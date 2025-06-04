
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '../../../types';
import { X, ArrowLeft, Phone } from 'lucide-react';

interface FullStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const FullStoryModal: React.FC<FullStoryModalProps> = ({ isOpen, onClose, theme }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const storyContent = [
    {
      year: "2020",
      title: "The Beginning",
      content: "I started my AI journey with zero coding background. Like many, I was fascinated by the potential but frustrated by the gap between AI hype and reality. I wasted money on unreliable developers and broken promises."
    },
    {
      year: "2021", 
      title: "Self-Teaching",
      content: "Determined to understand AI myself, I dove deep into learning. 10+ hours a day, every day. Python, machine learning, neural networks, APIs. I built my first working prototypes and started to see what was actually possible."
    },
    {
      year: "2022",
      title: "First Real Projects", 
      content: "I launched Talk to Eve, a mental wellness AI with emotional tracking, and ZingZang Lab, an AI music app. These weren't just demos—they were real applications handling real users. I learned what works in production."
    },
    {
      year: "2023",
      title: "Business Focus",
      content: "I built iWriter.ai for Norwegian SMEs and created the Optix.io marketplace. The focus shifted from cool technology to solving actual business problems. Every line of code had to deliver measurable value."
    },
    {
      year: "2024",
      title: "AI Consulting",
      content: "After 10,000+ hours of hands-on experience, I launched FarzadAI. Now I help businesses implement AI solutions that actually work—no theoretical fluff, just practical systems that deliver results."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto border
        ${theme === Theme.DARK 
          ? 'bg-black border-white/20' 
          : 'bg-white border-black/20'
        } backdrop-blur-xl`}>
        
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b
          ${theme === Theme.DARK 
            ? 'border-white/10 bg-black/90' 
            : 'border-black/10 bg-white/90'
          } backdrop-blur-xl`}>
          <h2 className={`text-2xl font-medium ${
            theme === Theme.DARK ? 'text-white' : 'text-black'
          }`}>
            My Full Story
          </h2>
          <button
            onClick={onClose}
            className={`p-2 transition-colors ${
              theme === Theme.DARK 
                ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                : 'hover:bg-black/10 text-gray-600 hover:text-black'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-12">
          {storyContent.map((section, index) => (
            <div key={index} className="flex gap-6">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-medium">
                  {section.year.slice(-2)}
                </div>
                {index < storyContent.length - 1 && (
                  <div className={`w-px h-16 mt-4 ${
                    theme === Theme.DARK ? 'bg-white/10' : 'bg-black/10'
                  }`} />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h3 className={`text-xl font-medium mb-3 ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                }`}>
                  {section.title}
                </h3>
                <p className={`text-base font-light leading-relaxed ${
                  theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`p-6 border-t text-center ${
          theme === Theme.DARK 
            ? 'border-white/10' 
            : 'border-black/10'
        }`}>
          <p className={`text-sm font-light ${
            theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Ready to work with someone who's been in the trenches?
          </p>
        </div>
      </div>
    </div>
  );
};
