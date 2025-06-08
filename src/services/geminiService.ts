import { WebSource, ChatMessage } from '../types';
import { 
    GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL, GENERIC_ERROR_MESSAGE,
    FBC_BRAND_NAME, AI_ASSISTANT_NAME, SIMULATED_KNOWLEDGE_BASE
} from '@/constants';

interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
}

const PROXY_ENDPOINT = '/api/gemini-proxy';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  factor: 2,
  retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'RATE_LIMIT_EXCEEDED', 'INTERNAL_ERROR']
};

// Circuit breaker state
const circuitBreaker = {
  isOpen: false,
  lastFailure: 0,
  failureCount: 0,
  resetAfter: 30000, // 30 seconds
  threshold: 5, // Number of failures before opening the circuit
};

// Development mode flag
const isDevelopment = process.env.NODE_ENV === 'development';

// Check circuit breaker state
const checkCircuitBreaker = (): boolean => {
  if (circuitBreaker.isOpen) {
    const now = Date.now();
    if (now - circuitBreaker.lastFailure > circuitBreaker.resetAfter) {
      // Reset circuit breaker after reset timeout
      circuitBreaker.isOpen = false;
      circuitBreaker.failureCount = 0;
      console.log('[Circuit Breaker] Circuit reset');
      return false;
    }
    return true; // Circuit is open
  }
  return false; // Circuit is closed
};

// Retry utility function with exponential backoff and circuit breaker
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  retries: number = RETRY_CONFIG.maxRetries
): Promise<T> => {
  try {
    if (checkCircuitBreaker()) {
      throw new Error('Service unavailable. Please try again later.');
    }
    
    return await operation();
  } catch (error: any) {
    if (retries <= 0) {
      // Update circuit breaker state on final failure
      circuitBreaker.failureCount++;
      circuitBreaker.lastFailure = Date.now();
      
      if (circuitBreaker.failureCount >= circuitBreaker.threshold) {
        circuitBreaker.isOpen = true;
        console.error(`[Circuit Breaker] Circuit opened after ${circuitBreaker.failureCount} failures`);
      }
      
      throw error;
    }
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.factor, RETRY_CONFIG.maxRetries - retries),
      RETRY_CONFIG.maxDelay
    );
    
    console.warn(`Retrying in ${delay}ms... (${retries} attempts left)`);
    
    // Wait for the calculated delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Retry the operation
    return retryWithBackoff(operation, retries - 1);
  }
};

