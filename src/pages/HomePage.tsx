import { Theme } from '@/types';
import { HomePageHero } from '@/components/home/HomePageHero';
import { WhyWorkWithMeSection } from '@/components/home/WhyWorkWithMeSection';
import { WhatIOfferSection } from '@/components/home/WhatIOfferSection';
import { FreeDigitalWorkshopSection } from '@/components/home/FreeDigitalWorkshopSection';
import { ProofWebsiteIsDemoSection } from '@/components/home/ProofWebsiteIsDemoSection';
import { ResultsRealProjectsSection } from '@/components/home/ResultsRealProjectsSection';
import { HomeFinalCTASection } from '@/components/home/HomeFinalCTASection';
import { PageTranslator } from '@/components/ui/PageTranslator';

interface HomePageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ theme, onToggleChat }) => {
  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${
      theme === Theme.DARK ? 'text-white' : 'text-black'
    }`}>
      {/* Content */}
      <div className="relative z-10">
        {/* Translation Button - Fixed position */}
        <div className="fixed bottom-6 right-6 z-50">
          <PageTranslator theme={theme} />
        </div>
        
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
