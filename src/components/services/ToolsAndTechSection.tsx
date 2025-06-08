import { Code, Database, Cloud, Cpu, Zap } from 'lucide-react'; 

export function ToolsAndTechSection() {
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
  const accentColor = 'var(--accent-color)'; // Orange

  return (
    <section className="py-16 md:py-24 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Tools & Tech I Use</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8 text-center">
          {tools.map((tool, index) => (
            <div key={index} className="p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-lg">
              <tool.icon size={32} className="mb-3" style={{ color: accentColor }} />
              <p className="text-sm font-medium">{tool.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};