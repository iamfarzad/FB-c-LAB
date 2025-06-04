
import React from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '../../../types';
import { ArrowRight } from 'lucide-react';

interface ServicesPageHeroProps {
  theme: Theme;
}

export const ServicesPageHero: React.FC<ServicesPageHeroProps> = ({ theme }) => {
  const accentColor = 'var(--accent-color)';
  const accentColorHover = 'var(--accent-color-hover)';
  const buttonTextColor = 'text-white';
  
  return (
    <section className={`py-20 md:py-28 text-center transition-colors duration-300 ${theme === Theme.DARK ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          Practical AI Services That Deliver Results
        </h1>
        <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-10 ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-600'}`}>
          Whether you need automation, a custom chatbot, or internal AI copilots, I help you build what actually works—no fluff, no theory.
        </p>
        <Link
          to="/contact"
          className={`inline-flex items-center justify-center font-semibold py-3 px-8 rounded-lg text-md md:text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-lg ${buttonTextColor}`}
          style={{ backgroundColor: accentColor }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentColorHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accentColor}
        >
          Book a Free Consultation <ArrowRight size={20} className="ml-2" />
        </Link>
      </div>
    </section>
  );
};