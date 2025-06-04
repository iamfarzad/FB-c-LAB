import React from 'react';
import { Theme } from '../types';
import { WorkshopHeroSection } from '../src/components/workshop/WorkshopHeroSection';
import { WhatToExpectSection } from '../src/components/workshop/WhatToExpectSection';
import { WhyItWorksSection } from '../src/components/workshop/WhyItWorksSection';
import { WorkshopStayUpdatedSection } from '../src/components/workshop/WorkshopStayUpdatedSection';

interface WorkshopPageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void; 
}

export const WorkshopPage: React.FC<WorkshopPageProps> = ({ theme, onToggleChat }) => {
  return (
    <div className={`transition-colors duration-300 ${theme === Theme.DARK ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <WorkshopHeroSection theme={theme} />
      <WhatToExpectSection theme={theme} />
      <WhyItWorksSection theme={theme} />
      <WorkshopStayUpdatedSection theme={theme} />
    </div>
  );
};
