// Polyfill/Mock TextDecoder and TextEncoder for JSDOM environment
// This needs to be at the very top to be available when modules are loaded.
if (typeof global.TextDecoder === 'undefined') {
  const util = require('util');
  global.TextDecoder = util.TextDecoder;
  global.TextEncoder = util.TextEncoder;
}

// Mock constants used by the service.
jest.mock('../constants', () => ({
  AI_ASSISTANT_NAME: 'TestAI_ConstantsMock',
  FBC_BRAND_NAME: 'TestBrand_ConstantsMock',
  GENERIC_ERROR_MESSAGE: 'Mocked Generic Error. Please try again.',
  API_KEY_ERROR_MESSAGE: 'Mocked API key is missing or invalid.',
  CHAT_INIT_ERROR_MESSAGE: 'Mocked Failed to initialize chat session.',
  QUALIFICATION_QUESTIONS: ['MQ1?', 'MQ2?'],
  SIMULATED_KNOWLEDGE_BASE: 'Mocked knowledge.',
  GEMINI_TEXT_MODEL: 'gemini-mock-text-model',
  GEMINI_IMAGE_MODEL: 'gemini-mock-image-model',
}));

// Mock the Google AI SDK for testing development fallback
const mockActualGenerateContent = jest.fn().mockResolvedValue({
  response: {
    text: jest.fn().mockReturnValue('mocked direct API response'),
    candidates: [{ groundingMetadata: { groundingChunks: [] } }]
  }
});
const mockActualGetGenerativeModel = jest.fn().mockReturnValue({
  generateContent: mockActualGenerateContent,
});
const mockActualGoogleGenerativeAI = jest.fn().mockImplementation(() => ({
  getGenerativeModel: mockActualGetGenerativeModel,
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: mockActualGoogleGenerativeAI,
}));

// Import functions from the service to be tested, and the new initializer
import {
  initializeGeminiService,
  createChatSession,
  generateText,
  streamText,
  analyzeImage,
  generateFollowUpBrief,
  summarizeChatHistory,
  streamAudio,
  stopAudioStream,
  checkProxyHealth,
  getServiceConfig,
  speakText,
  stopSpeaking,
} from './geminiService';
import type { ChatMessage, MessageSender } from '../types';
import { act } from '@testing-library/react';

// --- Global Test Setup ---
let fetchSpy: jest.SpyInstance;

beforeEach(() => {
  initializeGeminiService({ isDev: false, apiKey: undefined, googleAI: null });

  if (!global.fetch) {
    global.fetch = jest.fn();
  }
  fetchSpy = jest.spyOn(global, 'fetch');

  jest.clearAllMocks();
  mockActualGoogleGenerativeAI.mockClear();
  mockActualGetGenerativeModel.mockClear();
  mockActualGenerateContent.mockClear();
  mockActualGenerateContent.mockResolvedValue({
    response: {
      text: jest.fn().mockReturnValue('mocked direct API response'),
      candidates: [{ groundingMetadata: { groundingChunks: [] } }]
    }
  });
});

afterEach(() => {
  if (fetchSpy) fetchSpy.mockRestore();
});

