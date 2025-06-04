import React, { useState, useEffect } from 'react';
import { Theme } from '../../../types';
import { FlickeringGrid } from '../ui/FlickeringGrid';
import { ArrowDown } from 'lucide-react';

interface AboutPageHeroProps {
  theme: Theme;
}

export const AboutPageHero: React.FC<AboutPageHeroProps> = ({ theme }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section 
      className={`relative min-h-screen flex items-center justify-center text-center transition-all duration-700 overflow-hidden
        ${theme === Theme.DARK ? 'bg-black' : 'bg-white'}`}
    >
      {/* Sophisticated background */}
      <div className="absolute inset-0">
        <FlickeringGrid
          className="absolute inset-0 z-0"
          squareSize={2}
          gridGap={16}
          maxOpacity={0.06}
          flickerChance={0.008}
          width={1920}
          height={1080}
          theme={theme === Theme.DARK ? 'dark' : 'light'}
          blur={1.5}
        />
        
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: theme === Theme.DARK 
              ? 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.9) 80%)' 
              : 'radial-gradient(circle at center, transparent 20%, rgba(255,255,255,0.9) 80%)'
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-4xl mx-auto">
          {/* Clean, professional typography */}
          <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light leading-tight tracking-tight
              ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}
              style={{ animationDelay: '0.2s' }}
            >
              About{' '}
              <span className="font-medium text-orange-500">Farzad</span>
            </h1>
            
            <div className="w-24 h-px bg-orange-500 mx-auto" />
            
            <p className={`text-xl sm:text-2xl lg:text-3xl max-w-3xl mx-auto leading-relaxed font-light
              ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'}`}
              style={{ animationDelay: '0.4s' }}
            >
              Self-taught AI consultant who spent{' '}
              <span className="font-medium">10,000+ hours</span>{' '}
              building real solutions that work.
            </p>
          </div>

          {/* Simple stats */}
          <div className={`grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className={`text-3xl font-light mb-2 ${
                theme === Theme.DARK ? 'text-white' : 'text-black'
              }`}>
                4+
              </div>
              <div className={`text-sm font-light ${
                theme === Theme.DARK ? 'text-gray-500' : 'text-gray-600'
              }`}>
                Years learning
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-light mb-2 ${
                theme === Theme.DARK ? 'text-white' : 'text-black'
              }`}>
                10k+
              </div>
              <div className={`text-sm font-light ${
                theme === Theme.DARK ? 'text-gray-500' : 'text-gray-600'
              }`}>
                Hours coding
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-light mb-2 ${
                theme === Theme.DARK ? 'text-white' : 'text-black'
              }`}>
                100%
              </div>
              <div className={`text-sm font-light ${
                theme === Theme.DARK ? 'text-gray-500' : 'text-gray-600'
              }`}>
                Self-taught
              </div>
            </div>
          </div>

          {/* Minimal scroll indicator */}
          <div className={`absolute left-1/2 transform -translate-x-1/2 bottom-8
            ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.8s' }}>
            <div className={`flex flex-col items-center space-y-2 opacity-40 hover:opacity-100 transition-opacity cursor-pointer
              ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}
              onClick={() => {
                const element = document.getElementById('unified-about-content');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="text-xs font-medium tracking-wider uppercase">Learn more</span>
              <ArrowDown size={16} className="animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </section>
  );
};
