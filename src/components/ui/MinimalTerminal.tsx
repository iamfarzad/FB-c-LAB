import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '@/types';

interface MinimalTerminalProps {
  theme: Theme;
  commands: string[];
  typingSpeed?: number;
  cursorBlinkSpeed?: number;
}

export const MinimalTerminal: React.FC<MinimalTerminalProps> = ({
  theme,
  commands,
  typingSpeed = 50,
  cursorBlinkSpeed = 530
}) => {
  const [displayedText, setDisplayedText] = useState<string>('');
  const [currentCommandIndex, setCurrentCommandIndex] = useState<number>(0);
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0);
  const [showCursor, setShowCursor] = useState<boolean>(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Handle typing animation
  useEffect(() => {
    if (currentCommandIndex >= commands.length) return;
    
    const currentCommand = commands[currentCommandIndex];
    
    if (currentCharIndex < currentCommand.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + currentCommand[currentCharIndex]);
        setCurrentCharIndex(prev => prev + 1);
      }, typingSpeed);
      
      return () => clearTimeout(timeout);
    } else {
      // Command completed, wait before moving to next command
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + '\n$ ');
        setCurrentCommandIndex(prev => prev + 1);
        setCurrentCharIndex(0);
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [currentCommandIndex, currentCharIndex, commands, typingSpeed]);

  // Handle cursor blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, cursorBlinkSpeed);
    
    return () => clearInterval(interval);
  }, [cursorBlinkSpeed]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [displayedText]);

  return (
    <div className={`w-full max-w-2xl mx-auto overflow-hidden border transition-all duration-300
      ${theme === Theme.DARK 
        ? 'border-white/20 bg-black/40' 
        : 'border-black/20 bg-white/40'
      } backdrop-blur-xl`}>
      {/* Terminal header */}
      <div className={`flex items-center px-4 py-2 border-b ${
        theme === Theme.DARK ? 'border-white/10' : 'border-black/10'
      }`}>
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className={`text-xs font-medium mx-auto ${
          theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
        }`}>
          ai-automation.terminal
        </div>
      </div>
      
      {/* Terminal content */}
      <div 
        ref={terminalRef}
        className={`p-4 font-mono text-sm h-64 overflow-y-auto ${
          theme === Theme.DARK ? 'text-gray-300' : 'text-gray-800'
        }`}
      >
        <div className="whitespace-pre-wrap">
          $ {displayedText}
          <span className={`inline-block w-2 h-4 ml-0.5 -mb-0.5 ${
            showCursor ? 'bg-orange-500' : 'bg-transparent'
          } transition-colors duration-100`}></span>
        </div>
      </div>
    </div>
  );
};
