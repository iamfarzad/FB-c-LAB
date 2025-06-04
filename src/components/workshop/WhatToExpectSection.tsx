
import React from 'react';
import { Theme } from '../../../types';
import { Lightbulb, CheckCircle, BookOpen, Wrench, Users, MapPin } from 'lucide-react';

interface WhatToExpectSectionProps {
  theme: Theme;
}

export const WhatToExpectSection: React.FC<WhatToExpectSectionProps> = ({ theme }) => {
  const workshopFormatDetails = [
    "3 hours theory: What LLMs are, how they work, risks, limitations, and architecture basics.",
    "3 hours hands-on: Build a chatbot, automate a task, or create your own internal assistant using tools like ChatGPT, Claude, Gemini, and LangChain."
  ];

  const toolsCovered = [
    "ChatGPT / OpenAI", "Claude / Anthropic", "Google Gemini", 
    "Microsoft Copilot", "LangChain, Chroma, Supabase, Zapier"
  ];

  const deliveryOptions = [
    "On-site (Norway + Europe)", 
    "Remote (Global)", 
    "Includes templates, walkthroughs, sample prompts, and optional follow-up support"
  ];
  const accentColor = 'var(--accent-color)';

  return (
    <section className={`py-16 md:py-24 transition-colors duration-300 ${theme === Theme.DARK ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">What to Expect</h2>
          <p className={`text-lg mb-6 ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'}`}>
            These workshops are built from real-world experience—not theory. Every session is designed to give your team a working understanding of AI and the ability to build practical tools by the end of the day.
          </p>
          <p className={`text-lg mb-10 ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'}`}>
            Most AI tools fail in companies not because the technology is bad—but because the team doesn't understand how they work. These workshops start from the ground up:
          </p>
          <ul className={`space-y-3 mb-10 text-lg ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start">
              <CheckCircle size={24} className="text-green-500 mr-3 mt-1 shrink-0" />
              No prior coding or AI experience required
            </li>
            <li className="flex items-start">
              <CheckCircle size={24} className="text-green-500 mr-3 mt-1 shrink-0" />
              Clear explanations of how prompts, tokens, context windows, and APIs actually function
            </li>
            <li className="flex items-start">
              <CheckCircle size={24} className="text-green-500 mr-3 mt-1 shrink-0" />
              You’ll leave knowing how to troubleshoot basic AI issues on your own
            </li>
          </ul>
          <p className={`text-lg font-semibold mb-12 text-center italic ${theme === Theme.DARK ? 'text-orange-400' : 'text-orange-600'}`}>
            If you don't understand the core terms, debugging an AI problem is a nightmare. This training removes that barrier.
          </p>

          <div className="grid md:grid-cols-1 gap-8">
            <div className={`p-6 rounded-lg shadow-lg ${theme === Theme.DARK ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center mb-4">
                <BookOpen size={28} className="mr-3" style={{color: accentColor}} />
                <h3 className="text-2xl font-semibold">Workshop Format</h3>
              </div>
              <ul className="space-y-2">
                {workshopFormatDetails.map((item, index) => (
                  <li key={index} className={`flex items-start ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'}`}>
                    <Lightbulb size={20} className={`mr-2 mt-1 shrink-0 ${theme === Theme.DARK ? 'text-yellow-400' : 'text-yellow-500'}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={`p-6 rounded-lg shadow-lg ${theme === Theme.DARK ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center mb-4">
                <Wrench size={28} className="mr-3" style={{color: accentColor}} />
                <h3 className="text-2xl font-semibold">Tools Covered</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {toolsCovered.map((tool, index) => (
                  <span key={index} className={`px-3 py-1 rounded-full text-sm font-medium ${theme === Theme.DARK ? 'bg-gray-700 text-orange-300' : 'bg-orange-100 text-orange-700'}`}>
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            <div className={`p-6 rounded-lg shadow-lg ${theme === Theme.DARK ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center mb-4">
                <MapPin size={28} className="mr-3" style={{color: accentColor}} />
                <h3 className="text-2xl font-semibold">Delivery Options</h3>
              </div>
              <ul className="space-y-2">
                {deliveryOptions.map((item, index) => (
                  <li key={index} className={`flex items-start ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'}`}>
                    <CheckCircle size={20} className="text-green-500 mr-2 mt-1 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};