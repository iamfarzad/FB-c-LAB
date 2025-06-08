import React from 'react';
import { ServicesPageHero } from './ServicesPageHero';
import { AiConsultingSection } from './AiConsultingSection';
import { AiWorkshopsSection } from './AiWorkshopsSection';
import { ToolsAndTechSection } from './ToolsAndTechSection';
import { DeliveryProcessSection } from './DeliveryProcessSection';
import { ClientOutcomesSection } from './ClientOutcomesSection';
import { ServicesFinalCTASection } from './ServicesFinalCTASection';

interface ServicesPageContentProps {
  onToggleChat: (message?: string) => void;
}

export const ServicesPageContent: React.FC<ServicesPageContentProps> = ({ onToggleChat }) => {
  return (
    <div className="relative">
      <ServicesPageHero />
      <div className="relative transition-all duration-700 overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 space-y-16 md:space-y-24 py-16 md:py-24">
          <AiConsultingSection />
          <AiWorkshopsSection />
          <ToolsAndTechSection />
          <DeliveryProcessSection />
          <ClientOutcomesSection />
        </div>
      </div>
      <ServicesFinalCTASection onToggleChat={onToggleChat} />
    </div>
  );
};
