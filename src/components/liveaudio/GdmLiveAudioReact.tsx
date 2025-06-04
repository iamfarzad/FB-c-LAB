import React, { useEffect, useRef } from 'react';

// Import the GdmLiveAudio component to register the custom element
import GdmLiveAudio from './GdmLiveAudio';

// Explicitly register the custom element if not already registered
if (!customElements.get('gdm-live-audio')) {
  customElements.define('gdm-live-audio', GdmLiveAudio);
}

interface GdmLiveAudioReactProps {
  className?: string;
  onTranscription?: (text: string) => void;
  onError?: (error: Error) => void;
}

export const GdmLiveAudioReact: React.FC<GdmLiveAudioReactProps> = ({
  className = '',
  onTranscription,
  onError,
}) => {
  const elementRef = useRef<HTMLElement | null>(null);
  const instanceRef = useRef<GdmLiveAudio | null>(null);

  useEffect(() => {
    // Create the custom element
    const element = document.createElement('gdm-live-audio');
    if (className) {
      element.className = className;
    }
    
    // Store the element reference
    elementRef.current = element;
    
    // Add event listeners if callbacks are provided
    if (onTranscription) {
      element.addEventListener('transcription', (e: Event) => {
        const customEvent = e as CustomEvent<{ text: string }>;
        onTranscription(customEvent.detail.text);
      });
    }
    
    if (onError) {
      element.addEventListener('error', (e: Event) => {
        const errorEvent = e as ErrorEvent;
        onError(new Error(errorEvent.message));
      });
    }
    
    // Add to the DOM
    const container = document.createElement('div');
    container.style.display = 'none'; // Hide the container
    container.appendChild(element);
    document.body.appendChild(container);
    
    // Store the instance
    instanceRef.current = element as GdmLiveAudio;
    
    // Cleanup
    return () => {
      if (elementRef.current) {
        container.removeChild(elementRef.current);
        document.body.removeChild(container);
      }
    };
  }, [className, onTranscription, onError]);

  // This component doesn't render anything visible
  return null;
};

export default GdmLiveAudioReact;
