import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import * as geminiService from '../../../services/geminiService';

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
    if (!this.isRecording || !this.mediaStream) return;
    
    try {
      const inputData = e.inputBuffer.getChannelData(0);
      this.audioChunks.push(new Float32Array(inputData));
      
      // Process audio chunks if we have enough data
      if (this.audioChunks.length > 5) {
        this.processAudioChunk().catch(error => {
          console.error('Error processing audio chunk:', error);
          this.updateError('Error processing audio');
        });
      }
    } catch (error) {
      console.error('Error in audio processing:', error);
      this.updateError('Audio processing error');
    }
  }

  private async processAudioChunk(): Promise<void> {
    if (this.audioChunks.length === 0 || this.isProcessing || !this.mediaStream) return;
    
    this.isProcessing = true;
    const chunksToProcess = [...this.audioChunks];
    this.audioChunks = [];
    
    try {
      // Combine all chunks into a single Float32Array
      const totalLength = chunksToProcess.reduce((sum, chunk) => sum + chunk.length, 0);
      const combined = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of chunksToProcess) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Reset auto-stop timeout
      this.resetAutoStopTimer();
      
      // Convert to WAV and process
      const wavBlob = this.float32ToWav(combined, this.SAMPLE_RATE_IN);
      const stream = await geminiService.streamAudio(wavBlob, {
        model: this.modelName,
        systemInstruction: this.systemInstruction
      });
      
      this.streamReader = stream.getReader();
      
      while (this.isRecording) {
        const { done, value } = await this.streamReader.read();
        if (done) break;
        
        if (value?.text) {
          this.dispatchEvent(new CustomEvent('transcription', { 
            detail: { 
              text: value.text,
              isFinal: value.isFinal ?? false
            },
            bubbles: true,
            composed: true
          }));
          
          if (value.isFinal) {
            this.lastUserInterimTranscript = value.text;
          }
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      this.updateError('Failed to process audio. Please try again.');
    } finally {
      this.isProcessing = false;
    }
  }

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
    if (this.isRecording || !this.inputAudioContext) return;
    
    this.updateStatus('Starting...');
    
    // Reset any previous state
    this.cleanup();
    
    try {
      // Request microphone access
      this.updateStatus('Requesting microphone access...');
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: this.SAMPLE_RATE_IN
        },
        video: false
      });
      
      if (!this.audioProcessor) {
        throw new Error('Audio processor not initialized');
      }
      
      // Set up audio processing
      const source = this.inputAudioContext.createMediaStreamSource(this.mediaStream);
      
      // Connect nodes
      source.connect(this.audioProcessor);
      this.audioProcessor.connect(this.inputAudioContext.destination);
      
      this.isRecording = true;
      this.resetAutoStopTimer();
      this.updateStatus('Listening...');
      this.dispatchEvent(new CustomEvent('recording-started', { bubbles: true, composed: true }));
      
    } catch (error) {
      console.error('Error starting recording:', error);
      this.updateError('Failed to access microphone. Please check permissions.');
      this.cleanup();
      throw error;
    }
  }

  public async stopRecording(): Promise<void> {
    if (!this.isRecording) return;
    
    this.isRecording = false;
    this.updateStatus('Processing...');
    
    try {
      // Stop all tracks in the media stream
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
      }
      
      // Clean up stream reader
      if (this.streamReader) {
        try {
          await this.streamReader.cancel();
        } catch (error) {
          console.error('Error canceling stream reader:', error);
        }
        this.streamReader = null;
      }
      
      // Disconnect audio nodes
      if (this.audioProcessor) {
        this.audioProcessor.disconnect();
        this.audioProcessor = null;
      }
      
      // Clear any pending timeouts
      if (this.autoStopTimeout) {
        window.clearTimeout(this.autoStopTimeout);
        this.autoStopTimeout = null;
      }
      
      this.dispatchEvent(new CustomEvent('recording-stopped', { bubbles: true, composed: true }));
      this.updateStatus('Ready');
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.updateError('Error stopping recording');
      throw error;
    }
  }

  private cleanup(): void {
    // Clear any pending timeouts
    if (this.autoStopTimeout) {
      window.clearTimeout(this.autoStopTimeout);
      this.autoStopTimeout = null;
    }
    
    // Stop media stream if it exists
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    // Disconnect audio processor if it exists
    if (this.audioProcessor) {
      this.audioProcessor.disconnect();
      this.audioProcessor = null;
    }
    
    // Close audio contexts
    this.safeCloseContext(this.inputAudioContext);
    this.safeCloseContext(this.outputAudioContext);
    
    // Reset state
    this.audioChunks = [];
    this.isProcessing = false;
    this.isRecording = false;
  }

  private async safeCloseContext(context: AudioContext | null): Promise<void> {
    if (!context) return;
    
    try {
      if (context.state !== 'closed') {
        await context.close();
      }
    } catch (error) {
      console.error('Error closing audio context:', error);
    }
  }

  private updateStatus(message: string): void {
    this.status = message;
    this.requestUpdate('status');
  }

  private updateError(message: string): void {
    this.error = message;
    this.requestUpdate('error');
  }

  public resetSession(): void {
    this.cleanup();
    this.initializeAudioContexts();
    this.updateStatus('Ready');
    this.error = '';
    this.lastUserInterimTranscript = '';
  }

  // Expose audio nodes for visualization
  public getInputAudioContext(): AudioContext | null {
    return this.inputAudioContext;
  }

  public getAudioProcessor(): ScriptProcessorNode | null {
    return this.audioProcessor;
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
