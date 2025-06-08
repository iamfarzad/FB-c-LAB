import React, { useState } from 'react';
import { Theme } from '@/types';
import { AboutPageHero } from '@/components/about/AboutPageHero';
import { UnifiedAboutContent } from '@/components/about/UnifiedAboutContent';
import { AboutFinalCTASection } from '@/components/about/AboutFinalCTASection';
import { FullStoryModal } from '@/components/about/FullStoryModal';

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
      theme === Theme.DARK ? 'text-white' : 'text-black'
    }`}>
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
