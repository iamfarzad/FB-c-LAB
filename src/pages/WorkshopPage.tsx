import { WorkshopHeroSection } from '@/components/workshop/WorkshopHeroSection';
import { WhatToExpectSection } from '@/components/workshop/WhatToExpectSection';
import { WhyItWorksSection } from '@/components/workshop/WhyItWorksSection';
import { WorkshopStayUpdatedSection } from '@/components/workshop/WorkshopStayUpdatedSection';

interface WorkshopPageProps {
  theme?: 'light' | 'dark';
  onToggleChat?: (message?: string) => void;
}

export const WorkshopPage: React.FC<WorkshopPageProps> = ({ 
  theme = 'light', 
  onToggleChat = () => {} // Provide a default empty function
}) => {
  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${theme}`}>
      {/* TEST: Visible element to confirm page is rendering */}

      
      {/* Content */}
      <div className="relative z-10" onClick={() => onToggleChat('I have a question about the workshop')}>
        <WorkshopHeroSection />
        <WhatToExpectSection />
        <WhyItWorksSection />
        <WorkshopStayUpdatedSection />
      </div>
    </div>
  );
};
