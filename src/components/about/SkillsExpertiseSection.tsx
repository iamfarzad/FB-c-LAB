
import React from 'react';
import { Theme } from '../../../types';
import { Layers, Bot, Database, GitFork, Zap, Code, Settings } from 'lucide-react'; 

interface SkillsExpertiseSectionProps {
  theme: Theme;
}

const skills = [
  { name: "AI Automation & Workflows", icon: Zap },
  { name: "Conversational AI (Chatbots / Copilots)", icon: Bot },
  { name: "Private/Local LLM Setup", icon: Settings },
  { name: "Vector DBs (Chroma, Pinecone, Redis)", icon: Database },
  { name: "Knowledge Graphs & Hybrid Search", icon: GitFork },
  { name: "LangChain, Supabase, Next.js", icon: Layers },
  { name: "MVP Building, Debugging, Dev Oversight", icon: Code }
];

export const SkillsExpertiseSection: React.FC<SkillsExpertiseSectionProps> = ({ theme }) => {
  return (
    <section className={`relative py-20 md:py-32 transition-colors duration-300 overflow-hidden ${
      theme === Theme.DARK ? 'bg-black' : 'bg-white'
    }`}>
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full blur-3xl opacity-4 ${
          theme === Theme.DARK ? 'bg-orange-500' : 'bg-orange-400'
        } animate-drift`} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-orange-500/20 bg-orange-500/5 mb-8">
            <Code size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Technical Expertise</span>
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${
            theme === Theme.DARK ? 'text-white' : 'text-black'
          }`}>
            Skills & Expertise
          </h2>
        </div>

        {/* Skills Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skill, index) => (
            <div 
              key={index} 
              className={`group relative p-8 rounded-2xl border transition-all duration-500 hover:scale-105 hover:-translate-y-2 transform-gpu ${
                theme === Theme.DARK 
                  ? 'bg-gray-900/50 border-gray-800 hover:border-orange-500/30 hover:bg-gray-900/80' 
                  : 'bg-white border-gray-200 hover:border-orange-500/30 hover:bg-gray-50'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="mb-6">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                  theme === Theme.DARK ? 'bg-orange-500/10' : 'bg-orange-500/5'
                } group-hover:bg-orange-500/20`}>
                  <skill.icon size={28} className="text-orange-500" />
                </div>
              </div>
              
              {/* Text */}
              <h3 className={`text-lg font-semibold leading-tight ${
                theme === Theme.DARK ? 'text-white' : 'text-black'
              }`}>
                {skill.name}
              </h3>
              
              {/* Hover accent */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes drift {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          33% { transform: translateX(20px) translateY(-10px); }
          66% { transform: translateX(-10px) translateY(15px); }
        }
        .animate-drift {
          animation: drift 12s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};
