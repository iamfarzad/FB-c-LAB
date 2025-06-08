// File: api/gemini-proxy.ts
// Serverless proxy for secure Gemini API access
// Compatible with Vercel deployment

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// --- Types ---
interface ProxyRequestBody {
  prompt?: string;
  code?: string;
  audioData?: string;
  model?: string;
  language?: string;
  [key: string]: any;
}

interface ProxyResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    cost: number;
  };
}

// --- Gemini AI Client Initialization ---
let geminiAIInstance: GoogleGenerativeAI | null = null;

function getGeminiAI(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set.');
  }
  if (!geminiAIInstance) {
    geminiAIInstance = new GoogleGenerativeAI(apiKey);
  }
  return geminiAIInstance;
}

// --- Helper Functions ---
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function estimateCost(inputTokens: number, outputTokens: number): number {
  // Approximate cost calculation - adjust based on actual pricing
  const inputCost = inputTokens * 0.000001; // $1 per 1M tokens
  const outputCost = outputTokens * 0.000002; // $2 per 1M tokens
  return inputCost + outputCost;
}

function trackUsage(ip: string, model: string, inputTokens: number, outputTokens: number) {
  // Placeholder for usage tracking - implement with your preferred analytics
  console.log(`Usage - IP: ${ip}, Model: ${model}, Input: ${inputTokens}, Output: ${outputTokens}`);
}

// --- Handler Functions ---
async function handleStreamAudio(body: ProxyRequestBody): Promise<ProxyResponse> {
  const { audioData } = body;

  try {
    if (!audioData) {
      return { success: false, error: 'No audio data provided.', status: 400 };
    }

    // For now, return a placeholder response since live audio streaming 
    // requires specific SDK support that may not be available yet
    return { 
      success: true, 
      data: { 
        text: 'Audio streaming functionality is being implemented. Please use text input for now.',
        message: 'Audio processing not yet available in this version.' 
      } 
    };

  } catch (error: any) {
    console.error('Error handling audio stream:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return { success: false, error: errorMessage, status: 500 };
  }
}

async function handleGenerateText(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { prompt, model = 'gemini-pro' } = body;
    
    if (!prompt) {
      return { success: false, error: 'No prompt provided', status: 400 };
    }

    const ai = getGeminiAI();
    const modelInstance = ai.getGenerativeModel({ model });
    const result = await modelInstance.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(text);
    const cost = estimateCost(inputTokens, outputTokens);

    return {
      success: true,
      data: { text },
      usage: {
        inputTokens,
        outputTokens,
        cost
      }
    };
  } catch (error: any) {
    console.error('Error in handleGenerateText:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate text',
      status: 500
    };
  }
}

async function handleGenerateDocumentation(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { code, language = 'typescript', model = 'gemini-pro' } = body;
    
    if (!code) {
      return { success: false, error: 'No code provided for documentation', status: 400 };
    }

    const ai = getGeminiAI();
    const modelInstance = ai.getGenerativeModel({ model });
    
    const prompt = `Generate documentation for the following ${language} code. Include:
    1. Function/class description
    2. Parameter documentation
    3. Return value description
    4. Example usage
    
    Code:\n\`\`\`${language}\n${code}\n\`\`\``;

    const result = await modelInstance.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(text);
    const cost = estimateCost(inputTokens, outputTokens);

    return {
      success: true,
      data: { text },
      usage: {
        inputTokens,
        outputTokens,
        cost
      }
    };
  } catch (error: any) {
    console.error('Error in handleGenerateDocumentation:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate documentation',
      status: 500
    };
  }
}

async function handleGenerate(body: ProxyRequestBody): Promise<ProxyResponse> {
  // Default handler for general generation requests
  return handleGenerateText(body);
}

async function handleGenerateImage(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { prompt } = body;
    
    if (!prompt) {
      return { success: false, error: 'No prompt provided for image generation', status: 400 };
    }

    // For now, return a placeholder since image generation may require specific setup
    return {
      success: true,
      data: {
        text: 'Image generation is not yet implemented in this proxy version.',
        images: []
      }
    };
  } catch (error: any) {
    console.error('Error in handleGenerateImage:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate image',
      status: 500
    };
  }
}

async function handleSearchWeb(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { prompt } = body;
    
    if (!prompt) {
      return { success: false, error: 'No search prompt provided', status: 400 };
    }

    // For now, return a placeholder since web search requires specific setup
    return {
      success: true,
      data: {
        text: 'Web search functionality is not yet implemented in this proxy version.',
        sources: []
      }
    };
  } catch (error: any) {
    console.error('Error in handleSearchWeb:', error);
    return {
      success: false,
      error: error.message || 'Failed to perform web search',
      status: 500
    };
  }
}

async function handleTranslate(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { text, targetLanguage, sourceLanguage } = body;
    
    if (!text || !targetLanguage) {
      return { success: false, error: 'Text and target language are required', status: 400 };
    }

    const ai = getGeminiAI();
    const modelInstance = ai.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `Translate the following text from ${sourceLanguage || 'auto-detected language'} to ${targetLanguage}:\n\n${text}`;
    
    const result = await modelInstance.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(translatedText);
    const cost = estimateCost(inputTokens, outputTokens);

    return {
      success: true,
      data: {
        translatedText,
        detectedLanguage: sourceLanguage || 'auto'
      },
      usage: {
        inputTokens,
        outputTokens,
        cost
      }
    };
  } catch (error: any) {
    console.error('Error in handleTranslate:', error);
    return {
      success: false,
      error: error.message || 'Failed to translate text',
      status: 500
    };
  }
}

