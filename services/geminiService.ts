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

// --- Module-scoped environment configuration variables ---
let _isDevelopment = false;
let _hasDirectApiKey = false;
let _apiKey: string | undefined = undefined;
let _GoogleGenerativeAI: any = null;
let _isGoogleAILoaded = false;

// --- Initialization Function ---
export const initializeGeminiService = (config: {
  isDev: boolean;
  apiKey?: string;
  googleAI?: any;
}) => {
  _isDevelopment = config.isDev;
  _apiKey = config.apiKey;
  _hasDirectApiKey = !!config.apiKey;

  if (config.googleAI) {
    _GoogleGenerativeAI = config.googleAI;
    _isGoogleAILoaded = true;
    console.log('Google AI SDK provided via initializeGeminiService');
  } else {
    _GoogleGenerativeAI = null;
    _isGoogleAILoaded = false;
  }
  // Reset any other relevant state if this function can be called multiple times.
  // For example, if loadGoogleAI dynamically imports, ensure it can re-evaluate.
};


// Serverless proxy configuration
const PROXY_ENDPOINT = '/api/gemini-proxy';

const loadGoogleAI = async () => {
  // Use module-scoped variables. Attempt dynamic import only if not already provided.
  if (!_isGoogleAILoaded && _isDevelopment && _hasDirectApiKey && !_GoogleGenerativeAI) {
    try {
      // This dynamic import is for the scenario where googleAI was NOT passed during initialization
      const module = await import('@google/generative-ai');
      _GoogleGenerativeAI = module.GoogleGenerativeAI;
      _isGoogleAILoaded = true;
      console.log('Google AI SDK loaded dynamically for development fallback');
    } catch (error) {
      console.warn('Google AI SDK not available for development fallback (dynamic import failed):', error);
    }
  } else if (_isGoogleAILoaded && _GoogleGenerativeAI) {
    // Already loaded (either provided or dynamically imported prior)
    // console.log('Google AI SDK already available.');
  }
};

// Development fallback function
const makeDirectApiCall = async (action: string, data: any): Promise<ProxyResponse> => {
  if (!_isGoogleAILoaded) { // Ensure SDK is loaded/attempted if needed
    await loadGoogleAI();
  }
  
  if (!_GoogleGenerativeAI || !_hasDirectApiKey || !_apiKey) {
    return {
      success: false,
      error: 'Development fallback not available - SDK or API key missing or not configured for dev.'
    };
  }

  try {
    const genAI = new _GoogleGenerativeAI(_apiKey);
    
    switch (action) {
      case 'generate': {
        const model = genAI.getGenerativeModel({
          model: data.model || 'gemini-2.0-flash-001',
          systemInstruction: data.systemInstruction,
          tools: [{ googleSearchRetrieval: {} }],
        });
        const result = await model.generateContent(data.prompt);
        const response = await result.response;
        return {
          success: true,
          data: {
            text: response.text(),
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
              ?.map((chunk: any) => chunk.web && ({ uri: chunk.web.uri, title: chunk.web.title }))
              .filter(Boolean) || []
          }
        };
      }
      case 'analyze-image': {
        const model = genAI.getGenerativeModel({ model: data.model || 'gemini-2.0-flash-001' });
        const imagePart = {
          inlineData: {
            mimeType: data.mimeType || 'image/jpeg',
            data: data.image
          }
        };
        const textPart = { text: data.prompt || 'Describe this image' };
        const result = await model.generateContent([textPart, imagePart]);
        const response = await result.response;
        return {
          success: true,
          data: { text: response.text() }
        };
      }
      case 'health': {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
        await model.generateContent('Hello');
        return {
          success: true,
          data: { status: 'healthy', timestamp: new Date().toISOString() }
        };
      }
      default:
        return {
          success: false,
          error: 'Unsupported action in development fallback'
        };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Development fallback error'
    };
  }
};

// Utility function to make proxy requests with development fallback
const makeProxyRequest = async (endpoint: string, data: any): Promise<ProxyResponse> => {
  try {
    const response = await fetch(`${PROXY_ENDPOINT}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Rate limit exceeded. ${errorData.error || 'Please try again later.'}`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Proxy request failed, trying development fallback:', error);
    
    if (_isDevelopment && _hasDirectApiKey) {
      const action = endpoint.replace('/', '');
      return await makeDirectApiCall(action, data);
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
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

export const createChatSession = (systemInstructionText?: string): boolean => {
  console.log("Using serverless proxy mode - session managed server-side"); // This might change based on _isDevelopment
  return true;
};

export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  try {
    const response = await makeProxyRequest('/generate', {
      prompt,
      systemInstruction: systemInstruction || getBaseSystemInstruction(),
      model: GEMINI_TEXT_MODEL
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to generate text');
    }

    return response.data?.text || '';
  } catch (error) {
    console.error('Error generating text:', error);
    throw new Error(GENERIC_ERROR_MESSAGE);
  }
};

export const streamText = async (
  prompt: string, 
  onChunk: (chunk: string) => void,
  systemInstruction?: string
): Promise<void> => {
  // Note: Streaming with dev fallback via makeDirectApiCall is not implemented.
  // This function will always try the proxy or fail if proxy fails and dev fallback is expected.
  // To support dev fallback for streaming, makeDirectApiCall would need a 'stream' action.
  // For now, tests will focus on proxy streaming.
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

export const analyzeImage = async (imageFile: File, prompt: string = "Describe this image"): Promise<string> => {
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
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

export const summarizeChatHistory = async (conversationHistory: ChatMessage[]): Promise<string> => {
  try {
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

export const streamAudio = async (
  audioChunks: Float32Array[],
  onTranscript: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
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
    (streamAudio as any).currentRecognition = recognition;
    
  } catch (error) {
    console.error('Error in audio streaming:', error);
    onError('Failed to start audio streaming');
  }
};

export const stopAudioStream = (): void => {
  const recognition = (streamAudio as any).currentRecognition;
  if (recognition) {
    recognition.stop();
    (streamAudio as any).currentRecognition = null;
  }
};

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
    
    if (_isDevelopment && _hasDirectApiKey) {
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

export const getServiceConfig = () => ({
  mode: (_isDevelopment && _hasDirectApiKey) ? 'direct' : 'serverless-proxy', // Mode can now be dynamic
  endpoint: PROXY_ENDPOINT, // Remains proxy endpoint, direct calls use their own logic
  models: {
    text: GEMINI_TEXT_MODEL,
    image: GEMINI_IMAGE_MODEL
  },
  features: {
    textGeneration: true,
    imageAnalysis: true,
    streaming: true,
    audioStreaming: true,
    followUpBriefs: true
  }
});

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

export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};