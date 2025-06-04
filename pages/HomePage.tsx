

import React from 'react';
import { Theme } from '../types';
import { HomePageHero } from '../src/components/home/HomePageHero';
import { WhyWorkWithMeSection } from '../src/components/home/WhyWorkWithMeSection';
import { WhatIOfferSection } from '../src/components/home/WhatIOfferSection';
import { FreeDigitalWorkshopSection } from '../src/components/home/FreeDigitalWorkshopSection';
import { ProofWebsiteIsDemoSection } from '../src/components/home/ProofWebsiteIsDemoSection';
import { ResultsRealProjectsSection } from '../src/components/home/ResultsRealProjectsSection';
import { HomeFinalCTASection } from '../src/components/home/HomeFinalCTASection';

interface HomePageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ theme, onToggleChat }) => {
  return (
    <>
      <HomePageHero theme={theme} onToggleChat={() => onToggleChat()} />
      <WhyWorkWithMeSection theme={theme} />
      <WhatIOfferSection theme={theme} />
      <FreeDigitalWorkshopSection theme={theme} />
      <ProofWebsiteIsDemoSection theme={theme} onToggleChat={() => onToggleChat()} />
      <ResultsRealProjectsSection theme={theme} />
      <HomeFinalCTASection theme={theme} onToggleChat={() => onToggleChat()} />
    </>
  );
};
