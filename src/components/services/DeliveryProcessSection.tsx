
import React from 'react';
import { CheckSquare, MessageSquare, FileText, Settings, LifeBuoy } from 'lucide-react';
import { Theme } from '../../../types';

interface DeliveryProcessSectionProps {
  theme: Theme;
}

export const DeliveryProcessSection: React.FC<DeliveryProcessSectionProps> = ({ theme }) => {
  const processSteps = [
    { 
      id: 1, 
      title: "Free Consultation", 
      description: "We start with a free consultation to understand your needs and identify a high-impact use case.",
      icon: MessageSquare
    },
    { 
      id: 2, 
      title: "Proposal & Scope", 
      description: "I'll provide a clear proposal detailing the project scope, recommended tools, timeline, and transparent pricing.",
      icon: FileText
    },
    { 
      id: 3, 
      title: "Build & Deliver / Train", 
      description: "I'll either build, test, and deliver the solution, or train your team to implement it effectively.",
      icon: Settings
    },
    { 
      id: 4, 
      title: "Support & Follow-Up", 
      description: "Optional follow-up support and ongoing assistance are available to ensure long-term success and adaptation.",
      icon: LifeBuoy
    }
  ];
  const accentColor = 'var(--accent-color)'; // Orange

  return (
    <section className={`py-16 md:py-24 transition-colors duration-300 ${theme === Theme.DARK ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">My Delivery Process</h2>
        <div className="max-w-3xl mx-auto">
          {processSteps.map((step, index) => (
            <div key={step.id} className="flex items-start mb-8">
              <div className={`flex-shrink-0 w-12 h-12 rounded-full text-white flex items-center justify-center text-xl font-bold mr-6 shadow-md`} style={{backgroundColor: accentColor}}>
                {step.id}
              </div>
              <div className={`p-6 rounded-lg flex-grow ${theme === Theme.DARK ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
                <div className="flex items-center mb-2">
                  <step.icon size={24} className="mr-3" style={{color: accentColor}} />
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>
                <p className={`text-md ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'}`}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};