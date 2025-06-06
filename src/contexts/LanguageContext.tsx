import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context data
interface LanguageContextType {
  sourceLanguage: string;
  targetLanguage: string;
  setSourceLanguage: (language: string) => void;
  setTargetLanguage: (language: string) => void;
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
  const [targetLanguage, setTargetLanguage] = useState<string>('en'); // Default target language

  return (
    <LanguageContext.Provider value={{ sourceLanguage, targetLanguage, setSourceLanguage, setTargetLanguage }}>
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
