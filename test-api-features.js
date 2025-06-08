// Simple test script to check API features
const BASE_URL = 'http://localhost:5174/api/gemini-proxy';

async function testEndpoint(endpoint, data) {
  try {
    console.log(`\n🧪 Testing ${endpoint}...`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log(`✅ Status: ${response.status}`);
    console.log(`📊 Success: ${result.success}`);
    if (result.error) console.log(`❌ Error: ${result.error}`);
    if (result.data?.text) console.log(`📝 Response: ${result.data.text.substring(0, 100)}...`);
    
    return result;
  } catch (error) {
    console.log(`❌ Request failed: ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Testing AI Assistant API Features\n');
  
  // Test 1: Health Check
  await testEndpoint('/health', {});
  
  // Test 2: Basic Text Generation
  await testEndpoint('/generate', {
    prompt: 'Hello, how are you?',
    model: 'gemini-2.0-flash-001'
  });
  
  // Test 3: Translation
  await testEndpoint('/translateText', {
    text: 'Hello world',
    targetLanguage: 'no'
  });
  
  // Test 4: Image Generation
  await testEndpoint('/generateImage', {
    prompt: 'A beautiful sunset over mountains',
    model: 'imagen-3.0-generate-001'
  });
  
  // Test 5: Web Search
  await testEndpoint('/searchWeb', {
    prompt: 'What is the weather today?'
  });
  
  // Test 6: Document Generation
  await testEndpoint('/generateDocumentation', {
    prompt: 'Create documentation for a REST API',
    systemInstruction: 'You are a technical writer'
  });
  
  console.log('\n✅ Tests completed!');
}

// Run if this is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}

// Export for browser use
if (typeof window !== 'undefined') {
  window.runAPITests = runTests;
} 