import React from 'react';
import { Check, Users } from 'lucide-react';
import { Theme } from '@/types';

interface HowIWorkSectionProps {
  theme: Theme;
}

const workPrinciples = [
  "I start with what's practical, not theoretical",
  "I explain clearly, without technical jargon",
  "I avoid unnecessary complexity",
  "I build fast, test often, and cut through hype"
];

export const HowIWorkSection: React.FC<HowIWorkSectionProps> = ({ theme }) => {
  return (
    <section className={`relative py-20 md:py-32 transition-colors duration-300 overflow-hidden ${
      theme === Theme.DARK ? 'bg-black' : 'bg-white'
    }`}>
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-3 ${
          theme === Theme.DARK ? 'bg-orange-500' : 'bg-orange-400'
        } animate-pulse-gentle`} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-orange-500/20 bg-orange-500/5 mb-8">
            <Users size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Methodology</span>
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${
            theme === Theme.DARK ? 'text-white' : 'text-black'
          }`}>
            How I Work
          </h2>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {workPrinciples.map((principle, index) => (
              <div 
                key={index} 
                className={`group flex items-start p-6 rounded-2xl border transition-all duration-500 hover:scale-105 transform-gpu ${
                  theme === Theme.DARK 
                    ? 'bg-gray-900/30 border-gray-800 hover:border-orange-500/30' 
                    : 'bg-gray-50/50 border-gray-200 hover:border-orange-500/30'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mr-4 mt-1">
                  <Check size={24} className="text-orange-500 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <p className={`text-lg font-medium leading-relaxed ${
                  theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {principle}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Statement */}
          <div className={`text-center p-8 rounded-2xl border ${
            theme === Theme.DARK 
              ? 'bg-gray-900/20 border-gray-800' 
              : 'bg-gray-50/30 border-gray-200'
          }`}>
            <p className={`text-xl md:text-2xl font-medium leading-relaxed ${
              theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
            }`}>
              I don't offer fluff. I offer working tools, battle-tested workflows, and a direct approach that prioritizes your business outcome.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
