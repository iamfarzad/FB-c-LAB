import React, { useState, useEffect, useRef } from 'react';
import { Theme } from '../../../types';
// Background pattern is now handled by Layout component
import { TrendingUp, Clock, BarChart2 } from 'lucide-react';

interface ResultsRealProjectsSectionProps {
  theme: Theme;
}

// Clean counter component - no excessive animations
const CountUpAnimation: React.FC<{ end: number; duration: number; delay: number }> = ({ 
  end, 
  duration,
  delay 
}) => {
  const [count, setCount] = useState(0);
  const countRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const progress = (timestamp - startTimeRef.current) / (duration * 1000);

        if (progress < 1) {
          countRef.current = Math.min(Math.floor(end * progress), end);
          setCount(countRef.current);
          requestAnimationFrame(animate);
        } else {
          countRef.current = end;
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [end, duration, delay]);

  return <>{count}</>;
};

export const ResultsRealProjectsSection: React.FC<ResultsRealProjectsSectionProps> = ({ theme }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );

    const element = document.getElementById('results-section');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const results = [
    { 
      icon: Clock,
      metric: "65",
      text: "Faster response time",
      subtext: "Custom chatbot implementation",
      delay: 0
    },
    { 
      icon: TrendingUp,
      metric: "99",
      text: "Faster reporting",
      subtext: "From 3 days to 30 seconds",
      delay: 0.2
    },
    { 
      icon: BarChart2,
      metric: "40",
      text: "Increase in conversion",
      subtext: "AI-driven insights",
      delay: 0.4
    }
  ];

  return (
    <section 
      id="results-section"
      className="relative py-24 lg:py-32 transition-all duration-700 overflow-hidden"
    >
      <div className="container mx-auto px-6 relative z-10">
        {/* Clean section header */}
        <div className={`text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight ${
            theme === Theme.DARK ? 'text-white' : 'text-black'
          }`}>
            Real results
          </h2>
          <div className="w-16 h-px bg-orange-500 mx-auto" />
        </div>

        {/* Results grid with clean metrics */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className={`group relative p-8 border transition-all duration-300 hover:scale-[1.02]
                ${theme === Theme.DARK 
                  ? 'border-white/10 hover:border-white/20 bg-black/20' 
                  : 'border-black/10 hover:border-black/20 bg-white/20'}
                ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} backdrop-blur-xl`}
              style={{ animationDelay: `${result.delay}s` }}
            >
              {/* Clean metric card content */}
              <div className="text-center">
                {/* Professional icon */}
                <div className="mb-6">
                  <result.icon size={24} className="text-orange-500 mx-auto" />
                </div>

                {/* Clean animated metric */}
                <div className="mb-4">
                  <div className={`text-4xl font-light mb-2 ${
                    theme === Theme.DARK ? 'text-white' : 'text-black'
                  }`}>
                    {isVisible ? (
                      <CountUpAnimation
                        end={parseInt(result.metric)}
                        duration={2}
                        delay={result.delay}
                      />
                    ) : '0'}%
                  </div>
                  <h3 className={`text-lg font-medium ${
                    theme === Theme.DARK ? 'text-white' : 'text-black'
                  }`}>
                    {result.text}
                  </h3>
                </div>

                {/* Subtext */}
                <p className={`text-sm font-light ${
                  theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {result.subtext}
                </p>
              </div>

              {/* Minimal hover effect */}
              <div className="absolute inset-0 border border-orange-500/0 group-hover:border-orange-500/10 
                transition-colors duration-300" />
            </div>
          ))}
        </div>

        {/* Simple closing statement */}
        <div className={`text-center mt-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
             style={{ animationDelay: '0.6s' }}>
          <p className={`text-lg font-light max-w-2xl mx-auto ${
            theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Every project is designed to deliver measurable business impact.
          </p>
        </div>
      </div>

      <style>{`
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
