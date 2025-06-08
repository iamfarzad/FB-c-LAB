import { Link } from 'react-router-dom';
import { BookOpen, Wrench, Users, MapPin, PlayCircle, ArrowRight } from 'lucide-react'; 

export function AiWorkshopsSection() {
  const workshopFormat = [
    "3 hours of theory (clear, no-jargon overview of LLMs, prompt design, risk)",
    "3 hours hands-on implementation (build your own chatbot, automation, or assistant)"
  ];
  const coveredTools = ["ChatGPT (OpenAI)", "Claude (Anthropic)", "Gemini (Google)", "Microsoft Copilot / Azure AI", "LangChain, Chroma, Zapier, Make.com"];
  const levels = [
    { name: "Basic", audience: "For non-tech teams (marketing, ops, HR)" },
    { name: "Intermediate", audience: "For product, data, project leads" },
    { name: "Advanced", audience: "For developers or technical leads" }
  ];
  const delivery = ["Remote or On-site (Norway + Europe)", "Includes templates, walkthroughs, and code access"];
  const accentColor = 'var(--accent-color)';

  return (
    <section id="s2" className="py-16 md:py-24 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">AI Workshops & Team Training</h2>
        <p className="text-lg md:text-xl text-center max-w-3xl mx-auto mb-12">
          Teach your team how to use AI tools properly—and build real things.
        </p>

        <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 mb-12">
          <div className="p-6 rounded-lg shadow-md">
            <BookOpen size={28} className="mb-3" style={{ color: accentColor }} />
            <h3 className="text-xl font-semibold mb-2">Workshop Format:</h3>
            <ul className="space-y-1.5">
              {workshopFormat.map((item, index) => (
                <li key={index} className="text-sm">{item}</li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-lg shadow-md">
            <Wrench size={28} className="mb-3" style={{ color: accentColor }} /> 
            <h3 className="text-xl font-semibold mb-2">Covered Tools:</h3>
            <p className="text-sm">{coveredTools.join(', ')}</p>
          </div>
          <div className="p-6 rounded-lg shadow-md">
            <Users size={28} className="mb-3" style={{ color: accentColor }} />
            <h3 className="text-xl font-semibold mb-2">Levels:</h3>
            <ul className="space-y-1.5">
              {levels.map((level) => (
                <li key={level.name} className="text-sm">
                  <span className="font-medium">{level.name}</span> – {level.audience}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 rounded-lg shadow-md">
            <MapPin size={28} className="mb-3" style={{ color: accentColor }} />
            <h3 className="text-xl font-semibold mb-2">Delivery:</h3>
            <ul className="space-y-1.5">
              {delivery.map((item, index) => (
                <li key={index} className="text-sm">{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            to="/workshop"
            className="inline-flex items-center justify-center font-semibold py-3 px-6 rounded-lg text-md transition-transform duration-300 ease-in-out hover:scale-105 shadow-md"
          >
            Join Free Digital Preview <PlayCircle size={18} className="ml-2" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center font-semibold py-3 px-6 rounded-lg text-md transition-transform duration-300 ease-in-out hover:scale-105 shadow-md"
          >
            Request a Custom Workshop <ArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};