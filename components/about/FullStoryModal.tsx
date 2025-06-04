import React, { useEffect, useRef } from 'react';
import { Theme } from '../../types';
import { X, ArrowLeft, ArrowRight } from 'lucide-react';
import { useKeyPress } from '../../hooks/useKeyPress';

interface FullStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const FullStoryModal: React.FC<FullStoryModalProps> = ({ isOpen, onClose, theme }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeYear, setActiveYear] = React.useState<string>("2020");
  
  // Handle keyboard navigation
  useKeyPress('Escape', onClose);
  useKeyPress('ArrowRight', () => handleYearChange('next'));
  useKeyPress('ArrowLeft', () => handleYearChange('prev'));

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap
      modalRef.current?.focus();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const storyContent = [
    {
      year: "2020",
      title: "The Beginning",
      content: "I started my AI journey with zero coding background. Like many, I was fascinated by the potential but frustrated by the gap between AI hype and reality. I wasted money on unreliable developers and broken promises.",
      details: [
        "Spent months researching AI capabilities",
        "Hired multiple freelancers with disappointing results",
        "Decided to learn coding myself to understand what was possible"
      ]
    },
    {
      year: "2021", 
      title: "Self-Teaching",
      content: "Determined to understand AI myself, I dove deep into learning. 10+ hours a day, every day. Python, machine learning, neural networks, APIs. I built my first working prototypes and started to see what was actually possible.",
      details: [
        "Learned Python, JavaScript, and basic ML concepts",
        "Built first working prototype chatbots",
        "Experimented with GPT-3 when it was released"
      ]
    },
    {
      year: "2022",
      title: "First Real Projects", 
      content: "I launched Talk to Eve, a mental wellness AI with emotional tracking, and ZingZang Lab, an AI music app. These weren't just demos—they were real applications handling real users. I learned what works in production.",
      details: [
        "Launched Talk to Eve with 500+ active users",
        "Built ZingZang Lab's AI songwriting assistant",
        "Learned about scaling, reliability, and user experience"
      ]
    },
    {
      year: "2023",
      title: "Business Focus",
      content: "I built iWriter.ai for Norwegian SMEs and created the Optix.io marketplace. The focus shifted from cool technology to solving actual business problems. Every line of code had to deliver measurable value.",
      details: [
        "Developed iWriter.ai for content generation",
        "Created Optix.io to connect video creators",
        "Started consulting for small businesses"
      ]
    },
    {
      year: "2024",
      title: "AI Consulting",
      content: "After 10,000+ hours of hands-on experience, I launched FarzadAI. Now I help businesses implement AI solutions that actually work—no theoretical fluff, just practical systems that deliver results.",
      details: [
        "Launched FarzadAI consultancy",
        "Developed workshops for teams and businesses",
        "Focus on practical, measurable business outcomes"
      ]
    }
  ];

  const handleYearChange = (direction: 'next' | 'prev') => {
    const currentIndex = storyContent.findIndex(item => item.year === activeYear);
    if (direction === 'next' && currentIndex < storyContent.length - 1) {
      setActiveYear(storyContent[currentIndex + 1].year);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveYear(storyContent[currentIndex - 1].year);
    }
    
    // Smooth scroll to top when changing years
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  const currentStory = storyContent.find(item => item.year === activeYear) || storyContent[0];
  const currentIndex = storyContent.findIndex(item => item.year === activeYear);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-modal-title"
    >
      {/* Enhanced backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div 
        ref={modalRef}
        className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col border shadow-2xl
          ${theme === Theme.DARK 
            ? 'bg-black border-white/20' 
            : 'bg-white border-black/20'
          } backdrop-blur-xl animate-modal-in`}
        tabIndex={-1}
      >
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b z-10
          ${theme === Theme.DARK 
            ? 'border-white/10 bg-black/90' 
            : 'border-black/10 bg-white/90'
          } backdrop-blur-xl`}>
          <h2 
            id="story-modal-title"
            className={`text-2xl font-light ${
              theme === Theme.DARK ? 'text-white' : 'text-black'
            }`}
          >
            My Journey
          </h2>
          <button
            onClick={onClose}
            className={`p-2 transition-colors ${
              theme === Theme.DARK 
                ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                : 'hover:bg-black/10 text-gray-600 hover:text-black'
            }`}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Timeline navigation */}
        <div className={`flex items-center justify-between p-4 border-b
          ${theme === Theme.DARK 
            ? 'border-white/10 bg-black/80' 
            : 'border-black/10 bg-white/80'
          } backdrop-blur-xl`}>
          <div className="flex items-center space-x-4">
            {storyContent.map((item) => (
              <button
                key={item.year}
                onClick={() => setActiveYear(item.year)}
                className={`relative px-4 py-2 transition-all duration-300 ${
                  activeYear === item.year
                    ? theme === Theme.DARK 
                      ? 'text-orange-500' 
                      : 'text-orange-600'
                    : theme === Theme.DARK 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-600 hover:text-black'
                }`}
              >
                {item.year}
                {activeYear === item.year && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500`} />
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleYearChange('prev')}
              disabled={currentIndex === 0}
              className={`p-2 transition-colors ${
                currentIndex === 0
                  ? 'opacity-30 cursor-not-allowed'
                  : theme === Theme.DARK 
                    ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                    : 'hover:bg-black/10 text-gray-600 hover:text-black'
              }`}
              aria-label="Previous year"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={() => handleYearChange('next')}
              disabled={currentIndex === storyContent.length - 1}
              className={`p-2 transition-colors ${
                currentIndex === storyContent.length - 1
                  ? 'opacity-30 cursor-not-allowed'
                  : theme === Theme.DARK 
                    ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                    : 'hover:bg-black/10 text-gray-600 hover:text-black'
              }`}
              aria-label="Next year"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="p-8 space-y-8">
            {/* Year indicator */}
            <div className="flex items-center space-x-4">
              <div className={`text-6xl font-light ${
                theme === Theme.DARK ? 'text-white/20' : 'text-black/20'
              }`}>
                {currentStory.year}
              </div>
              <div className="w-full h-px bg-orange-500/20" />
            </div>
            
            {/* Title and content */}
            <div>
              <h3 className={`text-3xl font-light mb-6 ${
                theme === Theme.DARK ? 'text-white' : 'text-black'
              }`}>
                {currentStory.title}
              </h3>
              
              <p className={`text-xl font-light leading-relaxed mb-8 ${
                theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {currentStory.content}
              </p>
              
              {/* Details */}
              <div className={`p-6 border ${
                theme === Theme.DARK 
                  ? 'border-white/10 bg-black/20' 
                  : 'border-black/10 bg-white/20'
              }`}>
                <h4 className={`text-sm font-medium uppercase tracking-wider mb-4 ${
                  theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Key Developments
                </h4>
                <ul className="space-y-3">
                  {currentStory.details.map((detail, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-2 mr-3" />
                      <span className={`font-light ${
                        theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                      }`}>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Visual timeline */}
            <div className="pt-8">
              <div className="relative h-1 bg-gray-200 dark:bg-gray-800">
                {storyContent.map((item, index) => {
                  const position = `${(index / (storyContent.length - 1)) * 100}%`;
                  return (
                    <div 
                      key={item.year}
                      className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                        activeYear === item.year
                          ? 'bg-orange-500 border-orange-500 scale-150'
                          : theme === Theme.DARK 
                            ? 'bg-gray-800 border-gray-600' 
                            : 'bg-gray-200 border-gray-400'
                      }`}
                      style={{ left: position }}
                    />
                  );
                })}
                <div 
                  className="absolute top-0 left-0 h-full bg-orange-500 transition-all duration-500"
                  style={{ 
                    width: `${(currentIndex / (storyContent.length - 1)) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${
          theme === Theme.DARK 
            ? 'border-white/10' 
            : 'border-black/10'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-light ${
              theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Use arrow keys to navigate
            </p>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleYearChange('prev')}
                disabled={currentIndex === 0}
                className={`px-4 py-2 border text-sm transition-all duration-300 ${
                  currentIndex === 0
                    ? 'opacity-30 cursor-not-allowed'
                    : theme === Theme.DARK 
                      ? 'border-white/10 hover:border-white/20 text-gray-400 hover:text-white' 
                      : 'border-black/10 hover:border-black/20 text-gray-600 hover:text-black'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handleYearChange('next')}
                disabled={currentIndex === storyContent.length - 1}
                className={`px-4 py-2 border text-sm transition-all duration-300 ${
                  currentIndex === storyContent.length - 1
                    ? 'opacity-30 cursor-not-allowed'
                    : theme === Theme.DARK 
                      ? 'border-white/10 hover:border-white/20 text-gray-400 hover:text-white' 
                      : 'border-black/10 hover:border-black/20 text-gray-600 hover:text-black'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-modal-in {
          animation: modal-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

// Create a hook for keyboard navigation
export const useKeyPress = (targetKey: string, callback: () => void) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === targetKey) {
        callback();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [targetKey, callback]);
};
