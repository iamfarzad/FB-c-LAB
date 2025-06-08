import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChatMessage, MessageSender, MessageType, Theme } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Import i18n configuration
import '@/i18n';

// Import contexts
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

// Import the actual Header and Footer components
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Import the actual page components
import { HomePage } from '@/pages/HomePage';
import { AboutPage } from '@/pages/AboutPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { WorkshopPage } from '@/pages/WorkshopPage';
import { ContactPage } from '@/pages/ContactPage';
// import { AdminWorkshopPage } from '@/pages/AdminWorkshopPage';

// Import the interaction panel
import { UnifiedInteractionPanel } from '@/components/interaction/UnifiedInteractionPanel';
import { AppBackground } from '@/components/AppBackground';

// --- THIS IS THE FIX: Correctly import from inside src using the '@/' alias ---
import { INITIAL_AI_CHAT_MESSAGE } from '@/constants';
import {
  generateText,
  analyzeImage,
  generateImage,
  performGroundedSearch,
} from '@/services/geminiService';

// Main App component styling
import '@/index.css';

const AppContent: React.FC = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const toggleTheme = () => {
    const newTheme = resolvedTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;
    setTheme(newTheme);
  };

  const handleToggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const handleOpenInteractionPanelWithMessage = (message?: string) => {
    setIsChatOpen(true);
    
    if (chatHistory.length === 0 && !message) {
      const aiGreeting: ChatMessage = {
        id: uuidv4(),
        sender: MessageSender.AI,
        type: MessageType.TEXT,
        text: INITIAL_AI_CHAT_MESSAGE,
        timestamp: Date.now()
      };
      setChatHistory([aiGreeting]);
    }
    
    if (message) {
      handleSendMessage(message);
    }
  };

  const handleSendMessage = async (messageText: string, imageBase64?: string, imageMimeType?: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      sender: MessageSender.USER,
      type: imageBase64 ? MessageType.IMAGE : MessageType.TEXT,
      text: messageText,
      imageUrl: imageBase64 ? `data:${imageMimeType};base64,${imageBase64}` : undefined,
      timestamp: Date.now()
    };

    const thinkingMessage: ChatMessage = {
      id: uuidv4(),
      sender: MessageSender.AI,
      type: MessageType.TEXT,
      text: 'Thinking...',
      isLoading: true,
      timestamp: Date.now(),
    };

    setChatHistory(prev => [...prev, userMessage, thinkingMessage]);
    setIsAiThinking(true);

    try {
      let aiResponse: Partial<ChatMessage> = {};

      if (imageBase64 && imageMimeType) {
        const byteCharacters = atob(imageBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const imageFile = new File([byteArray], 'image.jpg', { type: imageMimeType });
        const analysisText = await analyzeImage(imageFile, messageText);
        aiResponse = { text: analysisText, type: MessageType.TEXT };
      } else if (messageText.toLowerCase().startsWith('search:')) {
        const query = messageText.substring(7).trim();
        const searchResult = await performGroundedSearch(query);
        aiResponse = { text: searchResult.text, sources: searchResult.sources, type: MessageType.TEXT };
      } else if (messageText.toLowerCase().startsWith('generate image:')) {
        const prompt = messageText.substring(15).trim();
        const imageResult = await generateImage(prompt);
        aiResponse = { text: imageResult.text, images: imageResult.images, type: MessageType.IMAGE };
      } else {
        const textResult = await generateText(messageText);
        aiResponse = { text: textResult, type: MessageType.TEXT };
      }

      const finalAiMessage: ChatMessage = {
        id: thinkingMessage.id, // Replace thinking message with the final one
        sender: MessageSender.AI,
        type: aiResponse.type || MessageType.TEXT,
        text: aiResponse.text || '',
        sources: aiResponse.sources,
        images: aiResponse.images,
        timestamp: Date.now(),
        isLoading: false,
      };
      
      setChatHistory(prev => prev.map(msg => msg.id === thinkingMessage.id ? finalAiMessage : msg));
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: thinkingMessage.id,
        sender: MessageSender.AI,
        type: MessageType.ERROR,
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
        isLoading: false,
      };
      setChatHistory(prev => prev.map(msg => msg.id === thinkingMessage.id ? errorMessage : msg));
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="relative flex flex-col min-h-screen bg-background text-foreground font-sans">
        <AppBackground />
        <Header 
          theme={resolvedTheme} 
          onToggleTheme={toggleTheme} 
          onToggleChat={handleToggleChat}
          isChatOpen={isChatOpen}
        />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage theme={resolvedTheme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/about" element={<AboutPage theme={resolvedTheme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/services" element={<ServicesPage theme={resolvedTheme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/workshop" element={<WorkshopPage />} />
            <Route path="/contact" element={<ContactPage onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            {/* <Route path="/fbc-internal/workshop-preview" element={<AdminWorkshopPage />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer theme={resolvedTheme} />
        
        <UnifiedInteractionPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          theme={resolvedTheme}
          chatHistory={chatHistory}
          onSendMessage={handleSendMessage}
          isAiThinking={isAiThinking}
        />

        <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-gray-800 rounded-full px-4 py-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_2px_rgba(74,222,128,0.7)] animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Farzad AI online
          </span>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}