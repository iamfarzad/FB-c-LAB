import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Theme } from '../../contexts/ThemeContext';

interface PageTranslatorProps {
  theme: Theme;
  className?: string;
}

export const PageTranslator: React.FC<PageTranslatorProps> = ({ theme, className = '' }) => {
  const { targetLanguage, setTargetLanguage, translatePageContent, isTranslating } = useLanguage();

  const handleTranslatePage = async () => {
    if (targetLanguage === 'en') {
      // Switch to Norwegian and translate content
      setTargetLanguage('no');
      
      console.log('Starting translation to Norwegian...');
      
      // Get main content areas (more selective)
      const textElements = document.querySelectorAll(`
        main p, 
        main h1, main h2, main h3, main h4, main h5, main h6,
        main span:not(.no-translate):not([class*="icon"]):not([class*="logo"]),
        main button:not(.no-translate) span,
        main li
      `);
      
      console.log(`Found ${textElements.length} elements to translate`);
      let translatedCount = 0;
      
      for (const element of textElements) {
        const textContent = element.textContent?.trim();
        
        // Skip elements that shouldn't be translated
        if (!textContent || 
            textContent.length < 3 || 
            /^\d+[\d\s\-\+\(\)]*$/.test(textContent) || // Numbers, phone numbers, etc.
            /^[A-Z]{2,}$/.test(textContent) || // Acronyms
            element.classList.contains('no-translate') ||
            element.closest('.no-translate') ||
            element.closest('nav') || // Skip navigation
            element.closest('header') || // Skip header
            element.closest('footer') || // Skip footer
            element.querySelector('canvas, svg, img, button')) {
          continue;
        }

        try {
          console.log(`Translating: "${textContent.substring(0, 50)}..."`);
          const translatedText = await translatePageContent(textContent);
          
          if (translatedText && translatedText !== textContent) {
            // Store original text as data attribute for reverting
            if (!element.getAttribute('data-original-text')) {
              element.setAttribute('data-original-text', textContent);
            }
            element.textContent = translatedText;
            translatedCount++;
            console.log(`Translated to: "${translatedText.substring(0, 50)}..."`);
          }
        } catch (error) {
          console.error('Translation failed for element:', error);
        }
      }
      
      console.log(`Translation complete! Translated ${translatedCount} elements.`);
      
    } else {
      // Switch back to English and restore original text
      setTargetLanguage('en');
      
      console.log('Restoring original English text...');
      
      // Restore original text from data attributes
      const translatedElements = document.querySelectorAll('[data-original-text]');
      translatedElements.forEach(element => {
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
          element.textContent = originalText;
          element.removeAttribute('data-original-text');
        }
      });
      
      console.log(`Restored ${translatedElements.length} elements to English.`);
    }
  };

  return (
    <button
      onClick={handleTranslatePage}
      disabled={isTranslating}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 
        hover:scale-105 active:scale-95 no-translate shadow-lg
        ${theme === Theme.DARK 
          ? 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 hover:border-slate-500' 
          : 'text-slate-700 hover:text-slate-900 bg-white/80 hover:bg-slate-50/80 border border-slate-300 hover:border-slate-400'
        }
        ${isTranslating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'}
        ${className}
      `}
      title={targetLanguage === 'en' ? 'Translate page content to Norwegian' : 'Switch back to English'}
    >
      <Languages className={`w-4 h-4 ${isTranslating ? 'opacity-50' : ''}`} />
      <span className="text-sm font-medium">
        {isTranslating 
          ? 'Translating...' 
          : targetLanguage === 'en' 
            ? 'Translate to Norwegian' 
            : 'Back to English'
        }
      </span>
    </button>
  );
}; 