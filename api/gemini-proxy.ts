// File: api/gemini-proxy.ts
// Serverless proxy for secure Gemini API access
// Compatible with Vite/Vercel deployment

import { GoogleGenerativeAI, GenerateContentResponse, Part } from "@google/generative-ai";

// Define the expected request body structure from client
interface ProxyRequestBody {
  prompt?: string;
  systemInstruction?: string;
  model?: string;
  image?: string;
  mimeType?: string;
  conversationHistory?: any[];
  audioChunks?: any[];
}

// Singleton instance for AI client to reuse connections
let geminiAIInstance: GoogleGenerativeAI | null = null;

// --- Gemini AI Client Initialization ---
function getGeminiAI() {
  if (!geminiAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY_SERVER; // Securely from Vercel env vars
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY_SERVER environment variable is required');
    }
    
    geminiAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return geminiAIInstance;
}

// --- Action Handlers ---

async function handleGenerate(body: ProxyRequestBody) {
  const ai = getGeminiAI();
  
  try {
    const model = ai.getGenerativeModel({
      model: body.model || 'gemini-2.0-flash-001',
      systemInstruction: body.systemInstruction,
      tools: [{ googleSearchRetrieval: {} }],
    });

    const result = await model.generateContent(body.prompt || '');
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
  } catch (error: any) {
    console.error('Generate content error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate content'
    };
  }
}

async function handleStream(body: ProxyRequestBody, res: any) {
  const ai = getGeminiAI();
  
  try {
    const model = ai.getGenerativeModel({
      model: body.model || 'gemini-2.0-flash-001',
      systemInstruction: body.systemInstruction,
      tools: [{ googleSearchRetrieval: {} }],
    });

    const result = await model.generateContentStream(body.prompt || '');
    
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }
    
    res.write('data: [DONE]\n\n');
    res.end();
    
  } catch (error: any) {
    console.error('Stream content error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to stream content'
    });
  }
}

async function handleAnalyzeImage(body: ProxyRequestBody) {
  const ai = getGeminiAI();
  
  try {
    const model = ai.getGenerativeModel({
      model: body.model || 'gemini-2.0-flash-001'
    });

    const imagePart: Part = {
      inlineData: {
        mimeType: body.mimeType || 'image/jpeg',
        data: body.image || ''
      }
    };

    const textPart: Part = { text: body.prompt || 'Describe this image' };
    
    const result = await model.generateContent([textPart, imagePart]);
    const response = await result.response;
    
    return {
      success: true,
      data: {
        text: response.text()
      }
    };
  } catch (error: any) {
    console.error('Analyze image error:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze image'
    };
  }
}

async function handleFollowUp(body: ProxyRequestBody) {
  const ai = getGeminiAI();
  
  try {
    const model = ai.getGenerativeModel({
      model: body.model || 'gemini-2.0-flash-001',
      systemInstruction: body.systemInstruction
    });

    // Create a prompt from conversation history
    const historyText = body.conversationHistory?.map((msg: any) => 
      `${msg.sender}: ${msg.content}`
    ).join('\n') || '';
    
    const prompt = `Based on this conversation history, generate a brief follow-up summary:\n\n${historyText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      success: true,
      data: {
        text: response.text()
      }
    };
  } catch (error: any) {
    console.error('Follow-up generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate follow-up'
    };
  }
}

async function handleAudioStream(body: ProxyRequestBody) {
  // For now, return a placeholder since audio streaming requires more complex setup
  return {
    success: false,
    error: 'Audio streaming not yet implemented in proxy'
  };
}

async function handleHealthCheck() {
  try {
    const ai = getGeminiAI();
    // Simple test to verify API key works
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-001' });
    await model.generateContent('Hello');
    
    return {
      success: true,
      data: { status: 'healthy', timestamp: new Date().toISOString() }
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Health check failed: ' + error.message
    };
  }
}

// --- Main Handler Function ---
export default async function handler(req: any, res: any) {
  // CORS headers for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Handle different endpoints based on URL path
  const path = req.url?.split('?')[0] || '';
  
  try {
    let result;

    if (req.method === 'GET' && path.endsWith('/health')) {
      result = await handleHealthCheck();
    } else if (req.method === 'POST') {
      const body: ProxyRequestBody = req.body;

      if (path.endsWith('/generate')) {
        result = await handleGenerate(body);
      } else if (path.endsWith('/stream')) {
        // Special handling for streaming - doesn't return JSON
        await handleStream(body, res);
        return;
      } else if (path.endsWith('/analyze-image')) {
        result = await handleAnalyzeImage(body);
      } else if (path.endsWith('/follow-up')) {
        result = await handleFollowUp(body);
      } else if (path.endsWith('/audio-stream')) {
        result = await handleAudioStream(body);
      } else {
        result = { success: false, error: `Unknown endpoint: ${path}` };
      }
    } else {
      result = { success: false, error: 'Method not allowed' };
    }

    res.status(result.success ? 200 : 400).json(result);

  } catch (error: any) {
    console.error('Proxy handler error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
} 