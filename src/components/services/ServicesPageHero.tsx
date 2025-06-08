import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function ServicesPageHero() {
  
  return (
    <section className="py-20 md:py-28 text-center transition-colors duration-300">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
          Practical AI Services That Deliver Results
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10">
          Whether you need automation, a custom chatbot, or internal AI copilots, I help you build what actually works—no fluff, no theory.
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center justify-center font-semibold py-3 px-8 rounded-lg text-md md:text-lg transition-transform duration-300 ease-in-out hover:scale-105 shadow-lg"
        >
          Book a Free Consultation <ArrowRight size={20} className="ml-2" />
        </Link>
      </div>
    </section>
  );
};