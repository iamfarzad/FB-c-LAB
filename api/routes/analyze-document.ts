import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiService } from '../../src/lib/GeminiService';

interface DocumentAnalysisRequest {
  documentText: string;
  analysisType?: 'summary' | 'key-points' | 'sentiment' | 'custom';
  customPrompt?: string;
  fileName?: string;
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
      documentText, 
      analysisType = 'summary', 
      customPrompt,
      fileName 
    }: DocumentAnalysisRequest = req.body;

    // Validation
    if (!documentText || documentText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Document text is required'
      });
    }

    if (documentText.length > 100000) {
      return res.status(400).json({
        success: false,
        error: 'Document text too long. Maximum 100,000 characters allowed.'
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

    // Analyze document
    const result = await geminiService.analyzeDocument(
      documentText,
      analysisType,
      customPrompt
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        analysis: result.data!.analysis,
        analysisType: result.data!.type,
        fileName: fileName || 'Unknown Document',
        wordCount: documentText.split(/\s+/).length,
        characterCount: documentText.length
      },
      usage: result.usage
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}