
import React from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '../../../types';
import { FlickeringGrid } from '../ui/FlickeringGrid';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface AboutFinalCTASectionProps {
  theme: Theme;
  onToggleChat: () => void;
}

export const AboutFinalCTASection: React.FC<AboutFinalCTASectionProps> = ({ theme, onToggleChat }) => {
  return (
    <section 
      className={`relative py-32 lg:py-40 text-center transition-all duration-300 overflow-hidden
        ${theme === Theme.DARK ? 'bg-black' : 'bg-white'}`}
    >
      {/* Sophisticated background */}
      <div className="absolute inset-0">
        <FlickeringGrid
          className="absolute inset-0 z-0"
          squareSize={2}
          gridGap={18}
          maxOpacity={0.05}
          flickerChance={0.006}
          width={1920}
          height={1080}
          theme={theme === Theme.DARK ? 'dark' : 'light'}
          blur={2}
        />
        
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: theme === Theme.DARK 
              ? 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 80%)' 
              : 'radial-gradient(circle at center, transparent 30%, rgba(255,255,255,0.8) 80%)'
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-3xl mx-auto">
          {/* Clean, professional typography */}
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-light mb-8 tracking-tight
            ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}>
            Ready to work together?
          </h2>

          <div className="w-16 h-px bg-orange-500 mx-auto mb-8" />

          <p className={`text-lg md:text-xl mb-16 font-light leading-relaxed ${
            theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Let's discuss your AI project and create something that delivers real business value.
          </p>

          {/* Clean CTA buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link
              to="/contact"
              className={`group inline-flex items-center gap-3 px-8 py-4 border-2 font-medium text-lg
                transition-all duration-200 hover:scale-[1.02]
                ${theme === Theme.DARK 
                  ? 'border-white text-white hover:bg-white hover:text-black' 
                  : 'border-black text-black hover:bg-black hover:text-white'}`}
            >
              Book consultation
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <button
              onClick={onToggleChat}
              className={`group inline-flex items-center gap-3 px-8 py-4 font-medium text-lg
                transition-all duration-200 hover:scale-[1.02]
                ${theme === Theme.DARK 
                  ? 'text-gray-400 hover:text-white' 
                  : 'text-gray-600 hover:text-black'}`}
            >
              <MessageCircle size={18} />
              Ask questions
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>

          {/* Subtle status indicators */}
          <div className="mt-16 flex items-center justify-center gap-12">
            <div className={`flex items-center gap-2 text-sm ${
              theme === Theme.DARK ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Available for new projects
            </div>
            <div className={`flex items-center gap-2 text-sm ${
              theme === Theme.DARK ? 'text-gray-500' : 'text-gray-400'
            }`}>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Free consultation
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
