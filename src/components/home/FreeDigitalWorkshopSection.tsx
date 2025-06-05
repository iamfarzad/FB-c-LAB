
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '../../../types';
// Background pattern is now handled by Layout component
import { ArrowRight, Clock, Users, Award } from 'lucide-react';

interface FreeDigitalWorkshopSectionProps {
  theme: Theme;
}

export const FreeDigitalWorkshopSection: React.FC<FreeDigitalWorkshopSectionProps> = ({ theme }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );

    const element = document.getElementById('workshop-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const workshopDetails = [
    {
      icon: Clock,
      label: "Duration",
      value: "90 minutes",
      delay: 0
    },
    {
      icon: Users,
      label: "Format",
      value: "Interactive guide",
      delay: 0.1
    },
    {
      icon: Award,
      label: "Level",
      value: "Business leaders",
      delay: 0.2
    }
  ];

  const outcomes = [
    "Identify AI opportunities in your business",
    "Understand implementation costs and timelines",
    "Create a practical AI roadmap",
    "Avoid common pitfalls and mistakes"
  ];

  return (
    <section 
      id="workshop-section"
      className={`relative py-24 lg:py-32 transition-all duration-700 overflow-hidden
        ${theme === Theme.DARK ? 'bg-black' : 'bg-white'}`}
    >
      {/* Background pattern is handled by Layout component */}
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Clean section header */}
          <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight ${
              theme === Theme.DARK ? 'text-white' : 'text-black'
            }`}>
              Free AI Strategy Workshop
            </h2>
            <div className="w-16 h-px bg-orange-500 mx-auto mb-8" />
            <p className={`text-lg font-light leading-relaxed max-w-2xl mx-auto ${
              theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
            }`}>
              A comprehensive guide to help you identify and prioritize AI opportunities in your business.
            </p>
          </div>

          {/* Workshop details */}
          <div className={`grid md:grid-cols-3 gap-8 mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.2s' }}>
            {workshopDetails.map((detail, index) => (
              <div
                key={index}
                className={`text-center p-6 border transition-all duration-300
                  ${theme === Theme.DARK 
                    ? 'border-white/10 bg-black/20' 
                    : 'border-black/10 bg-white/20'
                  } backdrop-blur-xl`}
                style={{ animationDelay: `${0.2 + detail.delay}s` }}
              >
                <div className="mb-4">
                  <detail.icon size={24} className="text-orange-500 mx-auto" />
                </div>
                <div className={`text-sm font-medium mb-2 ${
                  theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {detail.label}
                </div>
                <div className={`text-lg font-medium ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                }`}>
                  {detail.value}
                </div>
              </div>
            ))}
          </div>

          {/* What you'll learn */}
          <div className={`mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.4s' }}>
            <h3 className={`text-2xl font-medium mb-8 text-center ${
              theme === Theme.DARK ? 'text-white' : 'text-black'
            }`}>
              What you'll learn
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {outcomes.map((outcome, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-2" />
                  <span className={`text-base font-light ${
                    theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {outcome}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className={`text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.6s' }}>
            <Link
              to="/workshop"
              className={`group inline-flex items-center gap-3 px-8 py-4 border-2 font-medium text-lg
                transition-all duration-200 hover:scale-[1.02]
                ${theme === Theme.DARK 
                  ? 'border-white text-white hover:bg-white hover:text-black' 
                  : 'border-black text-black hover:bg-black hover:text-white'}`}
            >
              Start the workshop
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            
            <p className={`text-sm font-light mt-4 ${
              theme === Theme.DARK ? 'text-gray-500' : 'text-gray-400'
            }`}>
              No email required • Takes 90 minutes • Completely free
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
