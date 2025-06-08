import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { Mail, ArrowRight, Calendar, Bell } from 'lucide-react';

export function WorkshopStayUpdatedSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stay-updated');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const benefits = [
    {
      icon: Bell,
      text: "First to know when workshops launch"
    },
    {
      icon: Mail,
      text: "Free AI templates and resources"
    },
    {
      icon: Calendar,
      text: "Preview content and early access"
    }
  ];

  return (
    <section 
      id="stay-updated"
      className="py-24 md:py-32 transition-colors duration-300 relative"
    >
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Main Content */}
          <div className={`space-y-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
            
            {/* Heading */}
            <div className={`space-y-6 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                 style={{ animationDelay: '0.1s' }}>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light mb-6 tracking-tight">
                Stay <span className="font-medium text-orange-500">Updated</span>
              </h2>
              
              <div className="w-24 h-px bg-orange-500 mx-auto" />
              
              <p className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
                Workshops launch soon. Join the waitlist for exclusive access and free resources.
              </p>
            </div>

            {/* Benefits */}
            <div className={`grid md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                 style={{ animationDelay: '0.3s' }}>
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <benefit.icon size={32} className="text-orange-500 mx-auto mb-4" />
                  <p className="text-sm font-medium">
                    {benefit.text}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-16
              ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                 style={{ animationDelay: '0.5s' }}>
              <a 
                href="/#waitlist"
                className="group relative px-12 py-6 rounded-xl font-bold text-xl 
                  transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Join the Waitlist
                  <ArrowRight size={20} className="transition-transform duration-300 
                    group-hover:translate-x-1" />
                </span>
              </a>

              <Link
                to="/contact"
                className="group relative px-12 py-6 rounded-xl font-bold text-xl 
                  transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Book Consultation Instead
                  <ArrowRight size={20} className="transition-transform duration-300 
                    group-hover:translate-x-1" />
                </span>
              </Link>
            </div>

            {/* Additional Info */}
            <div className={`mt-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                 style={{ animationDelay: '0.7s' }}>
              <p className="text-sm text-gray-500">
                No spam, just valuable AI insights and workshop updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};