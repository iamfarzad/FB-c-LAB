import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Theme, ChatMessage, MessageSender, MessageType } from '../types';

// Import your actual page components
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ServicesPage } from '../pages/ServicesPage';
import { WorkshopPage } from '../pages/WorkshopPage';
import { ContactPage } from '../pages/ContactPage';

// Import chat interface
import { UnifiedInteractionPanel } from './components/interaction/UnifiedInteractionPanel';

// Simple Header Component with Chat Button
const SimpleHeader: React.FC<{ 
  theme: Theme; 
  onToggleTheme: () => void; 
  onToggleChat: () => void;
  isChatOpen: boolean;
}> = ({ theme, onToggleTheme, onToggleChat, isChatOpen }) => {
  return (
    <header className={`p-4 border-b ${theme === Theme.DARK ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">F.B/c AI Assistant Pro</h1>
        <div className="flex items-center space-x-3">
          <button 
            onClick={onToggleChat}
            className={`px-4 py-2 rounded ${isChatOpen ? 'bg-orange-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}
          >
            {isChatOpen ? 'Close Chat' : 'Open Chat'}
          </button>
          <button 
            onClick={onToggleTheme}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Toggle Theme ({theme})
          </button>
        </div>
      </div>
    </header>
  );
};

// Simple Footer Component
const SimpleFooter: React.FC<{ theme: Theme }> = ({ theme }) => {
  return (
    <footer className={`p-4 border-t ${theme === Theme.DARK ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <div className="container mx-auto text-center">
        <p>&copy; 2024 F.B/c AI Assistant Pro. All rights reserved.</p>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  console.log('App with chat interface rendering, theme:', theme);

  const toggleTheme = () => setTheme(prev => (prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));

  const handleToggleChat = (message?: string) => {
    console.log('Chat toggle requested:', message);
    setIsChatOpen(prev => !prev);
    
    // If opening chat with a message, add it to history
    if (message && !isChatOpen) {
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
    
    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        sender: MessageSender.AI,
        type: MessageType.TEXT,
        text: `Thanks for your message: "${messageText}". This is a simulated response while we test the chat interface.`,
        timestamp: Date.now()
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      setIsAiThinking(false);
    }, 2000);
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
    <BrowserRouter>
      <div className={`min-h-screen flex flex-col ${theme === Theme.DARK ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <SimpleHeader 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          onToggleChat={handleToggleChat}
          isChatOpen={isChatOpen}
        />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage theme={theme} onToggleChat={handleToggleChat} />} />
            <Route path="/about" element={<AboutPage theme={theme} onToggleChat={handleToggleChat} />} />
            <Route path="/services" element={<ServicesPage theme={theme} onToggleChat={handleToggleChat} />} />
            <Route path="/workshop" element={<WorkshopPage theme={theme} onToggleChat={handleToggleChat} />} />
            <Route path="/contact" element={<ContactPage theme={theme} onToggleChat={handleToggleChat} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <SimpleFooter theme={theme} />
        
        {/* Chat Interface */}
        <UnifiedInteractionPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          theme={theme}
          chatHistory={chatHistory}
          onSendMessage={handleSendMessage}
          onClearChat={handleClearChat}
          isAiThinking={isAiThinking}
          onLiveUserSpeechFinal={handleLiveUserSpeechFinal}
          onLiveAiSpeechText={handleLiveAiSpeechText}
          onFormSubmit={handleFormSubmit}
        />
      </div>
    </BrowserRouter>
  );
};

export default App; 