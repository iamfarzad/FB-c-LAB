import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '../types';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  console.log('App component rendering with theme:', theme);

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
        
        <main className="flex-1 p-8">
          <Routes>
            <Route path="/" element={
              <div>
                <h2 className="text-xl mb-4">Welcome to AI Assistant Pro</h2>
                <p>This is a simplified version to test basic functionality.</p>
                <p>Current theme: {theme}</p>
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <footer className="p-4 border-t text-center">
          <p>AI Assistant Pro - Simplified Version</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App; 