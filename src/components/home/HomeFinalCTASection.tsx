import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, ArrowRight, Sparkles } from 'lucide-react';
import { Theme } from '@/types';
// Background pattern is now handled by Layout component

interface HomeFinalCTASectionProps {
  theme: Theme;
  onToggleChat: () => void;
}

export const HomeFinalCTASection: React.FC<HomeFinalCTASectionProps> = ({ theme, onToggleChat }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section 
      className={`relative py-32 lg:py-40 text-center transition-all duration-700 overflow-hidden`}
    >
      {/* Background pattern is handled by Layout component */}

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="relative inline-block">
              <Sparkles 
                size={48} 
                className={`text-orange-500 transition-transform duration-500 ${
                  isHovered ? 'scale-125' : 'scale-100'
                }`} 
              />
              <div className="absolute inset-0 animate-ping-slow opacity-40">
                <Sparkles size={48} className="text-orange-500" />
              </div>
            </div>
          </div>

          <h2 className={`text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-8
            ${theme === Theme.DARK ? 'text-white' : 'text-gray-900'}`}>
            Ready to use{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-orange-500 to-amber-500 
                bg-clip-text text-transparent">
                AI that actually works
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-orange-500/20 
                transform -rotate-1" />
            </span>
            ?
          </h2>

          <p className={`text-xl md:text-2xl mb-12 ${
            theme === Theme.DARK ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Let's identify your use case and create something extraordinary together.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/contact"
              className="group relative overflow-hidden px-10 py-5 rounded-xl text-white font-bold text-lg 
                transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="relative z-10 flex items-center gap-2">
                Book Your Free Consultation
                <ArrowRight size={20} className="transition-transform duration-300 
                  group-hover:translate-x-1" />
              </span>
              
              
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent 
                via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full 
                transition-transform duration-1000" />
            </Link>

            <button
              onClick={onToggleChat}
              className={`group relative px-10 py-5 rounded-xl font-bold text-lg 
                transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                ${theme === Theme.DARK 
                  ? 'text-white' 
                  : 'text-gray-900'}`}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Bot size={20} className="text-orange-500" />
                Try the AI Demo
                <ArrowRight size={18} className="transition-transform duration-300 
                  group-hover:translate-x-1" />
              </span>
              
              <div className="absolute inset-0 rounded-xl border border-orange-500/0 
                group-hover:border-orange-500/30 transition-colors duration-300" />
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8">
            <div className={`flex items-center gap-2 ${
              theme === Theme.DARK ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm">Available for new projects</span>
            </div>
            <div className={`flex items-center gap-2 ${
              theme === Theme.DARK ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-sm">No commitment required</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
