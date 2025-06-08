import React from 'react';
import { Theme } from '@/types';
import { Calendar, Milestone } from 'lucide-react';
import styles from './TimelineSection.module.css';

interface TimelineSectionProps {
  theme: Theme;
}

const timelineEvents = [
  {
    year: "2020",
    title: "Started AI Journey",
    description: "Began learning AI with no coding background. Wasted money on unreliable developers and broken promises."
  },
  {
    year: "2021",
    title: "Self-Taught Development",
    description: "Taught myself to code, build, and debug AI systems. Started building my first working prototypes."
  },
  {
    year: "2022",
    title: "First Real Projects",
    description: "Launched Talk to Eve (mental wellness AI) and ZingZang Lab (AI music app). Learned what actually works."
  },
  {
    year: "2023",
    title: "Business Focus",
    description: "Built iWriter.ai for Norwegian SMEs and Optix.io marketplace. Focused on practical business solutions."
  },
  {
    year: "2024",
    title: "AI Consulting",
    description: "Launched FarzadAI and started helping businesses implement AI that actually delivers results."
  }
];

export const TimelineSection: React.FC<TimelineSectionProps> = ({ theme }) => {
  return (
    <section className={`relative py-20 md:py-32 transition-colors duration-300 overflow-hidden ${
      theme === Theme.DARK ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-4 ${
          theme === Theme.DARK ? 'bg-orange-500' : 'bg-orange-400'
        } ${styles['animate-drift-vertical']}`} />
        <div className={`absolute inset-0 opacity-[0.01] ${
          theme === Theme.DARK ? 'bg-white' : 'bg-black'
        }`} 
        style={{
          backgroundImage: `linear-gradient(90deg, currentColor 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-orange-500/20 bg-orange-500/5 mb-8">
            <Calendar size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Journey</span>
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${
            theme === Theme.DARK ? 'text-white' : 'text-black'
          }`}>
            My Timeline
          </h2>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Central line */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 w-1 h-full ${
              theme === Theme.DARK ? 'bg-gray-800' : 'bg-gray-300'
            } rounded-full`} />
            
            {/* Timeline items */}
            <div className="space-y-16">
              {timelineEvents.map((event, index) => (
                <div 
                  key={index} 
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'justify-start' : 'justify-end'
                  }`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                    <div className={`w-6 h-6 rounded-full border-4 transition-all duration-500 hover:scale-125 ${
                      theme === Theme.DARK 
                        ? 'bg-orange-500 border-gray-950' 
                        : 'bg-orange-500 border-gray-50'
                    }`} />
                  </div>
                  
                  {/* Content card */}
                  <div className={`group w-full max-w-md p-8 rounded-2xl border transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu ${
                    theme === Theme.DARK 
                      ? 'bg-gray-900/60 border-gray-800 hover:border-orange-500/30' 
                      : 'bg-white/80 border-gray-200 hover:border-orange-500/30'
                  } backdrop-blur-sm ${index % 2 === 0 ? 'mr-auto pr-16' : 'ml-auto pl-16'}`}>
                    
                    {/* Year badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-4">
                      <Milestone size={14} className="text-orange-500" />
                      <span className="text-sm font-bold text-orange-500">{event.year}</span>
                    </div>
                    
                    {/* Content */}
                    <h3 className={`text-xl font-bold mb-3 ${
                      theme === Theme.DARK ? 'text-white' : 'text-black'
                    } group-hover:text-orange-500 transition-colors duration-300`}>
                      {event.title}
                    </h3>
                    <p className={`text-base leading-relaxed ${
                      theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {event.description}
                    </p>
                    
                    {/* Hover accent */}
                    <div className={`absolute ${
                      index % 2 === 0 ? 'right-0' : 'left-0'
                    } top-0 w-1 h-full bg-orange-500 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ${
                      index % 2 === 0 ? 'rounded-r-2xl' : 'rounded-l-2xl'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
