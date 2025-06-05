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
const forceDirectApi = import.meta.env.VITE_FORCE_DIRECT_API === 'true';

console.log('[GeminiService] Environment:', { 
  isDevelopment, 
  hasDirectApiKey,
  forceDirectApi,
  mode: (isDevelopment || forceDirectApi) && hasDirectApiKey ? 'direct-api' : 'production-proxy'
});

// Proxy endpoint configuration
const PROXY_ENDPOINT = '/api/gemini-proxy';

// Load Google AI SDK for development and forced production mode
const loadGoogleAI = async () => {
  if ((!isDevelopment && !forceDirectApi) || !hasDirectApiKey) {
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

// Direct API call for development and forced production mode
const makeDirectApiCall = async (action: string, data: any): Promise<ProxyResponse> => {
  if ((!isDevelopment && !forceDirectApi) || !hasDirectApiKey) {
    throw new Error('Direct API calls only available in development or when forced with API key');
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
      
      case 'stream-audio': {
        // For development, we'll use browser STT + text processing + browser TTS
        console.log('[GeminiService] Development mode: Using browser STT for audio processing');
        return { 
          success: true, 
          data: { 
            transcript: 'Development mode: Please use browser speech recognition',
            isFinal: true 
          } 
        };
      }
      
      case 'speak-text': {
        // For development, we'll use browser TTS
        console.log('[GeminiService] Development mode: Using browser TTS for speech');
        return { 
          success: true, 
          data: { 
            text: data.text,
            audioData: null,
            message: 'Development mode: Using browser TTS'
          } 
        };
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
    // In development or forced mode, try direct API first if available
    if ((isDevelopment || forceDirectApi) && hasDirectApiKey) {
      console.log('[GeminiService] Using development direct API for:', endpoint);
      
      // Map endpoint to action
      const actionMap: Record<string, string> = {
        '/generate': 'generate',
        '/stream': 'stream', 
        '/analyze-image': 'analyze-image',
        '/follow-up': 'generate',
        '/health': 'health',
        '/stream-audio': 'stream-audio',
        '/speak-text': 'speak-text'
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
    const response = await makeProxyRequest('/generate', {
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

// Audio streaming using Gemini Live Audio API for native voice
export const streamAudio = async (
  audioChunks: Float32Array[],
  onTranscript: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    console.log('[GeminiService] Attempting Gemini Live Audio streaming...');
    
    // Convert audio chunks to WAV format for Gemini
    const audioBlob = await convertAudioChunksToWav(audioChunks);
    const base64Audio = await blobToBase64(audioBlob);
    
    // Use direct API call if available, otherwise proxy
    const endpoint = '/stream-audio';
    const data = {
      audioData: base64Audio,
      model: 'gemini-2.0-flash-live-001', // Gemini Live Audio model
      mimeType: 'audio/wav',
      sampleRate: 16000
    };
    
    let response: ProxyResponse;
    
    if (isDevelopment && hasDirectApiKey && forceDirectApi) {
      response = await makeDirectApiCall('stream-audio', data);
    } else {
      response = await makeProxyRequest(endpoint, data);
    }
    
    if (!response.success) {
      // Expected error - Live Audio requires WebSocket, not REST API
      console.log('[GeminiService] Live Audio not available via REST API, using browser speech recognition');
      onError('Live Audio requires WebSocket connection. Using browser speech recognition instead.');
      return;
    }
    
    // Handle streaming response (if somehow successful)
    if (response.data?.transcript) {
      onTranscript(response.data.transcript, response.data.isFinal || false);
    }
    
  } catch (error) {
    console.log('[GeminiService] Expected error - Live Audio requires WebSocket:', error);
    onError('Live Audio requires WebSocket connection. Using browser speech recognition instead.');
  }
};

// Convert audio chunks to WAV blob
const convertAudioChunksToWav = async (audioChunks: Float32Array[]): Promise<Blob> => {
  // Combine all audio chunks
  const totalLength = audioChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combinedBuffer = new Float32Array(totalLength);
  
  let offset = 0;
  for (const chunk of audioChunks) {
    combinedBuffer.set(chunk, offset);
    offset += chunk.length;
  }
  
  // Convert to WAV format
  return float32ToWav(combinedBuffer, 16000);
};

// Convert Float32Array to WAV blob
const float32ToWav = (buffer: Float32Array, sampleRate: number): Blob => {
  const length = buffer.length;
  const arrayBuffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length * 2, true);
  
  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, buffer[i]));
    view.setInt16(offset, sample * 0x7FFF, true);
    offset += 2;
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

// Convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:audio/wav;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Stop audio streaming
export const stopAudioStream = (): void => {
  // Clean up any active streaming connections
  console.log('[GeminiService] Stopping Gemini Live Audio stream...');
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
  mode: forceDirectApi ? 'direct-api' : 'serverless-proxy',
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
    nativeLiveAudio: true, // True Gemini Live Audio
    followUpBriefs: true
  }
});

// Text-to-speech using browser TTS (Gemini Live Audio requires WebSocket)
export const speakText = async (text: string): Promise<void> => {
  console.log('[GeminiService] Using browser TTS for:', text);
  
  // Use browser TTS directly since Gemini Live Audio requires WebSocket connection
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Text-to-speech not supported in this browser'));
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
    
    // Use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Enhanced') ||
      voice.name.includes('Premium')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 0.9; // Slightly slower for better clarity
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  });
};

// Play audio data from Gemini
const playGeminiAudio = async (audioData: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const audio = new Audio(`data:audio/wav;base64,${audioData}`);
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error('Failed to play Gemini audio'));
      audio.play();
    } catch (error) {
      reject(error);
    }
  });
};

// Stop text-to-speech
export const stopSpeaking = (): void => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};