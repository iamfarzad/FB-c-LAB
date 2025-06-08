import { WorkshopHeroSection } from '@/components/workshop/WorkshopHeroSection';
import { WhatToExpectSection } from '@/components/workshop/WhatToExpectSection';
import { WhyItWorksSection } from '@/components/workshop/WhyItWorksSection';
import { WorkshopStayUpdatedSection } from '@/components/workshop/WorkshopStayUpdatedSection';

export const WorkshopPage: React.FC = () => {
  return (
    <div className={`min-h-screen relative transition-colors duration-300`}>
      {/* TEST: Visible element to confirm page is rendering */}

      
      {/* Content */}
      <div className="relative z-10">
        <WorkshopHeroSection />
        <WhatToExpectSection />
        <WhyItWorksSection />
        <WorkshopStayUpdatedSection />
      </div>
    </div>
  );
};
