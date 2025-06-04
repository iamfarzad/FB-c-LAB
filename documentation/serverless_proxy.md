
### Plan: Secure Gemini API Key with Serverless Proxy & Refactor API calls 


Goal: Securely call Google Gemini API (and other Google Cloud APIs) from a client-side application by routing requests through a serverless proxy, thus preventing API key exposure.

Deployment Platform: Vercel (or similar, e.g., Netlify Functions, AWS Lambda, Google Cloud Functions).

Current Status (as per previous summaries):

Your geminiService.ts handles text-based, image generation, and multimodal interactions.
Your GdmLiveAudio.ts handles native live audio, currently directly accessing the Gemini API from the client (exposing the key).
API keys are currently directly exposed in the client-side bundle via process.env / import.meta.env.
Phase 1: Implement Serverless Proxy (Core Security Improvement)
Objective: Create a serverless function that acts as a secure intermediary for most Gemini API calls, keeping your API keys out of client-side code.

1. Create api Directory & Proxy File:
* Action: In the root of your project (e.g., your-project-root/), create a new directory named api.
* Action: Inside this api directory, create a new file named gemini-proxy.ts.
* Resulting Path: your-project-root/api/gemini-proxy.ts

2. Install Server-Side Dependencies:
* Your serverless function will need the necessary Google SDKs. Ensure these are listed in your project's package.json dependencies (not just devDependencies), as the serverless environment will need to install them.
* Command: Open your terminal in the project root and run:
bash npm install @google/genai @google-cloud/translate # or yarn add @google/genai @google-cloud/translate
* Note: If you are using Next.js for your frontend, next will already be a dependency, providing NextApiRequest and NextApiResponse types.

3. Implement the Proxy Code (api/gemini-proxy.ts):
* Action: Copy and paste the entire code block below into your newly created api/gemini-proxy.ts file.

