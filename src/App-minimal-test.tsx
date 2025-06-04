import React from 'react';

const App = () => {
  console.log('MINIMAL TEST: App component rendering...');
  
  return React.createElement('div', {
    style: { 
      padding: '20px', 
      backgroundColor: 'blue', 
      color: 'white',
      fontSize: '24px'
    }
  }, 'MINIMAL TEST: React is working!');
};

export default App; 