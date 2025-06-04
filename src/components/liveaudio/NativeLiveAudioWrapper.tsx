// components/liveaudio/NativeLiveAudioWrapper.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Theme } from '../../../types';
import LiveAudioVisual3D from './LiveAudioVisual3D'; 
import { GdmLiveAudio } from './GdmLiveAudio';
// GdmLiveAudio custom element is now properly imported and registered

interface NativeLiveAudioWrapperProps {
  theme: Theme; 
  gdmAudioRef: React.RefObject<GdmLiveAudio>;
}

export const NativeLiveAudioWrapper: React.FC<NativeLiveAudioWrapperProps> = ({ theme, gdmAudioRef }) => {
  const [isGdmRecording, setIsGdmRecording] = useState(false);
  const [gdmStatus, setGdmStatus] = useState('Initializing voice...');
  const [gdmError, setGdmError] = useState('');
  const [gdmUserInterimTranscript, setGdmUserInterimTranscript] = useState('');
  // isAiCurrentlySpeaking state is removed as this component won't directly use it for controls.
  // Visualizer might handle AI speaking visuals internally if enhanced later.

  const [inputAudioNode, setInputAudioNode] = useState<GainNode | null>(null);
  const [outputAudioNode, setOutputAudioNode] = useState<GainNode | null>(null);
  
  const orbContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const gdmElement = gdmAudioRef.current;
    if (gdmElement) {
      // Initial state sync
      setIsGdmRecording(gdmElement.isRecording);
      setGdmStatus(gdmElement.status || 'Connecting...');
      setGdmError(gdmElement.error);
      setGdmUserInterimTranscript(gdmElement.lastUserInterimTranscript);
      setInputAudioNode(gdmElement.inputNode);
      setOutputAudioNode(gdmElement.outputNode);

      // Auto-start recording if ref is available and not already recording
      // This is a simplified auto-start, assuming parent component handles the overall voice active state.
      // The parent (UnifiedInteractionPanel) calls gdmAudioRef.current.startRecording() now.
      // This effect primarily sets up listeners.

      const handleRecordingStateChange = (event: Event) => {
        setIsGdmRecording((event as CustomEvent<{ isRecording: boolean }>).detail.isRecording);
      };
      const handleStatusChange = (event: Event) => {
        setGdmStatus((event as CustomEvent<{ status: string }>).detail.status);
      };
      const handleErrorChange = (event: Event) => {
        setGdmError((event as CustomEvent<{ error: string }>).detail.error);
      };
      const handleInterimTranscript = (event: Event) => {
        // This component doesn't display interim transcript directly anymore.
        // The InteractionInputBar might handle it.
        // setGdmUserInterimTranscript((event as CustomEvent<{text: string}>).detail.text);
      };
       // AiSpeakingStateChange listener removed, not directly used for controls here.

      (gdmElement as unknown as EventTarget).addEventListener('recording-state-changed', handleRecordingStateChange);
      (gdmElement as unknown as EventTarget).addEventListener('status-changed', handleStatusChange);
      (gdmElement as unknown as EventTarget).addEventListener('error-changed', handleErrorChange);
      (gdmElement as unknown as EventTarget).addEventListener('user-speech-interim', handleInterimTranscript);
      
      const observer = new MutationObserver(() => {
        if (gdmElement.inputNode && !inputAudioNode) setInputAudioNode(gdmElement.inputNode);
        if (gdmElement.outputNode && !outputAudioNode) setOutputAudioNode(gdmElement.outputNode);
      });
      observer.observe(gdmElement as unknown as Node, { attributes: true, childList: false, subtree: false });

      return () => {
        (gdmElement as unknown as EventTarget).removeEventListener('recording-state-changed', handleRecordingStateChange);
        (gdmElement as unknown as EventTarget).removeEventListener('status-changed', handleStatusChange);
        (gdmElement as unknown as EventTarget).removeEventListener('error-changed', handleErrorChange);
        (gdmElement as unknown as EventTarget).removeEventListener('user-speech-interim', handleInterimTranscript);
        observer.disconnect();
      };
    }
  }, [gdmAudioRef, inputAudioNode, outputAudioNode]);


  const displayStatusText = gdmError 
    ? '' // Error shown separately
    : (isGdmRecording && gdmUserInterimTranscript ? `Hearing: ${gdmUserInterimTranscript}` : gdmStatus);


  return (
    <div className={`w-full flex flex-col items-center justify-center pt-2 pb-1 relative ${theme === Theme.DARK ? 'bg-gray-800' : 'bg-gray-100'}`}>
      {/* Orb Visualizer - Smaller and integrated */}
      <div ref={orbContainerRef} className="w-full h-20 sm:h-24 mb-1 flex items-center justify-center">
        {inputAudioNode && outputAudioNode && ( 
          <LiveAudioVisual3D
            theme={theme}
            isRecording={isGdmRecording}
            inputNode={inputAudioNode}
            outputNode={outputAudioNode} // Pass outputNode for potential future AI speech visualization
          />
        )}
      </div>

      {/* Status and Error Messages */}
      <div className="text-center mb-1 h-6 flex flex-col justify-center items-center w-full max-w-xs sm:max-w-sm">
        {gdmError && (
          <p className={`text-xs px-2 py-1 rounded-md flex items-center gap-1.5 ${theme === Theme.DARK ? 'bg-red-800/70 text-red-200 border border-red-700/60' : 'bg-red-100/80 text-red-700 border border-red-300/70'}`} role="alert">
            <AlertTriangle size={12} /> {gdmError}
          </p>
        )}
        {!gdmError && displayStatusText && (
          <p className={`text-xs truncate ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'}`} role="status">
            {/* Display status like "Listening...", "Processing..." etc. Interim transcript is shown in input bar */}
            {isGdmRecording && !gdmUserInterimTranscript ? "Listening..." : (gdmStatus === "Hearing: " ? "Listening..." : gdmStatus)}
          </p>
        )}
      </div>
      {/* Control buttons are now removed from here and handled by InteractionInputBar */}
    </div>
  );
};
