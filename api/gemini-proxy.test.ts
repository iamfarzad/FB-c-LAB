import handler from './gemini-proxy'; // Adjust path as necessary
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Mock @google/generative-ai
const mockGenerateContent = jest.fn();
const mockGenerateContentStream = jest.fn();
const mockSendMessage = jest.fn();
const mockStartChat = jest.fn(() => ({ sendMessage: mockSendMessage }));
const mockFunctionCalls = jest.fn();

const mockGetGenerativeModel = jest.fn(() => ({
  generateContent: mockGenerateContent,
  generateContentStream: mockGenerateContentStream,
  startChat: mockStartChat,
}));

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: mockGetGenerativeModel,
  })),
  HarmCategory: {
    HARM_CATEGORY_HARASSMENT: 'HARM_CATEGORY_HARASSMENT',
    HARM_CATEGORY_HATE_SPEECH: 'HARM_CATEGORY_HATE_SPEECH',
    HARM_CATEGORY_SEXUALLY_EXPLICIT: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    HARM_CATEGORY_DANGEROUS_CONTENT: 'HARM_CATEGORY_DANGEROUS_CONTENT',
  },
  HarmBlockThreshold: {
    BLOCK_MEDIUM_AND_ABOVE: 'BLOCK_MEDIUM_AND_ABOVE',
  },
}));

// Mock VercelRequest and VercelResponse
const mockRequest = (body: any, method: string = 'POST', url: string = '/api/gemini-proxy/testAction') => {
  return {
    body,
    method,
    url,
    headers: {},
    connection: { remoteAddress: '127.0.0.1' }, // for getClientIP
    socket: { remoteAddress: '127.0.0.1' }, // for getClientIP
  } as unknown as VercelRequest;
};

const mockResponse = () => {
  const res: Partial<VercelResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.write = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res as VercelResponse;
};