// Simplified proxy request function with resilience patterns
const makeProxyRequest = async (endpoint: string, data: any): Promise<ProxyResponse> => {
  checkCircuitBreaker();
  
  return retryWithBackoff(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
    
    try {
      const response = await fetch(`${PROXY_ENDPOINT}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Unknown server error' }));
        throw new Error(`Proxy Error: ${response.status} - ${errorBody.error || 'Failed to fetch'}`);
      }

      const result = await response.json();
      if (result.success === false) {
        throw new Error(result.error || GENERIC_ERROR_MESSAGE);
      }
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  });
};

const getBaseSystemInstruction = (): string => {
  // Your base system instruction function remains unchanged.
  return `You are ${AI_ASSISTANT_NAME}, an AI assistant for ${FBC_BRAND_NAME}. ` +
         `Your role is to provide helpful, accurate, and concise information. ` +
         `Use the following context when relevant: ${SIMULATED_KNOWLEDGE_BASE}.`;
};

// Generate documentation using the proxy
export const generateDocumentation = async (
  prompt: string,
  systemInstruction: string = getBaseSystemInstruction(),
  modelName: string = GEMINI_TEXT_MODEL
): Promise<{ text: string }> => {
  try {
    const response = await makeProxyRequest('?action=generateDocumentation', {
      prompt,
      systemInstruction,
      model: modelName
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate documentation');
    }

    // Ensure the response has the expected shape
    const data = response.data;
    if (typeof data.text !== 'string') {
      throw new Error('Invalid response format from documentation generation');
    }

    return { text: data.text };
  } catch (error) {
    console.error('[GeminiService] Documentation generation failed:', error);
    throw new Error(`Failed to generate documentation: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Check proxy health
export const checkProxyHealth = async (): Promise<boolean> => {
  try {
    await makeProxyRequest('?action=health', {});
    return true;
  } catch (error) {
    console.error('Proxy health check failed:', error);
    return false;
  }
};

export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  try {
    const response = await makeProxyRequest('/generate', {
      prompt,
      systemInstruction: systemInstruction || getBaseSystemInstruction(),
      model: GEMINI_TEXT_MODEL,
    });
    return response.data?.text || '';
  } catch (error) {
    console.error('[geminiService] generateText error:', error);
    throw error;
  }
};

// Stream text using the proxy
export const streamText = async (
  prompt: string,
  onChunk: (chunk: string) => void,
  systemInstruction?: string
): Promise<void> => {
  try {
    const response = await makeProxyRequest('?action=streamText', {
      prompt,
      systemInstruction,
      model: GEMINI_TEXT_MODEL,
    });

    // Process the streamed response
    if (response.data?.text) {
      onChunk(response.data.text);
    }
  } catch (error) {
    console.error('Error streaming text:', error);
    throw new Error('Failed to stream text');
  }
};

// --- RENAMED AUDIO FUNCTION ---
export const startBrowserSpeechRecognition = (
  onTranscript: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void
): (() => void) => { // Returns a stop function
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError('Speech recognition not supported in this browser');
    return () => {};
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      onTranscript(event.results[i][0].transcript, event.results[i].isFinal);
    }
  };
  recognition.onerror = (event: any) => onError(`Speech recognition error: ${event.error}`);
  recognition.start();

  return () => recognition.stop(); // Return a function to stop the recognition
};

export const getServiceConfig = () => ({
  mode: 'serverless-proxy',
  endpoint: PROXY_ENDPOINT,
  models: {
    text: GEMINI_TEXT_MODEL,
    image: GEMINI_IMAGE_MODEL,
    liveAudio: 'gemini-2.0-flash-live-001'
  },
  features: {
    textGeneration: true,
    imageAnalysis: true,
    streaming: true,
    audioStreaming: true,
    followUpBriefs: true
  }
});

// --- New Service Functions ---

// Interface for the image generation response data
export interface GeneratedImageData {
  text: string;
  images: { base64Data: string; mimeType: string }[];
}

// Interface for translation response
export interface TranslationResult {
  translatedText: string;
  detectedLanguage?: string;
}

// Interface for grounded search response data
export interface GroundedSearchResult {
  text: string;
  sources?: WebSource[];
}

/**
 * Generates an image based on a prompt using the Gemini API proxy.
 * @param prompt The text prompt for image generation.
 * @param model Optional model name (e.g., 'gemini-2.0-flash-preview-image-generation' or an Imagen model).
 * @returns A promise that resolves to the generated image data.
 */
export const generateImage = async (prompt: string, model?: string): Promise<GeneratedImageData> => {
  checkCircuitBreaker();
  
  try {
    const response = await makeProxyRequest('?action=generateImage', {
      prompt,
      model: model || GEMINI_IMAGE_MODEL
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate image: No data in response');
    }

    // Ensure the response has the expected shape
    const data = response.data as GeneratedImageData;
    if (!data.text || !Array.isArray(data.images)) {
      throw new Error('Invalid response format from image generation');
    }

    return data;
  } catch (error) {
    console.error('[GeminiService] Image generation failed:', error);
    
    // Provide fallback response for development
    if (isDevelopment) {
      return {
        text: 'Image generation not available in development mode. Please deploy to production with proper API keys.',
        images: []
      };
    }
    
    throw error;
  }
};

// Remove duplicate GroundedSearchResult interface

/**
 * Performs a grounded search using the Gemini API proxy.
 * @param prompt The search prompt.
 * @param conversationHistory Optional conversation history for contextual search.
 * @returns A promise that resolves to the search result.
 */
export const performGroundedSearch = async (prompt: string, conversationHistory: ChatMessage[] = []): Promise<GroundedSearchResult> => {
  checkCircuitBreaker();
  
  try {
    const response = await makeProxyRequest('?action=searchWeb', {
      prompt,
      conversationHistory
    });

    if (!response.success) {
      throw new Error(response.error || 'Search failed: No data in response');
    }

    // Ensure the response has the expected shape
    if (!response.data || typeof response.data.text !== 'string') {
      throw new Error('Invalid response format from search');
    }

    return {
      text: response.data.text,
      sources: response.data.sources || []
    };
  } catch (error) {
    console.error('[GeminiService] Web search failed:', error);
    
    // Provide fallback response for development
    if (isDevelopment) {
      return {
        text: 'Web search not available in development mode. This requires production deployment with proper API configuration.',
        sources: []
      };
    }
    
    throw new Error(`Failed to perform grounded search: ${error instanceof Error ? error.message : String(error)}`);
  }
};

/**
 * Translates text using the Gemini API proxy translation service.
 * @param text The text to translate.
 * @param targetLanguage The target language code (e.g., 'no' for Norwegian, 'es' for Spanish).
 * @param sourceLanguage Optional source language code. If not provided, auto-detection will be used.
 * @returns A promise that resolves to the translation result.
 */
export const translateText = async (
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResult> => {
  checkCircuitBreaker();
  
  try {
    const response = await makeProxyRequest('?action=translate', {
      text,
      targetLanguage,
      sourceLanguage: sourceLanguage || ''
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Translation failed: No data in response');
    }

    // Ensure the response has the expected shape
    if (typeof response.data.translatedText !== 'string') {
      throw new Error('Invalid response format from translation service');
    }

    return {
      translatedText: response.data.translatedText,
      detectedLanguage: response.data.detectedLanguage
    };
  } catch (error) {
    console.error('[GeminiService] Translation failed:', error);
    
    // Provide fallback for development
    if (isDevelopment) {
      return {
        translatedText: `[Translation not available in development] ${text}`,
        detectedLanguage: sourceLanguage || 'auto'
      };
    }
    
    throw new Error(`Failed to translate text: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Helper function to get language names for better prompts (exported for potential future use)
export function getLanguageName(languageCode: string): string {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'no': 'Norwegian',
    'nb': 'Norwegian Bokmål',
    'nn': 'Norwegian Nynorsk',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'sv': 'Swedish',
    'da': 'Danish',
    'fi': 'Finnish',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
  };
  
  return languageNames[languageCode] || languageCode.toUpperCase();
}

// --- Example refactor for analyzeImage ---
export const analyzeImage = async (imageFile: File, prompt: string = "Describe this image"): Promise<string> => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const response = await makeProxyRequest('/analyze-image', {
      image: base64,
      mimeType: imageFile.type,
      prompt,
      model: GEMINI_IMAGE_MODEL
    });

    return response.data?.text || '';
};

// --- NEW SUMMARY FUNCTIONS ---
export const generateInternalBrief = async (conversationHistory: ChatMessage[]): Promise<void> => {
  try {
    await makeProxyRequest('/generateInternalBrief', { conversationHistory });
  } catch (error) {
    console.error('[GeminiService] Failed to trigger internal brief generation:', error);
  }
};

export const generateClientSummary = async (conversationHistory: ChatMessage[]): Promise<string> => {
  const response = await makeProxyRequest('/generateClientSummaryForPdf', { conversationHistory });
  if (response.data?.summary) {
    return response.data.summary;
  }
  throw new Error('No summary content in response.');
};

// Remove duplicate retryWithBackoff implementation

// Remove duplicate checkCircuitBreaker implementation
// The circuit breaker is already implemented at the top of the file