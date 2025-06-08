import React, { useState } from 'react';
import { Theme } from '@/types';
import { FlaskConical, Check, Zap } from 'lucide-react';
import styles from './ModelCapabilitiesSection.module.css';

interface ModelCapabilitiesSectionProps {
  theme: Theme;
}

const capabilities = [
  { name: "Text generation", experimental: false },
  { name: "Image generation", experimental: false },
  { name: "Video generation", experimental: false },
  { name: "Speech generation", experimental: true },
  { name: "Music generation", experimental: true },
  { name: "Long context", experimental: false },
  { name: "Structured output", experimental: false },
  { name: "Thinking", experimental: false },
  { name: "Function calling", experimental: false },
  { name: "Document understanding", experimental: false },
  { name: "Image understanding", experimental: false },
  { name: "Video understanding", experimental: false },
  { name: "Audio understanding", experimental: false },
  { name: "Code execution", experimental: false },
  { name: "URL context", experimental: true },
  { name: "Grounding with Google Search", experimental: false },
];

type FilterType = 'all' | 'standard' | 'experimental';

export const ModelCapabilitiesSection: React.FC<ModelCapabilitiesSectionProps> = ({ theme }) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filteredCapabilities = capabilities.filter(capability => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'standard') return !capability.experimental;
    if (activeFilter === 'experimental') return capability.experimental;
    return true;
  });

  const isDark = theme === Theme.DARK;
  
  return (
    <section className={`relative py-20 md:py-32 transition-colors duration-500 overflow-hidden ${
      isDark ? 'bg-gray-950' : 'bg-white'
    }`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle grid pattern */}
        <div className={`absolute inset-0 opacity-[0.02] ${
          isDark ? 'bg-white' : 'bg-black'
        }`} 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        
        {/* Animated gradient orbs */}
        <div className={`absolute top-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-5 ${
          isDark ? 'bg-orange-500' : 'bg-orange-400'
        } ${styles['animate-float-slow']}`} />
        <div className={`absolute bottom-1/3 left-1/5 w-80 h-80 rounded-full blur-3xl opacity-3 ${
          isDark ? 'bg-orange-500' : 'bg-orange-400'
        } ${styles['animate-float-slow-reverse']}`} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Enhanced Header */}
        <div className={`text-center mb-16 ${styles['animate-fade-in']}`}>
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-orange-500/20 bg-orange-500/5 mb-8">
            <Zap size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-orange-500">AI Features</span>
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            Model Capabilities
          </h2>
          <p className={`text-xl max-w-2xl mx-auto leading-relaxed ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Explore the full range of AI capabilities, from standard features to experimental cutting-edge technology
          </p>
        </div>

        {/* Filter Controls */}
        <div className={`max-w-3xl mx-auto mb-10 flex justify-center ${styles['animate-fade-in-up']}`}>
          <div className={`inline-flex rounded-lg p-1 ${
            isDark ? 'bg-gray-900' : 'bg-gray-100'
          }`}>
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeFilter === 'all' 
                  ? `bg-orange-500 text-white shadow-lg` 
                  : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveFilter('standard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeFilter === 'standard' 
                  ? `bg-orange-500 text-white shadow-lg` 
                  : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
              }`}
            >
              Standard
            </button>
            <button 
              onClick={() => setActiveFilter('experimental')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                activeFilter === 'experimental' 
                  ? `bg-orange-500 text-white shadow-lg` 
                  : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
              }`}
            >
              Experimental
            </button>
          </div>
        </div>

        {/* Enhanced Capabilities Grid */}
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {filteredCapabilities.map((capability, index) => (
            <div 
              key={index} 
              className={`group flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-500 
                ${isDark 
                  ? 'bg-gray-900/70 border-gray-800 hover:border-orange-500/40' 
                  : 'bg-gray-50/80 border-gray-200 hover:border-orange-500/40'
                }
                hover:scale-105 hover:-translate-y-1 transform-gpu backdrop-blur-sm ${styles['animate-fade-in-up']}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center">
                {/* Status indicator */}
                <div className={`w-2 h-2 rounded-full mr-3 transition-all duration-500 ${
                  capability.experimental 
                    ? 'bg-orange-500 animate-pulse' 
                    : `${isDark ? 'bg-green-500' : 'bg-green-500'}`
                }`} />
                
                {/* Capability name with hover effect */}
                <span className={`text-md font-medium transition-all duration-300 ${
                  isDark 
                    ? hoveredIndex === index ? 'text-white' : 'text-gray-300' 
                    : hoveredIndex === index ? 'text-black' : 'text-gray-700'
                } group-hover:translate-x-1`}>
                  {capability.name}
                </span>
              </div>
              
              {/* Indicator icon with animations */}
              {capability.experimental ? (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${
                    isDark ? 'text-orange-400' : 'text-orange-600'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    Experimental
                  </span>
                  <div className="relative">
                    <FlaskConical size={20} className="text-orange-500 transition-transform duration-300 group-hover:scale-110" />
                    {/* Animated bubbles */}
                    <div className={`absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 ${styles['animate-bubble-rise']} transition-opacity duration-300`} />
                    <div className={`absolute -top-1 right-1 w-1.5 h-1.5 bg-orange-400 rounded-full opacity-0 group-hover:opacity-100 ${styles['animate-bubble-rise-delay']} transition-opacity duration-300`} />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                    Available
                  </span>
                  <Check size={18} className={`${
                    isDark ? 'text-green-500' : 'text-green-600'
                  } transition-transform duration-300 group-hover:scale-110`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom indicator */}
        <div className={`mt-12 text-center ${styles['animate-fade-in-up']}`} style={{ animationDelay: '0.5s' }}>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-600'
          }`}>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm">
              {filteredCapabilities.filter(c => c.experimental).length} experimental features
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
