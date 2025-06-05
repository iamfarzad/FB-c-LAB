import React from 'react';

// LIVE AUDIO FUNCTIONALITY PARKED FOR NOW

interface GdmLiveAudioReactProps {
  className?: string;
  onTranscription?: (text: string) => void;
  onError?: (error: Error) => void;
}

export const GdmLiveAudioReact: React.FC<GdmLiveAudioReactProps> = ({ className = '' }) => {
  return (
    <div className={`p-4 text-center text-orange-500 ${className}`}>Live audio is currently disabled (feature parked for now).</div>
  );
};