async function handleAnalyzeImage(body: ProxyRequestBody): Promise<ProxyResponse> {
  try {
    const { prompt = 'Analyze this image', imageData, mimeType, model = 'gemini-pro-vision' } = body;
    
    if (!imageData) {
      return { success: false, error: 'No image data provided', status: 400 };
    }

    const ai = getGeminiAI();
    const modelInstance = ai.getGenerativeModel({ model });
    
    // Convert base64 to the format expected by Gemini
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: mimeType || 'image/jpeg'
      }
    };
    
    const result = await modelInstance.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    const inputTokens = estimateTokens(prompt);
    const outputTokens = estimateTokens(text);
    const cost = estimateCost(inputTokens, outputTokens);

    return {
      success: true,
      data: { text },
      usage: {
        inputTokens,
        outputTokens,
        cost
      }
    };
  } catch (error: any) {
    console.error('Error in handleAnalyzeImage:', error);
    return {
      success: false,
      error: error.message || 'Failed to analyze image',
      status: 500
    };
  }
}

// --- Input Validation ---
function validateInput(body: ProxyRequestBody): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  // Check at least one of the required fields is present
  if (!body.prompt && !body.code && !body.audioData) {
    return { valid: false, error: 'Either prompt, code, or audioData must be provided' };
  }

  // Validate lengths
  if (body.prompt && body.prompt.length > 100000) {
    return { valid: false, error: 'Prompt too long. Maximum 100,000 characters.' };
  }

  if (body.code && body.code.length > 100000) {
    return { valid: false, error: 'Code too long. Maximum 100,000 characters.' };
  }

  // Validate audio data if present
  if (body.audioData) {
    try {
      // Basic validation for base64 audio data
      if (!body.audioData.startsWith('data:audio/')) {
        return { valid: false, error: 'Invalid audio format. Must be a data URL.' };
      }
      
      // Check size (approximate - base64 is ~1.33x original size)
      const base64Data = body.audioData.split(',')[1];
      const sizeInBytes = Math.ceil(base64Data.length * 3 / 4);
      if (sizeInBytes > 10 * 1024 * 1024) { // 10MB limit
        return { valid: false, error: 'Audio file too large. Maximum 10MB.' };
      }
    } catch (error) {
      return { valid: false, error: 'Invalid audio data' };
    }
  }

  return { valid: true };
}

// --- Main HTTP Handler ---
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const action = req.query.action as string;
    const clientIP = Array.isArray(req.headers['x-forwarded-for']) 
      ? req.headers['x-forwarded-for'][0] 
      : req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    let result: { success: boolean, data?: any, error?: any, status?: number, usage?: any };

    // Handle GET requests
    if (req.method === 'GET') {
      if (action === 'health') {
        return res.status(200).json({ success: true, data: { status: 'healthy' } });
      }
      result = { success: false, error: 'GET method not supported for this action' };
    }
    
    // Handle POST requests
    else if (req.method === 'POST') {
      const body: ProxyRequestBody = req.body || {};
      
      if (!action) {
        return res.status(400).json({ success: false, error: 'Action parameter is required' });
      }

      // Input validation
      const validation = validateInput(body);
      if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
      }

             // Process based on action
       switch (action) {
         case 'generateText':
           result = await handleGenerateText(body);
           if (result.success && result.usage) {
             trackUsage(clientIP, body.model || 'gemini-pro', result.usage.inputTokens, result.usage.outputTokens);
           }
           break;
         case 'streamAudio':
           result = await handleStreamAudio(body);
           break;
         case 'generateDocumentation':
           result = await handleGenerateDocumentation(body);
           if (result.success && result.usage) {
             trackUsage(clientIP, body.model || 'gemini-pro', result.usage.inputTokens, result.usage.outputTokens);
           }
           break;
         case 'generateImage':
           result = await handleGenerateImage(body);
           if (result.success && result.usage) {
             trackUsage(clientIP, body.model || 'gemini-pro-vision', result.usage.inputTokens, result.usage.outputTokens);
           }
           break;
         case 'searchWeb':
           result = await handleSearchWeb(body);
           if (result.success && result.usage) {
             trackUsage(clientIP, body.model || 'gemini-pro', result.usage.inputTokens, result.usage.outputTokens);
           }
           break;
         case 'translate':
           result = await handleTranslate(body);
           if (result.success && result.usage) {
             trackUsage(clientIP, body.model || 'gemini-pro', result.usage.inputTokens, result.usage.outputTokens);
           }
           break;
         case 'analyzeImage':
           result = await handleAnalyzeImage(body);
           if (result.success && result.usage) {
             trackUsage(clientIP, body.model || 'gemini-pro-vision', result.usage.inputTokens, result.usage.outputTokens);
           }
           break;
         default:
           result = await handleGenerate(body);
           if (result.success && result.usage) {
             trackUsage(clientIP, body.model || 'gemini-2.0-flash-001', result.usage.inputTokens, result.usage.outputTokens);
           }
           break;
       }
    } else {
      result = { 
        success: false, 
        error: `Method ${req.method} not allowed for action: ${action}`,
        status: 405
      };
    }
    
    // --- THIS IS THE CRITICAL FIX FOR RETURN LOGIC ---
    if (result.success) {
      // The whole result object is the body. It contains success, data, usage, etc.
      return res.status(result.status || 200).json(result);
    } else {
      // For errors, we send a standard error structure.
      return res.status(result.status || 500).json({
          success: false,
          error: result.error || 'An unknown server error occurred.'
      });
    }

  } catch (error: any) {
    console.error('Proxy handler error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
}