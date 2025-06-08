import { useState } from 'react';
import { Theme } from '@/types';
import { AboutPageHero } from '@/components/about/AboutPageHero';
import { UnifiedAboutContent } from '@/components/about/UnifiedAboutContent';
import { AboutFinalCTASection } from '@/components/about/AboutFinalCTASection';
import { FullStoryModal } from '@/components/about/FullStoryModal';

interface AboutPageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void;
}

export function AboutPage({ theme, onToggleChat }: AboutPageProps) {
  const [isFullStoryModalOpen, setIsFullStoryModalOpen] = useState(false);

  const openFullStoryModal = () => setIsFullStoryModalOpen(true);
  const closeFullStoryModal = () => setIsFullStoryModalOpen(false);

  return (
    <div className="bg-background text-foreground">
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
} 