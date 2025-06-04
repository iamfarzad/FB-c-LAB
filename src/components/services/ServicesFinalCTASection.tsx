
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot } from 'lucide-react';
import { Theme } from '../../../types';

interface ServicesFinalCTASectionProps {
  theme: Theme;
  onToggleChat: () => void;
}

export const ServicesFinalCTASection: React.FC<ServicesFinalCTASectionProps> = ({ theme, onToggleChat }) => {
  const accentColor = 'var(--accent-color)';
  const accentColorHover = 'var(--accent-color-hover)';
  const buttonTextColor = 'text-white';

  return (
    <section className={`py-16 md:py-24 text-center transition-colors duration-300 ${theme === Theme.DARK ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Let’s scope your use case, identify a quick win, and get to work.
        </h2>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            to="/contact"
            className={`inline-flex items-center justify-center font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-xl ${buttonTextColor}`}
            style={{ backgroundColor: accentColor }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentColorHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accentColor}
          >
            Book a Free Consultation <ArrowRight size={20} className="ml-2" />
          </Link>
          <button
            onClick={onToggleChat}
            className={`inline-flex items-center justify-center font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-xl
              ${theme === Theme.DARK 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Try My AI Assistant Now <Bot size={20} className="ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};