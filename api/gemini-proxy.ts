// File: api/gemini-proxy.ts
// Serverless proxy for secure Gemini API access
// Compatible with Vercel deployment

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from "@google/generative-ai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const usageStats = new Map<string, { requests: number; tokens: number; cost: number }>();

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: process.env.NODE_ENV === 'production' ? 60 : 100, // Increased for voice functionality
  windowMs: 60 * 1000, // 1 minute
  maxRequestsPerDay: process.env.NODE_ENV === 'production' ? 1000 : 2000, // Increased for production use
  maxCostPerDay: process.env.NODE_ENV === 'production' ? 10.00 : 50.00, // Increased to $10 prod
};

// Cost estimation (approximate Gemini pricing)
const COST_PER_1K_TOKENS = {
  'gemini-2.0-flash-001': 0.00015, // $0.15 per 1M tokens
  'gemini-2.0-flash-thinking-exp': 0.00015,
  'gemini-1.5-pro': 0.00125, // $1.25 per 1M tokens
};

function estimateTokens(text: string): number {
  // Rough estimation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rate = COST_PER_1K_TOKENS[model as keyof typeof COST_PER_1K_TOKENS] || COST_PER_1K_TOKENS['gemini-2.0-flash-001'];
  return ((inputTokens + outputTokens) / 1000) * rate;
}

function trackUsage(ip: string, model: string, inputTokens: number, outputTokens: number): void {
  const cost = estimateCost(model, inputTokens, outputTokens);
  const dayKey = getRateLimitKey(ip, 'day');
  
  const stats = usageStats.get(dayKey) || { requests: 0, tokens: 0, cost: 0 };
  stats.requests += 1;
  stats.tokens += inputTokens + outputTokens;
  stats.cost += cost;
  
  usageStats.set(dayKey, stats);
  
  // Log high usage for monitoring
  if (stats.cost > 1.0) { // Log when daily cost exceeds $1
    console.warn(`High usage detected - IP: ${ip}, Daily cost: $${stats.cost.toFixed(4)}, Requests: ${stats.requests}`);
  }
}

// Define the expected request body structure from client
interface ProxyRequestBody {
  prompt?: string;
  systemInstruction?: string;
  model?: string;
  image?: string;
  mimeType?: string;
  conversationHistory?: any[];
  audioChunks?: any[];
  text?: string;
  targetLanguage?: string;
  name?: string;
  email?: string;
  interest?: string;
  conversationSummary?: string;
  audioData?: string;
}

// Singleton instance for AI client to reuse connections
let geminiAIInstance: GoogleGenerativeAI | null = null;

