import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '../types';

// Import Header and Footer components
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Import your actual page components
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ServicesPage } from '../pages/ServicesPage';
import { WorkshopPage } from '../pages/WorkshopPage';
import { ContactPage } from '../pages/ContactPage';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  console.log('App with header/footer rendering, theme:', theme);

  // Apply theme to document
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
    // Placeholder for now
  };

  const handleOpenInteractionPanelWithMessage = (message?: string) => {
    console.log('Chat toggle requested with message:', message);
    // Placeholder for now
  };

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${theme === Theme.DARK ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <Header 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          onToggleChat={handleToggleChat}
          isChatOpen={false}
        />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage theme={theme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/about" element={<AboutPage theme={theme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/services" element={<ServicesPage theme={theme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/workshop" element={<WorkshopPage theme={theme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="/contact" element={<ContactPage theme={theme} onToggleChat={handleOpenInteractionPanelWithMessage} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App; 