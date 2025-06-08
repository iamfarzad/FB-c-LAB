import { MessageSquare, Mail, Calendar, MapPin } from 'lucide-react';

interface ContactPageProps {
  onToggleChat: (message?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onToggleChat }) => {
  const contactMethods = [
    {
      icon: MessageSquare,
      title: "AI Assistant Chat",
      description: "Get instant answers about AI consulting and services",
      action: "Start Chat",
      onClick: () => onToggleChat("I'd like to discuss AI consulting services")
    },
    {
      icon: Mail,
      title: "Email",
      description: "Send detailed inquiries and project requirements",
      action: "hello@farzadai.com",
      onClick: () => window.open('mailto:hello@farzadai.com')
    },
    {
      icon: Calendar,
      title: "Book a Call",
      description: "Schedule a free 15-minute strategy session",
      action: "Schedule Now",
      onClick: () => window.open('https://calendly.com/farzadai', '_blank')
    },
    {
      icon: MapPin,
      title: "Location",
      description: "Remote consultations worldwide, based in Norway",
      action: "Oslo, Norway",
      onClick: () => {}
    }
  ];

  return (
    <div className="min-h-screen relative transition-colors duration-300">
      
      {/* Content */}
      <div className="relative z-10">
        <div className="py-24">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-6xl font-light mb-6">
                Let's Build Something
                <span className="block text-gradient font-medium">Amazing Together</span>
              </h1>
              <p className="text-xl max-w-2xl mx-auto">
                Ready to transform your business with AI? Choose the best way to connect and let's start the conversation.
              </p>
            </div>

            {/* Contact Methods Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {contactMethods.map((method, index) => (
                <div
                  key={method.title}
                  onClick={method.onClick}
                  className="card-enhanced p-8 cursor-pointer hover-lift group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-lg bg-orange-500/10">
                      <method.icon size={24} className="text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-medium mb-2">
                        {method.title}
                      </h3>
                      <p className="text-sm mb-4">
                        {method.description}
                      </p>
                      <span className="text-orange-500 font-medium group-hover:underline">
                        {method.action}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Response Promise */}
            <div className="text-center p-8 rounded-lg border">
              <h3 className="text-lg font-medium mb-2">
                Quick Response Guarantee
              </h3>
              <p>
                I respond to all inquiries within 24 hours. For urgent matters, use the AI chat for immediate assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};