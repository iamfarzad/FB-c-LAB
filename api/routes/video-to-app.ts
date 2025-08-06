import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiService } from '../../src/lib/GeminiService';

interface VideoToAppRequest {
  videoDescription: string;
  requirements?: string[];
  targetPlatform?: 'web' | 'mobile' | 'desktop' | 'all';
  complexity?: 'simple' | 'medium' | 'complex';
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
      videoDescription, 
      requirements = [],
      targetPlatform = 'web',
      complexity = 'medium'
    }: VideoToAppRequest = req.body;

    // Validation
    if (!videoDescription || videoDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Video description is required'
      });
    }

    if (videoDescription.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Video description too long. Maximum 5,000 characters allowed.'
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

    // Enhance requirements based on platform and complexity
    const enhancedRequirements = [
      ...requirements,
      `Target platform: ${targetPlatform}`,
      `Complexity level: ${complexity}`,
      targetPlatform === 'mobile' ? 'Mobile-responsive design' : '',
      targetPlatform === 'web' ? 'Cross-browser compatibility' : '',
      complexity === 'complex' ? 'Advanced features and integrations' : '',
      complexity === 'simple' ? 'Minimal viable product approach' : ''
    ].filter(Boolean);

    // Generate app specification
    const result = await geminiService.generateVideoAppSpec(
      videoDescription,
      enhancedRequirements
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        specification: result.data!.specification,
        features: result.data!.features,
        techStack: result.data!.techStack,
        metadata: {
          targetPlatform,
          complexity,
          videoDescription: videoDescription.substring(0, 200) + '...',
          requirementsCount: enhancedRequirements.length
        }
      },
      usage: result.usage
    });

  } catch (error) {
    console.error('Video-to-app error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}