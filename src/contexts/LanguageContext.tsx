import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context data
interface LanguageContextType {
  sourceLanguage: string;
  targetLanguage: string;
  setSourceLanguage: (language: string) => void;
  setTargetLanguage: (language: string) => void;
  translatePageContent: (content: string) => Promise<string>;
  isTranslating: boolean;
}

// Create the context with a default undefined value
// We'll check for undefined in the hook to ensure provider is used
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Define the props for the provider component
interface LanguageProviderProps {
  children: ReactNode;
}

// Create the provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [sourceLanguage, setSourceLanguage] = useState<string>('en'); // Default source language
  const [targetLanguage, setTargetLanguage] = useState<string>('no'); // Default to Norwegian
  const [isTranslating, setIsTranslating] = useState<boolean>(false);

  // Function to translate page content using the proxy API or direct service
  const translatePageContent = async (content: string): Promise<string> => {
    if (!content || targetLanguage === sourceLanguage) {
      return content;
    }

    setIsTranslating(true);
    try {
      // Check if we're in development (localhost) or production
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (!isDevelopment) {
        // Try the API proxy (for production)
        try {
          const response = await fetch('/api/gemini-proxy/translateText', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: content,
              sourceLanguage,
              targetLanguage,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.translatedText) {
              return result.data.translatedText;
            }
          }
        } catch (apiError) {
          console.log('API proxy failed, falling back to direct service');
        }
      }

      // Use direct translation service (for development or fallback)
      console.log('Using direct translation service...');
      const { translateText } = await import('../../services/geminiService');
      const result = await translateText(content, targetLanguage, sourceLanguage);
      return result.translatedText;

    } catch (error) {
      console.error('Translation error:', error);
      // Return original content if translation fails
      return content;
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      sourceLanguage, 
      targetLanguage, 
      setSourceLanguage, 
      setTargetLanguage,
      translatePageContent,
      isTranslating
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a custom hook for easy context consumption
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
