import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGeminiService } from '../../src/lib/GeminiService';

interface ImageAnalysisRequest {
  imageData: string; // base64 encoded
  prompt?: string;
  mimeType?: string;
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
      imageData, 
      prompt = 'Analyze this image in detail. Describe what you see, including objects, people, text, colors, composition, and any notable features.',
      mimeType = 'image/jpeg',
      fileName 
    }: ImageAnalysisRequest = req.body;

    // Validation
    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }

    // Validate base64 format
    try {
      const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      const sizeInBytes = Math.ceil(base64Data.length * 3 / 4);
      
      if (sizeInBytes > 10 * 1024 * 1024) { // 10MB limit
        return res.status(400).json({
          success: false,
          error: 'Image too large. Maximum 10MB allowed.'
        });
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid image data format'
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

    // Clean base64 data (remove data URL prefix if present)
    const cleanImageData = imageData.includes(',') ? imageData.split(',')[1] : imageData;

    // Analyze image
    const result = await geminiService.analyzeImage(
      cleanImageData,
      prompt,
      mimeType
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      data: {
        analysis: result.data!.text,
        fileName: fileName || 'Unknown Image',
        prompt: prompt,
        mimeType: mimeType
      },
      usage: result.usage
    });

  } catch (error) {
    console.error('Image analysis error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}