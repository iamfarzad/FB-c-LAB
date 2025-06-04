
import React, { useState } from 'react';
import { Theme } from '../types';
import { AboutPageHero } from '../src/components/about/AboutPageHero';
import { UnifiedAboutContent } from '../src/components/about/UnifiedAboutContent';
import { AboutFinalCTASection } from '../src/components/about/AboutFinalCTASection';
import { FullStoryModal } from '../src/components/about/FullStoryModal';

interface AboutPageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ theme, onToggleChat }) => {
  const [isFullStoryModalOpen, setIsFullStoryModalOpen] = useState(false);

  const openFullStoryModal = () => setIsFullStoryModalOpen(true);
  const closeFullStoryModal = () => setIsFullStoryModalOpen(false);

  return (
    <div className={`transition-colors duration-300 ${theme === Theme.DARK ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <AboutPageHero theme={theme} />
      <UnifiedAboutContent theme={theme} onReadFullStory={openFullStoryModal} />
      <AboutFinalCTASection theme={theme} onToggleChat={() => onToggleChat()} />
      
      <FullStoryModal 
        isOpen={isFullStoryModalOpen} 
        onClose={closeFullStoryModal} 
        theme={theme} 
      />
    </div>
  );
};
