import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiService } from '../../src/lib/GeminiService';

interface RoiCalculationRequest {
  description: string;
  budget: number;
  timeline: string;
  goals: string[];
  metrics?: string[];
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
    const { description, budget, timeline, goals, metrics }: RoiCalculationRequest = req.body;

    // Validation
    if (!description || !budget || !timeline || !goals || goals.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: description, budget, timeline, goals'
      });
    }

    if (budget <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Budget must be greater than 0'
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

    // Generate ROI report
    const result = await geminiService.generateRoiReport({
      description,
      budget,
      timeline,
      goals,
      metrics
    });

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        report: result.data!.report,
        recommendations: result.data!.recommendations,
        projectData: { description, budget, timeline, goals, metrics }
      },
      usage: result.usage
    });

  } catch (error) {
    console.error('ROI calculation error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}