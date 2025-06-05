import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '../types';

// Import your actual page components
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ServicesPage } from '../pages/ServicesPage';
import { WorkshopPage } from '../pages/WorkshopPage';
import { ContactPage } from '../pages/ContactPage';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  console.log('App with pages rendering, theme:', theme);

  const handleToggleChat = (message?: string) => {
    console.log('Chat toggle requested:', message);
    // Placeholder for now
  };

  return (
    <BrowserRouter>
      <div className={`min-h-screen ${theme === Theme.DARK ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <header className="p-4 border-b">
          <h1 className="text-2xl font-bold">F.B/c AI Assistant Pro</h1>
          <button 
            onClick={() => setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK)}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Toggle Theme ({theme})
          </button>
        </header>
        
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
        
        <footer className="p-4 border-t text-center">
          <p>AI Assistant Pro - With Pages</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App; 