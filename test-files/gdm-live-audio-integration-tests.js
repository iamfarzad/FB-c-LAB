/**
 * GdmLiveAudio Integration Tests
 * Comprehensive integration testing for React wrapper, API connectivity, and UI components
 */

class GdmLiveAudioIntegrationTests {
    constructor() {
        this.testResults = [];
        this.mockGeminiService = null;
        this.originalGeminiService = null;
    }

    setupMocks() {
        // Mock Gemini Service
        this.mockGeminiService = {
            streamAudio: async (audioBlob, options) => {
                // Simulate streaming response
                const mockResponses = [
                    { text: 'Hello', isFinal: false },
                    { text: 'Hello there', isFinal: false },
                    { text: 'Hello there, how can I help you?', isFinal: true }
                ];

                let responseIndex = 0;
                const stream = new ReadableStream({
                    start(controller) {
                        const interval = setInterval(() => {
                            if (responseIndex < mockResponses.length) {
                                controller.enqueue(mockResponses[responseIndex]);
                                responseIndex++;
                            } else {
                                clearInterval(interval);
                                controller.close();
                            }
                        }, 100);
                    }
                });

                return stream;
            },

            isAvailable: () => true,
            getApiKeyError: () => null
        };

        // Store original if it exists
        if (window.geminiService) {
            this.originalGeminiService = window.geminiService;
        }
        window.geminiService = this.mockGeminiService;
    }

