// Audio worklet processor for handling audio streaming
class AudioStreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
    this.isActive = true;
  }

  handleMessage(event) {
    if (event.data === 'stop') {
      this.isActive = false;
    }
  }

  process(inputs) {
    if (!this.isActive) {
      return false; // Stop processing when inactive
    }

    const input = inputs[0];
    if (input && input.length > 0) {
      const inputData = input[0];
      this.port.postMessage({ audioData: inputData.buffer }, [inputData.buffer]);
    }

    return true; // Keep processor alive
  }
}

registerProcessor('audio-stream-processor', AudioStreamProcessor);
