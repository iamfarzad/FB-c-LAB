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
    text: () => 'Mocked response text from Google AI SDK',
  },
});

const mockActualGenerateContentStream = jest.fn().mockResolvedValue({
  stream: (async function* () {
    yield { text: () => 'Chunk 1 ' };
    yield { text: () => 'Chunk 2' };
  })(),
});

const mockGoogleGenerativeAI = jest.fn().mockImplementation(() => ({
  getGenerativeModel: jest.fn().mockReturnValue({
    generateContent: mockActualGenerateContent,
    generateContentStream: mockActualGenerateContentStream,
  }),
}));

// Mock fetch for proxy requests
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Import the service after mocks are set up
import {
  initializeGeminiService,
  generateText,
  streamText,
  analyzeImage,
  generateFollowUpBrief,
  summarizeChatHistory,
  checkProxyHealth,
  getServiceConfig,
  generateImage,
  performGroundedSearch,
  generateDocumentation,
  GeneratedImageData,
  GroundedSearchResult,
  DocumentationResult,
} from './geminiService';
import { GEMINI_TEXT_MODEL } from '../constants';
import { ChatMessage, WebSource } from '../types';

// Helper to create a JSON response
const createJsonResponse = (body: any, status: number = 200, ok: boolean = true) => {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response);
};

const PROXY_ENDPOINT = '/api/gemini-proxy';

