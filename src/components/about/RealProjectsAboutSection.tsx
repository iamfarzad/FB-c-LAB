
import React from 'react';
import { Theme } from '../../../types';
import { Brain, Music, Edit3, Users, Laptop, ExternalLink } from 'lucide-react';

interface RealProjectsAboutSectionProps {
  theme: Theme;
}

const projects = [
  { name: "Talk to Eve", description: "Mental wellness AI with emotional tracking and mindmaps", icon: Brain },
  { name: "ZingZang Lab", description: "AI music app with songwriting, vocal feedback, and mixing", icon: Music },
  { name: "iWriter.ai", description: "Copywriting assistant for Norwegian SMEs", icon: Edit3 },
  { name: "Optix.io", description: "Video production job marketplace with smart matching", icon: Users },
  { name: "FarzadAI (This Site)", description: "Voice/text assistant with real-time analysis and smart responses", icon: Laptop }
];

export const RealProjectsAboutSection: React.FC<RealProjectsAboutSectionProps> = ({ theme }) => {
  return (
    <section className={`relative py-20 md:py-32 transition-colors duration-300 overflow-hidden ${
      theme === Theme.DARK ? 'bg-gray-950' : 'bg-gray-50'
    }`}>
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/5 w-72 h-72 rounded-full blur-3xl opacity-4 ${
          theme === Theme.DARK ? 'bg-orange-500' : 'bg-orange-400'
        } animate-float-slow`} />
        <div className={`absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-3 ${
          theme === Theme.DARK ? 'bg-orange-500' : 'bg-orange-400'
        } animate-float-slow-reverse`} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-orange-500/20 bg-orange-500/5 mb-8">
            <ExternalLink size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Portfolio</span>
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${
            theme === Theme.DARK ? 'text-white' : 'text-black'
          }`}>
            Real Projects I've Built
          </h2>
        </div>

        {/* Projects Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div 
              key={index} 
              className={`group relative p-8 rounded-2xl border transition-all duration-700 hover:scale-105 hover:-translate-y-3 transform-gpu ${
                theme === Theme.DARK 
                  ? 'bg-gray-900/60 border-gray-800 hover:border-orange-500/40 hover:bg-gray-900' 
                  : 'bg-white/80 border-gray-200 hover:border-orange-500/40 hover:bg-white'
              } backdrop-blur-sm`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Icon Container */}
              <div className="mb-6 relative">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${
                  theme === Theme.DARK ? 'bg-orange-500/15' : 'bg-orange-500/10'
                } group-hover:bg-orange-500/25`}>
                  <project.icon size={36} className="text-orange-500 transition-transform duration-300 group-hover:scale-110" />
                </div>
                {/* Floating accent */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-ping" />
              </div>
              
              {/* Content */}
              <div className="space-y-4">
                <h3 className={`text-xl font-bold ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                } group-hover:text-orange-500 transition-colors duration-300`}>
                  {project.name}
                </h3>
                <p className={`text-base leading-relaxed ${
                  theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {project.description}
                </p>
              </div>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-2xl" />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-slow-reverse {
          animation: float-slow-reverse 10s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};
