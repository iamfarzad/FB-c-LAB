import React from 'react';
import { Theme } from '../types';
import { WorkshopHeroSection } from '../src/components/workshop/WorkshopHeroSection';
import { WhatToExpectSection } from '../src/components/workshop/WhatToExpectSection';
import { WhyItWorksSection } from '../src/components/workshop/WhyItWorksSection';
import { WorkshopStayUpdatedSection } from '../src/components/workshop/WorkshopStayUpdatedSection';
import { GridPattern } from '../src/components/magicui/grid-pattern';

interface WorkshopPageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void; 
}

export const WorkshopPage: React.FC<WorkshopPageProps> = ({ theme, onToggleChat }) => {
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
        <WorkshopHeroSection theme={theme} />
        <WhatToExpectSection theme={theme} />
        <WhyItWorksSection theme={theme} />
        <WorkshopStayUpdatedSection theme={theme} />
      </div>
    </div>
  );
};
