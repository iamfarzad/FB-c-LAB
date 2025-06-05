import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import './src/index.css';

console.log('index.tsx: Script is loading...');
console.log('React:', React);
console.log('ReactDOM:', ReactDOM);

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('Could not find root element!');
  throw new Error("Could not find root element to mount to");
}

try {
  console.log('Creating React root...');
  const root = ReactDOM.createRoot(rootElement);
  console.log('React root created:', root);
  
  console.log('Rendering App component...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App component rendered successfully!');
} catch (error) {
  console.error('Error during React mounting:', error);
  // Fallback: try to render something directly to the DOM
  rootElement.innerHTML = '<div style="padding: 20px; background: red; color: white;"><h1>FALLBACK: React failed to mount</h1><p>Error: ' + error + '</p></div>';
}