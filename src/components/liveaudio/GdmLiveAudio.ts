import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import * as geminiService from '../../../services/geminiService';
import { streamAudio } from '../../../services/geminiService';

interface AudioStreamResponse {
  text: string;
  isFinal?: boolean;
}
import { Theme } from '../../../types';

// WebKit compatibility
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
  interface HTMLElementTagNameMap {
    'gdm-live-audio': GdmLiveAudio;
  }
}

@customElement('gdm-live-audio')
export class GdmLiveAudio extends LitElement {
  // Audio configuration
  private readonly SAMPLE_RATE_IN = 16000;
  private readonly SAMPLE_RATE_OUT = 24000;
  private readonly BUFFER_SIZE = 4096;
  
  // Audio context and nodes
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private audioProcessor: ScriptProcessorNode | null = null;
  private mediaStream: MediaStream | null = null;
  
  // Audio processing state
  private audioChunks: Float32Array[] = [];
  private isProcessing = false;
  private streamReader: ReadableStreamDefaultReader<AudioStreamResponse> | null = null;
  private autoStopTimeout: number | null = null;
  
  // Public properties
  @property({ type: String }) theme: Theme = Theme.LIGHT;
  @property({ type: String }) modelName = 'gemini-2.0-flash-live-001';
  @property({ type: String }) systemInstruction = 'You are a helpful AI assistant.';
  
  // State properties
  @state() isRecording = false;
  @state() status = 'Ready';
  @state() error = '';
  @state() lastUserInterimTranscript = '';

