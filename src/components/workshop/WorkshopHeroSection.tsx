import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Users, ArrowRight } from 'lucide-react';

export function WorkshopHeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-6xl mx-auto text-center">
          
          {/* Main Content */}
          <div className={`space-y-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            
            {/* Heading */}
            <div className={`space-y-6 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                 style={{ animationDelay: '0.1s' }}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light leading-tight tracking-tight">
                AI Workshops for{' '}
                <span className="font-medium text-orange-500">Your Team</span>
              </h1>
              
              <div className="w-24 h-px bg-orange-500 mx-auto" />
              
              <p className="text-xl sm:text-2xl lg:text-3xl max-w-4xl mx-auto leading-relaxed font-light">
                6-hour hands-on training that teaches your team to build real AI solutions—not just use ChatGPT.
              </p>
            </div>

            {/* Workshop Details */}
            <div className={`grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                 style={{ animationDelay: '0.3s' }}>
              <div className="text-center">
                <Calendar size={32} className="text-orange-500 mx-auto mb-4" />
                <div className="text-lg font-medium mb-2">
                  Duration
                </div>
                <div className="text-sm">
                  6 hours total<br />3h theory + 3h hands-on
                </div>
              </div>

              <div className="text-center">
                <Users size={32} className="text-orange-500 mx-auto mb-4" />
                <div className="text-lg font-medium mb-2">
                  Format
                </div>
                <div className="text-sm">
                  Remote or On-site<br />Norway + Europe
                </div>
              </div>

              <div className="text-center">
                <Clock size={32} className="text-orange-500 mx-auto mb-4" />
                <div className="text-lg font-medium mb-2">
                  Status
                </div>
                <div className="text-sm">
                  Coming Soon<br />Join waitlist
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className={`flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-16
              ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                 style={{ animationDelay: '0.5s' }}>
              <a 
                href="/#waitlist" 
                className="group relative px-10 py-5 rounded-xl font-bold text-lg 
                  transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Join the Waitlist
                  <ArrowRight size={18} className="transition-transform duration-300 
                    group-hover:translate-x-1" />
                </span>
              </a>

              <Link
                to="/contact"
                className="group relative px-10 py-5 rounded-xl font-bold text-lg 
                  transition-all duration-300 transform hover:scale-105 hover:shadow-xl border"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Book Consultation
                  <ArrowRight size={18} className="transition-transform duration-300 
                    group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};