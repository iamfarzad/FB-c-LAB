import { 
    GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL, 
    API_KEY_ERROR_MESSAGE, GENERIC_ERROR_MESSAGE, CHAT_INIT_ERROR_MESSAGE,
    FBC_BRAND_NAME, AI_ASSISTANT_NAME, QUALIFICATION_QUESTIONS, SIMULATED_KNOWLEDGE_BASE
} from '../constants';
import { WebSource, ChatMessage, MessageSender } from '../types';

interface AudioStreamResponse {
  text: string;
  isFinal?: boolean;
}

interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
}

// Development environment detection
const isDevelopment = import.meta.env.DEV;
const hasDirectApiKey = !!import.meta.env.VITE_API_KEY;

console.log('[GeminiService] Environment:', { 
  isDevelopment, 
  hasDirectApiKey,
  mode: isDevelopment && hasDirectApiKey ? 'development-direct' : 'production-proxy'
});

// Proxy endpoint configuration
const PROXY_ENDPOINT = '/api/gemini-proxy';

// Load Google AI SDK for development
const loadGoogleAI = async () => {
  if (!isDevelopment || !hasDirectApiKey) {
    return null;
  }
  
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
    console.log('[GeminiService] Google AI SDK loaded successfully');
    return genAI;
  } catch (error) {
    console.error('[GeminiService] Failed to load Google AI SDK:', error);
    return null;
  }
};

