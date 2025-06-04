import React, { useEffect, useRef } from 'react';
import './GdmLiveAudio';

interface GdmLiveAudioWrapperProps {
  className?: string;
}

export const GdmLiveAudioWrapper: React.FC<GdmLiveAudioWrapperProps> = ({ className = '' }) => {
  const audioRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // The custom element is registered by importing GdmLiveAudio
    // We can add event listeners or interact with the element here if needed
    const element = audioRef.current;
    
    if (element) {
      // Example: Add event listeners if needed
      // element.addEventListener('transcription', handleTranscription);
      
      return () => {
        // Clean up event listeners
        // element.removeEventListener('transcription', handleTranscription);
      };
    }
  }, []);

  return React.createElement('gdm-live-audio', {
    ref: audioRef,
    className: className,
  });
};

export default GdmLiveAudioWrapper;
