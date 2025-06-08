import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Theme } from '../../contexts/ThemeContext';
import { InteractiveOrb } from '../ui';

interface HomePageHeroProps {
  theme: Theme;
  onToggleChat: (message?: string) => void; 
}

export const HomePageHero: React.FC<HomePageHeroProps> = ({ theme, onToggleChat }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for performance and animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const heroElement = document.getElementById('hero-home');
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => observer.disconnect();
  }, []);

  // Simplified, professional action prompts
  const actionPrompts = [
    { text: "Services", prompt: "Tell me about your AI consulting services." },
    { text: "Workshops", prompt: "What AI workshops do you offer?" },
    { text: "Consulting", prompt: "I'd like to discuss custom AI development." },
    { text: "Book Call", prompt: "I'd like to book a consultation." },
  ];

  return (
    <section 
      id="hero-home" 
      className={`relative min-h-screen flex items-center justify-center text-center transition-all duration-700 overflow-hidden
        ${theme === Theme.DARK ? '' : ''}`}
    >
      <div className="container mx-auto px-6 relative z-30 max-w-6xl">
        {/* Clean, professional typography */}
        <div className="space-y-12 mb-16">
          <div className="space-y-8">
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light leading-tight tracking-tight
              ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}
              ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}
              style={{ animationDelay: '0.2s' }}
            >
              <span className="block font-medium">AI Automation</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light mt-4 opacity-60">
                Without the Hype
              </span>
            </h1>
          </div>
          
          <p className={`text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-light
            ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'}
            ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
            style={{ animationDelay: '0.4s' }}
          >
            I'm <span className="font-medium text-orange-500">Farzad Bayat</span>—a self-taught AI consultant who spent{' '}
            <span className="font-medium">10,000+ hours</span> figuring out what works so your business doesn't have to.
          </p>
        </div>

        {/* Enhanced Interactive Orb - now using InteractiveOrb component */}
        <div className={`flex justify-center mb-16 ${isVisible ? 'animate-fade-in-scale' : 'opacity-0 scale-95'}`}
             style={{ animationDelay: '0.6s' }}>
          <InteractiveOrb
            theme={theme}
            size="xl"
            isVisible={isVisible}
            className="cursor-pointer"
          />
        </div>

        {/* Simplified interaction area */}
        <div className={`space-y-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
             style={{ animationDelay: '0.8s' }}>
          
          {/* Clean main prompt */}
          <div 
            onClick={() => onToggleChat("Start a conversation")}
            className={`group relative w-full max-w-2xl mx-auto p-6 border-2 transition-all duration-300 cursor-pointer
              ${theme === Theme.DARK 
                ? 'border-white/20 hover:border-white/40 bg-black/20 hover:bg-black/40' 
                : 'border-black/20 hover:border-black/40 bg-white/20 hover:bg-white/40'}
              hover:scale-[1.02] backdrop-blur-xl`}
            role="button"
            tabIndex={0}
            aria-label="Open AI Assistant"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full border ${
                  theme === Theme.DARK ? 'border-white/20' : 'border-black/20'
                }`}>
                  <MessageSquare size={20} className="text-orange-500" />
                </div>
                <div className="text-left">
                  <p className={`font-medium text-lg ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}>
                    Start a conversation
                  </p>
                  <p className={`text-sm ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ask about AI, services, or tap an action below
                  </p>
                </div>
              </div>
              <ArrowRight size={20} className={`text-orange-500 opacity-0 group-hover:opacity-100 
                transform translate-x-2 group-hover:translate-x-0 transition-all duration-300`} />
            </div>
          </div>

          {/* Clean action buttons */}
          <div className="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto">
            {actionPrompts.map((btn, index) => (
              <button
                key={btn.text}
                onClick={() => onToggleChat(btn.prompt || '')}
                className={`py-3 px-6 border font-medium text-sm transition-all duration-200 hover:scale-105
                  ${theme === Theme.DARK
                    ? 'border-white/20 text-gray-300 hover:border-white/40 hover:text-white'
                    : 'border-black/20 text-gray-700 hover:border-black/40 hover:text-black'
                  }`}
                style={{
                  animationDelay: `${1 + index * 0.1}s`
                }}
              >
                {btn.text}
              </button>
            ))}
          </div>
        </div>

        {/* Minimal scroll indicator */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 bottom-8
          ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
             style={{ animationDelay: '1.5s' }}>
          <div className={`flex flex-col items-center space-y-2 opacity-40 hover:opacity-100 transition-opacity
            ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}>
            <span className="text-xs font-medium tracking-wider uppercase">Explore</span>
            <div className="w-px h-8 bg-current animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};
