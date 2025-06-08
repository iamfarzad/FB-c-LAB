import React, { useEffect, useRef } from 'react';
import { Theme } from '@/types';
import { X } from 'lucide-react';
import { GdmLiveAudioReact } from './GdmLiveAudioReact';
import { supabase } from '@/lib/supabaseClient'; // Import supabase client

// AudioPlayer to handle incoming audio stream
class AudioPlayer {
  private audioContext: AudioContext;
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }

  public addAudio(audioData: ArrayBuffer) {
    this.audioQueue.push(audioData);
    if (!this.isPlaying) {
      this.playNext();
    }
  }

  private async playNext() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const audioData = this.audioQueue.shift()!;
    
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.onended = () => this.playNext();
      source.start();
    } catch (error) {
      console.error('Error playing audio:', error);
      this.playNext(); // Continue with next item in queue
    }
  }
}

interface FullScreenVoiceOverlayProps {
  isActive: boolean;
  onClose: () => void;
  theme: Theme;
  userId: string; // Required for the GdmLiveAudioReact component
  onTranscription?: (text: string) => void;
  className?: string;
}

export const FullScreenVoiceOverlay: React.FC<FullScreenVoiceOverlayProps> = ({
  isActive,
  onClose,
  theme,
  userId,
  onTranscription,
  className = '',
}) => {
  const audioPlayerRef = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (isActive) {
      audioPlayerRef.current = new AudioPlayer();
      
      const channel = supabase.channel('audio-stream');

      channel
        .on('broadcast', { event: 'audio-response' }, ({ payload }) => {
          if (payload.audio) {
            // Convert base64 back to ArrayBuffer
            const binaryString = window.atob(payload.audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            audioPlayerRef.current?.addAudio(bytes.buffer);
          }
        })
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.warn(`Supabase channel status: ${status}`);
          }
        });

      return () => {
        supabase.removeChannel(channel);
        audioPlayerRef.current = null;
      };
    }
  }, [isActive]);

  if (!isActive) return null;
  
  const glassmorphicBg = theme === Theme.DARK 
    ? 'bg-black/90 backdrop-blur-lg'
    : 'bg-white/90 backdrop-blur-lg';
  const textColor = theme === Theme.DARK ? 'text-white' : 'text-black';

  return (
    <div className={`fixed inset-0 z-[9999] ${glassmorphicBg} flex flex-col items-center justify-center ${className}`}>
      <button
        onClick={onClose}
        className={`absolute top-6 right-8 p-2 rounded-lg transition-colors ${
          theme === Theme.DARK 
            ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
            : 'hover:bg-black/10 text-gray-600 hover:text-black'
        } focus-ring`}
        aria-label="Close voice interface"
      >
        <X size={24} />
      </button>
      
      <div className="w-full max-w-lg text-center">
        <h2 className={`text-2xl font-bold mb-4 ${textColor}`}>
          Voice Assistant
        </h2>
        <p className={`mb-8 ${textColor}`}>
          Press Start and begin speaking.
        </p>
        <GdmLiveAudioReact 
          userId={userId}
          onTranscription={onTranscription}
          onError={(e) => console.error('Voice error:', e)}
        />
      </div>

    </div>
  );
};

export default FullScreenVoiceOverlay; 