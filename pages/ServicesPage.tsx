"use client";

import React from 'react';
import { Theme } from '../types';
import { ServicesPageContent } from '../src/components/services/ServicesPageContent';
import { GridPattern } from '../src/components/magicui/grid-pattern';

interface ServicesPageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ theme, onToggleChat }) => {
  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${
      theme === Theme.DARK ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Grid Pattern Background */}
      <GridPattern
        className="absolute inset-0 opacity-30"
        theme={theme === Theme.DARK ? 'dark' : 'light'}
        width={60}
        height={60}
        strokeDasharray="0"
      />
      
      {/* Content */}
      <div className="relative z-10">
        <ServicesPageContent theme={theme} onToggleChat={onToggleChat} />
      </div>
    </div>
  );
};
