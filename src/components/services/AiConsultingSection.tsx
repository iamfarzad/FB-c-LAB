import { Link } from 'react-router-dom';
import { CheckCircle, Users, DollarSign } from 'lucide-react';

export function AiConsultingSection() {
  const helpItems = [
    "Build internal chatbots connected to company data",
    "Automate customer service, HR, and operations tasks",
    "Design and deploy private/local AI copilots",
    "Build lightweight MVPs and test automation ideas quickly",
    "Debug, audit, or scale broken AI systems"
  ];

  const goodForItems = [
    "Startups, SMEs, or enterprise teams",
    "Ops, support, marketing, HR, product"
  ];

  const accentColor = 'var(--accent-color)'; // Orange

  return (
    <section className="py-16 md:py-24 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">AI Consulting</h2>
        <p className="text-lg md:text-xl text-center max-w-3xl mx-auto mb-12">
          Hands-on help for companies that want to use AI to cut costs, save time, and improve accuracy.
        </p>

        <div className="grid md:grid-cols-2 gap-10 mb-12">
          <div className="p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4" style={{ color: accentColor }}>What I help with:</h3>
            <ul className="space-y-3">
              {helpItems.map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle size={20} className="text-green-500 mr-3 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4" style={{ color: accentColor }}>Good for:</h3>
            <ul className="space-y-3">
              {goodForItems.map((item, index) => (
                <li key={index} className="flex items-start">
                  <Users size={20} className="mr-3 mt-0.5 shrink-0" style={{ color: accentColor }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/contact" 
            className="inline-flex items-center justify-center font-semibold py-3 px-8 rounded-lg text-md md:text-lg transition-transform duration-300 ease-in-out hover:scale-105"
          >
             Request a Custom Quote <DollarSign size={20} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};