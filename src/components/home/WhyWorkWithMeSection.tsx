import React, { useState, useEffect } from 'react';
import { Theme } from '@/types';
// Background pattern is now handled by Layout component
import { ArrowRight, CheckCircle } from 'lucide-react';

interface WhyWorkWithMeSectionProps {
  theme: Theme;
}

export const WhyWorkWithMeSection: React.FC<WhyWorkWithMeSectionProps> = ({ theme }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );

    const element = document.getElementById('why-work-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const reasons = [
    {
      title: "No theoretical fluff",
      description: "I've built real systems that handle millions of requests. You get battle-tested solutions, not academic theories.",
      delay: 0
    },
    {
      title: "Self-taught expertise",
      description: "10,000+ hours of hands-on learning means I understand the practical challenges you'll face.",
      delay: 0.2
    },
    {
      title: "Business-first approach",
      description: "Every AI implementation is designed to solve actual business problems and deliver measurable ROI.",
      delay: 0.4
    },
    {
      title: "End-to-end delivery",
      description: "From strategy to deployment, I handle the complete journey so you don't need multiple vendors.",
      delay: 0.6
    }
  ];

  return (
    <section 
      id="why-work-section"
      className="relative py-24 lg:py-32 transition-all duration-700 overflow-hidden"
    >
      {/* Background pattern is handled by Layout component */}

      <div className="container mx-auto px-6 relative z-10">
        {/* Clean section header */}
        <div className={`text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight ${
            theme === Theme.DARK ? 'text-white' : 'text-black'
          }`}>
            Why work with me?
          </h2>
          <div className="w-16 h-px bg-orange-500 mx-auto" />
        </div>

        {/* Reasons grid */}
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {reasons.map((reason, index) => (
              <div
                key={index}
                className={`group relative ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${reason.delay}s` }}
              >
                {/* Clean card design */}
                <div className={`relative p-8 border transition-all duration-300 hover:scale-[1.02]
                  ${theme === Theme.DARK 
                    ? 'border-white/10 hover:border-white/20' 
                    : 'border-black/10 hover:border-black/20'
                  } backdrop-blur-xl`}
                >
                  {/* Minimal icon */}
                  <div className="mb-6">
                    <CheckCircle size={24} className="text-orange-500" />
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl font-medium mb-4 ${
                    theme === Theme.DARK ? 'text-white' : 'text-black'
                  }`}>
                    {reason.title}
                  </h3>
                  
                  <p className={`text-base leading-relaxed font-light ${
                    theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {reason.description}
                  </p>

                  {/* Subtle hover indicator */}
                  <div className={`absolute right-6 top-6 opacity-0 group-hover:opacity-100 
                    transition-all duration-300 transform translate-x-2 group-hover:translate-x-0`}>
                    <ArrowRight size={16} className="text-orange-500" />
                  </div>

                  {/* Minimal hover effect */}
                  <div className="absolute inset-0 border border-orange-500/0 group-hover:border-orange-500/10 
                    transition-colors duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Simple closing statement */}
        <div className={`text-center mt-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
             style={{ animationDelay: '0.8s' }}>
          <p className={`text-lg font-light max-w-2xl mx-auto ${
            theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Ready to work with someone who's been in the trenches and knows what actually works?
          </p>
        </div>
      </div>
    </section>
  );
};
