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
  private lastRequestTime = 0;
  private readonly REQUEST_THROTTLE_MS = 1000; // Minimum 1 second between requests
  
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
    console.log('[GdmLiveAudio] Constructor called - custom element created');
  }

  private initializeAudioContexts(): void {
    try {
      console.log('[GdmLiveAudio] Initializing audio contexts...');
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.inputAudioContext = new AudioContext({ sampleRate: this.SAMPLE_RATE_IN });
      this.outputAudioContext = new AudioContext({ sampleRate: this.SAMPLE_RATE_OUT });
      console.log('[GdmLiveAudio] Audio contexts created successfully');
    } catch (error) {
      console.error('[GdmLiveAudio] Error creating audio contexts:', error);
      this.updateError('Your browser does not support the required audio features');
    }
  }

  private async initAudioProcessing(): Promise<void> {
    if (!this.inputAudioContext) {
      throw new Error('Input audio context not initialized');
    }

    try {
      // Get microphone access for visualization
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: this.SAMPLE_RATE_IN,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Ensure audio context is in the correct state
      if (this.inputAudioContext.state === 'suspended') {
        await this.inputAudioContext.resume();
      }
      
      // Create audio processing chain for visualization
      const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      this.audioProcessor = this.inputAudioContext.createScriptProcessor(
        this.BUFFER_SIZE,
        1, // Input channels
        1  // Output channels
      );
      
      // Connect source -> processor -> destination for visualization
      source.connect(this.audioProcessor);
      this.audioProcessor.connect(this.inputAudioContext.destination);
      
      this.audioProcessor.onaudioprocess = this.handleAudioProcess.bind(this);
      
      console.log('[GdmLiveAudio] Audio processing initialized with microphone access for visualization');
      
    } catch (error) {
      console.error('Error initializing audio processing:', error);
      throw error;
    }
  }

  private handleAudioProcess(e: AudioProcessingEvent): void {
    if (!this.isRecording || !this.mediaStream) return;
    
    try {
      // Process audio data for real Gemini Live Audio streaming
      const inputData = e.inputBuffer.getChannelData(0);
      const audioChunk = new Float32Array(inputData);
      this.audioChunks.push(audioChunk);
      
      // Stream audio chunks to Gemini Live Audio API in real-time
      if (this.audioChunks.length >= 3) { // Stream every ~120ms for real-time response
        const chunksToStream = this.audioChunks.splice(0, 3);
        this.streamAudioToGemini(chunksToStream);
      }
      
      // Calculate audio level for visualization
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      const audioLevel = Math.min(1, rms * 10); // Amplify for better visualization
      
      // Dispatch audio level event for visualization
      this.dispatchEvent(new CustomEvent('audio-level', { 
        detail: { level: audioLevel, isRecording: this.isRecording } 
      }));
      
    } catch (error) {
      console.error('Error in audio processing:', error);
    }
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

  private async initializeGeminiLiveAudio(): Promise<void> {
    try {
      // Import the streamAudio function from geminiService
      const { streamAudio } = await import('../../../services/geminiService');
      
      // Set up real-time audio streaming to Gemini
      if (this.audioProcessor && this.inputAudioContext) {
        this.audioProcessor.onaudioprocess = (e: AudioProcessingEvent) => {
          this.handleAudioProcess(e);
        };
        
        console.log('[GdmLiveAudio] Gemini Live Audio initialized with real audio processing');
        this.updateStatus('Gemini Live Audio ready');
      } else {
        throw new Error('Audio processing not initialized');
      }
    } catch (error) {
      console.error('[GdmLiveAudio] Failed to initialize Gemini Live Audio:', error);
      throw error;
    }
  }

  private async streamAudioToGemini(audioChunks: Float32Array[]): Promise<void> {
    try {
      // Throttle requests to prevent rate limiting
      const now = Date.now();
      if (now - this.lastRequestTime < this.REQUEST_THROTTLE_MS) {
        console.log('[GdmLiveAudio] Throttling request to prevent rate limiting');
        return;
      }
      this.lastRequestTime = now;

      // Import the streamAudio function
      const { streamAudio } = await import('../../../services/geminiService');
      
      // Stream audio chunks to Gemini Live Audio API
      await streamAudio(
        audioChunks,
        (transcript: string, isFinal: boolean) => {
          // Handle real-time transcription from Gemini
          if (isFinal) {
            console.log('[GdmLiveAudio] Final Gemini transcript:', transcript);
            this.dispatchEvent(new CustomEvent('user-speech-final', { detail: { text: transcript } }));
            this.processGeminiResponse(transcript);
          } else {
            console.log('[GdmLiveAudio] Interim Gemini transcript:', transcript);
            this.lastUserInterimTranscript = transcript;
            this.dispatchEvent(new CustomEvent('user-speech-interim', { detail: { text: transcript } }));
          }
        },
        (error: string) => {
          console.error('[GdmLiveAudio] Gemini streaming error:', error);
          this.updateError(`Gemini Live Audio error: ${error}`);
        }
      );
    } catch (error) {
      console.error('[GdmLiveAudio] Error streaming to Gemini:', error);
      this.updateError(`Failed to stream audio: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async processGeminiResponse(transcript: string): Promise<void> {
    try {
      this.updateStatus('Processing with Gemini...');
      
      // Generate AI response using Gemini
      const { generateText } = await import('../../../services/geminiService');
      const response = await generateText(transcript, this.systemInstruction);
      
      if (response && response.trim()) {
        this.updateStatus('Speaking Gemini response...');
        console.log('[GdmLiveAudio] Gemini response:', response);
        
        // Use Gemini's native TTS instead of browser TTS
        await this.speakGeminiResponse(response);
        
        // Dispatch AI speech event
        this.dispatchEvent(new CustomEvent('ai-speech-text', {
          detail: { text: response },
          bubbles: true
        }));
      } else {
        this.updateError('Empty response from Gemini');
        this.updateStatus('Ready');
      }
    } catch (error) {
      console.error('[GdmLiveAudio] Error processing Gemini response:', error);
      this.updateError(`Failed to process response: ${error instanceof Error ? error.message : String(error)}`);
      this.updateStatus('Ready');
    }
  }

  private async speakGeminiResponse(text: string): Promise<void> {
    try {
      // Use Gemini's native text-to-speech capabilities
      console.log('[GdmLiveAudio] Using Gemini native TTS for:', text);
      
      // Import the speakText function from geminiService
      const { speakText } = await import('../../../services/geminiService');
      
      // Dispatch AI speaking state
      this.dispatchEvent(new CustomEvent('ai-speaking-state', { detail: { isAiSpeaking: true } }));
      
      // Use Gemini's native TTS
      await speakText(text);
      
      // Dispatch AI speaking completed
      this.dispatchEvent(new CustomEvent('ai-speaking-state', { detail: { isAiSpeaking: false } }));
      this.updateStatus('Ready');
      
    } catch (error) {
      console.warn('[GdmLiveAudio] Gemini TTS failed, falling back to browser TTS:', error);
      // Fallback to browser TTS if Gemini TTS fails
      this.speakAiResponse(text);
    }
  }

  public async startRecording(): Promise<void> {
    if (this.isRecording) return;

    try {
      this.updateStatus('Starting Gemini Live Audio...');
      this.isRecording = true;
      this.requestUpdate('isRecording');

      // Initialize audio contexts for real audio processing
      await this.initAudioProcessing();

      // Use real Gemini Live Audio API instead of browser Speech Recognition
      await this.initializeGeminiLiveAudio();
      
      this.updateStatus('Connected to Gemini Live Audio');
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

    // Clean up audio processing when stopping
    if (this.audioProcessor) {
      this.audioProcessor.disconnect();
      this.audioProcessor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Clear any remaining audio chunks
    this.audioChunks = [];

    this.dispatchEvent(new CustomEvent('recording-state-changed', { detail: { isRecording: false } }));
    this.updateStatus('Gemini Live Audio stopped. Ready to listen.');
  }

  private async processUserSpeech(text: string): Promise<void> {
    // Throttle requests to prevent rate limiting
    const now = Date.now();
    if (now - this.lastRequestTime < this.REQUEST_THROTTLE_MS) {
      console.log('[GdmLiveAudio] Throttling speech processing to prevent rate limiting');
      return;
    }
    this.lastRequestTime = now;

    this.updateStatus('Processing user speech...');
    console.log('[GdmLiveAudio] Processing user speech:', text);
    
    try {
      // Use the geminiService which handles development fallback automatically
      const { generateText } = await import('../../../services/geminiService');
      
      console.log('[GdmLiveAudio] Calling generateText with:', text);
      const response = await generateText(text, this.systemInstruction);
      console.log('[GdmLiveAudio] Got response:', response);
      
      if (response && response.trim()) {
        this.updateStatus('Speaking response...');
        console.log('[GdmLiveAudio] About to speak response:', response);
        await this.speakGeminiResponse(response);
        
        // Dispatch AI speech event
        this.dispatchEvent(new CustomEvent('ai-speech-text', {
          detail: { text: response },
          bubbles: true
        }));
      } else {
        console.warn('[GdmLiveAudio] Empty or invalid response from AI:', response);
        this.updateError('Received empty response from AI');
        this.updateStatus('Ready');
      }
    } catch (error) {
      console.error('[GdmLiveAudio] Error processing speech:', error);
      this.updateError(`Failed to process speech: ${error instanceof Error ? error.message : String(error)}`);
      this.updateStatus('Ready');
    }
  }

  private speakAiResponse(text: string) {
    console.log('[GdmLiveAudio] speakAiResponse called with text:', text);
    
    if (!text || text.trim() === '') {
      console.warn('[GdmLiveAudio] No text to speak.');
      this.dispatchEvent(new CustomEvent('ai-speaking-state', { detail: { isAiSpeaking: false } }));
      return;
    }

    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.error('[GdmLiveAudio] Speech synthesis not supported in this browser');
      this.updateError('Text-to-speech not supported in this browser');
      this.dispatchEvent(new CustomEvent('ai-speaking-state', { detail: { isAiSpeaking: false } }));
      return;
    }

    // Stop any ongoing speech
    if (this.speechUtterance) {
      console.log('[GdmLiveAudio] Stopping previous speech');
      window.speechSynthesis.cancel();
    }

    console.log('[GdmLiveAudio] Creating new speech utterance with enhanced voice');
    this.speechUtterance = new SpeechSynthesisUtterance(text);
    this.speechUtterance.lang = 'en-US';
    this.speechUtterance.rate = 1.1; // Slightly faster for more natural flow
    this.speechUtterance.pitch = 1.0;
    this.speechUtterance.volume = 0.9;
    
    // Try to use a more natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoices = voices.filter(voice => 
      voice.lang.startsWith('en') && 
      (voice.name.includes('Neural') || voice.name.includes('Enhanced') || voice.name.includes('Premium'))
    );
    
    if (preferredVoices.length > 0) {
      this.speechUtterance.voice = preferredVoices[0];
      console.log('[GdmLiveAudio] Using enhanced voice:', preferredVoices[0].name);
    } else {
      // Fallback to any English voice
      const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
      if (englishVoices.length > 0) {
        this.speechUtterance.voice = englishVoices[0];
        console.log('[GdmLiveAudio] Using fallback voice:', englishVoices[0].name);
      }
    }

    this.speechUtterance.onstart = () => {
      console.log('[GdmLiveAudio] AI speaking started (TTS)');
      this.dispatchEvent(new CustomEvent('ai-speaking-state', { detail: { isAiSpeaking: true } }));
    };

    this.speechUtterance.onend = () => {
      console.log('[GdmLiveAudio] AI finished speaking (TTS)');
      this.dispatchEvent(new CustomEvent('ai-speaking-state', { detail: { isAiSpeaking: false } }));
      this.speechUtterance = null;
      this.updateStatus('Ready to listen');
    };

    this.speechUtterance.onerror = (event) => {
      console.error('[GdmLiveAudio] Speech Synthesis Error:', event.error);
      this.updateError(`TTS error: ${event.error}`);
      this.dispatchEvent(new CustomEvent('ai-speaking-state', { detail: { isAiSpeaking: false } }));
      this.speechUtterance = null;
      this.updateStatus('Ready to listen');
    };

    console.log('[GdmLiveAudio] Starting speech synthesis');
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

    // Clean up audio processing
    if (this.audioProcessor) {
      this.audioProcessor.disconnect();
      this.audioProcessor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.autoStopTimeout) {
      window.clearTimeout(this.autoStopTimeout);
      this.autoStopTimeout = null;
    }

    this.isRecording = false;
    this.lastUserInterimTranscript = '';
    this.audioChunks = [];
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