describe('Gemini Proxy API Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset rate limit and usage stats store if they are not cleared by other means
    // For simplicity, we assume they are managed externally or don't interfere across tests here
    process.env.GEMINI_API_KEY_SERVER = 'test-api-key'; // Ensure API key is set for tests
  });

  describe('handleGenerateImage', () => {
    it('should return generated image and text on success', async () => {
      const reqBody = { prompt: 'A futuristic city' };
      const mockSDKResponse = {
        response: {
          candidates: [{
            content: {
              parts: [
                { text: 'Here is your city:' },
                { inlineData: { data: 'base64imagedata', mimeType: 'image/png' } }
              ]
            }
          }],
          text: () => 'Here is your city:', // Mock for older text() call if any part of code uses it
        }
      };
      mockGenerateContent.mockResolvedValue(mockSDKResponse);

      const req = mockRequest(reqBody, 'POST', '/api/gemini-proxy/generateImage');
      const res = mockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: {
          text: 'Here is your city:',
          images: [{ base64Data: 'base64imagedata', mimeType: 'image/png' }],
        },
      }));
      expect(mockGetGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gemini-2.0-flash-preview-image-generation',
      }));
      expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
        // @ts-ignore
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }));
    });

    it('should return 400 if prompt is missing', async () => {
      const req = mockRequest({}, 'POST', '/api/gemini-proxy/generateImage');
      const res = mockResponse();
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: 'Missing prompt for image generation',
      }));
    });

    it('should handle SDK errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(new Error('SDK error'));
      const req = mockRequest({ prompt: 'test' }, 'POST', '/api/gemini-proxy/generateImage');
      const res = mockResponse();
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(400); // Error from handler itself
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.stringContaining('SDK error'),
      }));
    });
  });

  describe('handleSearchWeb (Function Calling)', () => {
    const userPrompt = 'What is the weather in London?';
    const functionCallResponse = {
      response: {
        candidates: [{ content: { parts: [{ functionCall: { name: 'web_search', args: { query: 'weather in London' } } }] } }],
        // Mock functionCalls() method if it's directly called on the response object
        functionCalls: () => [{ name: 'web_search', args: { query: 'weather in London' } }],
      }
    };
    const functionExecutionResult = {
      response: {
        candidates: [{ content: { parts: [{ text: 'The weather in London is sunny.' }] } }],
        text: () => 'The weather in London is sunny.',
      }
    };

    it('should execute function calling flow for web_search', async () => {
      mockStartChat.mockReturnValue({
        sendMessage: jest.fn()
          .mockResolvedValueOnce(functionCallResponse) // First call, model suggests function
          .mockResolvedValueOnce(functionExecutionResult) // Second call, model gives final answer
      });

      const req = mockRequest({ prompt: userPrompt }, 'POST', '/api/gemini-proxy/searchWeb');
      const res = mockResponse();
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          text: 'The weather in London is sunny.',
          sources: expect.arrayContaining([
            expect.objectContaining({ title: expect.stringContaining('Simulated Result 1 for "weather in London"') })
          ])
        }),
      }));
      expect(mockGetGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({
         tools: [expect.objectContaining({
           functionDeclarations: [expect.objectContaining({ name: 'web_search' })]
         })]
      }));
      expect(mockStartChat().sendMessage).toHaveBeenCalledTimes(2);
      expect(mockStartChat().sendMessage).toHaveBeenNthCalledWith(1, userPrompt);
      expect(mockStartChat().sendMessage).toHaveBeenNthCalledWith(2, [
        expect.objectContaining({
          functionResponse: expect.objectContaining({ name: 'web_search' })
        })
      ]);
    });

    it('should return direct text if no function call is made', async () => {
       mockStartChat.mockReturnValue({
        sendMessage: jest.fn().mockResolvedValueOnce({
          response: {
            candidates: [{ content: { parts: [{ text: "I don't need to search for that." }] } }],
            text: () => "I don't need to search for that.",
            functionCalls: () => null, // No function call
          }
        })
      });
      const req = mockRequest({ prompt: "Hello" }, 'POST', '/api/gemini-proxy/searchWeb');
      const res = mockResponse();
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: { text: "I don't need to search for that." }
      }));
    });
  });

  describe('handleGenerateTextOnly & handleGenerateChatResponse (for Documentation)', () => {
    const docPrompt = "generate docs for this function";
    const systemInstruction = "You are a technical writer.";
    const genConfig = { temperature: 0.2, maxOutputTokens: 500 };

    it('handleGenerateTextOnly should pass generationConfig to SDK', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { candidates: [{ content: { parts: [{text: "Generated text"}]}}], text: () => "Generated text"}
      });
      const req = mockRequest({ prompt: docPrompt, systemInstruction, generationConfig: genConfig, model: 'gemini-pro' }, 'POST', '/api/gemini-proxy/generateTextOnly');
      const res = mockResponse();
      await handler(req, res);

      expect(mockGetGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gemini-pro',
        systemInstruction: systemInstruction,
      }));
      expect(mockGenerateContent).toHaveBeenCalledWith(expect.objectContaining({
        generationConfig: genConfig,
        contents: [{parts: [{text: docPrompt}]}]
      }));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: { text: "Generated text" }}));
    });

    it('handleGenerateChatResponse should pass generationConfig to SDK via startChat', async () => {
      mockSendMessage.mockResolvedValue({
         response: { candidates: [{ content: { parts: [{text: "Chat response"}]}}], text: () => "Chat response" }
      });
      const req = mockRequest({ prompt: docPrompt, systemInstruction, generationConfig: genConfig, model: 'gemini-pro', conversationHistory: [] }, 'POST', '/api/gemini-proxy/generateChatResponse');
      const res = mockResponse();
      await handler(req, res);

      expect(mockGetGenerativeModel).toHaveBeenCalledWith(expect.objectContaining({
        model: 'gemini-pro',
        systemInstruction: systemInstruction,
      }));
      expect(mockStartChat).toHaveBeenCalledWith(expect.objectContaining({
        history: [],
        generationConfig: genConfig,
      }));
      expect(mockSendMessage).toHaveBeenCalledWith(docPrompt);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, data: expect.objectContaining({ text: "Chat response" })}));
    });
  });

  // TODO: Add tests for rate limiting, input validation, other actions, and more error scenarios.
});
