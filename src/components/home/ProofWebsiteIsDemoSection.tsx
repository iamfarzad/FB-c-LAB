
import React, { useState, useEffect } from 'react';
import { Theme } from '../../../types';
import { FlickeringGrid } from '../ui/FlickeringGrid';
import { Code, Server, Database, ArrowRight } from 'lucide-react';

interface ProofWebsiteIsDemoSectionProps {
  theme: Theme;
  onToggleChat: () => void;
}

export const ProofWebsiteIsDemoSection: React.FC<ProofWebsiteIsDemoSectionProps> = ({ theme, onToggleChat }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );

    const element = document.getElementById('proof-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Code,
      title: "React + TypeScript",
      description: "Built with modern frontend technologies for performance and type safety.",
      delay: 0
    },
    {
      icon: Server,
      title: "Google Gemini API",
      description: "Powered by Google's advanced large language model for natural conversations.",
      delay: 0.1
    },
    {
      icon: Database,
      title: "Stateful Interactions",
      description: "Maintains context throughout your conversation for coherent responses.",
      delay: 0.2
    }
  ];

  return (
    <section 
      id="proof-section"
      className={`relative py-24 lg:py-32 transition-all duration-700 overflow-hidden
        ${theme === Theme.DARK ? 'bg-black' : 'bg-white'}`}
    >
      {/* Subtle background effect */}
      <div className="absolute inset-0">
        <FlickeringGrid
          className="absolute inset-0 z-0"
          squareSize={2}
          gridGap={16}
          maxOpacity={0.05}
          flickerChance={0.007}
          width={1920}
          height={1080}
          theme={theme === Theme.DARK ? 'dark' : 'light'}
          blur={1.5}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Clean section header */}
          <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight ${
              theme === Theme.DARK ? 'text-white' : 'text-black'
            }`}>
              This website is a demo
            </h2>
            <div className="w-16 h-px bg-orange-500 mx-auto mb-8" />
            <p className={`text-lg font-light leading-relaxed max-w-2xl mx-auto ${
              theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Experience the AI capabilities firsthand. This site demonstrates what's possible with modern AI integration.
            </p>
          </div>

          {/* Technical features */}
          <div className={`grid md:grid-cols-3 gap-8 mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.2s' }}>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 border transition-all duration-300
                  ${theme === Theme.DARK 
                    ? 'border-white/10 bg-black/20' 
                    : 'border-black/10 bg-white/20'
                  } backdrop-blur-xl`}
                style={{ animationDelay: `${0.2 + feature.delay}s` }}
              >
                <div className="mb-4">
                  <feature.icon size={24} className="text-orange-500" />
                </div>
                <h3 className={`text-lg font-medium mb-2 ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                }`}>
                  {feature.title}
                </h3>
                <p className={`text-sm font-light ${
                  theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Code snippet */}
          <div className={`mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.4s' }}>
            <div className={`p-4 font-mono text-sm overflow-x-auto ${
              theme === Theme.DARK 
                ? 'bg-gray-900 text-gray-300 border border-gray-800' 
                : 'bg-gray-100 text-gray-800 border border-gray-200'
            }`}>
              <pre><code>{`// Example of AI integration
import * as GeminiService from '../../../services/geminiService';

const handleUserMessage = async (message: string) => {
  try {
    const response = await GeminiService.sendMessage(message);
    return response;
  } catch (error) {
    console.error("Error communicating with AI:", error);
    return "I'm having trouble processing your request.";
  }
};`}</code></pre>
            </div>
          </div>

          {/* CTA */}
          <div className={`text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.6s' }}>
            <button
              onClick={onToggleChat}
              className={`group inline-flex items-center gap-3 px-8 py-4 border-2 font-medium text-lg
                transition-all duration-200 hover:scale-[1.02]
                ${theme === Theme.DARK 
                  ? 'border-white text-white hover:bg-white hover:text-black' 
                  : 'border-black text-black hover:bg-black hover:text-white'}`}
            >
              Try the AI assistant
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
            
            <p className={`text-sm font-light mt-4 ${
              theme === Theme.DARK ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Ask questions about AI, my services, or anything else
            </p>
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
