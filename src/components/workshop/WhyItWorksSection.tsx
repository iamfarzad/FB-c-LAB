
import React from 'react';
import { Theme } from '../../../types';
import { Zap, Settings, Briefcase, Users } from 'lucide-react';

interface WhyItWorksSectionProps {
  theme: Theme;
}

const benefits = [
  { text: "You learn by doing", icon: Zap },
  { text: "You leave with working examples", icon: Settings },
  { text: "It’s not abstract theory—you build real tools using real business cases", icon: Briefcase },
  { text: "You understand enough to troubleshoot confidently, not get lost in technical jargon", icon: Users }
];

export const WhyItWorksSection: React.FC<WhyItWorksSectionProps> = ({ theme }) => {
  const accentColor = 'var(--accent-color)'; // Orange
  return (
    <section className={`py-16 md:py-24 transition-colors duration-300 ${theme === Theme.DARK ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why It Works</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className={`p-6 rounded-xl shadow-lg flex items-start space-x-4 transition-all duration-300 hover:shadow-xl ${theme === Theme.DARK ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <benefit.icon size={32} className="shrink-0 mt-1" style={{color: accentColor}} />
              <div>
                <p className={`text-lg font-medium ${theme === Theme.DARK ? 'text-gray-200' : 'text-gray-800'}`}>{benefit.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};