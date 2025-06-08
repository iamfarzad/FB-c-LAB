import React, { useState, useEffect } from 'react';
import { Theme } from '@/types';
import { 
  ArrowRight, 
  CheckCircle, 
  Code, 
  Star, 
  Brain,
  Music,
  Edit3,
  Laptop,
  Zap,
  Bot,
  Database,
  Layers,
  Settings,
  FlaskConical,
  Check,
} from 'lucide-react';

interface UnifiedAboutContentProps {
  theme: Theme;
  onReadFullStory: () => void;
}

export const UnifiedAboutContent: React.FC<UnifiedAboutContentProps> = ({ theme, onReadFullStory }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeCapabilityFilter, setActiveCapabilityFilter] = useState<'all' | 'standard' | 'experimental'>('all');

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    const element = document.getElementById('unified-about-content');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  // My Story & How I Work
  const storyHighlights = [
    "Started AI journey in 2020 with no coding background",
    "Self-taught through 10,000+ hours of hands-on learning", 
    "Built real systems handling millions of requests",
    "Focus on practical business solutions, not academic theory"
  ];

  const workPrinciples = [
    { title: "No theoretical fluff", description: "Battle-tested solutions from real-world experience" },
    { title: "Business-first approach", description: "Every implementation designed for measurable ROI" },
    { title: "End-to-end delivery", description: "Complete journey from strategy to deployment" },
    { title: "Transparent process", description: "Clear communication and realistic expectations" }
  ];

  // Skills & Projects
  const skills = [
    { name: "AI Automation & Workflows", icon: Zap },
    { name: "Conversational AI", icon: Bot },
    { name: "Vector DBs & Search", icon: Database },
    { name: "LangChain & Next.js", icon: Layers },
    { name: "MVP Building", icon: Code },
    { name: "Private LLM Setup", icon: Settings }
  ];

  const projects = [
    { name: "Talk to Eve", description: "Mental wellness AI with emotional tracking", icon: Brain },
    { name: "ZingZang Lab", description: "AI music app with songwriting tools", icon: Music },
    { name: "iWriter.ai", description: "Copywriting assistant for Norwegian SMEs", icon: Edit3 },
    { name: "FarzadAI", description: "This site - voice/text AI assistant", icon: Laptop }
  ];

  // Timeline & Capabilities
  const timelineEvents = [
    { year: "2020", title: "Started AI Journey", description: "Began learning with no coding background" },
    { year: "2021", title: "Self-Taught Development", description: "Built first working prototypes" },
    { year: "2022", title: "Real Projects", description: "Launched Talk to Eve and ZingZang Lab" },
    { year: "2023", title: "Business Focus", description: "Built iWriter.ai and Optix.io marketplace" },
    { year: "2024", title: "AI Consulting", description: "Launched FarzadAI consultancy" }
  ];

  const capabilities = [
    { name: "Text generation", experimental: false },
    { name: "Image generation", experimental: false },
    { name: "Video generation", experimental: false },
    { name: "Speech generation", experimental: true },
    { name: "Long context", experimental: false },
    { name: "Function calling", experimental: false },
    { name: "Document understanding", experimental: false },
    { name: "Code execution", experimental: false },
    { name: "URL context", experimental: true },
    { name: "Grounding with Search", experimental: false }
  ];

  const filteredCapabilities = capabilities.filter(capability => {
    if (activeCapabilityFilter === 'all') return true;
    if (activeCapabilityFilter === 'standard') return !capability.experimental;
    if (activeCapabilityFilter === 'experimental') return capability.experimental;
    return true;
  });

  // Testimonials
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager, TechCorp", 
      content: "Farzad delivered exactly what we needed - a working AI system that solved our bottleneck.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "CEO, StartupXYZ",
      content: "Finally, someone who builds AI that works in the real world. Saved us months of development.",
      rating: 5
    }
  ];

  return (
    <section 
      id="unified-about-content"
      className={`relative py-24 lg:py-32 transition-all duration-700 overflow-hidden`}
    >
      <div className="container mx-auto px-6 relative z-10 space-y-32">
        
        {/* My Story & How I Work - Combined */}
        <div className={`max-w-6xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight`}>
              My story & approach
            </h2>
            <div className="w-16 h-px bg-orange-500 mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Story highlights */}
            <div>
              <h3 className={`text-2xl font-medium mb-8`}>
                The journey
              </h3>
              <div className="space-y-6">
                {storyHighlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-2" />
                    <p className={`text-base font-light`}>
                      {highlight}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={onReadFullStory}
                className={`mt-8 inline-flex items-center gap-2 text-sm font-medium transition-colors`}
              >
                Read full story
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Work principles */}
            <div>
              <h3 className={`text-2xl font-medium mb-8`}>
                How I work
              </h3>
              <div className="space-y-6">
                {workPrinciples.map((principle, index) => (
                  <div key={index} className={`p-4 border transition-all duration-300 hover:scale-[1.02]
                    ${theme === Theme.DARK 
                      ? 'border-white/10 hover:border-white/20' 
                      : 'border-black/10 hover:border-black/20'
                    } backdrop-blur-xl`}>
                    <div className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className={`font-medium mb-1`}>
                          {principle.title}
                        </h4>
                        <p className={`text-sm font-light`}>
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Projects - Combined */}
        <div className={`max-w-6xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
             style={{ animationDelay: '0.2s' }}>
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight`}>
              Skills & projects
            </h2>
            <div className="w-16 h-px bg-orange-500 mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Skills */}
            <div>
              <h3 className={`text-2xl font-medium mb-8`}>
                Technical expertise
              </h3>
              <div className="grid gap-4">
                {skills.map((skill, index) => (
                  <div key={index} className={`flex items-center gap-4 p-4 border transition-all duration-300 hover:scale-[1.02]
                    ${theme === Theme.DARK 
                      ? 'border-white/10 hover:border-white/20' 
                      : 'border-black/10 hover:border-black/20'
                    } backdrop-blur-xl`}>
                    <skill.icon size={20} className="text-orange-500" />
                    <span className={`font-medium`}>
                      {skill.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div>
              <h3 className={`text-2xl font-medium mb-8`}>
                Real projects built
              </h3>
              <div className="space-y-6">
                {projects.map((project, index) => (
                  <div key={index} className={`p-6 border transition-all duration-300 hover:scale-[1.02]
                    ${theme === Theme.DARK 
                      ? 'border-white/10 hover:border-white/20' 
                      : 'border-black/10 hover:border-black/20'
                    } backdrop-blur-xl`}>
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        theme === Theme.DARK ? 'bg-orange-500/10' : 'bg-orange-500/5'
                      }`}>
                        <project.icon size={24} className="text-orange-500" />
                      </div>
                      <div>
                        <h4 className={`font-medium mb-2`}>
                          {project.name}
                        </h4>
                        <p className={`text-sm font-light`}>
                          {project.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline & Capabilities - Combined */}
        <div className={`max-w-6xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
             style={{ animationDelay: '0.4s' }}>
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight`}>
              Timeline & capabilities
            </h2>
            <div className="w-16 h-px bg-orange-500 mx-auto" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Timeline */}
            <div>
              <h3 className={`text-2xl font-medium mb-8`}>
                My journey
              </h3>
              <div className="space-y-6">
                {timelineEvents.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-medium">
                        {event.year.slice(-2)}
                      </div>
                      {index < timelineEvents.length - 1 && (
                        <div className={`w-px h-12 mt-2 ${
                          theme === Theme.DARK ? 'bg-white/10' : 'bg-black/10'
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h4 className={`font-medium mb-1`}>
                        {event.title}
                      </h4>
                      <p className={`text-sm font-light`}>
                        {event.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <h3 className={`text-2xl font-medium mb-8`}>
                AI capabilities
              </h3>
              
              {/* Filter */}
              <div className={`inline-flex rounded-lg p-1 mb-6`}>
                {(['all', 'standard', 'experimental'] as const).map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setActiveCapabilityFilter(filter)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
                      activeCapabilityFilter === filter 
                        ? 'bg-orange-500 text-white' 
                        : theme === Theme.DARK 
                          ? 'text-gray-400 hover:text-gray-200' 
                          : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              <div className="grid gap-3">
                {filteredCapabilities.map((capability, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 border transition-all duration-300
                    ${theme === Theme.DARK 
                      ? 'border-white/10 hover:border-white/20' 
                      : 'border-black/10 hover:border-black/20'
                    } backdrop-blur-xl`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        capability.experimental ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                      <span className={`text-sm font-medium`}>
                        {capability.name}
                      </span>
                    </div>
                    {capability.experimental ? (
                      <FlaskConical size={16} className="text-orange-500" />
                    ) : (
                      <Check size={16} className="text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials - Simplified */}
        <div className={`max-w-4xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
             style={{ animationDelay: '0.6s' }}>
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl lg:text-6xl font-light mb-6 tracking-tight`}>
              Client feedback
            </h2>
            <div className="w-16 h-px bg-orange-500 mx-auto" />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className={`p-6 border transition-all duration-300 hover:scale-[1.02]
                ${theme === Theme.DARK 
                  ? 'border-white/10 hover:border-white/20' 
                  : 'border-black/10 hover:border-black/20'
                } backdrop-blur-xl`}>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={14} className="text-orange-500 fill-current" />
                  ))}
                </div>
                <blockquote className={`text-base font-light mb-4`}>
                  "{testimonial.content}"
                </blockquote>
                <div>
                  <div className={`font-medium`}>
                    {testimonial.name}
                  </div>
                  <div className={`text-sm`}>
                    {testimonial.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
