import { NextRequest, NextResponse } from 'next/server';
import { getGeminiService } from '@/lib/GeminiService';

interface ImageAnalysisRequest {
  imageData: string; // base64 encoded
  prompt?: string;
  mimeType?: string;
  fileName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ImageAnalysisRequest = await request.json();
    const { 
      imageData, 
      prompt = 'Analyze this image in detail. Describe what you see, including objects, people, text, colors, composition, and any notable features.',
      mimeType = 'image/jpeg',
      fileName 
    } = body;

    // Validation
    if (!imageData) {
      return NextResponse.json({
        success: false,
        error: 'Image data is required'
      }, { status: 400 });
    }

    // Validate base64 format
    try {
      const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      const sizeInBytes = Math.ceil(base64Data.length * 3 / 4);
      
      if (sizeInBytes > 10 * 1024 * 1024) { // 10MB limit
        return NextResponse.json({
          success: false,
          error: 'Image too large. Maximum 10MB allowed.'
        }, { status: 400 });
      }
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid image data format'
      }, { status: 400 });
    }

    // Get Gemini service instance
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured'
      }, { status: 500 });
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
      return NextResponse.json(result, { status: 500 });
    }

    // Return successful response
    return NextResponse.json({
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}