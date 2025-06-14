import { BarChart2, Clock, Zap } from 'lucide-react';

export function ClientOutcomesSection() {
  const outcomes = [
    { text: "Response time dropped 65% with a simple chatbot built on internal docs.", icon: Clock },
    { text: "AI-generated reports that save us 3 hours a week, every week.", icon: BarChart2 },
    { text: "Finally understood what AI can (and can't) do after the first session.", icon: Zap }
  ];
  const accentColor = 'var(--accent-color)'; // Orange

  return (
    <section className="py-16 md:py-24 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Client Outcomes</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {outcomes.map((outcome, index) => (
            <div key={index} className="p-8 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col items-center text-center border border-gray-200">
              <outcome.icon className="w-12 h-12 mb-6" style={{color: accentColor}} />
              <p className="text-lg font-medium">
                "{outcome.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};