import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Theme, ChatMessage, MessageSender, MessageType } from '../types';

// Import i18n configuration
import './i18n';

// Import language context
import { LanguageProvider } from './contexts/LanguageContext';

// Import the actual Header and Footer components
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Import the actual page components
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ServicesPage } from '../pages/ServicesPage';
import { WorkshopPage } from '../pages/WorkshopPage';
import { ContactPage } from '../pages/ContactPage';
import { AdminWorkshopPage } from '../pages/AdminWorkshopPage';

// Import the interaction panel
import { UnifiedInteractionPanel } from './components/interaction/UnifiedInteractionPanel';

// Import voice component to register custom element
import './components/liveaudio/GdmLiveAudio';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  console.log('App rendering with UnifiedInteractionPanel, theme:', theme);

  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));

  const handleToggleChat = () => {
    console.log('Chat toggle requested');
    setIsChatOpen(prev => !prev);
  };

  const handleOpenInteractionPanelWithMessage = (message?: string) => {
    console.log('Chat toggle requested with message:', message);
    setIsChatOpen(true);
    
    // Add initial AI greeting if chat is empty
    if (chatHistory.length === 0 && !message) {
      const { INITIAL_AI_CHAT_MESSAGE } = require('../constants');
      const aiGreeting: ChatMessage = {
        id: `msg_${Date.now()}_greeting`,
        sender: MessageSender.AI,
        type: MessageType.TEXT,
        text: INITIAL_AI_CHAT_MESSAGE,
        timestamp: Date.now()
      };
      setChatHistory([aiGreeting]);
    }
    
    // If opening chat with a message, add it to history
    if (message) {
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: MessageSender.USER,
        type: MessageType.TEXT,
        text: message,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, userMessage]);
    }
  };

  const handleSendMessage = async (messageText: string, imageBase64?: string, imageMimeType?: string) => {
    console.log('Sending message:', messageText);
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      sender: MessageSender.USER,
      type: imageBase64 ? MessageType.IMAGE : MessageType.TEXT,
      text: messageText,
      imageUrl: imageBase64 ? `data:${imageMimeType};base64,${imageBase64}` : undefined,
      timestamp: Date.now()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setIsAiThinking(true);
    
    try {
      let aiResponseText: string;
      let sources: any[] = [];
      
      if (imageBase64) {
        // Handle image analysis - convert base64 to file
        const byteCharacters = atob(imageBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const imageFile = new File([byteArray], 'image', { type: imageMimeType || 'image/jpeg' });
        
        const { analyzeImage } = await import('../services/geminiService');
        aiResponseText = await analyzeImage(imageFile, messageText);
      } else {
        // Handle text generation with search
        const { generateText } = await import('../services/geminiService');
        const response = await generateText(messageText);
        aiResponseText = response;
      }
      
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        sender: MessageSender.AI,
        type: MessageType.TEXT,
        text: aiResponseText,
        sources: sources,
        timestamp: Date.now()
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        sender: MessageSender.AI,
        type: MessageType.ERROR,
        text: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: Date.now()
      };
      
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
  };

  const handleLiveUserSpeechFinal = (text: string) => {
    console.log('Live user speech final:', text);
    handleSendMessage(text);
  };

  const handleLiveAiSpeechText = (text: string) => {
    console.log('Live AI speech text:', text);
  };

  const handleFormSubmit = (messageId: string, formData: Record<string, string>) => {
    console.log('Form submitted:', messageId, formData);
  };

  return (
    <LanguageProvider>
      <BrowserRouter>
        <div className={`min-h-screen ${theme === Theme.DARK ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <Header 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          onToggleChat={handleToggleChat}
          isChatOpen={isChatOpen}
        />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage theme={theme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/about" element={<AboutPage theme={theme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/services" element={<ServicesPage theme={theme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/workshop" element={<WorkshopPage theme={theme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/contact" element={<ContactPage theme={theme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/fbc-internal/workshop-preview" element={<AdminWorkshopPage theme={theme} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer theme={theme} />
        
        {/* Chat Interface */}
        <UnifiedInteractionPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          theme={theme}
          chatHistory={chatHistory}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          isAiThinking={isAiThinking}
          onFormSubmit={handleFormSubmit}
        />
        
        {/* Status Indicator */}
        <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-gray-800 rounded-full px-4 py-2 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-lg shadow-green-400/50 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Farzad AI online
          </span>
        </div>
              </div>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App; 