// --- Rate Limiting Functions ---
function getRateLimitKey(ip: string, type: 'minute' | 'day'): string {
  const now = new Date();
  if (type === 'minute') {
    return `${ip}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
  }
  return `${ip}:${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

function checkRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  
  // Check minute-based rate limit
  const minuteKey = getRateLimitKey(ip, 'minute');
  const minuteData = rateLimitStore.get(minuteKey) || { count: 0, resetTime: now + RATE_LIMIT.windowMs };
  
  if (minuteData.count >= RATE_LIMIT.maxRequests && now < minuteData.resetTime) {
    return { allowed: false, resetTime: minuteData.resetTime };
  }
  
  // Check daily rate limit
  const dayKey = getRateLimitKey(ip, 'day');
  const dayData = rateLimitStore.get(dayKey) || { count: 0, resetTime: now + 24 * 60 * 60 * 1000 };
  
  if (dayData.count >= RATE_LIMIT.maxRequestsPerDay) {
    return { allowed: false, resetTime: dayData.resetTime };
  }
  
  // Check daily cost limit
  const dayStats = usageStats.get(dayKey) || { requests: 0, tokens: 0, cost: 0 };
  if (dayStats.cost >= RATE_LIMIT.maxCostPerDay) {
    return { allowed: false, resetTime: dayData.resetTime };
  }
  
  // Update counters
  rateLimitStore.set(minuteKey, { count: minuteData.count + 1, resetTime: minuteData.resetTime });
  rateLimitStore.set(dayKey, { count: dayData.count + 1, resetTime: dayData.resetTime });
  
  // Cleanup old entries (basic cleanup)
  if (Math.random() < 0.01) { // 1% chance to cleanup
    for (const [key, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  return { allowed: true };
}

function getClientIP(req: VercelRequest): string {
  return (
    req.headers['x-forwarded-for'] as string ||
    req.headers['x-real-ip'] as string ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  ).split(',')[0].trim();
}

// --- Input Validation ---
function validateInput(body: ProxyRequestBody): { valid: boolean; error?: string } {
  if (body.prompt && body.prompt.length > 10000) {
    return { valid: false, error: 'Prompt too long (max 10,000 characters)' };
  }
  
  if (body.image && body.image.length > 5 * 1024 * 1024) { // 5MB base64 limit
    return { valid: false, error: 'Image too large (max 5MB)' };
  }
  
  if (body.conversationHistory && body.conversationHistory.length > 50) {
    return { valid: false, error: 'Conversation history too long (max 50 messages)' };
  }
  
  // Content filtering - block suspicious patterns
  if (body.prompt) {
    const suspiciousPatterns = [
      /ignore.{0,20}previous.{0,20}instructions/i,
      /system.{0,20}prompt/i,
      /jailbreak/i,
      /pretend.{0,20}you.{0,20}are/i,
      /act.{0,20}as.{0,20}if/i,
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(body.prompt)) {
        return { valid: false, error: 'Content not allowed' };
      }
    }
  }
  
  return { valid: true };
}

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
    });

    const result = await model.generateContent(body.prompt || '');
    const response = await result.response;
    const responseText = response.text();
    
    // Track usage for cost monitoring
    const inputTokens = estimateTokens(body.prompt || '');
    const outputTokens = estimateTokens(responseText);
    
    return {
      success: true,
      data: {
        text: responseText,
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
          ?.map((chunk: any) => chunk.web && ({ uri: chunk.web.uri, title: chunk.web.title }))
          .filter(Boolean) || []
      },
      usage: {
        inputTokens,
        outputTokens,
        estimatedCost: estimateCost(body.model || 'gemini-2.0-flash-001', inputTokens, outputTokens)
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

async function handleStream(body: ProxyRequestBody, res: VercelResponse) {
  const ai = getGeminiAI();
  
  try {
    const model = ai.getGenerativeModel({
      model: body.model || 'gemini-2.0-flash-001',
      systemInstruction: body.systemInstruction,
    });

    const result = await model.generateContentStream(body.prompt || '');
    
    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
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

async function handleUsageStats() {
  try {
    const stats = Array.from(usageStats.entries()).map(([key, data]) => ({
      key,
      ...data
    }));
    
    const totalCost = stats.reduce((sum, stat) => sum + stat.cost, 0);
    const totalRequests = stats.reduce((sum, stat) => sum + stat.requests, 0);
    
    return {
      success: true,
      data: {
        totalCost: totalCost.toFixed(4),
        totalRequests,
        dailyStats: stats,
        rateLimitConfig: RATE_LIMIT
      }
    };
  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to get usage stats: ' + error.message
    };
  }
}

async function handleTranslateText(body: ProxyRequestBody) {
  const googleCloudProjectId = process.env.GOOGLE_CLOUD_PROJECT_ID_SERVER;
  if (!body.text || !body.targetLanguage || !googleCloudProjectId) {
    return { success: false, error: 'Missing text, targetLanguage, or Project ID for translation' };
  }
  
  // Note: This would require @google-cloud/translate package and proper service account setup
  // For now, return a placeholder response
  return { 
    success: true, 
    data: { 
      translatedText: `[Translation placeholder for: ${body.text}]`,
      detectedLanguage: 'en'
    } 
  };
}

async function handleNotifyLead(body: ProxyRequestBody) {
  const { name, email, interest, conversationSummary } = body;
  
  // TODO: Implement actual email sending here using a service like Resend, SendGrid, or Nodemailer.
  // Example implementation structure:
  // const emailApiKey = process.env.EMAIL_SERVICE_API_KEY;
  // if (emailApiKey) {
  //   await sendEmail({ 
  //     to: process.env.NOTIFICATION_EMAIL || 'your_email@example.com', 
  //     subject: `New Lead: ${name}`, 
  //     body: `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\nSummary: ${conversationSummary}` 
  //   });
  // }
  
  console.log(`LEAD NOTIFICATION: Name: ${name}, Email: ${email}, Interest: ${interest}, Summary: ${conversationSummary?.substring(0,100)}...`);
  return { 
    success: true, 
    data: { message: "Lead notification processed (logged to server console)" } 
  };
}

async function handleGenerateChatResponse(body: ProxyRequestBody) {
  try {
    if (!body.prompt || !body.model || !body.systemInstruction) {
      return { success: false, error: 'Missing userMessage, model, or systemInstruction for chat response' };
    }

    const ai = getGeminiAI();
    const model = ai.getGenerativeModel({ 
      model: body.model,
      systemInstruction: body.systemInstruction,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ]
    });

    // Create chat with history if provided
    const chat = model.startChat({
      history: body.conversationHistory || []
    });

    const result = await chat.sendMessage(body.prompt);
    const response = await result.response;
    
    // Extract grounding sources if available
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web && ({ uri: chunk.web.uri, title: chunk.web.title }))
      .filter(Boolean) || [];

    const inputTokens = estimateTokens(body.prompt);
    const outputTokens = estimateTokens(response.text());

    return {
      success: true,
      data: {
        text: response.text(),
        sources
      },
      usage: { inputTokens, outputTokens }
    };
  } catch (error: any) {
    console.error('Chat response error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate chat response'
    };
  }
}

async function handleGenerateImage(body: ProxyRequestBody) {
  try {
    if (!body.prompt || !body.model) {
      return { success: false, error: 'Missing prompt or model for image generation' };
    }

    const ai = getGeminiAI();
    const model = ai.getGenerativeModel({ model: body.model });

    await model.generateContent([{
      text: body.prompt
    }]);

    // Note: This is a placeholder - actual image generation would use a different API
    // For now, return a success response indicating the request was processed
    return {
      success: true,
      data: {
        generatedImages: [{
          url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzNzNkYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgUGxhY2Vob2xkZXI8L3RleHQ+PC9zdmc+',
          mimeType: 'image/svg+xml'
        }]
      }
    };
  } catch (error: any) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate image'
    };
  }
}

async function handleSearchWeb(body: ProxyRequestBody) {
  try {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const searchPrompt = `Search the web for: ${body.prompt}. Provide comprehensive results with sources.`;
    
    const result = await model.generateContent(searchPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: { text }
    };
  } catch (error) {
    console.error('[Proxy] Web search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Web search failed'
    };
  }
}

async function handleGenerateTextOnly(body: ProxyRequestBody) {
  try {
    if (!body.prompt || !body.model) {
      return { success: false, error: 'Missing prompt or model for text generation' };
    }

    const ai = getGeminiAI();
    const model = ai.getGenerativeModel({ 
      model: body.model,
      systemInstruction: body.systemInstruction,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ]
    });

    const result = await model.generateContent(body.prompt);
    const response = await result.response;

    const inputTokens = estimateTokens(body.prompt);
    const outputTokens = estimateTokens(response.text());

    return {
      success: true,
      data: { text: response.text() },
      usage: { inputTokens, outputTokens }
    };
  } catch (error: any) {
    console.error('Text generation error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate text'
    };
  }
}

