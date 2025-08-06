import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiService } from '../../src/lib/GeminiService';
import { ChatMessage } from '../../src/types';

interface GroundedSearchRequest {
  query: string;
  conversationHistory?: ChatMessage[];
  maxResults?: number;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  try {
    const { 
      query, 
      conversationHistory = [],
      maxResults = 10
    }: GroundedSearchRequest = req.body;

    // Validation
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    if (query.length > 500) {
      return res.status(400).json({
        success: false,
        error: 'Search query too long. Maximum 500 characters allowed.'
      });
    }

    // Get Gemini service instance
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key not configured'
      });
    }

    const geminiService = getGeminiService(apiKey);

    // Perform grounded search
    const result = await geminiService.performGroundedSearch(
      query,
      conversationHistory
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        text: result.data!.text,
        sources: result.data!.sources.slice(0, maxResults),
        query: query,
        timestamp: new Date().toISOString()
      },
      usage: result.usage
    });

  } catch (error) {
    console.error('Grounded search error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}