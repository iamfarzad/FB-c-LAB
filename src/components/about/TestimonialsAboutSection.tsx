import React from 'react';
import { Theme } from '@/types';
import { Star, Quote, Users } from 'lucide-react';

interface TestimonialsAboutSectionProps {
  theme: Theme;
}

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Manager, TechCorp",
    content: "Farzad delivered exactly what we needed - a working AI system that actually solved our customer service bottleneck. No fluff, just results.",
    rating: 5
  },
  {
    name: "Marcus Johnson",
    role: "CEO, StartupXYZ",
    content: "Finally, someone who builds AI that works in the real world. Farzad's practical approach saved us months of development time.",
    rating: 5
  },
  {
    name: "Elena Rodriguez",
    role: "Operations Director, ScaleUp Inc",
    content: "Farzad cut through all the AI hype and built us a system that actually improved our workflow. Highly recommend his no-nonsense approach.",
    rating: 5
  }
];

export const TestimonialsAboutSection: React.FC<TestimonialsAboutSectionProps> = ({ theme }) => {
  return (
    <section className={`relative py-20 md:py-32 transition-colors duration-300 overflow-hidden ${
      theme === Theme.DARK ? 'bg-black' : 'bg-white'
    }`}>
      {/* Subtle Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full blur-3xl opacity-3 ${
          theme === Theme.DARK ? 'bg-orange-500' : 'bg-orange-400'
        } animate-pulse-slow`} />
        <div className={`absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-4 ${
          theme === Theme.DARK ? 'bg-orange-500' : 'bg-orange-400'
        } animate-pulse-slow-reverse`} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-orange-500/20 bg-orange-500/5 mb-8">
            <Users size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-orange-500">Client Feedback</span>
          </div>
          <h2 className={`text-4xl md:text-5xl lg:text-6xl font-bold ${
            theme === Theme.DARK ? 'text-white' : 'text-black'
          }`}>
            What Clients Say
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={`group relative p-8 rounded-2xl border transition-all duration-700 hover:scale-105 hover:-translate-y-3 transform-gpu ${
                theme === Theme.DARK 
                  ? 'bg-gray-900/50 border-gray-800 hover:border-orange-500/30' 
                  : 'bg-gray-50/50 border-gray-200 hover:border-orange-500/30'
              } backdrop-blur-sm`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Quote icon */}
              <div className="mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  theme === Theme.DARK ? 'bg-orange-500/10' : 'bg-orange-500/5'
                } group-hover:bg-orange-500/20 transition-all duration-300`}>
                  <Quote size={20} className="text-orange-500" />
                </div>
              </div>
              
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} className="text-orange-500 fill-current" />
                ))}
              </div>
              
              {/* Content */}
              <blockquote className={`text-base leading-relaxed mb-6 ${
                theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'
              }`}>
                "{testimonial.content}"
              </blockquote>
              
              {/* Author */}
              <div className="space-y-1">
                <div className={`font-semibold ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                }`}>
                  {testimonial.name}
                </div>
                <div className={`text-sm ${
                  theme === Theme.DARK ? 'text-gray-500' : 'text-gray-600'
                }`}>
                  {testimonial.role}
                </div>
              </div>
              
              {/* Hover accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-t-2xl" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