async function handleGenerateContentWithImageAndText(body: ProxyRequestBody) {
  try {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const parts: Part[] = [];
    
    if (body.text) {
      parts.push({ text: body.text });
    }
    
    if (body.image && body.mimeType) {
      parts.push({
        inlineData: {
          data: body.image,
          mimeType: body.mimeType
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: { text }
    };
  } catch (error) {
    console.error('[Proxy] Content generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Content generation failed'
    };
  }
}

async function handleSummarizeChatHistory(body: ProxyRequestBody) {
  try {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const conversationText = body.conversationHistory?.map(msg => 
      `${msg.sender}: ${msg.text}`
    ).join('\n') || '';

    const prompt = `Please provide a concise summary of this conversation:\n\n${conversationText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: { summary: text }
    };
  } catch (error) {
    console.error('[Proxy] Chat summarization error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chat summarization failed'
    };
  }
}

async function handleGenerateInternalBrief(body: ProxyRequestBody) {
  try {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const conversationText = body.conversationHistory?.map(msg => 
      `${msg.sender}: ${msg.text}`
    ).join('\n') || '';

    const prompt = `Generate an internal brief based on this conversation:\n\n${conversationText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: { brief: text }
    };
  } catch (error) {
    console.error('[Proxy] Internal brief generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Internal brief generation failed'
    };
  }
}

async function handleGenerateClientSummaryForPdf(body: ProxyRequestBody) {
  try {
    const genAI = getGeminiAI();
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
    });

    const conversationText = body.conversationHistory?.map(msg => 
      `${msg.sender}: ${msg.text}`
    ).join('\n') || '';

    const prompt = `Generate a client summary for PDF based on this conversation:\n\n${conversationText}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      success: true,
      data: { summary: text }
    };
  } catch (error) {
    console.error('[Proxy] Client summary generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Client summary generation failed'
    };
  }
}

async function handleStreamAudio(body: ProxyRequestBody) {
  try {
    // Live Audio streaming requires WebSocket connection, not REST API
    return {
      success: false,
      error: 'Live Audio streaming requires WebSocket connection. Use Gemini Live API instead of REST API.',
      data: {
        message: 'Voice functionality requires direct client-side API access or WebSocket Live API',
        suggestion: 'Use browser-based speech recognition + text generation + browser TTS for production',
        documentation: 'https://ai.google.dev/gemini-api/docs/live'
      }
    };
  } catch (error: any) {
    console.error('Stream audio error:', error);
    return {
      success: false,
      error: error.message || 'Failed to process audio stream'
    };
  }
}

async function handleSpeakText(body: ProxyRequestBody) {
  try {
    // TTS via REST API is not available - requires Live API WebSocket or browser TTS
    return {
      success: false,
      error: 'Text-to-speech requires WebSocket Live API or browser speechSynthesis.',
      data: {
        text: body.text || '',
        message: 'Use browser speechSynthesis API for production TTS',
        fallback: 'Browser TTS recommended',
        documentation: 'https://ai.google.dev/gemini-api/docs/live'
      }
    };
  } catch (error: any) {
    console.error('Speak text error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate speech'
    };
  }
}

// --- Main Handler Function ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for browser requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Rate limiting check
  const clientIP = getClientIP(req);
  const rateLimitResult = checkRateLimit(clientIP);
  
  if (!rateLimitResult.allowed) {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      resetTime: rateLimitResult.resetTime
    });
    return;
  }

  // Parse the URL to determine the action
  const url = new URL(req.url || '', `https://${req.headers.host}`);
  const pathname = url.pathname;
  
  // Extract action from path: /api/gemini-proxy/action or /api/gemini-proxy?action=...
  let action = '';
  if (pathname.includes('/api/gemini-proxy/')) {
    action = pathname.split('/api/gemini-proxy/')[1] || '';
  } else {
    action = url.searchParams.get('action') || '';
  }
  
  console.log(`[Proxy] ${req.method} ${pathname} - Action: ${action} - IP: ${clientIP}`);
  
  try {
    let result;

    if (req.method === 'GET' && (action === 'health' || pathname.endsWith('/health'))) {
      result = await handleHealthCheck();
    } else if (req.method === 'POST') {
      const body: ProxyRequestBody = req.body || {};

      // Input validation
      const validation = validateInput(body);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: validation.error
        });
        return;
      }

      switch (action) {
        case 'generate':
          result = await handleGenerate(body);
          // Track usage after successful generation
          if (result.success && result.usage) {
            trackUsage(clientIP, body.model || 'gemini-2.0-flash-001', result.usage.inputTokens, result.usage.outputTokens);
          }
          break;
        case 'stream':
          // Special handling for streaming - doesn't return JSON
          await handleStream(body, res);
          return;
        case 'analyze-image':
          result = await handleAnalyzeImage(body);
          break;
        case 'follow-up':
          result = await handleFollowUp(body);
          break;
        case 'usage-stats':
          result = await handleUsageStats();
          break;
        case 'translateText':
          result = await handleTranslateText(body);
          break;
        case 'notifyLead':
          result = await handleNotifyLead(body);
          break;
        case 'generateChatResponse':
          result = await handleGenerateChatResponse(body);
          break;
        case 'generateImage':
          result = await handleGenerateImage(body);
          break;
        case 'searchWeb':
          result = await handleSearchWeb(body);
          break;
        case 'generateTextOnly':
          result = await handleGenerateTextOnly(body);
          if (result.success && result.usage) {
            trackUsage(clientIP, body.model || 'gemini-2.0-flash-001', result.usage.inputTokens, result.usage.outputTokens);
          }
          break;
        case 'generateContentWithImageAndText':
          result = await handleGenerateContentWithImageAndText(body);
          break;
        case 'summarizeChatHistory':
          result = await handleSummarizeChatHistory(body);
          break;
        case 'generateInternalBrief':
          result = await handleGenerateInternalBrief(body);
          break;
        case 'generateClientSummaryForPdf':
          result = await handleGenerateClientSummaryForPdf(body);
          break;
        case 'streamAudio':
          result = await handleStreamAudio(body);
          break;
        case 'speakText':
          result = await handleSpeakText(body);
          break;
        default:
          // Default to generate if no action specified
          result = await handleGenerate(body);
          // Track usage after successful generation
          if (result.success && result.usage) {
            trackUsage(clientIP, body.model || 'gemini-2.0-flash-001', result.usage.inputTokens, result.usage.outputTokens);
          }
          break;
      }
    } else {
      result = { 
        success: false, 
        error: `Method ${req.method} not allowed for action: ${action}` 
      };
    }

    res.status(result.success ? 200 : 400).json(result);

  } catch (error: any) {
    console.error('Proxy handler error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
} 