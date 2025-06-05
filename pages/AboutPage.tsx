import React, { useState } from 'react';
import { Theme } from '../types';
import { AboutPageHero } from '../src/components/about/AboutPageHero';
import { UnifiedAboutContent } from '../src/components/about/UnifiedAboutContent';
import { AboutFinalCTASection } from '../src/components/about/AboutFinalCTASection';
import { FullStoryModal } from '../src/components/about/FullStoryModal';
import { GridPattern } from '../src/components/magicui/grid-pattern';

interface AboutPageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ theme, onToggleChat }) => {
  const [isFullStoryModalOpen, setIsFullStoryModalOpen] = useState(false);

  const openFullStoryModal = () => setIsFullStoryModalOpen(true);
  const closeFullStoryModal = () => setIsFullStoryModalOpen(false);

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
        <AboutPageHero theme={theme} />
        <UnifiedAboutContent theme={theme} onReadFullStory={openFullStoryModal} />
        <AboutFinalCTASection theme={theme} onToggleChat={() => onToggleChat()} />
      </div>

      {/* Full Story Modal */}
      <FullStoryModal
        isOpen={isFullStoryModalOpen}
        onClose={closeFullStoryModal}
        theme={theme}
      />
    </div>
  );
};
