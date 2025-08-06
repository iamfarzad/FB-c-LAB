import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage, WebSource } from '../types';

// Types
interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

interface GeminiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: TokenUsage;
}

interface ServiceConfig {
  maxTokensPerRequest: number;
  maxCostPerRequest: number;
  dailyBudgetLimit: number;
  enableCaching: boolean;
  retryAttempts: number;
}

// Default configuration
const DEFAULT_CONFIG: ServiceConfig = {
  maxTokensPerRequest: 8000,
  maxCostPerRequest: 0.10, // $0.10 per request
  dailyBudgetLimit: 10.00, // $10 per day
  enableCaching: true,
  retryAttempts: 3
};

export class GeminiService {
  private genai: GoogleGenerativeAI;
  private config: ServiceConfig;
  private dailyUsage: number = 0;
  private cache: Map<string, any> = new Map();
  
  constructor(apiKey: string, config: Partial<ServiceConfig> = {}) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    
    this.genai = new GoogleGenerativeAI(apiKey);
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Load daily usage from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('gemini_daily_usage');
      const storedDate = localStorage.getItem('gemini_usage_date');
      const today = new Date().toDateString();
      
      if (stored && storedDate === today) {
        this.dailyUsage = parseFloat(stored);
      }
    }
  }

  // Utility methods
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    // Gemini pricing (approximate)
    const inputCost = inputTokens * 0.000001; // $1 per 1M input tokens
    const outputCost = outputTokens * 0.000002; // $2 per 1M output tokens
    return inputCost + outputCost;
  }

  private updateDailyUsage(cost: number) {
    this.dailyUsage += cost;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_daily_usage', this.dailyUsage.toString());
      localStorage.setItem('gemini_usage_date', new Date().toDateString());
    }
  }

  private checkBudget(estimatedCost: number): boolean {
    return (this.dailyUsage + estimatedCost) <= this.config.dailyBudgetLimit;
  }

  private getCacheKey(method: string, params: any): string {
    return `${method}_${JSON.stringify(params)}`;
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = this.config.retryAttempts
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
    
    throw lastError!;
  }

  // Core AI Methods
  async generateText(
    prompt: string, 
    systemInstruction?: string,
    model: string = 'gemini-2.0-flash-exp'
  ): Promise<GeminiResponse<{ text: string }>> {
    try {
      const cacheKey = this.getCacheKey('generateText', { prompt, systemInstruction, model });
      
      if (this.config.enableCaching && this.cache.has(cacheKey)) {
        return { success: true, data: this.cache.get(cacheKey) };
      }

      const inputTokens = this.estimateTokens(prompt + (systemInstruction || ''));
      const estimatedCost = this.estimateCost(inputTokens, 1000); // Estimate 1000 output tokens
      
      if (!this.checkBudget(estimatedCost)) {
        return {
          success: false,
          error: `Daily budget limit exceeded. Current usage: $${this.dailyUsage.toFixed(4)}`
        };
      }

      const result = await this.withRetry(async () => {
        const modelInstance = this.genai.getGenerativeModel({ 
          model,
          systemInstruction: systemInstruction ? { text: systemInstruction } : undefined
        });
        
        const response = await modelInstance.generateContent(prompt);
        return response.response.text();
      });

      const outputTokens = this.estimateTokens(result);
      const actualCost = this.estimateCost(inputTokens, outputTokens);
      this.updateDailyUsage(actualCost);

      const responseData = { text: result };
      
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, responseData);
      }

      return {
        success: true,
        data: responseData,
        usage: { inputTokens, outputTokens, cost: actualCost }
      };
      
    } catch (error) {
      console.error('GeminiService.generateText error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Text generation failed'
      };
    }
  }

  async analyzeImage(
    imageData: string,
    prompt: string = 'Analyze this image in detail',
    mimeType: string = 'image/jpeg',
    model: string = 'gemini-2.0-flash-exp'
  ): Promise<GeminiResponse<{ text: string }>> {
    try {
      const inputTokens = this.estimateTokens(prompt) + 1000; // Add tokens for image
      const estimatedCost = this.estimateCost(inputTokens, 1000);
      
      if (!this.checkBudget(estimatedCost)) {
        return {
          success: false,
          error: `Daily budget limit exceeded. Current usage: $${this.dailyUsage.toFixed(4)}`
        };
      }

      const result = await this.withRetry(async () => {
        const modelInstance = this.genai.getGenerativeModel({ model });
        
        const imagePart = {
          inlineData: {
            data: imageData,
            mimeType
          }
        };
        
        const response = await modelInstance.generateContent([prompt, imagePart]);
        return response.response.text();
      });

      const outputTokens = this.estimateTokens(result);
      const actualCost = this.estimateCost(inputTokens, outputTokens);
      this.updateDailyUsage(actualCost);

      return {
        success: true,
        data: { text: result },
        usage: { inputTokens, outputTokens, cost: actualCost }
      };
      
    } catch (error) {
      console.error('GeminiService.analyzeImage error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image analysis failed'
      };
    }
  }

  async analyzeDocument(
    documentText: string,
    analysisType: 'summary' | 'key-points' | 'sentiment' | 'custom' = 'summary',
    customPrompt?: string
  ): Promise<GeminiResponse<{ analysis: string; type: string }>> {
    try {
      let prompt = customPrompt;
      
      if (!prompt) {
        switch (analysisType) {
          case 'summary':
            prompt = 'Provide a comprehensive summary of this document:';
            break;
          case 'key-points':
            prompt = 'Extract the key points and main ideas from this document:';
            break;
          case 'sentiment':
            prompt = 'Analyze the sentiment and tone of this document:';
            break;
          default:
            prompt = 'Analyze this document:';
        }
      }

      const fullPrompt = `${prompt}\n\n${documentText}`;
      const response = await this.generateText(fullPrompt);

      if (!response.success) {
        return response;
      }

      return {
        success: true,
        data: {
          analysis: response.data!.text,
          type: analysisType
        },
        usage: response.usage
      };
      
    } catch (error) {
      console.error('GeminiService.analyzeDocument error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Document analysis failed'
      };
    }
  }

  async generateRoiReport(
    projectData: {
      description: string;
      budget: number;
      timeline: string;
      goals: string[];
      metrics?: string[];
    }
  ): Promise<GeminiResponse<{ report: string; recommendations: string[] }>> {
    try {
      const prompt = `Generate a comprehensive ROI analysis report for the following project:

Project Description: ${projectData.description}
Budget: $${projectData.budget}
Timeline: ${projectData.timeline}
Goals: ${projectData.goals.join(', ')}
${projectData.metrics ? `Metrics: ${projectData.metrics.join(', ')}` : ''}

Please provide:
1. ROI calculation methodology
2. Expected returns and timeline
3. Risk assessment
4. Key performance indicators
5. Actionable recommendations

Format the response as a professional business report.`;

      const response = await this.generateText(prompt);

      if (!response.success) {
        return response;
      }

      // Extract recommendations from the response
      const text = response.data!.text;
      const recommendations = this.extractRecommendations(text);

      return {
        success: true,
        data: {
          report: text,
          recommendations
        },
        usage: response.usage
      };
      
    } catch (error) {
      console.error('GeminiService.generateRoiReport error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'ROI report generation failed'
      };
    }
  }

  async generateVideoAppSpec(
    videoDescription: string,
    requirements?: string[]
  ): Promise<GeminiResponse<{ specification: string; features: string[]; techStack: string[] }>> {
    try {
      const prompt = `Based on this video description, generate a detailed app specification:

Video Description: ${videoDescription}
${requirements ? `Additional Requirements: ${requirements.join(', ')}` : ''}

Please provide:
1. App concept and purpose
2. Core features and functionality
3. User interface design suggestions
4. Recommended technology stack
5. Development phases and timeline
6. Monetization strategies

Format as a comprehensive technical specification document.`;

      const response = await this.generateText(prompt);

      if (!response.success) {
        return response;
      }

      const text = response.data!.text;
      const features = this.extractFeatures(text);
      const techStack = this.extractTechStack(text);

      return {
        success: true,
        data: {
          specification: text,
          features,
          techStack
        },
        usage: response.usage
      };
      
    } catch (error) {
      console.error('GeminiService.generateVideoAppSpec error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Video app spec generation failed'
      };
    }
  }

  async performGroundedSearch(
    query: string,
    conversationHistory: ChatMessage[] = []
  ): Promise<GeminiResponse<{ text: string; sources: WebSource[] }>> {
    try {
      // For now, this is a placeholder implementation
      // In a real implementation, you'd integrate with search APIs
      const contextPrompt = conversationHistory.length > 0 
        ? `Context from conversation: ${conversationHistory.map(msg => msg.content).join(' ')}\n\n`
        : '';

      const prompt = `${contextPrompt}Search and provide information about: ${query}

Please provide:
1. Comprehensive answer based on current information
2. Key facts and statistics
3. Multiple perspectives if applicable
4. Relevant context and background

Note: This is a simulated search result. In production, this would be enhanced with real-time web search capabilities.`;

      const response = await this.generateText(prompt);

      if (!response.success) {
        return response;
      }

      // Simulate sources (in production, these would come from actual search results)
      const sources: WebSource[] = [
        {
          title: 'Simulated Search Result',
          url: 'https://example.com/search-result',
          snippet: 'This is a placeholder for actual search results.'
        }
      ];

      return {
        success: true,
        data: {
          text: response.data!.text,
          sources
        },
        usage: response.usage
      };
      
    } catch (error) {
      console.error('GeminiService.performGroundedSearch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Grounded search failed'
      };
    }
  }

  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage: string = 'auto'
  ): Promise<GeminiResponse<{ translatedText: string; detectedLanguage?: string }>> {
    try {
      const prompt = `Translate the following text from ${sourceLanguage === 'auto' ? 'the detected language' : sourceLanguage} to ${targetLanguage}:

${text}

Please provide only the translation without additional commentary.`;

      const response = await this.generateText(prompt);

      if (!response.success) {
        return response;
      }

      return {
        success: true,
        data: {
          translatedText: response.data!.text,
          detectedLanguage: sourceLanguage === 'auto' ? 'auto-detected' : sourceLanguage
        },
        usage: response.usage
      };
      
    } catch (error) {
      console.error('GeminiService.translateText error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed'
      };
    }
  }

  // Utility methods for parsing responses
  private extractRecommendations(text: string): string[] {
    const recommendations: string[] = [];
    const lines = text.split('\n');
    
    let inRecommendationsSection = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('recommendation')) {
        inRecommendationsSection = true;
        continue;
      }
      
      if (inRecommendationsSection && (line.match(/^\d+\./) || line.match(/^[-•]/))) {
        recommendations.push(line.replace(/^\d+\.\s*|^[-•]\s*/, '').trim());
      }
    }
    
    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  private extractFeatures(text: string): string[] {
    const features: string[] = [];
    const featureKeywords = ['feature', 'functionality', 'capability'];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      if (featureKeywords.some(keyword => lowerLine.includes(keyword)) && 
          (line.match(/^\d+\./) || line.match(/^[-•]/))) {
        features.push(line.replace(/^\d+\.\s*|^[-•]\s*/, '').trim());
      }
    }
    
    return features.slice(0, 8); // Limit to 8 features
  }

  private extractTechStack(text: string): string[] {
    const techStack: string[] = [];
    const techKeywords = ['technology', 'stack', 'framework', 'language', 'database', 'platform'];
    const commonTech = ['React', 'Node.js', 'Python', 'TypeScript', 'MongoDB', 'PostgreSQL', 'AWS', 'Vercel'];
    
    for (const tech of commonTech) {
      if (text.includes(tech)) {
        techStack.push(tech);
      }
    }
    
    return [...new Set(techStack)]; // Remove duplicates
  }

  // Service management methods
  getDailyUsage(): number {
    return this.dailyUsage;
  }

  getRemainingBudget(): number {
    return Math.max(0, this.config.dailyBudgetLimit - this.dailyUsage);
  }

  clearCache(): void {
    this.cache.clear();
  }

  updateConfig(newConfig: Partial<ServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getStats() {
    return {
      dailyUsage: this.dailyUsage,
      remainingBudget: this.getRemainingBudget(),
      cacheSize: this.cache.size,
      config: this.config
    };
  }
}

// Singleton instance for the application
let geminiServiceInstance: GeminiService | null = null;

export const getGeminiService = (apiKey?: string): GeminiService => {
  if (!geminiServiceInstance && apiKey) {
    geminiServiceInstance = new GeminiService(apiKey);
  }
  
  if (!geminiServiceInstance) {
    throw new Error('GeminiService not initialized. Provide an API key.');
  }
  
  return geminiServiceInstance;
};

export default GeminiService;