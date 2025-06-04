"use client";

import React from 'react';
import { Theme } from '../types';
import { ServicesPageContent } from '../src/components/services/ServicesPageContent';
import { cn } from '../src/lib/utils';
import { InteractiveGridPattern } from '../src/components/magicui/interactive-grid-pattern';

interface ServicesPageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ theme, onToggleChat }) => {
  return (
    <div className={`relative min-h-screen w-full overflow-hidden transition-colors duration-300 ${theme === Theme.DARK ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <InteractiveGridPattern
        className={cn(
          "fixed inset-0 h-full w-full",
          theme === Theme.DARK 
            ? "[mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"
            : "[mask-image:radial-gradient(ellipse_at_center,transparent_20%,white)]",
          "[&>div]:h-full [&>div]:w-full"
        )}
        size={60}
        cellSize={2}
        interactive
      />
      <div className="relative z-10">
        <ServicesPageContent theme={theme} onToggleChat={onToggleChat} />
      </div>
    </div>
  );
};
