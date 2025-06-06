import {
  generateImage,
  performGroundedSearch,
  generateDocumentation,
  GeneratedImageData,
  GroundedSearchResult,
  DocumentationResult,
} from './geminiService';
import { GEMINI_TEXT_MODEL } from '../constants'; // For default model in generateDocumentation
import { ChatMessage, WebSource } from '../types'; // For performGroundedSearch history and sources

// Mocking global.fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

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
  });

  // --- generateImage Tests ---
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
      const model = 'gemini-pro-vision'; // example model
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

    it('should throw an error if API response is not ok', async () => {
      mockFetch.mockReturnValueOnce(createJsonResponse({}, 500, false));
      await expect(generateImage(prompt)).rejects.toThrow('Failed to generate image: HTTP error! status: 500');
    });

    it('should throw an error for malformed success response (no data)', async () => {
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: true, data: null }));
      await expect(generateImage(prompt)).rejects.toThrow('Failed to generate image: No data in response');
    });
  });

  // --- performGroundedSearch Tests ---
  describe('performGroundedSearch', () => {
    const prompt = 'What is retrieval augmented generation?';
    const mockSources: WebSource[] = [{ title: 'Source 1', link: 'https://example.com/1' }];
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
      const history: ChatMessage[] = [{ sender: 'user', text: 'Previous query' }];
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: true, data: mockSearchResult }));

      await performGroundedSearch(prompt, history);
      expect(mockFetch).toHaveBeenCalledWith(`${PROXY_ENDPOINT}/searchWeb`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, conversationHistory: history }),
      });
    });

    it('should throw an error if proxy returns success:false', async () => {
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: false, error: 'Proxy search error' }));
      await expect(performGroundedSearch(prompt)).rejects.toThrow('Failed to perform grounded search: Proxy search error');
    });

    it('should throw an error if API response is not ok', async () => {
      mockFetch.mockReturnValueOnce(createJsonResponse({}, 500, false));
      await expect(performGroundedSearch(prompt)).rejects.toThrow('Failed to perform grounded search: HTTP error! status: 500');
    });

    it('should handle successful response with no sources', async () => {
      const resultNoSources: GroundedSearchResult = { text: 'Answer without sources.' };
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: true, data: resultNoSources }));
      const result = await performGroundedSearch(prompt);
      expect(result).toEqual(resultNoSources);
    });
  });

  // --- generateDocumentation Tests ---
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
        body: JSON.stringify({ prompt, model: GEMINI_TEXT_MODEL }), // includes default model
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

    it('should throw an error if API response is not ok', async () => {
      mockFetch.mockReturnValueOnce(createJsonResponse({}, 400, false));
      await expect(generateDocumentation(prompt)).rejects.toThrow('Failed to generate documentation: HTTP error! status: 400');
    });

    it('should throw an error for malformed success response (no text)', async () => {
      mockFetch.mockReturnValueOnce(createJsonResponse({ success: true, data: {} }));
      await expect(generateDocumentation(prompt)).rejects.toThrow('Failed to generate documentation: No text in response');
    });
  });
});
