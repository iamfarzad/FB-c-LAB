import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Theme } from '../../../types';
import { FlickeringGrid } from '../ui/FlickeringGrid';
import { 
  ArrowRight, 
  ArrowDown,
  CheckCircle, 
  Users, 
  DollarSign,
  Clock,
  Wrench,
  MapPin,
  MessageCircle,
  Code,
  Database,
  Cloud,
  Cpu,
  Zap,
  BarChart2,
  FileText,
  Settings,
  LifeBuoy
} from 'lucide-react';

interface ServicesPageContentProps {
  theme: Theme;
  onToggleChat: (message?: string) => void;
}

export const ServicesPageContent: React.FC<ServicesPageContentProps> = ({ theme, onToggleChat }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // AI Consulting Section Data
  const consultingHelpItems = [
    "Build internal chatbots connected to company data",
    "Automate customer service, HR, and operations tasks",
    "Design and deploy private/local AI copilots",
    "Build lightweight MVPs and test automation ideas quickly",
    "Debug, audit, or scale broken AI systems"
  ];

  const consultingGoodForItems = [
    "Startups, SMEs, or enterprise teams",
    "Ops, support, marketing, HR, product"
  ];

  // AI Workshops Section Data
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

  // Tools & Tech Section Data
  const tools = [
    { name: "GPT-4 / 4o (OpenAI)", icon: Code },
    { name: "Claude 3.x", icon: Code },
    { name: "Google Gemini Pro 1.5", icon: Code },
    { name: "Microsoft Copilot / Azure AI Studio", icon: Cloud },
    { name: "LangChain, ChromaDB, Supabase, Redis, Postgres", icon: Database },
    { name: "Next.js, Tailwind, Vercel", icon: Code },
    { name: "LM Studio, AnythingLLM, Ollama (local AI)", icon: Cpu },
    { name: "Zapier, Make.com, browser extensions", icon: Zap }
  ];

  // Delivery Process Section Data
  const processSteps = [
    { 
      id: 1, 
      title: "Free Consultation", 
      description: "We start with a free consultation to understand your needs and identify a high-impact use case.",
      icon: MessageCircle
    },
    { 
      id: 2, 
      title: "Proposal & Scope", 
      description: "I'll provide a clear proposal detailing the project scope, recommended tools, timeline, and transparent pricing.",
      icon: FileText
    },
    { 
      id: 3, 
      title: "Build & Deliver / Train", 
      description: "I'll either build, test, and deliver the solution, or train your team to implement it effectively.",
      icon: Settings
    },
    { 
      id: 4, 
      title: "Support & Follow-Up", 
      description: "Optional follow-up support and ongoing assistance are available to ensure long-term success and adaptation.",
      icon: LifeBuoy
    }
  ];

  // Client Outcomes Section Data
  const outcomes = [
    { text: "Response time dropped 65% with a simple chatbot built on internal docs.", icon: Clock },
    { text: "AI-generated reports that save us 3 hours a week, every week.", icon: BarChart2 },
    { text: "Finally understood what AI can (and can't) do after the first session.", icon: CheckCircle }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section 
        className={`relative py-24 md:py-32 text-center transition-colors duration-300 overflow-hidden
          ${theme === Theme.DARK ? 'bg-black' : 'bg-white'}`}
      >
        <div className="absolute inset-0">
          <FlickeringGrid
            className="absolute inset-0 z-0"
            squareSize={2}
            gridGap={16}
            maxOpacity={0.06}
            flickerChance={0.008}
            width={1920}
            height={1080}
            theme={theme === Theme.DARK ? 'dark' : 'light'}
            blur={1.5}
          />
          
          <div 
            className="absolute inset-0 z-10"
            style={{
              background: theme === Theme.DARK 
                ? 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.9) 80%)' 
                : 'radial-gradient(circle at center, transparent 20%, rgba(255,255,255,0.9) 80%)'
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-4xl mx-auto">
            <div className={`space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              <h1 className={`text-4xl sm:text-5xl md:text-6xl font-light mb-6 tracking-tight
                ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}>
                Practical AI Services That <span className="font-medium">Deliver Results</span>
              </h1>
              
              <div className="w-24 h-px bg-orange-500 mx-auto" />
              
              <p className={`text-lg md:text-xl max-w-3xl mx-auto mb-10 font-light leading-relaxed ${
                theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Whether you need automation, a custom chatbot, or internal AI copilots, I help you build what actually works—no fluff, no theory.
              </p>

              <Link
                to="/contact"
                className={`group inline-flex items-center gap-3 px-8 py-4 border-2 font-medium text-lg
                  transition-all duration-200 hover:scale-[1.02]
                  ${theme === Theme.DARK 
                    ? 'border-white text-white hover:bg-white hover:text-black' 
                    : 'border-black text-black hover:bg-black hover:text-white'}`}
              >
                Book a Free Consultation
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Scroll indicator */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 bottom-8
              ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                 style={{ animationDelay: '0.6s' }}>
              <div className={`flex flex-col items-center space-y-2 opacity-40 hover:opacity-100 transition-opacity cursor-pointer
                ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}
                onClick={() => {
                  const element = document.getElementById('consulting-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="text-xs font-medium tracking-wider uppercase">Explore Services</span>
                <ArrowDown size={16} className="animate-bounce" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className={`relative transition-all duration-700 overflow-hidden
        ${theme === Theme.DARK ? 'bg-black' : 'bg-white'}`}>
        
        <div className="absolute inset-0">
          <FlickeringGrid
            className="absolute inset-0 z-0"
            squareSize={2}
            gridGap={20}
            maxOpacity={0.04}
            flickerChance={0.005}
            width={1920}
            height={1080}
            theme={theme === Theme.DARK ? 'dark' : 'light'}
            blur={2}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10 space-y-32 py-24">
          
          {/* AI Consulting Section */}
          <section id="consulting-section" className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-light mb-6 tracking-tight ${
                theme === Theme.DARK ? 'text-white' : 'text-black'
              }`}>
                AI Consulting
              </h2>
              <div className="w-16 h-px bg-orange-500 mx-auto mb-6" />
              <p className={`text-lg font-light max-w-3xl mx-auto ${
                theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Hands-on help for companies that want to use AI to cut costs, save time, and improve accuracy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 mb-12">
              <div className={`p-8 border transition-all duration-300
                ${theme === Theme.DARK 
                  ? 'border-white/10 bg-black/20' 
                  : 'border-black/10 bg-white/20'
                } backdrop-blur-xl`}>
                <h3 className={`text-xl font-medium mb-6 ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                }`}>
                  What I help with:
                </h3>
                <ul className="space-y-4">
                  {consultingHelpItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-2 mr-3" />
                      <span className={`font-light ${
                        theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                      }`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`p-8 border transition-all duration-300
                ${theme === Theme.DARK 
                  ? 'border-white/10 bg-black/20' 
                  : 'border-black/10 bg-white/20'
                } backdrop-blur-xl`}>
                <h3 className={`text-xl font-medium mb-6 ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                }`}>
                  Good for:
                </h3>
                <ul className="space-y-4">
                  {consultingGoodForItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-2 mr-3" />
                      <span className={`font-light ${
                        theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                      }`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/contact" 
                className={`group inline-flex items-center gap-3 px-8 py-4 border-2 font-medium text-lg
                  transition-all duration-200 hover:scale-[1.02]
                  ${theme === Theme.DARK 
                    ? 'border-white text-white hover:bg-white hover:text-black' 
                    : 'border-black text-black hover:bg-black hover:text-white'}`}
              >
                Request a Custom Quote
                <DollarSign size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </section>

          {/* AI Workshops Section */}
          <section id="workshops-section" className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-light mb-6 tracking-tight ${
                theme === Theme.DARK ? 'text-white' : 'text-black'
              }`}>
                AI Workshops & Team Training
              </h2>
              <div className="w-16 h-px bg-orange-500 mx-auto mb-6" />
              <p className={`text-lg font-light max-w-3xl mx-auto ${
                theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Teach your team how to use AI tools properly—and build real things.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-x-10 gap-y-8 mb-12">
              <div className={`p-8 border transition-all duration-300
                ${theme === Theme.DARK 
                  ? 'border-white/10 bg-black/20' 
                  : 'border-black/10 bg-white/20'
                } backdrop-blur-xl`}>
                <h3 className={`text-xl font-medium mb-6 ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                }`}>
                  Workshop Format:
                </h3>
                <ul className="space-y-4">
                  {workshopFormat.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-2 mr-3" />
                      <span className={`font-light ${
                        theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                      }`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`p-8 border transition-all duration-300
                ${theme === Theme.DARK 
                  ? 'border-white/10 bg-black/20' 
                  : 'border-black/10 bg-white/20'
                } backdrop-blur-xl`}>
                <h3 className={`text-xl font-medium mb-6 ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                }`}>
                  Covered Tools:
                </h3>
                <p className={`font-light ${
                  theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {coveredTools.join(', ')}
                </p>
              </div>
              <div className={`p-8 border transition-all duration-300
                ${theme === Theme.DARK 
                  ? 'border-white/10 bg-black/20' 
                  : 'border-black/10 bg-white/20'
                } backdrop-blur-xl`}>
                <h3 className={`text-xl font-medium mb-6 ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                }`}>
                  Levels:
                </h3>
                <ul className="space-y-4">
                  {levels.map((level) => (
                    <li key={level.name} className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-2 mr-3" />
                      <span className={`font-light ${
                        theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        <span className="font-medium">{level.name}</span> – {level.audience}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`p-8 border transition-all duration-300
                ${theme === Theme.DARK 
                  ? 'border-white/10 bg-black/20' 
                  : 'border-black/10 bg-white/20'
                } backdrop-blur-xl`}>
                <h3 className={`text-xl font-medium mb-6 ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                }`}>
                  Delivery:
                </h3>
                <ul className="space-y-4">
                  {delivery.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-2 mr-3" />
                      <span className={`font-light ${
                        theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                      }`}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/workshop"
                className={`group inline-flex items-center gap-3 px-8 py-4 border-2 font-medium text-lg
                  transition-all duration-200 hover:scale-[1.02]
                  ${theme === Theme.DARK 
                    ? 'border-white text-white hover:bg-white hover:text-black' 
                    : 'border-black text-black hover:bg-black hover:text-white'}`}
              >
                Join Free Digital Preview
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contact"
                className={`group inline-flex items-center gap-3 px-8 py-4 font-medium text-lg
                  transition-all duration-200 hover:scale-[1.02]
                  ${theme === Theme.DARK 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-black'}`}
              >
                Request a Custom Workshop
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </section>

          {/* Tools & Tech Section */}
          <section id="tools-section" className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-light mb-6 tracking-tight ${
                theme === Theme.DARK ? 'text-white' : 'text-black'
              }`}>
                Tools & Technologies
              </h2>
              <div className="w-16 h-px bg-orange-500 mx-auto mb-6" />
              <p className={`text-lg font-light max-w-3xl mx-auto ${
                theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Modern AI tools and frameworks I use to build effective solutions.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
              {tools.map((tool, index) => (
                <div key={index} className={`p-6 border transition-all duration-300 hover:scale-[1.02]
                  ${theme === Theme.DARK 
                    ? 'border-white/10 hover:border-white/20 bg-black/20' 
                    : 'border-black/10 hover:border-black/20 bg-white/20'
                  } backdrop-blur-xl`}>
                  <div className="flex flex-col items-center text-center">
                    <tool.icon size={24} className="text-orange-500 mb-4" />
                    <p className={`text-sm font-medium ${
                      theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                    }`}>{tool.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Delivery Process Section */}
          <section id="process-section" className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-light mb-6 tracking-tight ${
                theme === Theme.DARK ? 'text-white' : 'text-black'
              }`}>
                My Delivery Process
              </h2>
              <div className="w-16 h-px bg-orange-500 mx-auto mb-6" />
              <p className={`text-lg font-light max-w-3xl mx-auto ${
                theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
              }`}>
                A clear, transparent approach from consultation to implementation.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              {processSteps.map((step, index) => (
                <div key={step.id} className="flex items-start mb-12">
                  <div className="flex-shrink-0 w-12 h-12 border border-orange-500 rounded-full flex items-center justify-center text-xl font-light mr-6">
                    <span className={theme === Theme.DARK ? 'text-white' : 'text-black'}>
                      {step.id}
                    </span>
                  </div>
                  <div className={`p-6 border flex-grow
                    ${theme === Theme.DARK 
                      ? 'border-white/10 bg-black/20' 
                      : 'border-black/10 bg-white/20'
                    } backdrop-blur-xl`}>
                    <div className="flex items-center mb-2">
                      <step.icon size={20} className="text-orange-500 mr-3" />
                      <h3 className={`text-xl font-medium ${
                        theme === Theme.DARK ? 'text-white' : 'text-black'
                      }`}>{step.title}</h3>
                    </div>
                    <p className={`text-base font-light ${
                      theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
                    }`}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Client Outcomes Section */}
          <section id="outcomes-section" className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-light mb-6 tracking-tight ${
                theme === Theme.DARK ? 'text-white' : 'text-black'
              }`}>
                Client Outcomes
              </h2>
              <div className="w-16 h-px bg-orange-500 mx-auto mb-6" />
              <p className={`text-lg font-light max-w-3xl mx-auto ${
                theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Real results from businesses implementing AI solutions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {outcomes.map((outcome, index) => (
                <div key={index} className={`p-8 border transition-all duration-300 hover:scale-[1.02]
                  ${theme === Theme.DARK 
                    ? 'border-white/10 hover:border-white/20 bg-black/20' 
                    : 'border-black/10 hover:border-black/20 bg-white/20'
                  } backdrop-blur-xl`}>
                  <div className="flex flex-col items-center text-center">
                    <outcome.icon size={24} className="text-orange-500 mb-6" />
                    <p className={`text-lg font-light ${
                      theme === Theme.DARK ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      "{outcome.text}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA Section */}
          <section id="cta-section" className="max-w-3xl mx-auto text-center">
            <h2 className={`text-4xl md:text-5xl font-light mb-8 tracking-tight
              ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}>
              Let's scope your use case and get to work
            </h2>

            <div className="w-16 h-px bg-orange-500 mx-auto mb-8" />

            <p className={`text-lg md:text-xl mb-16 font-light leading-relaxed ${
              theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Identify a quick win, create a practical roadmap, and implement AI that delivers real results.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link
                to="/contact"
                className={`group inline-flex items-center gap-3 px-8 py-4 border-2 font-medium text-lg
                  transition-all duration-200 hover:scale-[1.02]
                  ${theme === Theme.DARK 
                    ? 'border-white text-white hover:bg-white hover:text-black' 
                    : 'border-black text-black hover:bg-black hover:text-white'}`}
              >
                Book a Free Consultation
                <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <button
                onClick={() => onToggleChat()}
                className={`group inline-flex items-center gap-3 px-8 py-4 font-medium text-lg
                  transition-all duration-200 hover:scale-[1.02]
                  ${theme === Theme.DARK 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-black'}`}
              >
                <MessageCircle size={18} />
                Try My AI Assistant Now
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
