
import React, { useState, useEffect } from 'react';
import { Theme } from '../../../types';
// Background pattern is now handled by Layout component
import { ArrowRight } from 'lucide-react';

interface WhatIOfferSectionProps {
  theme: Theme;
}

export const WhatIOfferSection: React.FC<WhatIOfferSectionProps> = ({ theme }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );

    const element = document.getElementById('what-i-offer-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const services = [
    {
      title: "AI Strategy & Consulting",
      description: "Identify high-impact AI opportunities in your business. Get a clear roadmap from concept to implementation.",
      features: ["Business case analysis", "Technology assessment", "Implementation roadmap", "ROI projections"],
      delay: 0
    },
    {
      title: "Custom AI Development",
      description: "Build AI solutions tailored to your specific needs. From chatbots to complex automation systems.",
      features: ["Custom chatbots", "Process automation", "Data analysis tools", "API integrations"],
      delay: 0.2
    },
    {
      title: "AI Training & Workshops",
      description: "Hands-on training for your team. Learn to implement and maintain AI solutions independently.",
      features: ["Executive briefings", "Technical workshops", "Hands-on training", "Ongoing support"],
      delay: 0.4
    }
  ];

  return (
    <section 
      id="what-i-offer-section"
      className={`relative py-24 lg:py-32 transition-all duration-700 overflow-hidden
        ${theme === Theme.DARK ? 'bg-black' : 'bg-white'}`}
    >
      {/* Background pattern is handled by Layout component */}

      <div className="container mx-auto px-6 relative z-10">
        {/* Clean section header */}
        <div className={`text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight ${
            theme === Theme.DARK ? 'text-white' : 'text-black'
          }`}>
            What I offer
          </h2>
          <div className="w-16 h-px bg-orange-500 mx-auto" />
        </div>

        {/* Services grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group relative ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                style={{ animationDelay: `${service.delay}s` }}
              >
                {/* Clean service card */}
                <div className={`relative h-full p-8 border transition-all duration-300 hover:scale-[1.02]
                  ${theme === Theme.DARK 
                    ? 'border-white/10 hover:border-white/20 bg-black/20' 
                    : 'border-black/10 hover:border-black/20 bg-white/20'
                  } backdrop-blur-xl`}
                >
                  {/* Service content */}
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-xl font-medium mb-4 ${
                        theme === Theme.DARK ? 'text-white' : 'text-black'
                      }`}>
                        {service.title}
                      </h3>
                      
                      <p className={`text-base leading-relaxed font-light ${
                        theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {service.description}
                      </p>
                    </div>

                    {/* Feature list */}
                    <div className="space-y-3">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                          <span className={`text-sm font-light ${
                            theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

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
             style={{ animationDelay: '0.6s' }}>
          <p className={`text-lg font-light max-w-2xl mx-auto ${
            theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Every solution is designed to solve real business problems and deliver measurable results.
          </p>
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