// --- Tests ---
describe('GeminiService', () => {

  describe('initializeGeminiService and getServiceConfig', () => {
    it('should reflect proxy mode when initialized for production', () => {
      initializeGeminiService({ isDev: false, apiKey: undefined, googleAI: null });
      const config = getServiceConfig();
      expect(config.mode).toBe('serverless-proxy');
    });

    it('should reflect direct mode when initialized for development with API key', () => {
      initializeGeminiService({ isDev: true, apiKey: 'test-key', googleAI: mockActualGoogleGenerativeAI });
      const config = getServiceConfig();
      expect(config.mode).toBe('direct');
    });
  });

  describe('createChatSession', () => {
    it('should log proxy mode message and return true', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const result = createChatSession();
      expect(result).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith("Using serverless proxy mode - session managed server-side");
      consoleSpy.mockRestore();
    });
  });

  describe('generateText', () => {
    const prompt = 'Test prompt';
    const systemInstruction = 'Test system instruction';

    it('should use proxy: return text from successful proxy response', async () => {
      initializeGeminiService({ isDev: false, apiKey: undefined, googleAI: null });
      const mockResponseData = { text: 'Generated text' };
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockResponseData }),
      } as Response);

      const result = await generateText(prompt, systemInstruction);
      expect(result).toBe(mockResponseData.text);
      expect(fetchSpy).toHaveBeenCalledWith('/api/gemini-proxy/generate', expect.any(Object));
      const fetchBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(fetchBody.prompt).toBe(prompt);
    });

    it('should use proxy: throw error if proxy response success is false', async () => {
      initializeGeminiService({ isDev: false, apiKey: undefined, googleAI: null });
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: 'Proxy error' }),
      } as Response);
      await expect(generateText(prompt, systemInstruction)).rejects.toThrow('Mocked Generic Error. Please try again.');
    });

    it('should use dev fallback: make direct API call if proxy fails and dev config is set', async () => {
      initializeGeminiService({ isDev: true, apiKey: 'test-key', googleAI: mockActualGoogleGenerativeAI });
      fetchSpy.mockResolvedValueOnce({
        ok: false, status: 500, json: async () => ({ success: false, error: 'Proxy error' }),
      } as Response);
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const result = await generateText(prompt, systemInstruction);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(mockActualGoogleGenerativeAI).toHaveBeenCalledWith('test-key');
      expect(mockActualGetGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({ model: 'gemini-mock-text-model' }));
      expect(mockActualGenerateContent).toHaveBeenCalledWith(prompt);
      expect(result).toBe('mocked direct API response');
      consoleWarnSpy.mockRestore();
    });

     it('should use dev fallback: make direct API call if proxy has network error and dev config is set', async () => {
      initializeGeminiService({ isDev: true, apiKey: 'test-key', googleAI: mockActualGoogleGenerativeAI });
      fetchSpy.mockRejectedValueOnce(new Error("Network error"));
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const result = await generateText(prompt, systemInstruction);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(mockActualGoogleGenerativeAI).toHaveBeenCalledWith('test-key');
      expect(result).toBe('mocked direct API response');
      consoleWarnSpy.mockRestore();
    });

    it('should throw generic error if proxy fails and dev fallback also fails', async () => {
      initializeGeminiService({ isDev: true, apiKey: 'test-key', googleAI: mockActualGoogleGenerativeAI });
      fetchSpy.mockRejectedValueOnce(new Error("Proxy Network error"));
      mockActualGenerateContent.mockRejectedValueOnce(new Error("Direct API SDK error"));
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(generateText(prompt, systemInstruction)).rejects.toThrow('Mocked Generic Error. Please try again.');
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should throw generic error if proxy fails and dev fallback is not configured', async () => {
      initializeGeminiService({ isDev: true, apiKey: undefined, googleAI: null });
      fetchSpy.mockRejectedValueOnce(new Error("Proxy Network error"));
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(generateText(prompt, systemInstruction)).rejects.toThrow('Mocked Generic Error. Please try again.');
      expect(mockActualGoogleGenerativeAI).not.toHaveBeenCalled();
      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('streamText', () => {
    const prompt = 'Stream test prompt';
    const onChunk = jest.fn();

    beforeEach(() => { onChunk.mockClear(); });

    it('should call onChunk with text from data lines', async () => {
      const mockStreamChunks = ['data: {"text": "Hello"}\n', 'data: {"text": " world"}\n'];
      let streamIndex = 0;
      const mockReader = {
        read: jest.fn(async () => {
          if (streamIndex < mockStreamChunks.length) {
            return { done: false, value: new TextEncoder().encode(mockStreamChunks[streamIndex++]) };
          }
          return { done: true, value: undefined };
        }),
      };
      fetchSpy.mockResolvedValueOnce({
        ok: true, body: { getReader: () => mockReader },
      } as unknown as Response);

      await streamText(prompt, onChunk, 'Test instruction');
      expect(onChunk).toHaveBeenCalledWith('Hello');
      expect(onChunk).toHaveBeenCalledWith(' world');
    });

    it('should throw generic error on non-ok HTTP response', async () => {
      fetchSpy.mockResolvedValueOnce({ ok: false, status: 500 } as Response);
      await expect(streamText(prompt, onChunk)).rejects.toThrow('Mocked Generic Error. Please try again.');
    });
  });

  describe('analyzeImage', () => {
    const mockFile = new File(['dummy_content'], 'test.jpg', { type: 'image/jpeg' });
    const mockPrompt = 'Describe';
    let fileReaderSpy: jest.SpyInstance;
    let mockReaderInstance: any;

    beforeEach(() => {
        mockReaderInstance = {
            result: 'data:image/jpeg;base64,dummy_base64_content',
            readAsDataURL: jest.fn(function() { if(this.onload) { this.onload(); } }),
            onload: null, onerror: null,
        };
        fileReaderSpy = jest.spyOn(global, 'FileReader').mockImplementation(() => mockReaderInstance);
    });

    afterEach(() => { if (fileReaderSpy) fileReaderSpy.mockRestore(); });

    it('should use proxy: return text from successful proxy response', async () => {
        initializeGeminiService({ isDev: false, apiKey: undefined, googleAI: null });
        const mockResponseData = { text: 'Image description' };
        fetchSpy.mockResolvedValueOnce({
          ok: true, json: async () => ({ success: true, data: mockResponseData }),
        } as Response);

        const result = await analyzeImage(mockFile, mockPrompt);
        expect(result).toBe(mockResponseData.text);
        expect(fetchSpy.mock.calls[0][0]).toBe('/api/gemini-proxy/analyze-image');
      });

      it('should use dev fallback for analyzeImage if proxy fails and dev config is set', async () => {
        initializeGeminiService({ isDev: true, apiKey: 'test-key', googleAI: mockActualGoogleGenerativeAI });
        fetchSpy.mockRejectedValueOnce(new Error("Proxy network error for image"));
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const result = await analyzeImage(mockFile, mockPrompt);
        expect(result).toBe('mocked direct API response');
        expect(mockActualGoogleGenerativeAI).toHaveBeenCalledWith('test-key');
        expect(mockActualGetGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-mock-image-model' });
        expect(mockActualGenerateContent).toHaveBeenCalledWith([
            { text: mockPrompt },
            { inlineData: { mimeType: mockFile.type, data: 'dummy_base64_content' } }
        ]);
        consoleWarnSpy.mockRestore();
      });
  });

  describe('checkProxyHealth', () => {
    it('should return true on successful fetch to /health (proxy)', async () => {
        initializeGeminiService({ isDev: false, apiKey: undefined, googleAI: null });
        fetchSpy.mockResolvedValueOnce({
            ok: true, json: async () => ({ success: true }),
        } as Response);
        const result = await checkProxyHealth();
        expect(result).toBe(true);
        expect(fetchSpy.mock.calls[0][0]).toBe('/api/gemini-proxy/health');
    });

    it('should use dev fallback for health check if proxy fails and dev config is set', async () => {
        initializeGeminiService({ isDev: true, apiKey: 'test-key-health', googleAI: mockActualGoogleGenerativeAI });
        fetchSpy.mockRejectedValueOnce(new Error("Proxy health network failure"));
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        mockActualGenerateContent.mockResolvedValueOnce({ response: { text: jest.fn().mockReturnValue('Health OK') } });
        const result = await checkProxyHealth();
        expect(result).toBe(true);
        expect(mockActualGoogleGenerativeAI).toHaveBeenCalledWith('test-key-health');
        expect(mockActualGetGenerativeModel).toHaveBeenCalledWith({ model: 'gemini-2.0-flash-001' });
        expect(mockActualGenerateContent).toHaveBeenCalledWith('Hello');
        consoleWarnSpy.mockRestore();
    });

    it('should return false if proxy fails and dev fallback is also unavailable/fails', async () => {
        initializeGeminiService({ isDev: true, apiKey: 'test-key-health', googleAI: mockActualGoogleGenerativeAI });
        fetchSpy.mockRejectedValueOnce(new Error("Proxy health network failure"));
        mockActualGenerateContent.mockRejectedValueOnce(new Error("Direct API health error"));
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const result = await checkProxyHealth();
        expect(result).toBe(false);
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });
  });

  describe('streamAudio and stopAudioStream', () => {
    it('should setup and stop correctly', () => {
        const mockRecognition = { start: jest.fn(), stop: jest.fn(), continuous: false, interimResults: false, lang: '', onresult: null, onerror: null };
        const SpeechRecognitionMock = jest.fn(() => mockRecognition);
        (global as any).SpeechRecognition = SpeechRecognitionMock;
        (global as any).webkitSpeechRecognition = SpeechRecognitionMock;

        streamAudio([], jest.fn(), jest.fn());
        expect(mockRecognition.start).toHaveBeenCalled();
        stopAudioStream();
        expect(mockRecognition.stop).toHaveBeenCalled();

        delete (global as any).SpeechRecognition;
        delete (global as any).webkitSpeechRecognition;
    });
  });

  describe('speakText and stopSpeaking', () => {
    it('should setup and stop correctly', async () => { // Added async
        const speechSynthesisMock = { speak: jest.fn(), cancel: jest.fn() };
        // Make onend and onerror assignable for simulation
        let utteranceInstance: any = { text: '', onend: null, onerror: null };
        const UtteranceMock = jest.fn(() => utteranceInstance);

        (global as any).speechSynthesis = speechSynthesisMock;
        (global as any).SpeechSynthesisUtterance = UtteranceMock;

        const speakPromise = speakText("hello"); // Get the promise
        expect(speechSynthesisMock.speak).toHaveBeenCalled();

        // Simulate onend for promise resolution
        if (utteranceInstance.onend) utteranceInstance.onend();
        await expect(speakPromise).resolves.toBeUndefined(); // Wait for resolution

        stopSpeaking();
        expect(speechSynthesisMock.cancel).toHaveBeenCalled();

        delete (global as any).speechSynthesis;
        delete (global as any).SpeechSynthesisUtterance;
    });
  });

  describe('generateFollowUpBrief', () => {
    it('should call proxy with correct parameters', async () => {
      initializeGeminiService({ isDev: false, apiKey: undefined, googleAI: null });
      fetchSpy.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: {text: "brief"} }) } as Response);
      const history = [{sender: 'user' as MessageSender, text: 'Hi'}]
      await generateFollowUpBrief(history);
      expect(fetchSpy).toHaveBeenCalledWith('/api/gemini-proxy/follow-up', expect.any(Object));
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      expect(body.conversationHistory).toEqual(history);
      expect(body.systemInstruction).toContain("TestAI_ConstantsMock");
    });
  });

  describe('summarizeChatHistory', () => {
    it('should call proxy with correct parameters', async () => {
      initializeGeminiService({ isDev: false, apiKey: undefined, googleAI: null });
      fetchSpy.mockResolvedValueOnce({ ok: true, json: async () => ({ success: true, data: {text: "summary"} }) } as Response);
      // Corrected mockHistory to match what the assertion expects if it were "Summarize this please"
      const history = [{sender: 'user' as MessageSender, text: 'Summarize this please'}]
      await summarizeChatHistory(history);
      expect(fetchSpy).toHaveBeenCalledWith('/api/gemini-proxy/generate', expect.any(Object));
      const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
      // Assertion matches the content of mockHistory.text
      expect(body.prompt).toContain("Summarize this please");
      expect(body.systemInstruction).toContain("summaries of conversations");
    });
  });
});
