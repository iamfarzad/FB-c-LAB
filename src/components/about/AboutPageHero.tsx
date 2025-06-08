import React, { useState, useEffect } from 'react';
import { Theme } from '@/types';
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
      className="relative min-h-screen flex items-center justify-center text-center transition-all duration-700 overflow-hidden"
    >
      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-7xl mx-auto">
          {/* Main content layout */}
          <div className={`grid lg:grid-cols-2 gap-16 lg:gap-24 items-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            
            {/* Left side - Profile Image */}
            <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'} order-2 lg:order-1`}
                 style={{ animationDelay: '0.1s' }}>
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-full lg:h-[500px] xl:h-[600px] mx-auto group">
                {/* Main image container with enhanced interactions */}
                <div className="relative w-full h-full transform transition-all duration-500 ease-out
                  hover:scale-105 hover:-rotate-1 hover:shadow-3xl
                  animate-float">
                  <img
                    src="/assets/farzad-bayat-profile.jpg"
                    alt="Farzad Bayat"
                    className={`w-full h-full object-cover rounded-2xl shadow-2xl transition-all duration-500
                      ${theme === Theme.DARK ? 'ring-1 ring-white/10 hover:ring-white/20' : 'ring-1 ring-black/5 hover:ring-black/10'}
                      group-hover:shadow-orange-500/20`}
                  />
                  
                  {/* Enhanced overlay effect */}
                  <div className="absolute inset-0 rounded-2xl" />
                  
                  {/* Animated border glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500
                    blur-sm -z-10" />
                </div>

                {/* Enhanced corner accents */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full blur-lg 
                  animate-pulse-slow group-hover:w-20 group-hover:h-20 
                  transition-all duration-700" />
                
                <div className="absolute bottom-6 left-6 w-8 h-8 rounded-full blur-md 
                  animate-pulse-slow group-hover:w-14 group-hover:h-14 
                  transition-all duration-700" style={{ animationDelay: '1s' }} />

                {/* Subtle animated dots */}
                <div className="absolute top-1/2 -right-4 opacity-30 group-hover:opacity-60 transition-opacity duration-500">
                  <div className="flex flex-col space-y-2">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Content */}
            <div className={`${isVisible ? 'animate-fade-in-up' : 'opacity-0'} order-1 lg:order-2 text-center lg:text-left`}
                 style={{ animationDelay: '0.3s' }}>
              
              <div className="space-y-8">
                <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light leading-tight tracking-tight
                  ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}>
                  About{' '}
                  <span className="font-medium text-orange-500">Farzad</span>
                </h1>
                
                <div className={`w-24 h-px ${typeof window !== 'undefined' && window.innerWidth >= 1024 ? '' : 'mx-auto'}`} />
                
                <p className={`text-xl sm:text-2xl lg:text-3xl leading-relaxed font-light
                  ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                  Self-taught AI consultant who spent{' '}
                  <span className="font-medium">10,000+ hours</span>{' '}
                  building real solutions that work.
                </p>

                {/* Stats integrated into content area */}
                <div className="grid grid-cols-3 gap-8 mt-12 max-w-md mx-auto lg:mx-0">
                  <div className="text-center lg:text-left">
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
                  
                  <div className="text-center lg:text-left">
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
                  
                  <div className="text-center lg:text-left">
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
              </div>
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
    </section>
  );
};