describe('GeminiService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockActualGenerateContent.mockClear();
    mockActualGenerateContentStream.mockClear();
    mockGoogleGenerativeAI.mockClear();
  });

  describe('initializeGeminiService', () => {
    it('should initialize with provided configuration', () => {
      const config = {
        isDev: true,
        apiKey: 'test-api-key',
        googleAI: mockGoogleGenerativeAI,
      };

      expect(() => initializeGeminiService(config)).not.toThrow();
    });

    it('should handle initialization without Google AI SDK', () => {
      const config = {
        isDev: false,
        apiKey: 'test-api-key',
      };

      expect(() => initializeGeminiService(config)).not.toThrow();
    });
  });

  describe('generateText', () => {
    it('should use proxy by default', async () => {
      const mockResponse = { success: true, data: { text: 'Generated text' } };
      mockFetch.mockResolvedValueOnce(createJsonResponse(mockResponse));

      const result = await generateText('Test prompt');

      expect(result).toBe('Generated text');
      expect(mockFetch).toHaveBeenCalledWith('/api/gemini-proxy/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Test prompt' }),
      });
    });

    it('should handle proxy errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce(createJsonResponse({ success: false, error: 'API Error' }));

      await expect(generateText('Test prompt')).rejects.toThrow('API Error');
    });

    it('should use development fallback when configured', async () => {
      // Initialize for development mode
      initializeGeminiService({
        isDev: true,
        apiKey: 'test-key',
        googleAI: mockGoogleGenerativeAI,
      });

      // Mock fetch to fail (simulating proxy unavailable)
      mockFetch.mockRejectedValueOnce(new Error('Proxy unavailable'));

      const result = await generateText('Test prompt');

      expect(result).toBe('Mocked response text from Google AI SDK');
      expect(mockGoogleGenerativeAI).toHaveBeenCalledWith('test-key');
    });
  });

  describe('streamText', () => {
    it('should stream text chunks via proxy', async () => {
      const chunks: string[] = [];
      const onChunk = (chunk: string) => chunks.push(chunk);

      // Mock a streaming response
      const mockResponse = {
        ok: true,
        body: {
          getReader: () => ({
            read: jest.fn()
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"chunk":"Hello "}\n\n') })
              .mockResolvedValueOnce({ done: false, value: new TextEncoder().encode('data: {"chunk":"World"}\n\n') })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await streamText('Test prompt', onChunk);

      expect(chunks).toEqual(['Hello ', 'World']);
    });
  });

  describe('analyzeImage', () => {
    it('should analyze image via proxy', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { success: true, data: { text: 'Image analysis result' } };
      
      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:image/jpeg;base64,dGVzdA==',
        onload: null as any,
      };
      
      global.FileReader = jest.fn(() => mockFileReader) as any;

      mockFetch.mockResolvedValueOnce(createJsonResponse(mockResponse));

      const promise = analyzeImage(mockFile, 'Describe this image');
      
      // Simulate FileReader onload
      mockFileReader.onload();
      
      const result = await promise;

      expect(result).toBe('Image analysis result');
    });
  });

  describe('checkProxyHealth', () => {
    it('should return true when proxy is healthy', async () => {
      mockFetch.mockResolvedValueOnce(createJsonResponse({ success: true }));

      const result = await checkProxyHealth();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/api/gemini-proxy/health');
    });

    it('should return false when proxy is unhealthy', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await checkProxyHealth();

      expect(result).toBe(false);
    });
  });

  describe('getServiceConfig', () => {
    it('should return service configuration', () => {
      const config = getServiceConfig();

      expect(config).toHaveProperty('mode');
      expect(config).toHaveProperty('endpoint');
      expect(config).toHaveProperty('models');
      expect(config).toHaveProperty('features');
    });
  });

  // --- New Gemini Tools Tests ---
  describe('generateImage', () => {
    const prompt = 'A cat wearing a hat';
    const mockImageData: GeneratedImageData = {
      text: 'Here is your image!',
      images: [{ base64Data: 'base64string', mimeType: 'image/png' }],
    };

    it('should return image data on successful API call', async () => {
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: true, data: mockImageData }));

      const result = await generateImage(prompt);
      expect(result).toEqual(mockImageData);
      expect(mockFetch).toHaveBeenCalledWith(`${PROXY_ENDPOINT}/generateImage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
    });

    it('should include model in request if provided', async () => {
      const model = 'gemini-pro-vision';
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: true, data: mockImageData }));

      await generateImage(prompt, model);
      expect(mockFetch).toHaveBeenCalledWith(`${PROXY_ENDPOINT}/generateImage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model }),
      });
    });

    it('should throw an error if proxy returns success:false', async () => {
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: false, error: 'Proxy image generation error' }));
      await expect(generateImage(prompt)).rejects.toThrow('Failed to generate image: Proxy image generation error');
    });
  });

  describe('performGroundedSearch', () => {
    const prompt = 'What is retrieval augmented generation?';
    const mockSources: WebSource[] = [{ uri: 'https://example.com/1', title: 'Source 1' }];
    const mockSearchResult: GroundedSearchResult = {
      text: 'RAG is a technique...',
      sources: mockSources,
    };

    it('should return search result on successful API call', async () => {
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: true, data: mockSearchResult }));

      const result = await performGroundedSearch(prompt);
      expect(result).toEqual(mockSearchResult);
      expect(mockFetch).toHaveBeenCalledWith(`${PROXY_ENDPOINT}/searchWeb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
    });

    it('should include conversationHistory in request if provided', async () => {
      const history: ChatMessage[] = [{ 
        id: '1', 
        sender: 'user' as any, 
        type: 'text' as any, 
        text: 'Previous query', 
        timestamp: Date.now() 
      }];
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: true, data: mockSearchResult }));

      await performGroundedSearch(prompt, history);
      expect(mockFetch).toHaveBeenCalledWith(`${PROXY_ENDPOINT}/searchWeb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, conversationHistory: history }),
      });
    });
  });

  describe('generateDocumentation', () => {
    const prompt = 'Document this function: `const a = 1;`';
    const mockDocResult: DocumentationResult = { text: 'This function declares a variable `a`.' };

    it('should return documentation text on successful API call', async () => {
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: true, data: { text: mockDocResult.text } }));

      const result = await generateDocumentation(prompt);
      expect(result).toEqual(mockDocResult);
      expect(mockFetch).toHaveBeenCalledWith(`${PROXY_ENDPOINT}/generateTextOnly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: GEMINI_TEXT_MODEL }),
      });
    });

    it('should include systemInstruction and generationConfig in request if provided', async () => {
      const systemInstruction = 'You are a technical writer.';
      const generationConfig = { temperature: 0.5 };
      const model = 'gemini-pro';
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: true, data: { text: mockDocResult.text } }));

      await generateDocumentation(prompt, systemInstruction, generationConfig, model);
      expect(mockFetch).toHaveBeenCalledWith(`${PROXY_ENDPOINT}/generateTextOnly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction, generationConfig, model }),
      });
    });

    it('should throw an error if proxy returns success:false', async () => {
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: false, error: 'Proxy documentation error' }));
      await expect(generateDocumentation(prompt)).rejects.toThrow('Failed to generate documentation: Proxy documentation error');
    });
  });
});