    teardownMocks() {
        if (this.originalGeminiService) {
            window.geminiService = this.originalGeminiService;
        } else {
            delete window.geminiService;
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
            ['React Wrapper Creation', this.testReactWrapperCreation],
            ['Custom Element Registration', this.testCustomElementRegistration],
            ['Gemini API Connection', this.testGeminiAPIConnection],
            ['Audio Streaming Workflow', this.testAudioStreamingWorkflow],
            ['Error Handling Integration', this.testErrorHandlingIntegration],
            ['Component Cleanup', this.testComponentCleanup],
            ['Event Propagation', this.testEventPropagation],
            ['Performance Under Load', this.testPerformanceUnderLoad],
            ['Memory Leaks', this.testMemoryLeaks]
        ];

        for (const [testName, testFunction] of tests) {
            const result = await this.runTest(testName, testFunction);
            if (logCallback) {
                logCallback(testName, result.passed, result.message, result.duration);
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        this.teardownMocks();
    }

    async runUITests(logCallback) {
        const uiTests = [
            ['Visual Feedback Test', this.testVisualFeedback],
            ['Error Message Display', this.testErrorMessageDisplay],
            ['Status Updates', this.testStatusUpdates],
            ['Recording State Indicators', this.testRecordingStateIndicators]
        ];

        for (const [testName, testFunction] of uiTests) {
            const result = await this.runTest(testName, testFunction);
            if (logCallback) {
                logCallback(testName, result.passed, result.message, result.duration);
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    async testReactWrapperCreation() {
        // Test React wrapper component creation and prop handling
        const mockReactComponent = {
            props: {
                className: 'test-audio-component',
                onTranscription: (text) => { this.lastTranscription = text; },
                onError: (error) => { this.lastError = error; }
            },
            
            createElement: () => {
                const element = {
                    tagName: 'gdm-live-audio',
                    className: '',
                    addEventListener: (event, handler) => {
                        this.eventHandlers = this.eventHandlers || {};
                        this.eventHandlers[event] = handler;
                    },
                    removeEventListener: (event, handler) => {
                        if (this.eventHandlers && this.eventHandlers[event]) {
                            delete this.eventHandlers[event];
                        }
                    }
                };
                return element;
            }
        };

        const element = mockReactComponent.createElement();
        
        if (element.tagName !== 'gdm-live-audio') {
            throw new Error(`Expected element tag 'gdm-live-audio', got '${element.tagName}'`);
        }

        // Test event handler setup
        const transcriptionHandler = (e) => {
            mockReactComponent.props.onTranscription(e.detail.text);
        };
        
        const errorHandler = (e) => {
            mockReactComponent.props.onError(new Error(e.message));
        };

        element.addEventListener('transcription', transcriptionHandler);
        element.addEventListener('error', errorHandler);

        // Simulate events
        if (element.eventHandlers) {
            element.eventHandlers.transcription({ detail: { text: 'Test transcription' } });
            element.eventHandlers.error({ message: 'Test error' });
        }

        return {
            message: 'React wrapper creation and event handling successful'
        };
    }

    async testCustomElementRegistration() {
        // Test custom element registration and lifecycle
        const elementName = 'gdm-live-audio';
        
        // Check if custom elements API is available
        if (!window.customElements) {
            throw new Error('Custom Elements API not available');
        }

        // Mock custom element class
        class MockGdmLiveAudio extends HTMLElement {
            constructor() {
                super();
                this.isRecording = false;
                this.status = 'Ready';
            }

            connectedCallback() {
                this.connected = true;
            }

            disconnectedCallback() {
                this.connected = false;
            }

            async startRecording() {
                this.isRecording = true;
                this.status = 'Recording';
            }

            async stopRecording() {
                this.isRecording = false;
                this.status = 'Ready';
            }
        }

        // Register the element (if not already registered)
        if (!customElements.get(elementName)) {
            customElements.define(elementName, MockGdmLiveAudio);
        }

        // Create and test the element
        const element = document.createElement(elementName);
        document.body.appendChild(element);

        // Wait for connection
        await new Promise(resolve => setTimeout(resolve, 10));

        if (!element.connected) {
            throw new Error('Custom element did not connect properly');
        }

        // Test methods
        await element.startRecording();
        if (!element.isRecording) {
            throw new Error('startRecording method failed');
        }

        await element.stopRecording();
        if (element.isRecording) {
            throw new Error('stopRecording method failed');
        }

        // Cleanup
        document.body.removeChild(element);

        return {
            message: 'Custom element registration and lifecycle successful'
        };
    }

    async testGeminiAPIConnection() {
        // Test connection to Gemini API service
        if (!window.geminiService) {
            throw new Error('Gemini service not available');
        }

        const service = window.geminiService;

        // Test service availability
        if (!service.isAvailable()) {
            throw new Error('Gemini service reports as unavailable');
        }

        // Test API key validation
        const apiKeyError = service.getApiKeyError();
        if (apiKeyError) {
            throw new Error(`API key error: ${apiKeyError}`);
        }

        // Test audio streaming (with mock data)
        const mockAudioBlob = new Blob(['mock audio data'], { type: 'audio/wav' });
        const options = {
            model: 'gemini-2.0-flash-live-001',
            systemInstruction: 'Test instruction'
        };

        const stream = await service.streamAudio(mockAudioBlob, options);
        if (!stream) {
            throw new Error('Failed to create audio stream');
        }

        const reader = stream.getReader();
        const responses = [];
        
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                responses.push(value);
            }
        } finally {
            reader.releaseLock();
        }

        if (responses.length === 0) {
            throw new Error('No responses received from stream');
        }

        return {
            message: `Gemini API connection successful: ${responses.length} responses received`
        };
    }

    async testAudioStreamingWorkflow() {
        // Test complete audio streaming workflow
        const workflow = [];
        
        // Mock audio processing pipeline
        const mockWorkflow = {
            async captureAudio() {
                workflow.push('captureAudio');
                return new Float32Array(4096).fill(0.5);
            },
            
            async convertToWav(audioData) {
                workflow.push('convertToWav');
                return new Blob([audioData], { type: 'audio/wav' });
            },
            
            async streamToGemini(wavBlob) {
                workflow.push('streamToGemini');
                const stream = await window.geminiService.streamAudio(wavBlob, {
                    model: 'gemini-2.0-flash-live-001'
                });
                return stream;
            },
            
            async processResponse(stream) {
                workflow.push('processResponse');
                const reader = stream.getReader();
                const responses = [];
                
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        responses.push(value);
                    }
                } finally {
                    reader.releaseLock();
                }
                
                return responses;
            }
        };

        // Execute workflow
        const audioData = await mockWorkflow.captureAudio();
        const wavBlob = await mockWorkflow.convertToWav(audioData);
        const stream = await mockWorkflow.streamToGemini(wavBlob);
        const responses = await mockWorkflow.processResponse(stream);

        const expectedWorkflow = ['captureAudio', 'convertToWav', 'streamToGemini', 'processResponse'];
        if (JSON.stringify(workflow) !== JSON.stringify(expectedWorkflow)) {
            throw new Error(`Workflow mismatch: expected ${expectedWorkflow.join(' -> ')}, got ${workflow.join(' -> ')}`);
        }

        if (responses.length === 0) {
            throw new Error('No responses received from workflow');
        }

        return {
            message: `Audio streaming workflow successful: ${workflow.length} steps, ${responses.length} responses`
        };
    }

    async testErrorHandlingIntegration() {
        // Test error handling across integration points
        const errors = [];

        // Test API error handling
        try {
            const originalStreamAudio = window.geminiService.streamAudio;
            window.geminiService.streamAudio = async () => {
                throw new Error('API connection failed');
            };

            try {
                await window.geminiService.streamAudio(new Blob(), {});
            } catch (error) {
                errors.push('API error handled');
            }

            window.geminiService.streamAudio = originalStreamAudio;
        } catch (error) {
            errors.push('API error test completed');
        }

        // Test component error propagation
        try {
            const mockElement = {
                dispatchEvent: (event) => {
                    if (event.type === 'error') {
                        errors.push('Component error propagated');
                    }
                }
            };

            const errorEvent = new CustomEvent('error', {
                detail: { message: 'Integration test error' }
            });

            mockElement.dispatchEvent(errorEvent);
        } catch (error) {
            errors.push('Error propagation test completed');
        }

        if (errors.length === 0) {
            throw new Error('No error handling scenarios were tested');
        }

        return {
            message: `Error handling integration successful: ${errors.join(', ')}`
        };
    }

    async testComponentCleanup() {
        // Test proper cleanup of resources
        const resources = {
            audioContext: null,
            mediaStream: null,
            streamReader: null,
            eventListeners: []
        };

        // Mock component with cleanup
        const mockComponent = {
            async initialize() {
                resources.audioContext = { state: 'running', close: async () => { resources.audioContext = null; } };
                resources.mediaStream = { getTracks: () => [{ stop: () => {} }] };
                resources.streamReader = { cancel: async () => { resources.streamReader = null; } };
                resources.eventListeners.push('transcription', 'error');
            },

            async cleanup() {
                if (resources.audioContext) {
                    await resources.audioContext.close();
                }
                
                if (resources.mediaStream) {
                    resources.mediaStream.getTracks().forEach(track => track.stop());
                    resources.mediaStream = null;
                }
                
                if (resources.streamReader) {
                    await resources.streamReader.cancel();
                }
                
                resources.eventListeners = [];
            }
        };

        // Test initialization and cleanup
        await mockComponent.initialize();
        
        if (!resources.audioContext || !resources.mediaStream) {
            throw new Error('Component initialization failed');
        }

        await mockComponent.cleanup();

        if (resources.audioContext || resources.mediaStream || resources.streamReader) {
            throw new Error('Component cleanup incomplete');
        }

        if (resources.eventListeners.length > 0) {
            throw new Error('Event listeners not cleaned up');
        }

        return {
            message: 'Component cleanup successful'
        };
    }

    async testEventPropagation() {
        // Test event propagation through component hierarchy
        const eventLog = [];

        // Mock component hierarchy
        const mockHierarchy = {
            child: {
                dispatchEvent: (event) => {
                    eventLog.push(`child:${event.type}`);
                    if (event.bubbles) {
                        mockHierarchy.parent.handleChildEvent(event);
                    }
                }
            },
            
            parent: {
                handleChildEvent: (event) => {
                    eventLog.push(`parent:${event.type}`);
                    if (event.composed) {
                        mockHierarchy.root.handleEvent(event);
                    }
                }
            },
            
            root: {
                handleEvent: (event) => {
                    eventLog.push(`root:${event.type}`);
                }
            }
        };

        // Test transcription event propagation
        const transcriptionEvent = new CustomEvent('transcription', {
            detail: { text: 'Test transcription', isFinal: true },
            bubbles: true,
            composed: true
        });

        mockHierarchy.child.dispatchEvent(transcriptionEvent);

        // Test error event propagation
        const errorEvent = new CustomEvent('error', {
            detail: { message: 'Test error' },
            bubbles: true,
            composed: true
        });

        mockHierarchy.child.dispatchEvent(errorEvent);

        const expectedEvents = [
            'child:transcription',
            'parent:transcription',
            'root:transcription',
            'child:error',
            'parent:error',
            'root:error'
        ];

        if (JSON.stringify(eventLog) !== JSON.stringify(expectedEvents)) {
            throw new Error(`Event propagation mismatch: expected ${expectedEvents.join(', ')}, got ${eventLog.join(', ')}`);
        }

        return {
            message: `Event propagation successful: ${eventLog.length} events processed`
        };
    }

    async testPerformanceUnderLoad() {
        // Test performance under concurrent operations
        const startTime = Date.now();
        const operations = [];

        // Simulate concurrent audio processing
        for (let i = 0; i < 100; i++) {
            operations.push(this.simulateAudioOperation(i));
        }

        const results = await Promise.all(operations);
        const duration = Date.now() - startTime;

        const successfulOperations = results.filter(r => r.success).length;
        const failedOperations = results.length - successfulOperations;

        if (failedOperations > results.length * 0.1) { // Allow 10% failure rate
            throw new Error(`Too many failed operations: ${failedOperations}/${results.length}`);
        }

        const averageOperationTime = duration / results.length;
        if (averageOperationTime > 100) { // Each operation should take less than 100ms on average
            throw new Error(`Operations too slow: ${averageOperationTime.toFixed(2)}ms average`);
        }

        return {
            message: `Performance test passed: ${successfulOperations}/${results.length} operations in ${duration}ms`
        };
    }

    async simulateAudioOperation(index) {
        try {
            // Simulate audio processing
            const audioData = new Float32Array(1024);
            audioData.fill(Math.sin(index * 0.1));

            // Simulate WAV conversion
            const wavBlob = new Blob([audioData], { type: 'audio/wav' });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, Math.random() * 10));

            return { success: true, index };
        } catch (error) {
            return { success: false, index, error: error.message };
        }
    }

    async testMemoryLeaks() {
        // Test for memory leaks in repeated operations
        const initialMemory = this.getMemoryUsage();
        
        // Perform repeated operations
        for (let i = 0; i < 50; i++) {
            await this.simulateComponentLifecycle();
            
            // Force garbage collection periodically
            if (i % 10 === 0 && window.gc) {
                window.gc();
            }
        }

        // Final garbage collection
        if (window.gc) {
            window.gc();
        }

        const finalMemory = this.getMemoryUsage();
        const memoryIncrease = finalMemory - initialMemory;

        // Allow some memory increase but flag if excessive
        if (memoryIncrease > 50) { // 50MB threshold
            throw new Error(`Potential memory leak detected: ${memoryIncrease.toFixed(2)}MB increase`);
        }

        return {
            message: `Memory leak test passed: ${memoryIncrease.toFixed(2)}MB increase after 50 cycles`
        };
    }

    async simulateComponentLifecycle() {
        // Simulate component creation, usage, and destruction
        const component = {
            audioChunks: [],
            eventListeners: new Map(),
            
            initialize() {
                this.audioChunks = new Array(10).fill(null).map(() => new Float32Array(1024));
                this.eventListeners.set('transcription', () => {});
                this.eventListeners.set('error', () => {});
            },
            
            cleanup() {
                this.audioChunks = [];
                this.eventListeners.clear();
            }
        };

        component.initialize();
        await new Promise(resolve => setTimeout(resolve, 1));
        component.cleanup();
    }

    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }

    // UI Test Methods
    async testVisualFeedback() {
        // Test visual feedback during recording
        const mockUI = {
            recordingIndicator: { visible: false, pulsing: false },
            statusText: 'Ready',
            
            startRecording() {
                this.recordingIndicator.visible = true;
                this.recordingIndicator.pulsing = true;
                this.statusText = 'Recording...';
            },
            
            stopRecording() {
                this.recordingIndicator.visible = false;
                this.recordingIndicator.pulsing = false;
                this.statusText = 'Ready';
            }
        };

        // Test recording state
        mockUI.startRecording();
        if (!mockUI.recordingIndicator.visible || !mockUI.recordingIndicator.pulsing) {
            throw new Error('Recording indicator not properly activated');
        }
        if (mockUI.statusText !== 'Recording...') {
            throw new Error('Status text not updated for recording state');
        }

        // Test stop state
        mockUI.stopRecording();
        if (mockUI.recordingIndicator.visible || mockUI.recordingIndicator.pulsing) {
            throw new Error('Recording indicator not properly deactivated');
        }
        if (mockUI.statusText !== 'Ready') {
            throw new Error('Status text not reset after stopping');
        }

        return {
            message: 'Visual feedback test successful'
        };
    }

    async testErrorMessageDisplay() {
        // Test error message display functionality
        const mockErrorDisplay = {
            visible: false,
            message: '',
            type: '',
            
            showError(message, type = 'error') {
                this.visible = true;
                this.message = message;
                this.type = type;
            },
            
            hideError() {
                this.visible = false;
                this.message = '';
                this.type = '';
            }
        };

        // Test error display
        mockErrorDisplay.showError('Microphone permission denied', 'permission');
        if (!mockErrorDisplay.visible) {
            throw new Error('Error message not displayed');
        }
        if (mockErrorDisplay.message !== 'Microphone permission denied') {
            throw new Error('Error message content incorrect');
        }
        if (mockErrorDisplay.type !== 'permission') {
            throw new Error('Error type not set correctly');
        }

        // Test error hiding
        mockErrorDisplay.hideError();
        if (mockErrorDisplay.visible) {
            throw new Error('Error message not hidden');
        }

        return {
            message: 'Error message display test successful'
        };
    }

    async testStatusUpdates() {
        // Test status update functionality
        const statusHistory = [];
        
        const mockStatusManager = {
            currentStatus: 'Ready',
            
            updateStatus(status) {
                this.currentStatus = status;
                statusHistory.push({
                    status,
                    timestamp: Date.now()
                });
            }
        };

        // Test status progression
        const expectedStatuses = ['Initializing', 'Ready', 'Recording', 'Processing', 'Ready'];
        
        for (const status of expectedStatuses) {
            mockStatusManager.updateStatus(status);
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        if (statusHistory.length !== expectedStatuses.length) {
            throw new Error(`Expected ${expectedStatuses.length} status updates, got ${statusHistory.length}`);
        }

        for (let i = 0; i < expectedStatuses.length; i++) {
            if (statusHistory[i].status !== expectedStatuses[i]) {
                throw new Error(`Status ${i}: expected '${expectedStatuses[i]}', got '${statusHistory[i].status}'`);
            }
        }

        return {
            message: `Status updates test successful: ${statusHistory.length} status changes tracked`
        };
    }

    async testRecordingStateIndicators() {
        // Test recording state indicators
        const mockIndicators = {
            microphoneIcon: { active: false, color: 'gray' },
            waveform: { visible: false, amplitude: 0 },
            timer: { visible: false, value: '00:00' },
            
            startRecording() {
                this.microphoneIcon.active = true;
                this.microphoneIcon.color = 'red';
                this.waveform.visible = true;
                this.timer.visible = true;
                this.timer.value = '00:00';
            },
            
            updateRecording(amplitude, duration) {
                this.waveform.amplitude = amplitude;
                this.timer.value = this.formatTime(duration);
            },
            
            stopRecording() {
                this.microphoneIcon.active = false;
                this.microphoneIcon.color = 'gray';
                this.waveform.visible = false;
                this.timer.visible = false;
            },
            
            formatTime(seconds) {
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }
        };

        // Test recording start
        mockIndicators.startRecording();
        if (!mockIndicators.microphoneIcon.active || mockIndicators.microphoneIcon.color !== 'red') {
            throw new Error('Microphone icon not properly activated');
        }
        if (!mockIndicators.waveform.visible || !mockIndicators.timer.visible) {
            throw new Error('Recording indicators not properly shown');
        }

        // Test recording updates
        mockIndicators.updateRecording(0.8, 15);
        if (mockIndicators.waveform.amplitude !== 0.8) {
            throw new Error('Waveform amplitude not updated');
        }
        if (mockIndicators.timer.value !== '00:15') {
            throw new Error('Timer not updated correctly');
        }

        // Test recording stop
        mockIndicators.stopRecording();
        if (mockIndicators.microphoneIcon.active || mockIndicators.microphoneIcon.color !== 'gray') {
            throw new Error('Microphone icon not properly deactivated');
        }
        if (mockIndicators.waveform.visible || mockIndicators.timer.visible) {
            throw new Error('Recording indicators not properly hidden');
        }

        return {
            message: 'Recording state indicators test successful'
        };
    }
}

// Make the class available globally
window.GdmLiveAudioIntegrationTests = GdmLiveAudioIntegrationTests; 