```typescript
// File: api/gemini-proxy.ts
import { GoogleGenAI, GenerateContentResponse, Part, Chat, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { TranslationServiceClient } from '@google-cloud/translate'; // For Google Translate
import type { NextApiRequest, NextApiResponse } from 'next'; // Vercel uses Next.js style API routes

// Define the expected request body structure from your client (geminiService.ts)
interface ProxyRequestBody {
  action: string; // e.g., 'generateChatResponse', 'generateImage', 'translateText'
  payload: any;   // Data specific to the action
  chatHistory?: any[]; // Formatted chat history for context
}

// Singleton instances for AI clients to reuse connections (improves performance)
let geminiAIInstance: GoogleGenAI | null = null;
let translationClientInstance: TranslationServiceClient | null = null;

// --- Gemini AI Client Initialization ---
function getGeminiAI() {
  if (!geminiAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY_SERVER; // Securely from Vercel env vars
    if (!apiKey) {
      console.error('FATAL: GEMINI_API_KEY_SERVER is not set in the server environment.');
      throw new Error('Gemini API key not configured on server.');
    }
    geminiAIInstance = new GoogleGenAI({ apiKey });
  }
  return geminiAIInstance;
}

// --- Google Translation Client Initialization ---
function getTranslationClient() {
  if (!translationClientInstance) {
    // The SDK will automatically use Application Default Credentials if
    // GOOGLE_APPLICATION_CREDENTIALS env var is set, or if running on GCP with Workload Identity.
    // For Vercel, you'd typically set GOOGLE_APPLICATION_CREDENTIALS to the content of your service account JSON key.
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && !process.env.GOOGLE_CLOUD_PROJECT_ID_SERVER) {
         console.warn('WARN: GOOGLE_APPLICATION_CREDENTIALS_JSON or GOOGLE_CLOUD_PROJECT_ID_SERVER not set. Translation may fail if not on GCP.');
    }
    translationClientInstance = new TranslationServiceClient();
  }
  return translationClientInstance;
}

// --- Safety Settings for Gemini ---
const defaultSafetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// --- Main Handler Function ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, payload, chatHistory } = req.body as ProxyRequestBody;

  try {
    const ai = getGeminiAI();
    let resultData: any;

    // --- Gemini Actions ---
    switch (action) {
      case 'createChatSessionIfNeeded': // Conceptual - might be a no-op if chat is stateless
        // For stateless chat handling (passing history each time), this might just confirm proxy is up.
        resultData = { message: "Proxy acknowledged chat session readiness." };
        break;

      case 'generateChatResponse':
        if (!payload.userMessage || !payload.model || !payload.systemInstruction) {
          return res.status(400).json({ error: 'Missing userMessage, model, or systemInstruction for chat response' });
        }
        // For chat, we re-create a temporary chat instance on the server with history.
        // This is simpler than managing server-side session objects for a stateless serverless function.
        const tempChat = ai.chats.create({
          model: payload.model,
          config: {
            systemInstruction: payload.systemInstruction,
            tools: [{ googleSearch: {} }], // Assuming Google Search is always available for chat
            safetySettings: defaultSafetySettings,
          },
          history: chatHistory || [] // Use history sent from client
        });
        const chatResult: GenerateContentResponse = await tempChat.sendMessage({ message: payload.userMessage });
        resultData = {
          text: chatResult.text,
          sources: chatResult.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web && ({ uri: chunk.web.uri, title: chunk.web.title }))
            .filter(Boolean) || [],
        };
        break;

      case 'generateImage':
        if (!payload.prompt || !payload.model) {
          return res.status(400).json({ error: 'Missing prompt or model for image generation' });
        }
        const imageResult = await ai.models.generateImages({
          model: payload.model,
          prompt: payload.prompt,
          config: payload.config || { numberOfImages: 1, outputMimeType: 'image/jpeg' },
        });
        resultData = { generatedImages: imageResult.generatedImages };
        break;

      case 'searchWeb': // Renamed from searchWebWithGemini for consistency
        if (!payload.query || !payload.model) {
          return res.status(400).json({ error: 'Missing query or model for web search' });
        }
        const searchResult = await ai.models.generateContent({
          model: payload.model,
          contents: payload.query,
          config: {
            tools: [{ googleSearch: {} }],
            systemInstruction: payload.systemInstruction,
            safetySettings: defaultSafetySettings,
          }
        });
        resultData = {
          text: searchResult.text,
          sources: searchResult.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web && ({ uri: chunk.web.uri, title: chunk.web.title }))
            .filter(Boolean) || [],
        };
        break;

      case 'generateTextOnly':
        if (!payload.prompt || !payload.model) {
          return res.status(400).json({ error: 'Missing prompt or model for text generation' });
        }
        const textOnlyResult = await ai.models.generateContent({
          model: payload.model,
          contents: payload.prompt,
          config: {
            systemInstruction: payload.systemInstruction,
            safetySettings: defaultSafetySettings,
          }
        });
        resultData = { text: textOnlyResult.text };
        break;

      case 'generateContentWithImageAndText':
        if (!payload.textPrompt || !payload.base64ImageData || !payload.mimeType || !payload.model) {
          return res.status(400).json({ error: 'Missing data for multimodal content generation' });
        }
        const imagePart: Part = { inlineData: { mimeType: payload.mimeType, data: payload.base64ImageData } };
        const textPart: Part = { text: payload.textPrompt };
        const multimodalResult = await ai.models.generateContent({
          model: payload.model,
          contents: { parts: [textPart, imagePart] }, // Ensure this structure matches SDK expectations
          config: { safetySettings: defaultSafetySettings }
        });
        resultData = { text: multimodalResult.text };
        break;

      case 'summarizeChatHistory':
      case 'generateInternalBrief': // Updated from generateFollowUpBrief
      case 'generateClientSummaryForPdf': // New
        if (!payload.prompt || !payload.model) {
          return res.status(400).json({ error: 'Missing prompt or model for brief/summary generation' });
        }
        // These actions use the entire pre-formatted prompt sent from geminiService.ts
        const summaryBriefResult = await ai.models.generateContent({
          model: payload.model,
          contents: payload.prompt,
          config: { safetySettings: defaultSafetySettings }
        });
        resultData = { text: summaryBriefResult.text };
        break;

      // --- Google Translate Action ---
      case 'translateText':
        const googleCloudProjectId = process.env.GOOGLE_CLOUD_PROJECT_ID_SERVER;
        if (!payload.text || !payload.targetLanguage || !googleCloudProjectId) {
          return res.status(400).json({ error: 'Missing text, targetLanguage, or Project ID for translation' });
        }
        const translationClient = getTranslationClient();
        const translateRequest = {
          parent: `projects/${googleCloudProjectId}/locations/global`,
          contents: Array.isArray(payload.text) ? payload.text : [payload.text],
          mimeType: 'text/plain',
          targetLanguageCode: payload.targetLanguage,
          sourceLanguageCode: payload.sourceLanguageCode || undefined,
        };
        const [translateResponse] = await translationClient.translateText(translateRequest);
        if (translateResponse.translations && translateResponse.translations.length > 0) {
          resultData = { translatedText: translateResponse.translations[0].translatedText };
        } else {
          throw new Error('No translation returned from Translation API');
        }
        break;

      // --- Lead Notification Action ---
      case 'notifyLead':
        const { name, email, interest, conversationSummary } = payload;
        // TODO: Implement actual email sending here using a service like Resend, SendGrid, or Nodemailer.
        // Example:
        // const emailApiKey = process.env.EMAIL_SERVICE_API_KEY;
        // if (emailApiKey) {
        //   // await sendEmail({ to: 'your_email@example.com', subject: `New Lead: ${name}`, body: `...` });
        // }
        console.log(`SIMULATED LEAD NOTIFICATION: Name: ${name}, Email: ${email}, Interest: ${interest}, Summary: ${conversationSummary.substring(0,100)}...`);
        resultData = { message: "Lead notification processed by proxy (logged)." };
        break;

      default:
        return res.status(400).json({ error: `Invalid action: ${action}` });
    }

    return res.status(200).json(resultData);

  } catch (error: any) {
    console.error(`Error in proxy (action: ${action}):`, error);
    // Avoid sending detailed internal error messages or stack traces to the client in production.
    let clientErrorMessage = 'An error occurred while processing your request.';
    if (error.message && error.message.includes('API key not valid')) {
        clientErrorMessage = 'Server API key configuration issue. Please contact support.';
    } else if (error.message && (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED'))) {
        clientErrorMessage = 'API quota exceeded. Please try again later or contact support.';
    }
    // You might want to log the full error for debugging on the server.
    return res.status(500).json({ error: clientErrorMessage });
  }
}
```
4. Configure Environment Variables for Deployment (Vercel/Netlify):
* When you deploy your project to Vercel (or Netlify, etc.), you need to set these environment variables in the platform's settings.
* Action: Go to your Vercel project settings (or equivalent for your platform) -> "Environment Variables".
* Action: Add the following variables, ensuring they are configured for both Development and Production environments:
* GEMINI_API_KEY_SERVER: Your actual Google Gemini API key. This key will only be visible to your serverless function.
* GOOGLE_CLOUD_PROJECT_ID_SERVER: Your Google Cloud Project ID (e.g., your-project-12345). This is required for the Translation API.
* GOOGLE_APPLICATION_CREDENTIALS_JSON: This is crucial for the Google Cloud Translation API to authenticate.
* Action: In your Google Cloud Console, create or select a Service Account. Generate a new JSON key for it.
* Action: Open the downloaded JSON key file. Copy its entire content (including curly braces, quotes, commas, etc.).
* Action: In your Vercel Environment Variables, paste this entire JSON content as the value for GOOGLE_APPLICATION_CREDENTIALS_JSON. Make sure it's pasted as a single, continuous string if your platform's UI requires it (sometimes multi-line values work directly).

