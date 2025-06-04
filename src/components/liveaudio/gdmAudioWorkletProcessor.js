
// components/liveaudio/gdmAudioWorkletProcessor.js
class GdmAudioProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(options);
    // Buffer PCM data before sending
    // The API probably expects chunks of a certain size or duration.
    // ScriptProcessorNode used bufferSize 256.
    // AudioWorklet process() is called with 128 frames by default.
    // We can accumulate 2 * 128 = 256 frames before posting.
    this._bufferSize = 256; 
    this._buffer = new Float32Array(this._bufferSize);
    this._bufferPos = 0;

    this.port.onmessage = (event) => {
      // Handle messages from the main thread if needed (e.g., config changes)
      // For now, this worklet only sends data out.
    };
  }

  process(inputs, outputs, parameters) {
    // Assuming mono audio input on the first input port
    const input = inputs[0];
    if (!input || input.length === 0) {
      return true; // No input to process
    }

    const inputChannel = input[0]; // First channel data (Float32Array)

    if (inputChannel) {
      // Fill our internal buffer
      for (let i = 0; i < inputChannel.length; i++) {
        this._buffer[this._bufferPos++] = inputChannel[i];
        
        // When buffer is full, post it to the main thread
        if (this._bufferPos === this._bufferSize) {
          // Post a copy of the buffer's content
          this.port.postMessage(this._buffer.slice(0, this._bufferPos));
          this._bufferPos = 0; // Reset buffer position
        }
      }
    }
    
    // Return true to keep the processor alive
    return true;
  }
}

try {
  registerProcessor('gdm-audio-processor', GdmAudioProcessor);
} catch (e) {
  console.error("Failed to register gdm-audio-processor:", e);
  // This catch might not be reachable in all environments if syntax error occurs earlier.
}
