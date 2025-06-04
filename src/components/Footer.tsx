
import React from 'react';
import { Theme } from '../../types';
import { FBC_BRAND_NAME } from '../../constants';

interface FooterProps {
  theme: Theme;
}

export const Footer: React.FC<FooterProps> = ({ theme }) => (
  <footer className={`relative py-12 text-center border-t transition-all duration-300 overflow-hidden
    ${theme === Theme.DARK 
      ? 'bg-black/80 backdrop-blur-xl text-gray-400 border-gray-800/50' 
      : 'bg-white/80 backdrop-blur-xl text-gray-600 border-gray-200/50'}` 
    }>
    
    {/* Subtle background pattern */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-orange-500/20 to-transparent" />
      <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-orange-500/20 to-transparent" />
    </div>
    
    <div className="container mx-auto px-6 relative z-10">
      <div className="space-y-4">
        {/* Enhanced brand mention */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-8 h-px bg-gradient-to-r from-transparent to-orange-500/50" />
          <span 
            className="font-bold text-lg tracking-wider"
            style={{ 
              color: 'var(--accent-color)',
              fontFamily: "'Space Mono', monospace"
            }}
          >
            {FBC_BRAND_NAME}
          </span>
          <div className="w-8 h-px bg-gradient-to-l from-transparent to-orange-500/50" />
        </div>
        
        {/* Copyright with enhanced styling */}
        <p className="text-sm font-medium">
          &copy; {new Date().getFullYear()} {FBC_BRAND_NAME} | Farzad Bayat. All Rights Reserved.
        </p>
        
        {/* Tagline with subtle animation */}
        <p className={`text-sm font-light tracking-wide transition-all duration-300 hover:scale-105
          ${theme === Theme.DARK ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-600'}`}>
          AI Automation Without the Hype.
        </p>
        
        {/* Subtle decorative element */}
        <div className="flex justify-center pt-4">
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="w-1 h-1 rounded-full bg-orange-500/40 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </footer>
);
