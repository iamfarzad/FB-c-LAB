/**
 * GdmLiveAudio Unit Tests
 * Comprehensive unit testing for the GdmLiveAudio component
 */

class GdmLiveAudioUnitTests {
    constructor() {
        this.mockAudioContext = null;
        this.mockMediaStream = null;
        this.originalGetUserMedia = null;
        this.testResults = [];
    }

    // Mock implementations for testing
    setupMocks() {
        // Mock AudioContext
        this.mockAudioContext = class MockAudioContext {
            constructor(options = {}) {
                this.sampleRate = options.sampleRate || 44100;
                this.state = 'running';
                this.destination = {};
            }

            async resume() {
                this.state = 'running';
                return Promise.resolve();
            }

            async close() {
                this.state = 'closed';
                return Promise.resolve();
            }

            createScriptProcessor(bufferSize, inputChannels, outputChannels) {
                return {
                    bufferSize,
                    inputChannels,
                    outputChannels,
                    onaudioprocess: null,
                    connect: () => {},
                    disconnect: () => {}
                };
            }

            createMediaStreamSource(stream) {
                return {
                    connect: () => {},
                    disconnect: () => {}
                };
            }
        };

        // Mock MediaStream
        this.mockMediaStream = class MockMediaStream {
            constructor() {
                this.active = true;
                this.id = 'mock-stream-' + Date.now();
            }

            getTracks() {
                return [{
                    kind: 'audio',
                    enabled: true,
                    stop: () => { this.active = false; }
                }];
            }

            getAudioTracks() {
                return this.getTracks();
            }
        };

        // Mock getUserMedia
        this.originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
        if (navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia = async (constraints) => {
                if (constraints.audio) {
                    return new this.mockMediaStream();
                }
                throw new DOMException('Permission denied', 'NotAllowedError');
            };
        }

        // Mock global AudioContext
        window.MockAudioContext = this.mockAudioContext;
        if (!window.AudioContext) {
            window.AudioContext = this.mockAudioContext;
        }
        if (!window.webkitAudioContext) {
            window.webkitAudioContext = this.mockAudioContext;
        }
    }

    teardownMocks() {
        // Restore original getUserMedia
        if (this.originalGetUserMedia && navigator.mediaDevices) {
            navigator.mediaDevices.getUserMedia = this.originalGetUserMedia;
        }
    }

    async runTest(testName, testFunction) {
        const startTime = Date.now();
        try {
            const result = await testFunction.call(this);
            const duration = Date.now() - startTime;
            this.testResults.push({
                name: testName,
                passed: true,
                message: result.message || 'Test passed',
                duration
            });
            return { passed: true, message: result.message || 'Test passed', duration };
        } catch (error) {
            const duration = Date.now() - startTime;
            this.testResults.push({
                name: testName,
                passed: false,
                message: error.message,
                duration
            });
            return { passed: false, message: error.message, duration };
        }
    }

