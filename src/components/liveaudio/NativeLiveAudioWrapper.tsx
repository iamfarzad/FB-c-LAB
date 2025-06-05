// components/liveaudio/NativeLiveAudioWrapper.tsx
import React from 'react';
import { Theme } from '../../../types';

interface NativeLiveAudioWrapperProps {
  theme: Theme;
  gdmAudioRef: React.RefObject<any>;
}

export const NativeLiveAudioWrapper: React.FC<NativeLiveAudioWrapperProps> = ({ theme }) => {
  return (
    <div className={`p-4 text-center ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}>Native live audio is <span className="text-orange-500">disabled</span> (feature parked for now).</div>
  );
};
