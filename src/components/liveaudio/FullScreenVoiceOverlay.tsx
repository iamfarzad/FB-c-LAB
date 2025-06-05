import React from 'react';
import { X } from 'lucide-react';
import { Theme } from '../../../types';

interface FullScreenVoiceOverlayProps {
  isActive: boolean;
  onClose: () => void;
  theme: Theme;
  gdmAudioRef: React.RefObject<any>;
  className?: string;
}

export const FullScreenVoiceOverlay: React.FC<FullScreenVoiceOverlayProps> = ({
  isActive,
  onClose,
  theme,
  className = '',
}) => {
  if (!isActive) return null;
  const glassmorphicBg = theme === Theme.DARK 
    ? 'bg-black/90 backdrop-blur-lg'
    : 'bg-white/90 backdrop-blur-lg';
  const textColor = theme === Theme.DARK ? 'text-white' : 'text-black';
  return (
    <div className={`fixed inset-0 z-[9999] ${glassmorphicBg} flex flex-col items-center justify-center ${className}`}>
      <button
        onClick={onClose}
        className={`absolute top-6 right-8 p-2 transition-colors ${
          theme === Theme.DARK 
            ? 'hover:bg-white/5 text-gray-400 hover:text-white' 
            : 'hover:bg-black/5 text-gray-600 hover:text-black'
        }`}
        aria-label="Close voice interface"
      >
        <X size={20} />
      </button>
      <div className={`text-2xl font-bold ${textColor}`}>Voice assistant is currently <span className="text-orange-500">disabled</span>.</div>
      <div className={`mt-4 text-base ${textColor}`}>Live audio features are parked for now. Text chat is fully available.</div>
    </div>
  );
};

export default FullScreenVoiceOverlay; 