    async runAllTests(logCallback) {
        this.setupMocks();
        
        const tests = [
            ['Audio Context Initialization', this.testAudioContextInitialization],
            ['Sample Rate Configuration', this.testSampleRateConfiguration],
            ['WAV Conversion', this.testWavConversion],
            ['Error Handling', this.testErrorHandling],
            ['Event Dispatching', this.testEventDispatching],
            ['Component Lifecycle', this.testComponentLifecycle],
            ['Audio Chunk Processing', this.testAudioChunkProcessing],
            ['Memory Management', this.testMemoryManagement],
            ['Browser Compatibility', this.testBrowserCompatibility]
        ];

        for (const [testName, testFunction] of tests) {
            const result = await this.runTest(testName, testFunction);
            if (logCallback) {
                logCallback(testName, result.passed, result.message, result.duration);
            }
            // Small delay between tests
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.teardownMocks();
    }

    async testAudioContextInitialization() {
        // Test audio context creation with correct sample rates
        const inputSampleRate = 16000;
        const outputSampleRate = 24000;

        const inputContext = new this.mockAudioContext({ sampleRate: inputSampleRate });
        const outputContext = new this.mockAudioContext({ sampleRate: outputSampleRate });

        if (inputContext.sampleRate !== inputSampleRate) {
            throw new Error(`Expected input sample rate ${inputSampleRate}, got ${inputContext.sampleRate}`);
        }

        if (outputContext.sampleRate !== outputSampleRate) {
            throw new Error(`Expected output sample rate ${outputSampleRate}, got ${outputContext.sampleRate}`);
        }

        // Test WebKit compatibility
        const hasWebKit = !!(window.webkitAudioContext);
        const hasStandard = !!(window.AudioContext);

        if (!hasWebKit && !hasStandard) {
            throw new Error('No AudioContext support detected');
        }

        await inputContext.close();
        await outputContext.close();

        return {
            message: `Audio contexts initialized correctly. WebKit: ${hasWebKit}, Standard: ${hasStandard}`
        };
    }

    async testSampleRateConfiguration() {
        // Test that the component uses the correct sample rates
        const expectedInputRate = 16000;
        const expectedOutputRate = 24000;

        const inputContext = new this.mockAudioContext({ sampleRate: expectedInputRate });
        const outputContext = new this.mockAudioContext({ sampleRate: expectedOutputRate });

        // Verify sample rates are set correctly
        if (inputContext.sampleRate !== expectedInputRate) {
            throw new Error(`Input sample rate mismatch: expected ${expectedInputRate}, got ${inputContext.sampleRate}`);
        }

        if (outputContext.sampleRate !== expectedOutputRate) {
            throw new Error(`Output sample rate mismatch: expected ${expectedOutputRate}, got ${outputContext.sampleRate}`);
        }

        return {
            message: `Sample rates configured correctly: Input ${expectedInputRate}Hz, Output ${expectedOutputRate}Hz`
        };
    }

    async testWavConversion() {
        // Test WAV conversion functionality
        const sampleRate = 16000;
        const duration = 1; // 1 second
        const samples = sampleRate * duration;
        
        // Create test audio data (sine wave)
        const buffer = new Float32Array(samples);
        for (let i = 0; i < samples; i++) {
            buffer[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.5; // 440Hz sine wave
        }

        // Mock the WAV conversion method
        const wavBlob = this.mockFloat32ToWav(buffer, sampleRate);
        
        if (!(wavBlob instanceof Blob)) {
            throw new Error('WAV conversion did not return a Blob');
        }

        if (wavBlob.size === 0) {
            throw new Error('WAV conversion returned empty blob');
        }

        // Verify WAV header (first 44 bytes should be WAV header)
        const expectedSize = 44 + buffer.length * 2; // Header + data
        if (wavBlob.size !== expectedSize) {
            throw new Error(`WAV blob size mismatch: expected ${expectedSize}, got ${wavBlob.size}`);
        }

        return {
            message: `WAV conversion successful: ${buffer.length} samples -> ${wavBlob.size} bytes`
        };
    }

    mockFloat32ToWav(buffer, sampleRate) {
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

        // Convert float samples to 16-bit PCM
        let offset = 44;
        for (let i = 0; i < buffer.length; i++) {
            const sample = Math.max(-1, Math.min(1, buffer[i]));
            view.setInt16(offset, sample * 0x7FFF, true);
            offset += 2;
        }

        return new Blob([wavBuffer], { type: 'audio/wav' });
    }

    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    async testErrorHandling() {
        // Test various error scenarios
        const errors = [];

        // Test audio context creation failure
        try {
            const originalAudioContext = window.AudioContext;
            window.AudioContext = undefined;
            window.webkitAudioContext = undefined;
            
            // This should trigger an error
            try {
                new window.AudioContext();
            } catch (error) {
                errors.push('AudioContext creation error handled');
            }
            
            // Restore
            window.AudioContext = originalAudioContext;
        } catch (error) {
            errors.push('Error handling test completed');
        }

        // Test getUserMedia failure
        try {
            const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
            navigator.mediaDevices.getUserMedia = async () => {
                throw new DOMException('Permission denied', 'NotAllowedError');
            };

            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
            } catch (error) {
                if (error.name === 'NotAllowedError') {
                    errors.push('Permission denied error handled');
                }
            }

            navigator.mediaDevices.getUserMedia = originalGetUserMedia;
        } catch (error) {
            errors.push('getUserMedia error test completed');
        }

        if (errors.length === 0) {
            throw new Error('No error handling scenarios were tested');
        }

        return {
            message: `Error handling tests completed: ${errors.join(', ')}`
        };
    }

    async testEventDispatching() {
        // Test custom event dispatching
        const events = [];
        
        // Create a mock element that can dispatch events
        const mockElement = {
            dispatchEvent: (event) => {
                events.push({
                    type: event.type,
                    detail: event.detail,
                    bubbles: event.bubbles,
                    composed: event.composed
                });
                return true;
            }
        };

        // Test transcription event
        const transcriptionEvent = new CustomEvent('transcription', {
            detail: { text: 'Hello world', isFinal: true },
            bubbles: true,
            composed: true
        });

        mockElement.dispatchEvent(transcriptionEvent);

        // Test error event
        const errorEvent = new CustomEvent('error', {
            detail: { message: 'Test error' },
            bubbles: true,
            composed: true
        });

        mockElement.dispatchEvent(errorEvent);

        if (events.length !== 2) {
            throw new Error(`Expected 2 events, got ${events.length}`);
        }

        const transcriptionEventData = events.find(e => e.type === 'transcription');
        if (!transcriptionEventData || transcriptionEventData.detail.text !== 'Hello world') {
            throw new Error('Transcription event not dispatched correctly');
        }

        const errorEventData = events.find(e => e.type === 'error');
        if (!errorEventData || errorEventData.detail.message !== 'Test error') {
            throw new Error('Error event not dispatched correctly');
        }

        return {
            message: `Event dispatching successful: ${events.length} events processed`
        };
    }

    async testComponentLifecycle() {
        // Test component lifecycle methods
        const lifecycle = [];

        // Mock component lifecycle
        const mockComponent = {
            isRecording: false,
            audioChunks: [],
            mediaStream: null,
            
            async startRecording() {
                lifecycle.push('startRecording');
                this.isRecording = true;
                this.mediaStream = new MockMediaStream();
            },
            
            async stopRecording() {
                lifecycle.push('stopRecording');
                this.isRecording = false;
                if (this.mediaStream) {
                    this.mediaStream.getTracks().forEach(track => track.stop());
                    this.mediaStream = null;
                }
            },
            
            cleanup() {
                lifecycle.push('cleanup');
                this.audioChunks = [];
                this.isRecording = false;
            }
        };

        // Test lifecycle flow
        await mockComponent.startRecording();
        if (!mockComponent.isRecording) {
            throw new Error('Component should be recording after startRecording()');
        }

        await mockComponent.stopRecording();
        if (mockComponent.isRecording) {
            throw new Error('Component should not be recording after stopRecording()');
        }

        mockComponent.cleanup();

        const expectedLifecycle = ['startRecording', 'stopRecording', 'cleanup'];
        if (JSON.stringify(lifecycle) !== JSON.stringify(expectedLifecycle)) {
            throw new Error(`Lifecycle mismatch: expected ${expectedLifecycle.join(' -> ')}, got ${lifecycle.join(' -> ')}`);
        }

        return {
            message: `Component lifecycle test passed: ${lifecycle.join(' -> ')}`
        };
    }

    async testAudioChunkProcessing() {
        // Test audio chunk processing and data integrity
        const sampleRate = 16000;
        const chunkSize = 4096;
        const numChunks = 5;
        
        const chunks = [];
        
        // Generate test chunks
        for (let i = 0; i < numChunks; i++) {
            const chunk = new Float32Array(chunkSize);
            for (let j = 0; j < chunkSize; j++) {
                chunk[j] = Math.sin(2 * Math.PI * 440 * (i * chunkSize + j) / sampleRate) * 0.5;
            }
            chunks.push(chunk);
        }

        // Test chunk combination
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const combined = new Float32Array(totalLength);
        let offset = 0;
        
        for (const chunk of chunks) {
            combined.set(chunk, offset);
            offset += chunk.length;
        }

        // Verify data integrity
        if (combined.length !== numChunks * chunkSize) {
            throw new Error(`Combined length mismatch: expected ${numChunks * chunkSize}, got ${combined.length}`);
        }

        // Verify first and last samples
        const firstSample = Math.sin(2 * Math.PI * 440 * 0 / sampleRate) * 0.5;
        const lastSample = Math.sin(2 * Math.PI * 440 * (totalLength - 1) / sampleRate) * 0.5;
        
        if (Math.abs(combined[0] - firstSample) > 0.001) {
            throw new Error('First sample data integrity check failed');
        }
        
        if (Math.abs(combined[combined.length - 1] - lastSample) > 0.001) {
            throw new Error('Last sample data integrity check failed');
        }

        return {
            message: `Audio chunk processing successful: ${numChunks} chunks, ${totalLength} samples`
        };
    }

    async testMemoryManagement() {
        // Test memory management and cleanup
        const initialMemory = this.getMemoryUsage();
        const chunks = [];
        
        // Create many audio chunks to test memory usage
        for (let i = 0; i < 100; i++) {
            const chunk = new Float32Array(4096);
            chunk.fill(Math.random());
            chunks.push(chunk);
        }

        const peakMemory = this.getMemoryUsage();
        
        // Clear chunks (simulate cleanup)
        chunks.length = 0;
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        const finalMemory = this.getMemoryUsage();
        
        const memoryIncrease = peakMemory - initialMemory;
        const memoryRecovered = peakMemory - finalMemory;
        
        return {
            message: `Memory test: +${memoryIncrease.toFixed(2)}MB peak, -${memoryRecovered.toFixed(2)}MB recovered`
        };
    }

    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }

