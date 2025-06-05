import React from 'react';
import { Theme } from '../types';
import { HomePageHero } from '../src/components/home/HomePageHero';
import { WhyWorkWithMeSection } from '../src/components/home/WhyWorkWithMeSection';
import { WhatIOfferSection } from '../src/components/home/WhatIOfferSection';
import { FreeDigitalWorkshopSection } from '../src/components/home/FreeDigitalWorkshopSection';
import { ProofWebsiteIsDemoSection } from '../src/components/home/ProofWebsiteIsDemoSection';
import { ResultsRealProjectsSection } from '../src/components/home/ResultsRealProjectsSection';
import { HomeFinalCTASection } from '../src/components/home/HomeFinalCTASection';
import { GridPattern } from '../src/components/magicui/grid-pattern';

interface HomePageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ theme, onToggleChat }) => {
  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${
      theme === Theme.DARK ? 'bg-black text-white' : 'bg-white text-black'
    }`}>
      {/* Grid Pattern Background - only for non-hero sections */}
      <div className="absolute inset-0">
        <GridPattern
          className="absolute inset-0 opacity-20"
          theme={theme === Theme.DARK ? 'dark' : 'light'}
          width={60}
          height={60}
          strokeDasharray="0"
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Hero section with its own background (keep the orb intact) */}
        <HomePageHero theme={theme} onToggleChat={onToggleChat} />
        
        {/* Other sections with grid background */}
        <WhatIOfferSection theme={theme} />
        <WhyWorkWithMeSection theme={theme} />
        <ResultsRealProjectsSection theme={theme} />
        <ProofWebsiteIsDemoSection theme={theme} onToggleChat={onToggleChat} />
        <FreeDigitalWorkshopSection theme={theme} />
        <HomeFinalCTASection theme={theme} onToggleChat={onToggleChat} />
      </div>
    </div>
  );
};
