import { Theme } from '@/types';
import { ServicesPageContent } from '@/components/services/ServicesPageContent';

interface ServicesPageProps {
  theme: Theme;
  onToggleChat: (message?: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ theme, onToggleChat }) => {
  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${
      theme === Theme.DARK ? 'text-white' : 'text-black'
    }`}>
      {/* Content */}
      <div className="relative z-10">
        <ServicesPageContent onToggleChat={onToggleChat} />
      </div>
    </div>
  );
};