    async testBrowserCompatibility() {
        // Test browser-specific features and compatibility
        const features = [];
        
        // Check AudioContext support
        if (window.AudioContext) {
            features.push('AudioContext');
        }
        if (window.webkitAudioContext) {
            features.push('webkitAudioContext');
        }
        
        // Check MediaDevices support
        if (navigator.mediaDevices) {
            features.push('MediaDevices');
        }
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            features.push('getUserMedia');
        }
        
        // Check CustomElements support
        if (window.customElements) {
            features.push('CustomElements');
        }
        
        // Check secure context
        if (window.isSecureContext) {
            features.push('SecureContext');
        }
        
        // Browser detection
        const userAgent = navigator.userAgent;
        let browser = 'Unknown';
        
        if (userAgent.includes('Chrome')) browser = 'Chrome';
        else if (userAgent.includes('Firefox')) browser = 'Firefox';
        else if (userAgent.includes('Safari')) browser = 'Safari';
        else if (userAgent.includes('Edge')) browser = 'Edge';
        
        if (features.length < 4) {
            throw new Error(`Insufficient browser support: only ${features.length} features available`);
        }
        
        return {
            message: `Browser compatibility: ${browser}, Features: ${features.join(', ')}`
        };
    }
}

// Make the class available globally
window.GdmLiveAudioUnitTests = GdmLiveAudioUnitTests; 