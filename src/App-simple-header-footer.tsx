import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '../types';

// Import your actual page components
import { HomePage } from '../pages/HomePage';
import { AboutPage } from '../pages/AboutPage';
import { ServicesPage } from '../pages/ServicesPage';
import { WorkshopPage } from '../pages/WorkshopPage';
import { ContactPage } from '../pages/ContactPage';

// Simple Header Component
const SimpleHeader: React.FC<{ theme: Theme; onToggleTheme: () => void }> = ({ theme, onToggleTheme }) => {
  return (
    <header className={`p-4 border-b ${theme === Theme.DARK ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">F.B/c AI Assistant Pro</h1>
        <button 
          onClick={onToggleTheme}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Toggle Theme ({theme})
        </button>
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

  console.log('App with simple header/footer rendering, theme:', theme);

  const toggleTheme = () => setTheme(prev => (prev === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));

  const handleToggleChat = (message?: string) => {
    console.log('Chat toggle requested:', message);
    // Placeholder for now
  };

  return (
    <BrowserRouter>
      <div className={`min-h-screen flex flex-col ${theme === Theme.DARK ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
        <SimpleHeader theme={theme} onToggleTheme={toggleTheme} />
        
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
      </div>
    </BrowserRouter>
  );
};

export default App; 