  private speechRecognition: any | null = null;
  private speechUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    super();
    this.initializeAudioContexts();
  }

  private initializeAudioContexts(): void {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.inputAudioContext = new AudioContext({ sampleRate: this.SAMPLE_RATE_IN });
      this.outputAudioContext = new AudioContext({ sampleRate: this.SAMPLE_RATE_OUT });
      
      this.initAudioProcessing().catch(error => {
        console.error('Error initializing audio processing:', error);
        this.updateError('Failed to initialize audio processing');
      });
    } catch (error) {
      console.error('Error creating audio contexts:', error);
      this.updateError('Your browser does not support the required audio features');
    }
  }

  private async initAudioProcessing(): Promise<void> {
    if (!this.inputAudioContext) {
      throw new Error('Input audio context not initialized');
    }

    try {
      // Ensure audio context is in the correct state
      if (this.inputAudioContext.state === 'suspended') {
        await this.inputAudioContext.resume();
      }
      
      // Create audio processor
      this.audioProcessor = this.inputAudioContext.createScriptProcessor(
        this.BUFFER_SIZE,
        1, // Input channels
        1  // Output channels
      );
      
      this.audioProcessor.onaudioprocess = this.handleAudioProcess.bind(this);
      
    } catch (error) {
      console.error('Error initializing audio processing:', error);
      throw error;
    }
  }

  private handleAudioProcess(e: AudioProcessingEvent): void {
    // Legacy method - no longer used with browser STT/TTS (Option B)
    // Audio processing now handled by browser SpeechRecognition API
  }

  // Removed old audio processing - now using browser STT/TTS (Option B)

  private resetAutoStopTimer(): void {
    if (this.autoStopTimeout) {
      window.clearTimeout(this.autoStopTimeout);
    }
    
    this.autoStopTimeout = window.setTimeout(() => {
      if (this.isRecording) {
        this.stopRecording();
        this.updateStatus('Session ended due to inactivity');
      }
    }, 30000); // 30 seconds of inactivity
  }

  private float32ToWav(buffer: Float32Array, sampleRate: number): Blob {
    const wavBuffer = new ArrayBuffer(44 + buffer.length * 2);
    const view = new DataView(wavBuffer);

    // WAV header
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + buffer.length * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, buffer.length * 2, true);

    // Convert to 16-bit PCM
    const int16Buffer = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }

    // Add audio data
    const dataView = new DataView(wavBuffer, 44);
    for (let i = 0; i < int16Buffer.length; i++) {
      dataView.setInt16(i * 2, int16Buffer[i], true);
    }

    return new Blob([view], { type: 'audio/wav' });
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  public async startRecording(): Promise<void> {
    if (this.isRecording) return;

    try {
      this.updateStatus('Starting speech recognition...');
      this.isRecording = true;
      this.requestUpdate('isRecording');

      // Initialize browser-based Speech Recognition (Option B from serverless proxy plan)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser');
      }

      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;
      this.speechRecognition.lang = 'en-US';

      this.speechRecognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript) {
          this.lastUserInterimTranscript = interimTranscript;
          this.dispatchEvent(new CustomEvent('user-speech-interim', { detail: { text: interimTranscript } }));
        }

        if (finalTranscript) {
          console.log('[GdmLiveAudio] Final user speech:', finalTranscript);
          this.dispatchEvent(new CustomEvent('user-speech-final', { detail: { text: finalTranscript } }));
          this.lastUserInterimTranscript = "";
          this.processUserSpeech(finalTranscript); // Send to proxy!
        }
      };

      this.speechRecognition.onerror = (event: any) => {
        console.error('[GdmLiveAudio] Speech Recognition Error:', event.error);
        this.updateError(`Speech recognition error: ${event.error}`);
        this.stopRecording();
      };

      this.speechRecognition.onend = () => {
        console.log('[GdmLiveAudio] Speech Recognition Ended.');
        if (this.isRecording) {
          // Restart if still intended to be recording
          this.speechRecognition?.start();
        }
      };

      this.speechRecognition.start();
      this.updateStatus('Listening for speech...');
      this.dispatchEvent(new CustomEvent('recording-state-changed', { detail: { isRecording: true } }));

    } catch (error) {
      console.error('[GdmLiveAudio] Error starting Speech Recognition:', error);
      this.updateError(`Failed to start speech recognition: ${error instanceof Error ? error.message : String(error)}`);
      this.stopRecording();
    }
  }

  public async stopRecording(): Promise<void> {
    if (!this.isRecording) return;

    this.isRecording = false;
    this.requestUpdate('isRecording');

    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.speechRecognition = null;
    }

    this.dispatchEvent(new CustomEvent('recording-state-changed', { detail: { isRecording: false } }));
    this.updateStatus('Recording stopped. Ready to listen.');
  }

  private async processUserSpeech(text: string) {
    this.updateStatus('Processing user speech...');
    try {
      // Use proxy for text processing (Option B from serverless proxy plan)
      const response = await fetch('/api/gemini-proxy/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: text,
          model: this.modelName,
          systemInstruction: this.systemInstruction,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data?.text) {
        console.log('[GdmLiveAudio] AI Text Response from Proxy:', result.data.text);
        this.dispatchEvent(new CustomEvent('ai-speech-text', { detail: { text: result.data.text } }));
        this.speakAiResponse(result.data.text); // Use browser TTS
      } else {
        console.warn('[GdmLiveAudio] No text response from AI via proxy.');
        this.updateError('No response from AI');
      }
    } catch (error) {
      console.error('[GdmLiveAudio] Error processing user speech via proxy:', error);
      this.updateError(`AI response error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private speakAiResponse(text: string) {
    if (!text || text.trim() === '') {
      console.warn('[GdmLiveAudio] No text to speak.');
      this.dispatchEvent(new CustomEvent('ai-speaking-state', { detail: { isAiSpeaking: false } }));
      return;
    }

    // Stop any ongoing speech
    if (this.speechUtterance) {
      window.speechSynthesis.cancel();
    }

    this.speechUtterance = new SpeechSynthesisUtterance(text);
    this.speechUtterance.lang = 'en-US';
    this.speechUtterance.rate = 1.0;
    this.speechUtterance.pitch = 1.0;

    this.speechUtterance.onstart = () => {
      console.log('[GdmLiveAudio] AI speaking (TTS)');
      this.dispatchEvent(new CustomEvent('ai-speaking-state', { detail: { isAiSpeaking: true } }));
    };

    this.speechUtterance.onend = () => {
      console.log('[GdmLiveAudio] AI finished speaking (TTS)');
      this.dispatchEvent(new CustomEvent('ai-speaking-state', { detail: { isAiSpeaking: false } }));
      this.speechUtterance = null;
    };

    this.speechUtterance.onerror = (event) => {
      console.error('[GdmLiveAudio] Speech Synthesis Error:', event.error);
      this.updateError(`TTS error: ${event.error}`);
      this.dispatchEvent(new CustomEvent('ai-speaking-state', { detail: { isAiSpeaking: false } }));
      this.speechUtterance = null;
    };

    window.speechSynthesis.speak(this.speechUtterance);
  }

  private updateStatus(message: string): void {
    this.status = message;
    this.requestUpdate('status');
    this.dispatchEvent(new CustomEvent('status-changed', { detail: { status: message } }));
  }

  private updateError(message: string): void {
    this.error = message;
    this.requestUpdate('error');
  }

  public resetSession(): void {
    this.stopRecording();
    if (this.speechUtterance) {
      window.speechSynthesis.cancel();
      this.speechUtterance = null;
    }
    this.lastUserInterimTranscript = '';
    this.updateStatus('Ready to listen');
    this.updateError('');
  }

  // Expose audio nodes for visualization (legacy compatibility)
  public getInputAudioContext(): AudioContext | null {
    return this.inputAudioContext;
  }

  public getAudioProcessor(): ScriptProcessorNode | null {
    return this.audioProcessor;
  }

  private cleanup(): void {
    // Cleanup for browser STT/TTS implementation
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.speechRecognition = null;
    }
    if (this.speechUtterance) {
      window.speechSynthesis.cancel();
      this.speechUtterance = null;
    }
    this.isRecording = false;
    this.lastUserInterimTranscript = '';
  }

  override disconnectedCallback() {
    this.cleanup();
    super.disconnectedCallback();
  }

  // Render method - can be customized based on UI requirements
  override render() {
    return html`
      <div class="gdm-live-audio ${this.theme}">
        <div class="status">${this.status}</div>
        ${this.error ? html`<div class="error">${this.error}</div>` : ''}
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
    }
    .gdm-live-audio {
      padding: 1rem;
    }
    .status {
      margin-bottom: 0.5rem;
    }
    .error {
      color: var(--error-color, #f44336);
    }
  `;
}

export default GdmLiveAudio;
