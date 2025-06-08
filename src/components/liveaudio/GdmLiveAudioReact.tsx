import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';

// LIVE AUDIO FUNCTIONALITY PARKED FOR NOW

type RealtimeSubscribeStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CHANNEL_ERROR' | 'CLOSED';

interface GdmLiveAudioReactProps {
  className?: string;
  onTranscription?: (text: string) => void;
  onError?: (error: Error) => void;
  userId: string;
}

interface GeminiResponsePayload {
  text?: string;
  audio?: any; 
}

export const GdmLiveAudioReact: React.FC<GdmLiveAudioReactProps> = ({ 
  className = '',
  onTranscription,
  onError,
  userId
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState('Idle');
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(`voice-session:${userId}`, {
      config: {
        broadcast: {
          self: true,
        },
      },
    });

    channel
      .on('broadcast', { event: 'gemini-response' }, ({ payload }: { payload: GeminiResponsePayload}) => {
        if (payload.text) {
          onTranscription?.(payload.text);
        }
      })
      .subscribe((status: RealtimeSubscribeStatus) => {
        if (status === 'SUBSCRIBED') {
          setStatus('Ready to stream');
        } else if (status !== 'CLOSED') {
          setStatus('Supabase connection failed');
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [userId, onTranscription]);

  const startStreaming = useCallback(async () => {
    if (isRecording || !channelRef.current) return;

    try {
      setStatus('Initializing...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      
      try {
        await context.audioWorklet.addModule('/src/components/liveaudio/gdmAudioWorkletProcessor.js');
      } catch (e) {
        console.error("Failed to add AudioWorklet module. Make sure the path is correct and the file is served.", e);
        setStatus('Error: Could not load audio processor.');
        return;
      }
      
      const microphoneSource = context.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(context, 'gdm-audio-processor');
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        channelRef.current?.send({
          type: 'broadcast',
          event: 'client-audio',
          payload: { audioData: event.data },
        });
      };

      microphoneSource.connect(workletNode);
      // We don't connect to destination, to avoid feedback loop.
      // workletNode.connect(context.destination);

      setIsRecording(true);
      setStatus('Streaming...');
    } catch (err: any) {
      console.error('Error starting audio stream:', err);
      setStatus(`Error: ${err.message}`);
      onError?.(err);
    }
  }, [isRecording, onError]);

  const stopStreaming = useCallback(() => {
    if (!isRecording) return;

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    workletNodeRef.current?.disconnect();
    audioContextRef.current?.close().then(() => {
        audioContextRef.current = null;
    });

    setIsRecording(false);
    setStatus('Idle');
  }, [isRecording]);

  return (
    <div className={`p-4 text-center ${className}`}>
      <div className="mb-4">
        <p className="text-lg mb-2">{status}</p>
        <div className={`
          w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all duration-300
          ${isRecording ? 'bg-red-500/20' : 'bg-gray-500/20'}
        `}>
          <div className={`
            w-16 h-16 rounded-full transition-all duration-300
            ${isRecording ? 'bg-red-500 shadow-lg' : 'bg-gray-500'}
          `}/>
        </div>
      </div>
      <button 
        onClick={isRecording ? stopStreaming : startStreaming}
        className={`px-8 py-4 rounded-full text-white font-bold uppercase tracking-wider transition-all transform hover:scale-105 ${
          isRecording 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-orange-500 hover:bg-orange-600'
        }`}
      >
        {isRecording ? 'Stop' : 'Start'}
      </button>
    </div>
  );
};
