import React from 'react';
import { Theme } from '@/types';
import { 
  CheckCircle, 
  ArrowRight, 
  Star, 
  Target, 
  Lightbulb,
  TrendingUp,
  Shield,
  Zap,
  Brain,
} from 'lucide-react';

interface StructuredResponseCardProps {
  data: any;
  theme: Theme;
  onAction?: (action: string, data?: any) => void;
}

interface ServiceCard {
  type: 'service';
  title: string;
  description: string;
  features: string[];
  benefits: string[];
  cta?: {
    text: string;
    action: string;
  };
}

interface ConsultingCard {
  type: 'consulting';
  title: string;
  overview: string;
  services: Array<{
    name: string;
    description: string;
    icon?: string;
  }>;
  process?: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  cta?: {
    text: string;
    action: string;
  };
}

type StructuredData = ServiceCard | ConsultingCard;

const iconMap = {
  strategy: Target,
  opportunity: TrendingUp,
  feasibility: Shield,
  roadmap: ArrowRight,
  development: Brain,
  integration: Zap,
  optimization: Star,
  default: Lightbulb
};

export const StructuredResponseCard: React.FC<StructuredResponseCardProps> = ({
  data,
  theme,
  onAction
}) => {
  // Try to parse structured data, fallback to plain text
  let structuredData: StructuredData | null = null;
  
  try {
    if (typeof data === 'string') {
      // Try to extract JSON from text
      const jsonMatch = data.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        structuredData = JSON.parse(jsonMatch[1]);
      }
    } else if (typeof data === 'object') {
      structuredData = data;
    }
  } catch (error) {
    console.log('Could not parse structured data:', error);
  }

  // If no structured data, return null (let parent handle plain text)
  if (!structuredData) {
    return null;
  }

  const textColor = theme === Theme.DARK ? 'text-white' : 'text-black';
  const subtextColor = theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700';
  const mutedColor = theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600';

  const renderServiceCard = (card: ServiceCard) => (
    <div className={`p-6 rounded-lg space-y-4`}>
      <div>
        <h3 className={`text-xl font-semibold ${textColor} mb-2`}>{card.title}</h3>
        <p className={`${subtextColor} leading-relaxed`}>{card.description}</p>
      </div>

      {card.features && card.features.length > 0 && (
        <div>
          <h4 className={`text-sm font-medium ${textColor} mb-3 flex items-center`}>
            <Star size={16} className="text-orange-500 mr-2" />
            Key Features
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {card.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                <span className={`text-sm ${subtextColor}`}>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {card.benefits && card.benefits.length > 0 && (
        <div>
          <h4 className={`text-sm font-medium ${textColor} mb-3 flex items-center`}>
            <TrendingUp size={16} className="text-orange-500 mr-2" />
            Benefits
          </h4>
          <div className="space-y-2">
            {card.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-2">
                <ArrowRight size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                <span className={`text-sm ${subtextColor}`}>{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {card.cta && (
        <button
          onClick={() => onAction?.(card.cta!.action)}
          className="w-full mt-4 px-4 py-3 text-white rounded-lg transition-colors font-medium"
        >
          {card.cta.text}
        </button>
      )}
    </div>
  );

  const renderConsultingCard = (card: ConsultingCard) => (
    <div className={`p-6 rounded-lg space-y-6`}>
      <div>
        <h3 className={`text-xl font-semibold ${textColor} mb-2`}>{card.title}</h3>
        <p className={`${subtextColor} leading-relaxed`}>{card.overview}</p>
      </div>

      {card.services && card.services.length > 0 && (
        <div>
          <h4 className={`text-sm font-medium ${textColor} mb-4 flex items-center`}>
            <Brain size={16} className="text-orange-500 mr-2" />
            Our Services
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {card.services.map((service, index) => {
              const IconComponent = iconMap[service.icon as keyof typeof iconMap] || iconMap.default;
              return (
                <div key={index} className={`p-4 rounded-lg border ${
                  theme === Theme.DARK ? 'border-gray-600' : 'border-gray-300'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg">
                      <IconComponent size={16} className="text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h5 className={`font-medium ${textColor} mb-1`}>{service.name}</h5>
                      <p className={`text-sm ${mutedColor}`}>{service.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {card.process && card.process.length > 0 && (
        <div>
          <h4 className={`text-sm font-medium ${textColor} mb-4 flex items-center`}>
            <Target size={16} className="text-orange-500 mr-2" />
            Our Process
          </h4>
          <div className="space-y-3">
            {card.process.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full text-white text-sm font-medium flex items-center justify-center">
                  {step.step}
                </div>
                <div className="flex-1">
                  <h5 className={`font-medium ${textColor} mb-1`}>{step.title}</h5>
                  <p className={`text-sm ${mutedColor}`}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {card.cta && (
        <button
          onClick={() => onAction?.(card.cta!.action)}
          className="w-full mt-4 px-4 py-3 text-white rounded-lg transition-colors font-medium"
        >
          {card.cta.text}
        </button>
      )}
    </div>
  );

  // Render based on type
  switch (structuredData.type) {
    case 'service':
      return renderServiceCard(structuredData);
    case 'consulting':
      return renderConsultingCard(structuredData);
    default:
      return null;
  }
}; 