// Direct API call for development
const makeDirectApiCall = async (action: string, data: any): Promise<ProxyResponse> => {
  if (!isDevelopment || !hasDirectApiKey) {
    throw new Error('Direct API calls only available in development with API key');
  }

  try {
    const genAI = await loadGoogleAI();
    if (!genAI) {
      throw new Error('Failed to initialize Google AI SDK');
    }

    switch (action) {
      case 'generate': {
        const model = genAI.getGenerativeModel({ 
          model: data.model || GEMINI_TEXT_MODEL,
          systemInstruction: data.systemInstruction
        });
        
        const result = await model.generateContent(data.prompt);
        const response = await result.response;
        const text = response.text();
        
        return { success: true, data: { text } };
      }
      
      case 'stream': {
        const model = genAI.getGenerativeModel({ 
          model: data.model || GEMINI_TEXT_MODEL,
          systemInstruction: data.systemInstruction
        });
        
        const result = await model.generateContentStream(data.prompt);
        let fullText = '';
        
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullText += chunkText;
          if (data.onChunk) {
            data.onChunk(chunkText);
          }
        }
        
        return { success: true, data: { text: fullText } };
      }
      
      case 'analyze-image': {
        const model = genAI.getGenerativeModel({ model: data.model || GEMINI_TEXT_MODEL });
        
        const imagePart = {
          inlineData: {
            data: data.image,
            mimeType: data.mimeType
          }
        };
        
        const result = await model.generateContent([data.prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        
        return { success: true, data: { text } };
      }
      
      case 'health': {
        // Simple health check for development
        return { success: true, data: { status: 'healthy', mode: 'development' } };
      }
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`[GeminiService] Direct API call failed for ${action}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Proxy request function
const makeProxyRequest = async (endpoint: string, data: any): Promise<ProxyResponse> => {
  try {
    // In development, try direct API first if available
    if (isDevelopment && hasDirectApiKey) {
      console.log('[GeminiService] Using development direct API for:', endpoint);
      
      // Map endpoint to action
      const actionMap: Record<string, string> = {
        '/generate': 'generate',
        '/stream': 'stream', 
        '/analyze-image': 'analyze-image',
        '/follow-up': 'generate',
        '/health': 'health'
      };
      
      const action = actionMap[endpoint];
      if (action) {
        try {
          const result = await makeDirectApiCall(action, data);
          if (result.success) {
            return result;
          }
          console.warn('[GeminiService] Direct API failed, falling back to proxy:', result.error);
        } catch (directError) {
          console.warn('[GeminiService] Direct API error, falling back to proxy:', directError);
        }
      }
    }

    // Fallback to proxy (production mode or development fallback)
    console.log('[GeminiService] Using proxy for:', endpoint);
    const response = await fetch(`${PROXY_ENDPOINT}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`[GeminiService] Proxy request failed for ${endpoint}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
};

// Base system instruction for the AI assistant
const getBaseSystemInstruction = (): string => {
  return `You are ${AI_ASSISTANT_NAME}, an AI assistant for ${FBC_BRAND_NAME}. 
  
  Your role is to help visitors understand Farzad's expertise in AI consulting, development, and workshops. You should:
  
  1. Be professional, knowledgeable, and helpful
  2. Focus on Farzad's AI expertise and services
  3. Ask qualifying questions when appropriate: ${QUALIFICATION_QUESTIONS.join(', ')}
  4. Reference relevant information from the knowledge base when helpful
  5. Guide conversations toward scheduling consultations or workshops
  6. Be concise but thorough in your responses
  
  Knowledge Base: ${SIMULATED_KNOWLEDGE_BASE}
  
  Always maintain a professional tone while being approachable and helpful.`;
};

// Chat session management (simplified for proxy)
export const createChatSession = (systemInstructionText?: string): boolean => {
  // For proxy mode, we don't create local sessions
  // Session management is handled server-side
  console.log("Using serverless proxy mode - session managed server-side");
  return true;
};

// Generate text response via proxy
export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  try {
    const response = await makeProxyRequest('generate', {
      prompt,
      systemInstruction: systemInstruction || getBaseSystemInstruction(),
      model: GEMINI_TEXT_MODEL,
    });

    if (response.success && response.data?.text) {
      return response.data.text;
    } else {
      throw new Error(response.error || 'No text in response');
    }
  } catch (error) {
    console.error('[geminiService] generateText error:', error);
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Stream text response via proxy
export const streamText = async (
  prompt: string, 
  onChunk: (chunk: string) => void,
  systemInstruction?: string
): Promise<void> => {
  try {
    const response = await fetch(`${PROXY_ENDPOINT}/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemInstruction: systemInstruction || getBaseSystemInstruction(),
        model: GEMINI_TEXT_MODEL
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              onChunk(data.text);
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } catch (error) {
    console.error('Error streaming text:', error);
    throw new Error(GENERIC_ERROR_MESSAGE);
  }
};

// Analyze image via proxy
export const analyzeImage = async (imageFile: File, prompt: string = "Describe this image"): Promise<string> => {
  try {
    // Convert image to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });

    const response = await makeProxyRequest('/analyze-image', {
      image: base64,
      mimeType: imageFile.type,
      prompt,
      model: GEMINI_IMAGE_MODEL
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to analyze image');
    }

    return response.data?.text || '';
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error(GENERIC_ERROR_MESSAGE);
  }
};

// Generate follow-up brief via proxy
export const generateFollowUpBrief = async (conversationHistory: ChatMessage[]): Promise<string> => {
  try {
    const response = await makeProxyRequest('/follow-up', {
      conversationHistory,
      systemInstruction: getBaseSystemInstruction()
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate follow-up brief');
    }

    return response.data?.text || '';
  } catch (error) {
    console.error('Error generating follow-up brief:', error);
    throw new Error(GENERIC_ERROR_MESSAGE);
  }
};

// Summarize chat history via proxy
export const summarizeChatHistory = async (conversationHistory: ChatMessage[]): Promise<string> => {
  try {
    // Create a summary prompt
    const historyText = conversationHistory.map((msg: ChatMessage) => 
      `${msg.sender}: ${msg.text}`
    ).join('\n');
    
    const summaryPrompt = `Please provide a concise summary of this conversation:\n\n${historyText}\n\nSummary:`;
    
    const response = await makeProxyRequest('/generate', {
      prompt: summaryPrompt,
      systemInstruction: 'You are a helpful assistant that creates clear, concise summaries of conversations.',
      model: GEMINI_TEXT_MODEL
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to summarize chat history');
    }

    return response.data?.text || '';
  } catch (error) {
    console.error('Error summarizing chat history:', error);
    throw new Error(GENERIC_ERROR_MESSAGE);
  }
};

// Audio streaming via proxy (placeholder for future implementation)
export const streamAudio = async (
  audioChunks: Float32Array[],
  onTranscript: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    // For now, we'll use browser-based speech recognition as recommended in the plan
    // This is more secure than streaming audio through the proxy
    
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      onError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        onTranscript(transcript, isFinal);
      }
    };

    recognition.onerror = (event: any) => {
      onError(`Speech recognition error: ${event.error}`);
    };

    recognition.start();
    
    // Store recognition instance for cleanup
    (streamAudio as any).currentRecognition = recognition;
    
  } catch (error) {
    console.error('Error in audio streaming:', error);
    onError('Failed to start audio streaming');
  }
};

// Stop audio streaming
export const stopAudioStream = (): void => {
  const recognition = (streamAudio as any).currentRecognition;
  if (recognition) {
    recognition.stop();
    (streamAudio as any).currentRecognition = null;
  }
};

// Check proxy health with development fallback
export const checkProxyHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${PROXY_ENDPOINT}/health`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.warn('Proxy health check failed, trying development fallback:', error);
    
    // Try development fallback
    if (isDevelopment && hasDirectApiKey) {
      try {
        const result = await makeDirectApiCall('health', {});
        return result.success === true;
      } catch (fallbackError) {
        console.error('Development fallback health check failed:', fallbackError);
        return false;
      }
    }
    
    return false;
  }
};

// Get service configuration
export const getServiceConfig = () => ({
  mode: 'serverless-proxy',
  endpoint: PROXY_ENDPOINT,
  models: {
    text: GEMINI_TEXT_MODEL,
    image: GEMINI_IMAGE_MODEL
  },
  features: {
    textGeneration: true,
    imageAnalysis: true,
    streaming: true,
    audioStreaming: true, // Browser-based STT/TTS
    followUpBriefs: true
  }
});

// Text-to-speech using browser API (recommended approach for voice)
export const speakText = async (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Text-to-speech not supported in this browser'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
    
    window.speechSynthesis.speak(utterance);
  });
};

// Stop text-to-speech
export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};