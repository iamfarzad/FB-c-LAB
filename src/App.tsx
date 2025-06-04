import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Theme, ChatMessage, MessageSender, MessageType } from '../types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UnifiedInteractionPanel } from './components/interaction/UnifiedInteractionPanel';
import * as GeminiService from '../services/geminiService';
import { SIMULATED_KNOWLEDGE_BASE } from '../constants';

// Import the custom element to register it
import './components/liveaudio/GdmLiveAudio';

// Page Imports
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ServicesPage } from '../pages/ServicesPage';
import { WorkshopPage } from '../pages/WorkshopPage';
import { ContactPage } from '../pages/ContactPage';
import { AdminWorkshopPage } from '../pages/AdminWorkshopPage';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [isInteractionPanelOpen, setIsInteractionPanelOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [initialUserMessage, setInitialUserMessage] = useState<string | undefined>();
  const [isGeminiAvailable, setIsGeminiAvailable] = useState(false);

  useEffect(() => {
    if (theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Check proxy health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isHealthy = await GeminiService.checkProxyHealth();
        setIsGeminiAvailable(isHealthy);
      } catch (error) {
        console.error('Health check failed:', error);
        setIsGeminiAvailable(false);
      }
    };

    // Check immediately
    checkHealth();

    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => setTheme(prev => (prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));
  
  const handleToggleChat = () => {
    setIsInteractionPanelOpen(!isInteractionPanelOpen);
  };

  const handleOpenInteractionPanelWithMessage = (message?: string) => {
    setInitialUserMessage(message);
    setIsInteractionPanelOpen(true);
  };

  const handleCloseInteractionPanel = () => {
    setIsInteractionPanelOpen(false);
    setInitialUserMessage(undefined);
  };

  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSendMessage = useCallback(async (messageText: string, imageBase64?: string, imageMimeType?: string) => {
    if (!messageText.trim() && !imageBase64) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      sender: MessageSender.USER,
      type: imageBase64 ? MessageType.IMAGE : MessageType.TEXT,
      text: messageText,
      imageUrl: imageBase64 ? `data:${imageMimeType};base64,${imageBase64}` : undefined,
      timestamp: Date.now(),
    };

    setChatHistory(prev => [...prev, userMessage]);
    setIsAiThinking(true);

    try {
      let response;
      if (imageBase64 && imageMimeType) {
        // Handle image + text input - convert base64 to File object
        const byteCharacters = atob(imageBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const imageFile = new File([byteArray], 'image.jpg', { type: imageMimeType });
        
        response = await GeminiService.analyzeImage(imageFile, messageText);
      } else {
        // Handle text-only input using serverless proxy
        response = await GeminiService.generateText(messageText);
      }

      // Add AI response
      const aiMessage: ChatMessage = {
        id: generateMessageId(),
        sender: MessageSender.AI,
        type: MessageType.TEXT,
        text: response,
        timestamp: Date.now(),
      };

      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        sender: MessageSender.AI,
        type: MessageType.ERROR,
        text: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: Date.now(),
      };

      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsAiThinking(false);
    }
  }, []);

  const handleClearChat = () => {
    setChatHistory([]);
  };

  const handleLiveUserSpeechFinal = useCallback((text: string) => {
    console.log('[App] Live user speech final:', text);
    if (text.trim()) {
      handleSendMessage(text);
    }
  }, [handleSendMessage]);

  const handleLiveAiSpeechText = useCallback((text: string) => {
    console.log('[App] Live AI speech text:', text);
    // Handle AI speech text if needed for UI feedback
  }, []);

  const handleFormSubmit = useCallback((messageId: string, formData: Record<string, string>) => {
    console.log('[App] Form submitted:', messageId, formData);
    
    // Mark the form message as submitted
    setChatHistory(prev => 
      prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, formSubmitted: true }
          : msg
      )
    );

    // Process the form data (e.g., save lead information)
    const { name, email } = formData;
    if (name && email) {
      // Add confirmation message
      const confirmationMessage: ChatMessage = {
        id: generateMessageId(),
        sender: MessageSender.AI,
        type: MessageType.TEXT,
        text: `Thank you, ${name}! I've noted your contact information (${email}). I'll be in touch soon to discuss how I can help with your AI initiatives.`,
        timestamp: Date.now(),
      };

      setChatHistory(prev => [...prev, confirmationMessage]);
    }
  }, []);

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${theme === Theme.DARK ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <Header 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          onToggleChat={handleToggleChat}
          isChatOpen={isInteractionPanelOpen}
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
          isOpen={isInteractionPanelOpen}
          onClose={handleCloseInteractionPanel}
          theme={theme}
          chatHistory={chatHistory}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          isAiThinking={isAiThinking}
          onLiveUserSpeechFinal={handleLiveUserSpeechFinal}
          onLiveAiSpeechText={handleLiveAiSpeechText}
          initialUserMessage={initialUserMessage}
          onFormSubmit={handleFormSubmit}
        />
        
        {/* Farzad AI Status Indicator */}
        <div className="fixed bottom-4 right-4 flex items-center space-x-2 bg-white/10 dark:bg-black/20 backdrop-blur-sm border border-white/20 dark:border-gray-800 rounded-full px-4 py-2 shadow-lg">
          <div className={`w-2 h-2 rounded-full ${
            isGeminiAvailable 
              ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse' 
              : 'bg-red-400 shadow-lg shadow-red-400/50'
          }`}></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Farzad Ai {isGeminiAvailable ? 'online' : 'offline'}
          </span>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App; 