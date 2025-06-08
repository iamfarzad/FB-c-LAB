import { useState, useEffect } from 'react';
import { CheckCircle, Brain, Code } from 'lucide-react';

export function WhatToExpectSection() {
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

    const element = document.getElementById('what-to-expect');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const workshopFormatDetails = [
    {
      icon: Brain,
      title: "Theory Foundation",
      description: "3 hours: What LLMs are, how they work, risks, limitations, and architecture basics.",
    },
    {
      icon: Code,
      title: "Hands-On Building",
      description: "3 hours: Build a chatbot, automate a task, or create your own internal assistant.",
    }
  ];

  const toolsCovered = [
    "ChatGPT / OpenAI", "Claude / Anthropic", "Google Gemini", 
    "Microsoft Copilot", "LangChain", "Chroma", "Supabase", "Zapier"
  ];

  const keyBenefits = [
    "No prior coding or AI experience required",
    "Clear explanations of how prompts, tokens, context windows, and APIs actually function",
    "You'll leave knowing how to troubleshoot basic AI issues on your own"
  ];

  return (
    <section 
      id="what-to-expect"
      className="py-24 md:py-32 transition-colors duration-300 relative"
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className={`text-center mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light mb-6 tracking-tight">
              What to <span className="font-medium text-orange-500">Expect</span>
            </h2>
            <div className="w-24 h-px bg-orange-500 mx-auto mb-8" />
            <p className="text-xl sm:text-2xl max-w-4xl mx-auto leading-relaxed font-light">
              Built from real-world experience—not theory. Every session gives your team working knowledge 
              and the ability to build practical tools.
            </p>
          </div>

          {/* Key Message */}
          <div className={`text-center mb-16 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.2s' }}>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg font-medium italic text-orange-700">
                "Most AI tools fail in companies not because the technology is bad—but because the team doesn't understand how they work."
              </p>
            </div>
          </div>

          {/* Key Benefits */}
          <div className={`mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.3s' }}>
            <div className="space-y-6 max-w-4xl mx-auto">
              {keyBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <CheckCircle size={24} className="text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-lg">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Workshop Format */}
          <div className={`grid lg:grid-cols-2 gap-12 mb-20 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.4s' }}>
            {workshopFormatDetails.map((item, index) => (
              <div key={index} className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start mb-6">
                  <item.icon size={32} className="text-orange-500 mr-4" />
                  <h3 className="text-2xl font-semibold">
                    {item.title}
                  </h3>
                </div>
                <p className="text-lg leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Tools Covered */}
          <div className={`text-center ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
               style={{ animationDelay: '0.5s' }}>
            <h3 className="text-3xl font-semibold mb-8">
              Tools & Technologies Covered
            </h3>
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
              {toolsCovered.map((tool, index) => (
                <span key={index} 
                      className="px-6 py-3 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};