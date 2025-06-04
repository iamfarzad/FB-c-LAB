import React from 'react';

const App: React.FC = () => {
  console.log('App component is rendering...');
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'red', color: 'white' }}>
      <h1>DEBUG: App is rendering!</h1>
      <p>If you see this, React is working.</p>
    </div>
  );
};

export default App; 