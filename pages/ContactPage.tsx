
import React from 'react';
import { Theme } from '../types';
import { Mail, Calendar, MessageSquare } from 'lucide-react';
import { CALENDLY_PLACEHOLDER_URL, FBC_BRAND_NAME } from '../constants';

interface ContactPageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ theme, onToggleChat }) => {
  const accentColor = 'var(--accent-color)'; // Orange
  const accentColorHover = 'var(--accent-color-hover)';
  const buttonTextColor = 'text-white'; // Assuming white text for orange buttons

  return (
    <div className={`py-12 md:py-20 transition-colors duration-300 ${theme === Theme.DARK ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-6">
        <header className="text-center mb-12 md:mb-16">
          <Mail size={64} className="mx-auto mb-6" style={{ color: accentColor }} />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-600'}`}>
            Ready to explore how AI can transform your business? Let's connect.
          </p>
        </header>

        <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12">
          <div className={`p-6 md:p-8 rounded-xl shadow-xl text-center ${theme === Theme.DARK ? 'bg-gray-900' : 'bg-white'}`}>
            <Calendar size={48} className="mx-auto mb-5" style={{ color: accentColor }} />
            <h2 className="text-2xl font-semibold mb-3">Book a Free Consultation</h2>
            <p className={`mb-6 text-md ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
              Schedule a complimentary 15-minute strategy session to discuss your needs and how ${FBC_BRAND_NAME} can help.
            </p>
            <a
              href={CALENDLY_PLACEHOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-block font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-lg ${buttonTextColor}`}
              style={{ backgroundColor: accentColor }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `var(--accent-color-hover)`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accentColor}
            >
              Schedule Now
            </a>
          </div>

          <div className={`p-6 md:p-8 rounded-xl shadow-xl text-center ${theme === Theme.DARK ? 'bg-gray-900' : 'bg-white'}`}>
            <MessageSquare size={48} className="mx-auto mb-5" style={{ color: accentColor }} />
            <h2 className="text-2xl font-semibold mb-3">Ask My AI Assistant</h2>
            <p className={`mb-6 text-md ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
              Have a quick question? My AI assistant is available 24/7 to provide information about services, workshops, or general AI queries.
            </p>
            <button
              onClick={() => onToggleChat()}
              className={`inline-block font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-lg ${buttonTextColor}`}
              style={{ backgroundColor: accentColor }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `var(--accent-color-hover)`}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accentColor}
            >
              Start AI Chat
            </button>
          </div>
        </div>
        
        <div className={`mt-12 md:mt-16 p-6 md:p-8 rounded-xl shadow-xl text-center max-w-3xl mx-auto ${theme === Theme.DARK ? 'bg-gray-900' : 'bg-white'}`}>
            <h2 className="text-2xl font-semibold mb-3">General Inquiries</h2>
             <p className={`mb-4 text-md ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
              For other questions, or if you prefer email, you can reach out directly. 
              (Please note: for fastest response on consultation booking, use the scheduling link.)
            </p>
            <p className={`text-lg font-medium`} style={{color: accentColor}}>
                Email: <a href="mailto:placeholder@fbc.com" className="hover:underline">placeholder@fbc.com</a> (Replace with actual email)
            </p>
        </div>


      </div>
    </div>
  );
};