import { useState, useEffect } from 'react';
import { Target, Users, Wrench, BookOpen, Zap, Award } from 'lucide-react';

export function WhyItWorksSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('why-it-works');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const reasons = [
    {
      icon: Target,
      title: "Real-World Focus",
      description: "Built from 10,000+ hours of actual AI implementation, not academic theory."
    },
    {
      icon: Wrench,
      title: "Hands-On Learning",
      description: "You build actual tools during the workshop—leave with working solutions."
    },
    {
      icon: Users,
      title: "Team-Tailored",
      description: "Customized for your industry, use cases, and technical skill level."
    },
    {
      icon: BookOpen,
      title: "Foundation First",
      description: "Understand the fundamentals so you can troubleshoot and innovate independently."
    },
    {
      icon: Zap,
      title: "Immediate Impact",
      description: "Start implementing AI solutions in your workflow the next day."
    },
    {
      icon: Award,
      title: "Ongoing Support",
      description: "Templates, code samples, and follow-up guidance included."
    }
  ];

  return (
    <section 
      id="why-it-works"
      className="py-24 md:py-32 transition-colors duration-300 relative"
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className={`text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light mb-6 tracking-tight">
              Why It <span className="font-medium text-orange-500">Works</span>
            </h2>
            <div className="w-24 h-px bg-orange-500 mx-auto mb-8" />
            <p className="text-xl sm:text-2xl max-w-4xl mx-auto leading-relaxed font-light">
              This isn't another generic AI overview. It's a practical system that gets teams 
              building real solutions fast.
            </p>
          </div>

          {/* Reasons Grid */}
          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.2s' }}>
            {reasons.map((reason, index) => (
              <div key={index} className="text-center lg:text-left">
                <reason.icon size={32} className="text-orange-500 mx-auto lg:mx-0 mb-4" />
                <h3 className="text-xl font-semibold mb-4">
                  {reason.title}
                </h3>
                <p className="leading-relaxed">
                  {reason.description}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className={`text-center mt-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.4s' }}>
            <p className="text-lg font-medium mb-6">
              Ready to give your team the AI skills they actually need?
            </p>
            <a 
              href="/#waitlist"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-lg 
                transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              Join the Waitlist
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};