import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bot } from 'lucide-react';

interface ServicesFinalCTASectionProps {
  onToggleChat: () => void;
}

export const ServicesFinalCTASection: React.FC<ServicesFinalCTASectionProps> = ({ onToggleChat }) => {

  return (
    <section className="py-16 md:py-24 text-center transition-colors duration-300">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Let’s scope your use case, identify a quick win, and get to work.
        </h2>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            to="/contact"
            className="inline-flex items-center justify-center font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-xl"
          >
            Book a Free Consultation <ArrowRight size={20} className="ml-2" />
          </Link>
          <button
            onClick={onToggleChat}
            className="inline-flex items-center justify-center font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-xl"
          >
            Try My AI Assistant Now <Bot size={20} className="ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
};