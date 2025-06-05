import { initializeGeminiService } from '../services/geminiService'; // Adjust path if services is not ../services

// This function will be called once at application startup.
export const setupEnvironment = async () => {
  let GoogleGenerativeAIModule: any = null;

  // Safely access import.meta.env
  const isNodeEnv = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
  const isBrowserEnv = typeof window !== 'undefined';

  let isDev = false;
  let apiKey: string | undefined = undefined;

  if (!isNodeEnv && isBrowserEnv && typeof import.meta !== 'undefined' && import.meta.env) {
    isDev = import.meta.env.DEV ?? false;
    apiKey = import.meta.env.VITE_API_KEY || import.meta.env.GEMINI_API_KEY_SERVER;
  } else if (isNodeEnv) {
    // Potentially handle Node.js env variables if needed, e.g. for server-side aspects
    // For this primarily client-side service, browser env vars are key.
    // isDev = process.env.NODE_ENV === 'development';
    // apiKey = process.env.VITE_API_KEY || process.env.GEMINI_API_KEY_SERVER;
  }


  if (isDev && apiKey) {
    try {
      // Dynamically import Google AI SDK only in dev mode with an API key
      GoogleGenerativeAIModule = await import('@google/generative-ai');
    } catch (e) {
      console.warn("Failed to load Google AI SDK for development fallback in envInitializer:", e);
    }
  }

  initializeGeminiService({
    isDev: isDev,
    apiKey: apiKey,
    googleAI: GoogleGenerativeAIModule ? GoogleGenerativeAIModule.GoogleGenerativeAI : null
  });

  console.log(`Gemini Service Initialized: isDev=${isDev}, hasApiKey=${!!apiKey}, GoogleAISDKLoaded=${!!GoogleGenerativeAIModule}`);
};
