import React from 'react';

interface GdmLiveAudioWrapperProps {
  className?: string;
}

export const GdmLiveAudioWrapper: React.FC<GdmLiveAudioWrapperProps> = ({ className = '' }) => {
  return (
    <div className={`p-4 text-center text-orange-500 ${className}`}>Live audio is currently disabled (feature parked for now).</div>
  );
};

export default GdmLiveAudioWrapper;
