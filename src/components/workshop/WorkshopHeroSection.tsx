
import React from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '../../../types';
import { Clock } from 'lucide-react';

interface WorkshopHeroSectionProps {
  theme: Theme;
}

export const WorkshopHeroSection: React.FC<WorkshopHeroSectionProps> = ({ theme }) => {
  const accentColor = 'var(--accent-color)';
  const accentColorHover = 'var(--accent-color-hover)';
  const buttonTextColor = 'text-white';

  return (
    <section className={`py-20 md:py-28 text-center transition-colors duration-300 ${theme === Theme.DARK ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <div className="container mx-auto px-6">
        <Clock size={56} className="mx-auto mb-6" style={{ color: accentColor }}/>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          Hands-On AI Workshops for Your Team
        </h1>
        <p className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-600'}`}>
          Coming Soon – Get notified when the full workshop schedule is live.
        </p>
        <a 
          href="/#waitlist" 
          className={`inline-flex items-center justify-center font-semibold py-3 px-8 rounded-lg text-md md:text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-lg ${buttonTextColor}`}
          style={{ backgroundColor: accentColor }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentColorHover}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accentColor}
        >
          Join the Waitlist &rarr;
        </a>
      </div>
    </section>
  );
};