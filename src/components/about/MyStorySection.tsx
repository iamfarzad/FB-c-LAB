
import React from 'react';
import { Theme } from '../../../types';
import { ArrowRight, Quote } from 'lucide-react';

interface MyStorySectionProps {
  theme: Theme;
  onReadFullStory: () => void;
}

export const MyStorySection: React.FC<MyStorySectionProps> = ({ theme, onReadFullStory }) => {
  return (
    <section className={`relative py-20 md:py-32 transition-colors duration-300 overflow-hidden ${
      theme === Theme.DARK ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/3 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-3 ${
          theme === Theme.DARK ? 'bg-orange-500' : 'bg-orange-400'
        } animate-pulse-gentle`} />
        <div className={`absolute inset-0 opacity-[0.015] ${
          theme === Theme.DARK ? 'bg-white' : 'bg-black'
        }`} 
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: '80px 80px'
        }} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Section Header */}
          <div className="mb-16 animate-fade-in-up">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-orange-500/20 bg-orange-500/5 mb-8">
              <Quote size={16} className="text-orange-500" />
              <span className="text-sm font-medium text-orange-500">My Journey</span>
            </div>
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${
              theme === Theme.DARK ? 'text-white' : 'text-black'
            }`}>
              My Story
            </h2>
          </div>

          {/* Story Content */}
          <div className="space-y-8 mb-12 animate-fade-in-up-delay">
            <p className={`text-xl md:text-2xl leading-relaxed font-medium ${
              theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
            }`}>
              I started my AI journey in 2020 with no coding background. I wasted time and money on unreliable developers, 
              broken products, and fake promises. That's when I taught myself to build, debug, and deliver AI systems that actually work.
            </p>
            <p className={`text-lg md:text-xl leading-relaxed ${
              theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Since then, I've invested over 10,000 hours into building AI-powered systems for mental health, productivity, 
              automation, and team tools. I've worked alone, failed fast, rebuilt better, and proven what works by doing it.
            </p>
          </div>

          {/* CTA Button */}
          <div className="animate-fade-in-up-delay-2">
            <button
              onClick={onReadFullStory}
              className="group inline-flex items-center justify-center font-semibold py-4 px-10 rounded-lg text-lg border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 transform-gpu"
            >
              <span>Read My Full Story</span>
              <ArrowRight size={20} className="ml-3 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-gentle {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 8s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animate-fade-in-up-delay {
          animation: fade-in-up 0.8s ease-out 0.2s forwards;
          opacity: 0;
        }
        .animate-fade-in-up-delay-2 {
          animation: fade-in-up 0.8s ease-out 0.4s forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};