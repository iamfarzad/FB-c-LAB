import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2 } from 'lucide-react';
import { Theme } from '../../../types';
import { GdmLiveAudio } from './GdmLiveAudio';
import { LiveAudioVisual3D } from './LiveAudioVisual3D';

interface FullScreenVoiceOverlayProps {
  isActive: boolean;
  onClose: () => void;
  theme: Theme;
  gdmAudioRef: React.RefObject<GdmLiveAudio>;
  className?: string;
}

export const FullScreenVoiceOverlay: React.FC<FullScreenVoiceOverlayProps> = ({
  isActive,
  onClose,
  theme,
  gdmAudioRef,
  className = '',
}) => {
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [status, setStatus] = useState('Ready to listen');
  const [recordingStartTime, setRecordingStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [inputNode, setInputNode] = useState<GainNode | null>(null);
  
  const timerRef = useRef<number | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Update timer
  useEffect(() => {
    if (isRecording && recordingStartTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        setElapsedTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, recordingStartTime]);

  // Listen for events from GdmLiveAudio
  useEffect(() => {
    const gdmElement = gdmAudioRef.current;
    if (!gdmElement) return;

    const handleUserSpeechInterim = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setInterimTranscript(detail.text || '');
    };

    const handleUserSpeechFinal = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setFinalTranscript(prev => prev + (prev ? ' ' : '') + (detail.text || ''));
      setInterimTranscript('');
    };

    const handleAiSpeechText = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setAiResponse(detail.text || '');
    };

    const handleRecordingStateChanged = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setIsRecording(detail.isRecording);
      if (detail.isRecording) {
        setRecordingStartTime(Date.now());
        setElapsedTime('00:00');
        
        // Get audio context and create gain node for visualization
        const audioContext = gdmElement.getInputAudioContext();
        const audioProcessor = gdmElement.getAudioProcessor();
        
        if (audioContext && audioProcessor) {
          try {
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 1.0;
            
            // Connect the audio processor to our gain node for visualization
            audioProcessor.connect(gainNode);
            
            setInputNode(gainNode);
            console.log('[FullScreenVoiceOverlay] Audio visualization node connected successfully');
          } catch (error) {
            console.error('[FullScreenVoiceOverlay] Error connecting audio visualization:', error);
            setInputNode(null);
          }
        } else {
          console.warn('[FullScreenVoiceOverlay] Audio context or processor not available');
          setInputNode(null);
        }
      } else {
        setInputNode(null);
      }
    };

    const handleStatusChanged = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setStatus(detail.status || 'Ready to listen');
    };

    const handleAiSpeakingState = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setIsAiSpeaking(detail.isAiSpeaking);
      console.log('[FullScreenVoiceOverlay] AI speaking state:', detail.isAiSpeaking);
    };

    try {
      (gdmElement as unknown as EventTarget).addEventListener('user-speech-interim', handleUserSpeechInterim as EventListener);
      (gdmElement as unknown as EventTarget).addEventListener('user-speech-final', handleUserSpeechFinal as EventListener);
      (gdmElement as unknown as EventTarget).addEventListener('ai-speech-text', handleAiSpeechText as EventListener);
      (gdmElement as unknown as EventTarget).addEventListener('recording-state-changed', handleRecordingStateChanged as EventListener);
      (gdmElement as unknown as EventTarget).addEventListener('status-changed', handleStatusChanged as EventListener);
      (gdmElement as unknown as EventTarget).addEventListener('ai-speaking-state', handleAiSpeakingState as EventListener);

      return () => {
        (gdmElement as unknown as EventTarget).removeEventListener('user-speech-interim', handleUserSpeechInterim as EventListener);
        (gdmElement as unknown as EventTarget).removeEventListener('user-speech-final', handleUserSpeechFinal as EventListener);
        (gdmElement as unknown as EventTarget).removeEventListener('ai-speech-text', handleAiSpeechText as EventListener);
        (gdmElement as unknown as EventTarget).removeEventListener('recording-state-changed', handleRecordingStateChanged as EventListener);
        (gdmElement as unknown as EventTarget).removeEventListener('status-changed', handleStatusChanged as EventListener);
        (gdmElement as unknown as EventTarget).removeEventListener('ai-speaking-state', handleAiSpeakingState as EventListener);
      };
    } catch (error) {
      console.error('[FullScreenVoiceOverlay] Error setting up event listeners:', error);
    }
  }, [gdmAudioRef]);

  const handleToggleRecording = () => {
    if (!gdmAudioRef.current) return;

    if (isRecording) {
      gdmAudioRef.current.stopRecording();
    } else {
      gdmAudioRef.current.startRecording();
    }
  };

  const handleClearTranscripts = () => {
    setInterimTranscript('');
    setFinalTranscript('');
    setAiResponse('');
    setElapsedTime('00:00');
  };

  const handleClose = () => {
    if (isRecording && gdmAudioRef.current) {
      gdmAudioRef.current.stopRecording();
    }
    handleClearTranscripts();
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isActive) {
        handleClose();
      }
      if (event.code === 'Space' && isActive) {
        event.preventDefault();
        handleToggleRecording();
      }
    };

    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, isRecording]);

  // Lock body scroll when active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isActive]);

  if (!isActive) return null;

  const glassmorphicBg = theme === Theme.DARK 
    ? 'bg-black/90 backdrop-blur-lg'
    : 'bg-white/90 backdrop-blur-lg';

  const cardBg = theme === Theme.DARK
    ? 'border border-white/10 bg-black/20'
    : 'border border-black/10 bg-white/20';

  const textColor = theme === Theme.DARK ? 'text-white' : 'text-black';
  const mutedTextColor = theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600';

  return (
    <div 
      ref={overlayRef}
      className={`fixed inset-0 z-[9999] ${glassmorphicBg} flex flex-col ${className}`}
    >
      {/* Refined Header */}
      <div className="flex justify-between items-center px-8 py-6 border-b border-white/5">
        <div className="flex items-center space-x-4">
          <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
            isRecording ? 'bg-orange-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <h1 className={`text-xl font-light ${textColor}`}>
            Voice Assistant
          </h1>
          {isRecording && (
            <span className={`text-sm font-mono ${mutedTextColor}`}>
              {elapsedTime}
            </span>
          )}
        </div>
        <button
          onClick={handleClose}
          className={`p-2 transition-colors ${
            theme === Theme.DARK 
              ? 'hover:bg-white/5 text-gray-400 hover:text-white' 
              : 'hover:bg-black/5 text-gray-600 hover:text-black'
          }`}
          aria-label="Close voice interface"
        >
          <X size={20} />
        </button>
      </div>

      {/* 3D Audio Visualizer - Full Background */}
      <div className="absolute inset-0">
        <LiveAudioVisual3D
          inputNode={inputNode}
          outputNode={null}
          theme={theme}
          isRecording={isRecording}
          isAiSpeaking={isAiSpeaking}
        />
      </div>
      
      {/* Content Overlay - Refined Layout */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className={`w-full max-w-3xl ${cardBg} backdrop-blur-md p-8 space-y-8`}>
            {/* Status */}
            <div className="text-center">
              <p className={`text-sm font-light ${mutedTextColor}`}>{status}</p>
            </div>

            {/* Live Interim Transcript */}
            {interimTranscript && (
              <div className="space-y-2">
                <h3 className={`text-xs font-medium uppercase tracking-wider ${mutedTextColor}`}>
                  Listening...
                </h3>
                <p className={`text-lg font-light ${textColor} opacity-80 leading-relaxed`}>
                  {interimTranscript}
                </p>
              </div>
            )}

            {/* Final User Transcript */}
            {finalTranscript && (
              <div className="space-y-2">
                <h3 className={`text-xs font-medium uppercase tracking-wider ${mutedTextColor}`}>
                  You said
                </h3>
                <div className={`p-4 ${cardBg} border-l-2 border-l-orange-500`}>
                  <p className={`text-lg font-light ${textColor} leading-relaxed`}>
                    {finalTranscript}
                  </p>
                </div>
              </div>
            )}

            {/* AI Response */}
            {aiResponse && (
              <div className="space-y-2">
                <h3 className={`text-xs font-medium uppercase tracking-wider ${mutedTextColor} flex items-center`}>
                  <Volume2 size={14} className="mr-2" />
                  Response
                </h3>
                <div className={`p-4 ${cardBg}`}>
                  <p className={`text-lg font-light ${textColor} leading-relaxed`}>
                    {aiResponse}
                  </p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!interimTranscript && !finalTranscript && !aiResponse && (
              <div className="text-center py-12">
                <p className={`text-lg font-light ${mutedTextColor}`}>
                  Press the button below or spacebar to start talking
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Controls - Refined */}
        <div className="flex-shrink-0 pb-12">
          {/* Controls */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <button
              onClick={handleToggleRecording}
              className={`relative w-16 h-16 border transition-all duration-300 ${
                isRecording 
                  ? 'border-orange-500 bg-orange-500/10 hover:bg-orange-500/20' 
                  : 'border-white/20 hover:border-orange-500 hover:bg-orange-500/10'
              }`}
              aria-label={isRecording ? "Stop recording" : "Start recording"}
            >
              {isRecording ? (
                <MicOff size={24} className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  ${isRecording ? 'text-orange-500' : textColor}`} />
              ) : (
                <Mic size={24} className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                  ${isRecording ? 'text-orange-500' : textColor}`} />
              )}
            </button>

            <button
              onClick={handleClearTranscripts}
              className={`px-4 py-2 border text-sm transition-all duration-300 ${
                theme === Theme.DARK 
                  ? 'border-white/10 hover:border-white/20 text-gray-400 hover:text-white' 
                  : 'border-black/10 hover:border-black/20 text-gray-600 hover:text-black'
              }`}
            >
              Clear
            </button>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2">
            <div className={`flex items-center justify-center gap-4 text-sm font-light ${mutedTextColor}`}>
              <div className="flex items-center gap-2">
                <kbd className={`px-2 py-0.5 text-xs border ${
                  theme === Theme.DARK ? 'border-white/10' : 'border-black/10'
                }`}>
                  Space
                </kbd>
                <span>to toggle recording</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className={`px-2 py-0.5 text-xs border ${
                  theme === Theme.DARK ? 'border-white/10' : 'border-black/10'
                }`}>
                  Esc
                </kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenVoiceOverlay; 