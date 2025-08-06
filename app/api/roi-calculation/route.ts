import { NextRequest, NextResponse } from 'next/server';
import { getGeminiService } from '@/lib/GeminiService';

interface RoiCalculationRequest {
  description: string;
  budget: number;
  timeline: string;
  goals: string[];
  metrics?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: RoiCalculationRequest = await request.json();
    const { description, budget, timeline, goals, metrics } = body;

    // Validation
    if (!description || !budget || !timeline || !goals || goals.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: description, budget, timeline, goals'
      }, { status: 400 });
    }

    if (budget <= 0) {
      return NextResponse.json({
        success: false,
        error: 'Budget must be greater than 0'
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

    // Generate ROI report
    const result = await geminiService.generateRoiReport({
      description,
      budget,
      timeline,
      goals,
      metrics
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    // Return successful response
    return NextResponse.json({
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
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}