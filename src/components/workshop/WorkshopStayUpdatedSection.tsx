
import React from 'react';
import { Link } from 'react-router-dom'; 
import { Theme } from '../../../types';
import { Mail, ArrowRight } from 'lucide-react';

interface WorkshopStayUpdatedSectionProps {
  theme: Theme;
}

export const WorkshopStayUpdatedSection: React.FC<WorkshopStayUpdatedSectionProps> = ({ theme }) => {
  const accentColor = 'var(--accent-color)';
  const accentColorHover = 'var(--accent-color-hover)';
  const buttonTextColor = 'text-white';

  return (
    <section className={`py-16 md:py-24 text-center transition-colors duration-300 ${theme === Theme.DARK ? 'bg-black text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="container mx-auto px-6">
        <Mail size={48} className="mx-auto mb-6" style={{color: accentColor}} />
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Stay Updated</h2>
        <p className={`text-lg md:text-xl max-w-xl mx-auto mb-10 ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-600'}`}>
          Workshops will launch soon. Join the waitlist to get notified, receive free templates, and preview content.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <a 
            href="/#waitlist"
            className={`inline-flex items-center justify-center font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-xl ${buttonTextColor}`}
            style={{ backgroundColor: accentColor }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentColorHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accentColor}
          >
            Join the Waitlist <ArrowRight size={20} className="ml-2" />
          </a>
          <Link
            to="/contact"
            className={`inline-flex items-center justify-center font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-xl
              ${theme === Theme.DARK 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Book a Consultation Instead
          </Link>
        </div>
      </div>
    </section>
  );
};