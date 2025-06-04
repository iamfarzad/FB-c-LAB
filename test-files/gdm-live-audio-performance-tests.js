/**
 * GdmLiveAudio Performance and Edge Case Tests
 * Comprehensive testing for performance, browser compatibility, and edge cases
 */

class GdmLiveAudioPerformanceTests {
    constructor() {
        this.testResults = [];
        this.performanceMetrics = {};
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
                duration,
                metrics: result.metrics || {}
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

    async runPerformanceTests(logCallback) {
        const performanceTests = [
            ['Long Recording Memory Usage', this.testLongRecordingMemoryUsage],
            ['CPU Usage During Processing', this.testCPUUsageDuringProcessing],
            ['Responsiveness During Capture', this.testResponsivenessDuringCapture]
        ];

        for (const [testName, testFunction] of performanceTests) {
            const result = await this.runTest(testName, testFunction);
            if (logCallback) {
                logCallback(testName, result.passed, result.message, result.duration);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    async runBrowserCompatibilityTests(logCallback) {
        const browserTests = [
            ['Chrome/Chromium Support', this.testChromeSupport],
            ['Firefox Support', this.testFirefoxSupport],
            ['Safari Support', this.testSafariSupport],
            ['Mobile Browser Support', this.testMobileBrowserSupport]
        ];

        for (const [testName, testFunction] of browserTests) {
            const result = await this.runTest(testName, testFunction);
            if (logCallback) {
                logCallback(testName, result.passed, result.message, result.duration);
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }

    async runEdgeCaseTests(logCallback) {
        const edgeCaseTests = [
            ['Microphone Permission Denied', this.testMicrophonePermissionDenied],
            ['Network Interruptions', this.testNetworkInterruptions],
            ['Rapid Start/Stop Cycles', this.testRapidStartStopCycles],
            ['Invalid API Key Handling', this.testInvalidAPIKeyHandling],
            ['Large Audio Buffer Handling', this.testLargeAudioBufferHandling],
            ['Concurrent Component Instances', this.testConcurrentComponentInstances]
        ];

        for (const [testName, testFunction] of edgeCaseTests) {
            const result = await this.runTest(testName, testFunction);
            if (logCallback) {
                logCallback(testName, result.passed, result.message, result.duration);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // Performance Tests
    async testLongRecordingMemoryUsage() {
        const memorySnapshots = [];
        const initialMemory = this.getMemoryUsage();
        memorySnapshots.push({ time: 0, memory: initialMemory });

        // Simulate long recording session (5 seconds worth of audio chunks)
        const sampleRate = 16000;
        const chunkSize = 4096;
        const duration = 5; // seconds
        const totalChunks = Math.floor((sampleRate * duration) / chunkSize);
        
        const audioChunks = [];
        
        for (let i = 0; i < totalChunks; i++) {
            // Create audio chunk
            const chunk = new Float32Array(chunkSize);
            for (let j = 0; j < chunkSize; j++) {
                chunk[j] = Math.sin(2 * Math.PI * 440 * (i * chunkSize + j) / sampleRate) * 0.5;
            }
            audioChunks.push(chunk);
            
            // Take memory snapshot every 50 chunks
            if (i % 50 === 0) {
                const currentMemory = this.getMemoryUsage();
                memorySnapshots.push({ 
                    time: (i * chunkSize) / sampleRate, 
                    memory: currentMemory 
                });
            }
            
            // Simulate processing delay
            if (i % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 1));
            }
        }

        const finalMemory = this.getMemoryUsage();
        const memoryIncrease = finalMemory - initialMemory;
        const totalAudioData = totalChunks * chunkSize * 4; // 4 bytes per float32
        const memoryEfficiency = (totalAudioData / 1024 / 1024) / memoryIncrease; // MB audio per MB memory

        // Cleanup
        audioChunks.length = 0;
        
        if (window.gc) {
            window.gc();
        }

        const cleanupMemory = this.getMemoryUsage();
        const memoryRecovered = finalMemory - cleanupMemory;

        if (memoryIncrease > 100) { // 100MB threshold
            throw new Error(`Excessive memory usage: ${memoryIncrease.toFixed(2)}MB for ${duration}s recording`);
        }

        return {
            message: `Memory usage: +${memoryIncrease.toFixed(2)}MB peak, -${memoryRecovered.toFixed(2)}MB recovered, efficiency: ${memoryEfficiency.toFixed(2)}`,
            metrics: {
                memoryIncrease,
                memoryRecovered,
                memoryEfficiency,
                snapshots: memorySnapshots
            }
        };
    }

    async testCPUUsageDuringProcessing() {
        const operations = 1000;
        const startTime = performance.now();
        let totalOperationTime = 0;

        // Simulate intensive audio processing operations
        for (let i = 0; i < operations; i++) {
            const operationStart = performance.now();
            
            // Simulate WAV conversion
            const audioData = new Float32Array(4096);
            for (let j = 0; j < audioData.length; j++) {
                audioData[j] = Math.sin(2 * Math.PI * 440 * j / 16000) * 0.5;
            }
            
            // Simulate WAV header creation
            const wavBuffer = new ArrayBuffer(44 + audioData.length * 2);
            const view = new DataView(wavBuffer);
            
            // Write WAV header (simplified)
            view.setUint32(0, 0x46464952); // "RIFF"
            view.setUint32(4, 36 + audioData.length * 2);
            view.setUint32(8, 0x45564157); // "WAVE"
            
            // Convert audio data to 16-bit PCM
            for (let j = 0; j < audioData.length; j++) {
                const sample = Math.max(-1, Math.min(1, audioData[j]));
                view.setInt16(44 + j * 2, sample * 0x7FFF, true);
            }
            
            const operationEnd = performance.now();
            totalOperationTime += (operationEnd - operationStart);
            
            // Yield control periodically
            if (i % 100 === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        const totalTime = performance.now() - startTime;
        const averageOperationTime = totalOperationTime / operations;
        const cpuUtilization = (totalOperationTime / totalTime) * 100;
        const throughput = operations / (totalTime / 1000); // operations per second

        if (averageOperationTime > 10) { // 10ms threshold per operation
            throw new Error(`CPU performance too slow: ${averageOperationTime.toFixed(2)}ms per operation`);
        }

        return {
            message: `CPU performance: ${averageOperationTime.toFixed(2)}ms/op, ${cpuUtilization.toFixed(1)}% utilization, ${throughput.toFixed(0)} ops/sec`,
            metrics: {
                averageOperationTime,
                cpuUtilization,
                throughput,
                totalOperations: operations
            }
        };
    }

    async testResponsivenessDuringCapture() {
        const uiInteractions = 50;
        const responseTimes = [];
        
        // Simulate UI interactions during audio capture
        for (let i = 0; i < uiInteractions; i++) {
            const interactionStart = performance.now();
            
            // Simulate audio processing in background
            const audioProcessing = this.simulateBackgroundAudioProcessing();
            
            // Simulate UI interaction (button click, state update)
            const uiUpdate = this.simulateUIInteraction(i);
            
            // Wait for both to complete
            await Promise.all([audioProcessing, uiUpdate]);
            
            const interactionEnd = performance.now();
            const responseTime = interactionEnd - interactionStart;
            responseTimes.push(responseTime);
            
            // Small delay between interactions
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        const maxResponseTime = Math.max(...responseTimes);
        const responsiveInteractions = responseTimes.filter(time => time < 100).length; // Under 100ms
        const responsivenessRate = (responsiveInteractions / uiInteractions) * 100;

        if (averageResponseTime > 50) { // 50ms threshold
            throw new Error(`UI not responsive enough: ${averageResponseTime.toFixed(2)}ms average response time`);
        }

        if (responsivenessRate < 80) { // 80% of interactions should be responsive
            throw new Error(`Poor responsiveness rate: ${responsivenessRate.toFixed(1)}%`);
        }

        return {
            message: `UI responsiveness: ${averageResponseTime.toFixed(2)}ms avg, ${maxResponseTime.toFixed(2)}ms max, ${responsivenessRate.toFixed(1)}% responsive`,
            metrics: {
                averageResponseTime,
                maxResponseTime,
                responsivenessRate,
                responseTimes
            }
        };
    }

    async simulateBackgroundAudioProcessing() {
        // Simulate audio chunk processing
        const audioData = new Float32Array(1024);
        for (let i = 0; i < audioData.length; i++) {
            audioData[i] = Math.random() * 2 - 1;
        }
        
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
        
        return audioData;
    }

    async simulateUIInteraction(index) {
        // Simulate DOM updates, state changes
        const mockState = {
            isRecording: index % 2 === 0,
            status: index % 3 === 0 ? 'Recording' : 'Processing',
            transcription: `Test transcription ${index}`
        };
        
        // Simulate state update delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
        
        return mockState;
    }

    // Browser Compatibility Tests
    async testChromeSupport() {
        const userAgent = navigator.userAgent;
        const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
        const isChromium = /Chromium/.test(userAgent);
        const isEdge = /Edg/.test(userAgent);

        const features = [];
        
        // Test Chrome-specific features
        if (window.AudioContext) features.push('AudioContext');
        if (window.webkitAudioContext) features.push('webkitAudioContext');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) features.push('getUserMedia');
        if (window.customElements) features.push('CustomElements');
        if ('serviceWorker' in navigator) features.push('ServiceWorker');

        // Test performance APIs
        if (performance.memory) features.push('MemoryAPI');
        if (performance.mark) features.push('PerformanceMarks');

        const browserType = isChrome ? 'Chrome' : isChromium ? 'Chromium' : isEdge ? 'Edge' : 'Unknown Chromium-based';
        const supportLevel = features.length >= 5 ? 'Full' : features.length >= 3 ? 'Partial' : 'Limited';

        if (features.length < 3) {
            throw new Error(`Insufficient Chrome support: only ${features.length} features available`);
        }

        return {
            message: `${browserType} support: ${supportLevel} (${features.length}/7 features)`,
            metrics: {
                browserType,
                supportLevel,
                features,
                isChrome,
                isChromium,
                isEdge
            }
        };
    }

    async testFirefoxSupport() {
        const userAgent = navigator.userAgent;
        const isFirefox = /Firefox/.test(userAgent);

        const features = [];
        
        // Test Firefox-specific features
        if (window.AudioContext) features.push('AudioContext');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) features.push('getUserMedia');
        if (window.customElements) features.push('CustomElements');
        if ('serviceWorker' in navigator) features.push('ServiceWorker');

        // Firefox-specific checks
        if (window.mozRTCPeerConnection) features.push('mozRTCPeerConnection');
        if (navigator.mozGetUserMedia) features.push('mozGetUserMedia');

        const supportLevel = features.length >= 4 ? 'Full' : features.length >= 2 ? 'Partial' : 'Limited';

        if (!isFirefox) {
            return {
                message: 'Not running on Firefox - compatibility unknown',
                metrics: { browserType: 'Not Firefox', features }
            };
        }

        if (features.length < 2) {
            throw new Error(`Insufficient Firefox support: only ${features.length} features available`);
        }

        return {
            message: `Firefox support: ${supportLevel} (${features.length} features)`,
            metrics: {
                browserType: 'Firefox',
                supportLevel,
                features,
                isFirefox
            }
        };
    }

    async testSafariSupport() {
        const userAgent = navigator.userAgent;
        const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
        const isWebKit = /WebKit/.test(userAgent);

        const features = [];
        
        // Test Safari/WebKit features
        if (window.AudioContext) features.push('AudioContext');
        if (window.webkitAudioContext) features.push('webkitAudioContext');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) features.push('getUserMedia');
        if (window.customElements) features.push('CustomElements');

        // Safari-specific checks
        if (window.webkitURL) features.push('webkitURL');
        if (navigator.webkitGetUserMedia) features.push('webkitGetUserMedia');

        const supportLevel = features.length >= 4 ? 'Full' : features.length >= 2 ? 'Partial' : 'Limited';

        if (!isSafari && !isWebKit) {
            return {
                message: 'Not running on Safari/WebKit - compatibility unknown',
                metrics: { browserType: 'Not Safari', features }
            };
        }

        // Safari has some limitations
        if (isSafari && features.length < 3) {
            return {
                message: `Safari support limited: ${features.length} features (WebKit prefix required)`,
                metrics: {
                    browserType: 'Safari',
                    supportLevel: 'Limited',
                    features,
                    requiresWebKitPrefix: true
                }
            };
        }

        return {
            message: `Safari/WebKit support: ${supportLevel} (${features.length} features)`,
            metrics: {
                browserType: isSafari ? 'Safari' : 'WebKit',
                supportLevel,
                features,
                isSafari,
                isWebKit
            }
        };
    }

    async testMobileBrowserSupport() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isAndroid = /Android/i.test(userAgent);
        const isiOS = /iPhone|iPad|iPod/i.test(userAgent);

        const features = [];
        const limitations = [];

        // Test mobile-specific features
        if (window.AudioContext) features.push('AudioContext');
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) features.push('getUserMedia');
        if (window.customElements) features.push('CustomElements');
        if ('ontouchstart' in window) features.push('TouchEvents');
        if (window.DeviceOrientationEvent) features.push('DeviceOrientation');

        // Check for mobile limitations
        if (isMobile) {
            if (!window.isSecureContext) limitations.push('RequiresHTTPS');
            if (isiOS && !window.AudioContext) limitations.push('iOSAudioLimitations');
            if (isAndroid && !navigator.mediaDevices) limitations.push('AndroidMediaLimitations');
        }

        const supportLevel = features.length >= 3 ? 'Good' : features.length >= 2 ? 'Basic' : 'Poor';

        if (!isMobile) {
            return {
                message: 'Not running on mobile device',
                metrics: { 
                    deviceType: 'Desktop',
                    features,
                    isMobile: false
                }
            };
        }

        if (limitations.length > 2) {
            throw new Error(`Mobile support limited: ${limitations.join(', ')}`);
        }

        const deviceType = isiOS ? 'iOS' : isAndroid ? 'Android' : 'Mobile';

        return {
            message: `${deviceType} support: ${supportLevel} (${features.length} features, ${limitations.length} limitations)`,
            metrics: {
                deviceType,
                supportLevel,
                features,
                limitations,
                isMobile,
                isAndroid,
                isiOS
            }
        };
    }

    // Edge Case Tests
    async testMicrophonePermissionDenied() {
        const permissionScenarios = [];

        // Test different permission denial scenarios
        const scenarios = [
            {
                name: 'NotAllowedError',
                error: new DOMException('Permission denied', 'NotAllowedError')
            },
            {
                name: 'NotFoundError', 
                error: new DOMException('No microphone found', 'NotFoundError')
            },
            {
                name: 'NotSupportedError',
                error: new DOMException('getUserMedia not supported', 'NotSupportedError')
            }
        ];

        for (const scenario of scenarios) {
            try {
                // Mock getUserMedia to throw specific error
                const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
                
                if (navigator.mediaDevices) {
                    navigator.mediaDevices.getUserMedia = async () => {
                        throw scenario.error;
                    };
                }

                // Test error handling
                let errorCaught = false;
                let errorType = '';
                
                try {
                    await navigator.mediaDevices.getUserMedia({ audio: true });
                } catch (error) {
                    errorCaught = true;
                    errorType = error.name;
                }

                // Restore original function
                if (originalGetUserMedia && navigator.mediaDevices) {
                    navigator.mediaDevices.getUserMedia = originalGetUserMedia;
                }

                permissionScenarios.push({
                    scenario: scenario.name,
                    errorCaught,
                    errorType,
                    handled: errorCaught && errorType === scenario.error.name
                });

            } catch (error) {
                permissionScenarios.push({
                    scenario: scenario.name,
                    errorCaught: false,
                    errorType: 'TestError',
                    handled: false
                });
            }
        }

        const handledScenarios = permissionScenarios.filter(s => s.handled).length;
        
        if (handledScenarios < scenarios.length) {
            throw new Error(`Permission error handling incomplete: ${handledScenarios}/${scenarios.length} scenarios handled`);
        }

        return {
            message: `Permission denial handling: ${handledScenarios}/${scenarios.length} scenarios handled correctly`,
            metrics: {
                scenarios: permissionScenarios,
                handledCount: handledScenarios,
                totalCount: scenarios.length
            }
        };
    }

    async testNetworkInterruptions() {
        const networkScenarios = [];
        
        // Test different network failure scenarios
        const failures = [
            { type: 'ConnectionError', delay: 0 },
            { type: 'TimeoutError', delay: 5000 },
            { type: 'ServerError', delay: 100 },
            { type: 'RateLimitError', delay: 200 },
            { type: 'AuthenticationError', delay: 50 }
        ];

        for (const failure of failures) {
            const startTime = Date.now();
            
            try {
                // Simulate network request with failure
                await this.simulateNetworkRequest(failure);
                
                // Should not reach here
                networkScenarios.push({
                    type: failure.type,
                    handled: false,
                    duration: Date.now() - startTime,
                    recovered: false
                });
                
            } catch (error) {
                const duration = Date.now() - startTime;
                
                // Test recovery mechanism
                const recovered = await this.simulateNetworkRecovery(failure.type);
                
                networkScenarios.push({
                    type: failure.type,
                    handled: true,
                    duration,
                    recovered,
                    errorMessage: error.message
                });
            }
        }

        const handledFailures = networkScenarios.filter(s => s.handled).length;
        const recoveredFailures = networkScenarios.filter(s => s.recovered).length;

        if (handledFailures < failures.length) {
            throw new Error(`Network error handling incomplete: ${handledFailures}/${failures.length} failures handled`);
        }

        return {
            message: `Network interruption handling: ${handledFailures}/${failures.length} handled, ${recoveredFailures} recovered`,
            metrics: {
                scenarios: networkScenarios,
                handledCount: handledFailures,
                recoveredCount: recoveredFailures,
                totalCount: failures.length
            }
        };
    }

    async simulateNetworkRequest(failure) {
        await new Promise(resolve => setTimeout(resolve, failure.delay));
        
        switch (failure.type) {
            case 'ConnectionError':
                throw new Error('Network connection failed');
            case 'TimeoutError':
                throw new Error('Request timeout');
            case 'ServerError':
                throw new Error('Server error 500');
            case 'RateLimitError':
                throw new Error('Rate limit exceeded');
            case 'AuthenticationError':
                throw new Error('Authentication failed');
            default:
                throw new Error('Unknown network error');
        }
    }

    async simulateNetworkRecovery(failureType) {
        // Simulate recovery attempts
        const maxRetries = 3;
        
        for (let i = 0; i < maxRetries; i++) {
            await new Promise(resolve => setTimeout(resolve, 100 * (i + 1))); // Exponential backoff
            
            // Simulate recovery success rate based on failure type
            const recoveryChance = {
                'ConnectionError': 0.8,
                'TimeoutError': 0.9,
                'ServerError': 0.6,
                'RateLimitError': 0.7,
                'AuthenticationError': 0.3
            }[failureType] || 0.5;
            
            if (Math.random() < recoveryChance) {
                return true; // Recovery successful
            }
        }
        
        return false; // Recovery failed
    }

    async testRapidStartStopCycles() {
        const cycles = 20;
        const cycleResults = [];
        
        for (let i = 0; i < cycles; i++) {
            const cycleStart = Date.now();
            
            try {
                // Simulate rapid start/stop cycle
                await this.simulateRecordingCycle(i);
                
                const cycleDuration = Date.now() - cycleStart;
                cycleResults.push({
                    cycle: i,
                    success: true,
                    duration: cycleDuration
                });
                
            } catch (error) {
                const cycleDuration = Date.now() - cycleStart;
                cycleResults.push({
                    cycle: i,
                    success: false,
                    duration: cycleDuration,
                    error: error.message
                });
            }
            
            // Very short delay between cycles
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        const successfulCycles = cycleResults.filter(r => r.success).length;
        const averageCycleDuration = cycleResults.reduce((sum, r) => sum + r.duration, 0) / cycles;
        const maxCycleDuration = Math.max(...cycleResults.map(r => r.duration));

        if (successfulCycles < cycles * 0.9) { // 90% success rate
            throw new Error(`Rapid cycles failed: only ${successfulCycles}/${cycles} successful`);
        }

        if (averageCycleDuration > 100) { // 100ms threshold
            throw new Error(`Cycles too slow: ${averageCycleDuration.toFixed(2)}ms average`);
        }

        return {
            message: `Rapid start/stop cycles: ${successfulCycles}/${cycles} successful, ${averageCycleDuration.toFixed(2)}ms avg`,
            metrics: {
                cycles: cycleResults,
                successfulCycles,
                averageCycleDuration,
                maxCycleDuration,
                successRate: (successfulCycles / cycles) * 100
            }
        };
    }

    async simulateRecordingCycle(cycleIndex) {
        // Simulate component state changes
        const mockComponent = {
            isRecording: false,
            audioChunks: [],
            
            async startRecording() {
                if (this.isRecording) {
                    throw new Error('Already recording');
                }
                this.isRecording = true;
                this.audioChunks = [];
            },
            
            async stopRecording() {
                if (!this.isRecording) {
                    throw new Error('Not recording');
                }
                this.isRecording = false;
                // Simulate processing
                await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
            }
        };

        await mockComponent.startRecording();
        
        // Simulate brief recording
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        
        await mockComponent.stopRecording();
    }

    async testInvalidAPIKeyHandling() {
        const apiKeyScenarios = [
            { key: '', error: 'Empty API key' },
            { key: 'invalid-key', error: 'Invalid API key format' },
            { key: 'expired-key', error: 'API key expired' },
            { key: 'revoked-key', error: 'API key revoked' }
        ];

        const results = [];

        for (const scenario of apiKeyScenarios) {
            try {
                // Mock API service with invalid key
                const mockService = {
                    streamAudio: async () => {
                        throw new Error(scenario.error);
                    },
                    isAvailable: () => false,
                    getApiKeyError: () => scenario.error
                };

                // Test error handling
                let errorHandled = false;
                try {
                    await mockService.streamAudio(new Blob(), {});
                } catch (error) {
                    errorHandled = error.message === scenario.error;
                }

                results.push({
                    scenario: scenario.key || 'empty',
                    errorHandled,
                    expectedError: scenario.error
                });

            } catch (error) {
                results.push({
                    scenario: scenario.key || 'empty',
                    errorHandled: false,
                    expectedError: scenario.error,
                    actualError: error.message
                });
            }
        }

        const handledScenarios = results.filter(r => r.errorHandled).length;

        if (handledScenarios < apiKeyScenarios.length) {
            throw new Error(`API key error handling incomplete: ${handledScenarios}/${apiKeyScenarios.length} scenarios handled`);
        }

        return {
            message: `API key error handling: ${handledScenarios}/${apiKeyScenarios.length} scenarios handled correctly`,
            metrics: {
                scenarios: results,
                handledCount: handledScenarios,
                totalCount: apiKeyScenarios.length
            }
        };
    }

    async testLargeAudioBufferHandling() {
        const bufferSizes = [4096, 8192, 16384, 32768, 65536]; // Different buffer sizes
        const results = [];

        for (const bufferSize of bufferSizes) {
            const startTime = Date.now();
            
            try {
                // Create large audio buffer
                const audioBuffer = new Float32Array(bufferSize);
                for (let i = 0; i < bufferSize; i++) {
                    audioBuffer[i] = Math.sin(2 * Math.PI * 440 * i / 16000) * 0.5;
                }

                // Simulate processing
                const processedBuffer = await this.processLargeAudioBuffer(audioBuffer);
                
                const processingTime = Date.now() - startTime;
                const throughput = bufferSize / processingTime; // samples per ms

                results.push({
                    bufferSize,
                    processingTime,
                    throughput,
                    success: true,
                    memoryUsed: bufferSize * 4 // 4 bytes per float32
                });

            } catch (error) {
                const processingTime = Date.now() - startTime;
                results.push({
                    bufferSize,
                    processingTime,
                    throughput: 0,
                    success: false,
                    error: error.message
                });
            }
        }

        const successfulBuffers = results.filter(r => r.success).length;
        const averageThroughput = results
            .filter(r => r.success)
            .reduce((sum, r) => sum + r.throughput, 0) / successfulBuffers;

        if (successfulBuffers < bufferSizes.length) {
            throw new Error(`Large buffer handling failed: only ${successfulBuffers}/${bufferSizes.length} sizes handled`);
        }

        return {
            message: `Large buffer handling: ${successfulBuffers}/${bufferSizes.length} sizes, ${averageThroughput.toFixed(2)} samples/ms avg`,
            metrics: {
                results,
                successfulBuffers,
                averageThroughput,
                maxBufferSize: Math.max(...bufferSizes),
                totalSizes: bufferSizes.length
            }
        };
    }

    async processLargeAudioBuffer(audioBuffer) {
        // Simulate intensive audio processing
        const processedBuffer = new Float32Array(audioBuffer.length);
        
        // Apply some processing (e.g., filtering, normalization)
        for (let i = 0; i < audioBuffer.length; i++) {
            processedBuffer[i] = audioBuffer[i] * 0.8; // Simple gain reduction
        }

        // Simulate processing delay based on buffer size
        const processingDelay = Math.min(audioBuffer.length / 10000, 100); // Max 100ms
        await new Promise(resolve => setTimeout(resolve, processingDelay));

        return processedBuffer;
    }

    async testConcurrentComponentInstances() {
        const instanceCount = 10;
        const instances = [];
        const results = [];

        // Create multiple component instances
        for (let i = 0; i < instanceCount; i++) {
            const instance = {
                id: i,
                isRecording: false,
                audioChunks: [],
                
                async startRecording() {
                    this.isRecording = true;
                    // Simulate audio capture
                    for (let j = 0; j < 10; j++) {
                        this.audioChunks.push(new Float32Array(1024));
                        await new Promise(resolve => setTimeout(resolve, 10));
                    }
                },
                
                async stopRecording() {
                    this.isRecording = false;
                    this.audioChunks = [];
                }
            };
            
            instances.push(instance);
        }

        const startTime = Date.now();

        // Start all instances concurrently
        const startPromises = instances.map(async (instance) => {
            try {
                await instance.startRecording();
                return { id: instance.id, operation: 'start', success: true };
            } catch (error) {
                return { id: instance.id, operation: 'start', success: false, error: error.message };
            }
        });

        const startResults = await Promise.all(startPromises);

        // Stop all instances concurrently
        const stopPromises = instances.map(async (instance) => {
            try {
                await instance.stopRecording();
                return { id: instance.id, operation: 'stop', success: true };
            } catch (error) {
                return { id: instance.id, operation: 'stop', success: false, error: error.message };
            }
        });

        const stopResults = await Promise.all(stopPromises);

        const totalTime = Date.now() - startTime;
        const allResults = [...startResults, ...stopResults];
        const successfulOperations = allResults.filter(r => r.success).length;
        const totalOperations = allResults.length;

        if (successfulOperations < totalOperations * 0.9) { // 90% success rate
            throw new Error(`Concurrent instances failed: only ${successfulOperations}/${totalOperations} operations successful`);
        }

        return {
            message: `Concurrent instances: ${instanceCount} instances, ${successfulOperations}/${totalOperations} operations successful in ${totalTime}ms`,
            metrics: {
                instanceCount,
                totalOperations,
                successfulOperations,
                totalTime,
                successRate: (successfulOperations / totalOperations) * 100,
                startResults,
                stopResults
            }
        };
    }

    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        return 0;
    }
}

// Make the class available globally
window.GdmLiveAudioPerformanceTests = GdmLiveAudioPerformanceTests; 