5. Update Client-Side geminiService.ts:
* Objective: Modify your client-side code to send all AI-related requests to your new proxy endpoint (/api/gemini-proxy) instead of directly initializing GoogleGenAI client-side.
* Action: Locate your geminiService.ts file.
* Action: Remove any lines that directly initialize GoogleGenAI with your API key within geminiService.ts (e.g., ai = new GoogleGenAI({ apiKey: process.env.API_KEY });). The client-side code will no longer need direct access to the API key.
* Action: Ensure all functions (e.g., generateChatResponse, generateImage, searchWeb, etc.) are refactored to use a helper function that makes a POST request to /api/gemini-proxy.

* **Example `callProxy` helper function (add this to `geminiService.ts` if you don't have one):**
    ```typescript
    // Inside services/geminiService.ts (or a new proxy-client.ts file)

    // Define the endpoint for your proxy
    const PROXY_ENDPOINT = '/api/gemini-proxy';

    // Helper function to call the serverless proxy
    export async function callProxy(action: string, payload: any, chatHistory?: any[]) {
      try {
        const response = await fetch(PROXY_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action, payload, chatHistory }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Proxy error response:', errorData);
          throw new Error(`Proxy call failed: ${errorData.error || response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`Error calling proxy for action "${action}":`, error);
        throw error; // Re-throw to be handled by the caller
      }
    }

    // Example modification for generateChatResponse
    // (Adjust according to your existing function signatures and data structures)
    // Ensure you pass `model` and `systemInstruction` in the `payload`
    // and `chatHistory` as a top-level arg if the proxy expects it.

    /*
    // ORIGINAL (conceptual):
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); // REMOVE THIS!

    export const generateChatResponse = async (
      userMessage: string,
      chatHistory: ChatMessage[],
      // ... other params like systemInstruction if you're not getting it globally
    ): Promise<{ text: string; sources?: WebSource[] }> => {
      // ... your existing logic using ai.chats.create and chat.sendMessage ...
    };
    */

    // NEW (conceptual, after implementing callProxy):
    // (Make sure to import relevant types like ChatMessage, WebSource)
    export const generateChatResponse = async (
      userMessage: string,
      chatHistory: ChatMessage[], // Ensure this is formatted correctly for the proxy
      model: string, // Pass the model from client to proxy
      systemInstruction: string // Pass system instruction from client to proxy
    ): Promise<{ text: string; sources?: WebSource[] }> => {
      const payload = {
        userMessage,
        model,
        systemInstruction,
      };
      // Assume chatHistory is an array of { role: 'user' | 'model', parts: [{text: '...'}]}
      // Adjust `formatChatHistoryForProxy` if your ChatMessage[] needs conversion
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.role,
        parts: msg.parts.map(p => typeof p === 'string' ? { text: p } : p)
      }));

      const response = await callProxy('generateChatResponse', payload, formattedHistory);
      return { text: response.text, sources: response.sources };
    };

    // Example for generateImage
    export const generateImage = async (
      prompt: string,
      model: string, // e.g., 'image-generation-005'
      config?: { numberOfImages?: number; outputMimeType?: string }
    ): Promise<{ generatedImages: { url: string; mimeType: string }[] }> => {
      const payload = {
        prompt,
        model,
        config,
      };
      const response = await callProxy('generateImage', payload);
      return response;
    };

    // Similarly, update all other functions that call Gemini
    // (generateTextOnly, generateContentWithImageAndText, searchWeb, summarizeChatHistory, etc.)
    // to use the `callProxy` helper function.
    ```
* **Action:** Test locally. When running your dev server (`npm run dev`), the Vercel CLI or Next.js will automatically route requests to `/api/*` to your local serverless function.
Phase 2: Address Native Live Voice (GdmLiveAudio.ts)
Objective: Decide on a strategy for the GdmLiveAudio component, as the current proxy doesn't directly support its WebSocket-based live audio streaming securely without additional server-side complexity (which is beyond this plan).

Choose Option B (Recommended Secure Alternative): Browser STT/TTS with Proxy for Text.

Strategy: Re-architect GdmLiveAudio.ts to use browser-native capabilities for audio input/output, and send/receive text (not raw audio streams) to/from your secure proxy.

Steps for Option B:

Modify GdmLiveAudio.ts to use SpeechRecognition (for STT):
Action: Remove or comment out the MediaStream and ScriptProcessorNode (or AudioWorkletNode) setup for microphone input.
Action: Implement window.SpeechRecognition (or webkitSpeechRecognition) to capture user speech as text.
Example (conceptual, simplified):
TypeScript

// Inside GdmLiveAudio.ts
// ... other imports ...
// import { callProxy } from '../../services/geminiService'; // Import your proxy helper

// ... existing GdmLiveAudio class definition ...

private speechRecognition: SpeechRecognition | null = null;

public async startRecording() {
    // ... existing permission checks and audio context resume ...

    this.updateStatus('Starting speech recognition...');
    this.isRecording = true;
    this.requestUpdate('isRecording');

    // Initialize SpeechRecognition
    this.speechRecognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)();
    this.speechRecognition.continuous = true; // Keep listening
    this.speechRecognition.interimResults = true; // Get interim results
    this.speechRecognition.lang = 'en-US';

    this.speechRecognition.onresult = (event: SpeechRecognitionEvent) => {
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
            // Optional: Dispatch an event for interim transcript display
            this.dispatchEvent(new CustomEvent('user-speech-interim', { detail: { text: interimTranscript } }));
        }

        if (finalTranscript) {
            console.log('[GdmLiveAudio] Final user speech:', finalTranscript);
            this.dispatchEvent(new CustomEvent('user-speech-final', { detail: { text: finalTranscript } }));
            this.lastUserInterimTranscript = ""; // Clear interim after final
            this.processUserSpeech(finalTranscript); // Send to proxy!
        }
    };

    this.speechRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('[GdmLiveAudio] Speech Recognition Error:', event.error);
        this.updateError(`Speech recognition error: ${event.error}`);
        this.stopRecording();
    };

    this.speechRecognition.onend = () => {
        console.log('[GdmLiveAudio] Speech Recognition Ended.');
        if (this.isRecording) { // If still intended to be recording, restart
            this.speechRecognition?.start();
        }
    };

    try {
        this.speechRecognition.start();
        this.updateStatus('Listening for speech...');
        this.dispatchEvent(new CustomEvent('recording-state-changed', { detail: { isRecording: true } }));
    } catch (err) {
        console.error('[GdmLiveAudio] Error starting Speech Recognition:', err);
        this.updateError(`Failed to start speech recognition: ${err instanceof Error ? err.message : String(err)}`);
        this.stopRecording();
    }
    // REMOVE client.live.connect and related session.sendRealtimeInput logic here
    // It will no longer directly interact with Gemini Live API for audio
}

public stopRecording() {
    if (this.speechRecognition) {
        this.speechRecognition.stop();
        this.speechRecognition = null;
    }
    // ... existing cleanup for isRecording, status, mediaStream, etc. ...
    this.dispatchEvent(new CustomEvent('recording-state-changed', { detail: { isRecording: false } }));
    this.updateStatus('Recording stopped. Ready to listen.');
}

private async processUserSpeech(text: string) {
    this.updateStatus('Processing user speech...');
    try {
        // Call your new proxy helper
        const response = await callProxy('generateChatResponse', {
            userMessage: text,
            model: this.modelName, // or a specific text model
            systemInstruction: this.systemInstruction,
        }, []); // Pass empty history or relevant history if GdmLiveAudio tracks it

        if (response && response.text) {
            console.log('[GdmLiveAudio] AI Text Response from Proxy:', response.text);
            this.dispatchEvent(new CustomEvent('ai-speech-text', { detail: { text: response.text } }));
            this.speakAiResponse(response.text); // Speak the AI's response
        } else {
            console.warn('[GdmLiveAudio] No text response from AI via proxy.');
        }
    } catch (error) {
        console.error('[GdmLiveAudio] Error processing user speech via proxy:', error);
        this.updateError(`AI response error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
Modify GdmLiveAudio.ts to use SpeechSynthesis (for TTS):
Action: Implement window.speechSynthesis to speak the AI's text responses.

Action: Remove or comment out all logic related to outputAudioContext, decodeAudioData, AudioBufferSourceNode, and this.sources. The AI's audio will now be generated client-side by the browser, not streamed from Gemini.

Example speakAiResponse method (add this to GdmLiveAudio.ts):

TypeScript

// Inside GdmLiveAudio.ts
private speechUtterance: SpeechSynthesisUtterance | null = null;

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
    this.speechUtterance.lang = 'en-US'; // Set language
    // Optional: Choose a voice. Get available voices with window.speechSynthesis.getVoices()
    // this.speechUtterance.voice = window.speechSynthesis.getVoices().find(voice => voice.name === 'Google US English');
    this.speechUtterance.rate = 1.0; // Speed (0.1 - 10)
    this.speechUtterance.pitch = 1.0; // Pitch (0 - 2)

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

// Adjust handleServerMessage to only process text, or remove it if not needed
// Since you're now using browser TTS, there's no incoming AI audio.
// You might keep the input transcription parts if you still want to log/display interim results
// from Gemini's live audio transcription if you decide to keep the live session for that,
// but it's simpler to rely solely on browser SpeechRecognition.
private handleServerMessage(message: LiveServerMessage) {
    // This function would primarily be for processing responses from a *live* Gemini session.
    // If you switch to browser STT/TTS and HTTP proxy, this function largely becomes obsolete
    // for the core voice interaction. You'd move text processing to `processUserSpeech`.
    // Any remaining parts of `handleServerMessage` would need to be re-evaluated for relevance.
    console.warn('[GdmLiveAudio] handleServerMessage called in browser STT/TTS mode. This might be unexpected.');
    // Only keep relevant parts if any, e.g., turnComplete for user transcript
    if (message.serverContent?.turnComplete) {
        let userTranscript = message.serverContent.inputTranscription?.text;
        if (userTranscript) {
            console.log('[GdmLiveAudio] Found user speech transcript from Live API:', userTranscript);
            // This would conflict with browser SpeechRecognition. Choose one.
        }
    }
}
Action: Remove or adjust the responseModalities: [Modality.AUDIO, Modality.TEXT] from your client.live.connect configuration, as you no longer need Modality.AUDIO from Gemini. If you fully switch to browser STT/TTS, you might remove client.live.connect entirely from GdmLiveAudio.ts.

Phase 3: Incremental Development of Advanced Gemini Capabilities
Objective: Systematically add support for more advanced Gemini features as needed, leveraging the secure proxy.

Steps for each new capability (e.g., Video Understanding, Function Calling):

UI/UX Design: Determine how the user will interact with this new feature in your application's UI.
Client-Side Integration (services/geminiService.ts):
Add a new function that prepares the specific payload for the desired capability (e.g., sendVideoForAnalysis(videoUrl: string), callToolFunction(toolName: string, args: any)).
This function will use your callProxy helper with a new, distinct action name (e.g., 'analyzeVideo', 'runFunction').
Proxy Handler (api/gemini-proxy.ts):
Add a new case statement within the switch (action) block in api/gemini-proxy.ts.
Implement the server-side logic:
Receive the payload for the new action.
Call the appropriate method of the ai.models instance (or ai.live if it's a new live feature that needs a server-side WebSocket) with the correct parameters and configuration (e.g., tools array for function calling, specific contents for video analysis).
Process the Gemini API response.
Return the relevant data to the client.
Phase 4: Testing & Deployment
Local Testing:
Action: Run your project locally (npm run dev).
Action: Thoroughly test all text-based, image generation, web search, multimodal (image+text), summarization, translation, and lead notification functionalities. Verify that they all correctly route requests through /api/gemini-proxy (check your browser's Network tab for POST requests to localhost:5173/api/gemini-proxy).
Action: Test your refactored voice solution (GdmLiveAudio.ts using browser STT/TTS).
Deployment:
Action: Commit your changes and push to your Git repository.
Action: Deploy your project via Vercel (or your chosen platform).
Action: After deployment, visit your live application.
Action: Verify all environment variables are correctly set on the Vercel platform.
Action: Test the deployed application to confirm all features work as expected.
Crucial: Use your browser's developer tools on the live site to verify that your API keys are NOT exposed in the client-side network requests or JavaScript source code.