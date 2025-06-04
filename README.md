
# F.B/c AI Assistant & Portfolio Website

This project is a comprehensive AI-powered portfolio website for Farzad Bayat (F.B/c), showcasing AI consulting services, workshops, and expertise. It features an integrated AI assistant powered by the Google Gemini API for interactive user engagement, lead capture, and demonstration of advanced AI capabilities. The frontend is built with React and TypeScript, emphasizing a modern UI/UX design.

The AI assistant's core text, image, search, and multimodal (webcam/screen frame + text) interactions are designed to be routed through a **secure serverless backend proxy**, ensuring the primary Google Gemini API key is not exposed client-side.

## Key Features

*   **Interactive AI Assistant**:
    *   Supports **Text**, **Webcam frame + Text**, and **Screen share frame + Text** interactions via a secure backend proxy.
    *   Native Voice (Speech-to-Text & Text-to-Speech) interactions are possible via the `<gdm-live-audio>` component, but require careful API key management (see "API Key Configuration").
    *   Handles complex conversational flows, including lead capture (name/email).
    *   Provides information based on a simulated knowledge base and real-time web searches (proxied).
    *   Can generate images and text content on request (proxied).
*   **Dynamic User Interface**:
    *   Theming: Light and Dark mode support.
    *   Responsive Design: Adapts to various screen sizes.
    *   Engaging Animations: Including a 3D orb in the hero section and a 3D voice visualizer.
*   **Comprehensive Portfolio Content**:
    *   Multi-page structure: Home, Services, About, Workshop, Contact.
    *   Detailed sections showcasing expertise, services, project history, and client testimonials.
*   **Advanced Chat Functionality**:
    *   Fullscreen mode for an immersive chat experience.
    *   Multimodal input: Webcam and screen capture (still frames) to send with text prompts.
    *   Chat Side Panel: Tools for conversation summarization and follow-up brief generation.
*   **Admin Workshop Preview Page**:
    *   An internal page (`/fbc-internal/workshop-preview`) demonstrating various AI concepts with interactive elements, charts, and potentially direct Gemini API usage for educational purposes. API key handling for this specific page needs careful consideration if deployed publicly.

## Technologies Used

*   **Frontend**:
    *   React 19 (with TypeScript)
    *   Tailwind CSS (for utility-first styling)
    *   Custom CSS (for theming, animations, and specific component styles)
*   **Backend (Conceptual for API Key Security)**:
    *   Serverless Functions (e.g., on Vercel, Netlify) to act as a proxy for Gemini API calls.
*   **AI & Language Models**:
    *   Google Gemini API (`@google/genai`)
*   **Custom Elements**:
    *   Lit (for `gdm-live-audio` Web Component)
*   **Routing**:
    *   React Router DOM v6
*   **3D Graphics & Visualization**:
    *   Three.js (for hero orb and voice visualizer)
    *   Chart.js (for data visualization in the Admin Workshop page)
*   **Icons**:
    *   Lucide React
*   **Module Loading (Development)**:
    *   ES Modules with `importmap` (dependencies sourced via `esm.sh`). For production, a build tool like Vite is recommended.

## Core AI Functionalities (Powered by Google Gemini)

The application leverages several Gemini models for its AI capabilities, primarily accessed via the secure backend proxy:

*   **Conversational AI**: `gemini-2.5-flash-preview-04-17` for chat sessions, supporting system instructions, context awareness, and tool use (Google Search).
*   **Image Generation**: `imagen-3.0-generate-002` for creating images from text prompts.
*   **Web Search & Grounding**: Provides search results with citations for up-to-date information.
*   **Text Generation**: Used for various tasks including summarization, generating follow-up briefs, and general text creation.
*   **Multimodal Input**: Capable of processing text prompts combined with images (from webcam/screen capture or file uploads if re-enabled).
*   **Simulated Knowledge Base**: The AI uses a predefined knowledge base (`SIMULATED_KNOWLEDGE_BASE` in `constants.ts`) to answer specific questions about F.B/c.
*   **Lead Capture Flow**: The AI is programmed with a specific conversational flow to request and process user's name and email.
*   **Native Audio Interaction (Special Consideration)**: `gemini-2.5-flash-preview-native-audio-dialog` via `<gdm-live-audio>` for real-time voice. Secure API key handling for this feature is critical (see API Key Configuration).

## Project Structure

*   `index.html`: Main HTML entry point.
*   `index.tsx`: React application entry point.
*   `App.tsx`: Root React component.
*   `metadata.json`: Application metadata (permissions for microphone, camera).
*   **`api/` (Conceptual for Deployment):** Directory for serverless functions (e.g., `gemini-proxy.ts`) that securely handle API calls.
*   **`components/`**: Reusable UI components.
    *   `interaction/`: Components for the AI chat panel, including input bar with webcam/screen share controls.
    *   `liveaudio/`: Components for native voice interaction (`GdmLiveAudio.ts`, `NativeLiveAudioWrapper.tsx`, etc.).
*   **`pages/`**: Top-level page components.
*   **`services/geminiService.ts`**: **Client-side service** that makes `fetch` calls to the backend proxy endpoint (`/api/gemini-proxy`). It no longer initializes `GoogleGenAI` directly for these proxied calls.
*   **`constants.ts`**, **`types.ts`**: Application-wide definitions.
*   **`assets/`**: Static assets.

## Setup and Running

### 1. API Key Configuration (Critical for Security)

*   **Primary Gemini API Key (Secure Backend Proxy)**:
    *   For most AI interactions (text, image generation, search, webcam/screen frames), the application is designed to use a **serverless backend proxy**.
    *   Your main Google Gemini API key should be stored as a secure environment variable (e.g., `GEMINI_API_KEY_SERVER`) on your deployment platform (Vercel, Netlify, etc.) and accessed *only* by this serverless proxy function.
    *   The `services/geminiService.ts` file in the frontend will then make `fetch` requests to this proxy endpoint (e.g., `/api/gemini-proxy`).
    *   **This is the recommended and most secure method.**
*   **Native Voice (`<gdm-live-audio>`) API Key**:
    *   The `GdmLiveAudio.ts` component currently attempts to initialize `GoogleGenAI` directly using `process.env.API_KEY`.
    *   **Option 1 (Most Secure for Voice):** Modify the application to use browser-based SpeechRecognition (STT) and SpeechSynthesis (TTS). The recognized text would be sent through the secure proxy, and the text response spoken by the browser. This avoids exposing any API key client-side for voice.
    *   **Option 2 (Less Secure - Client-Side Key Exposure):** If using `GdmLiveAudio.ts` directly with an API key, you'll need a build step (e.g., Vite) to inject an environment variable (e.g., `VITE_GEMINI_API_KEY`) into the client-side bundle. **This `VITE_GEMINI_API_KEY` will be publicly visible in your website's JavaScript.** If you choose this path, it's highly recommended to use a separate, restricted API key with strict quotas specifically for this voice feature.
*   **Admin Workshop Page (`AdminWorkshopPage.tsx`) API Key**:
    *   This page might make direct calls to Gemini. If deployed, its API key handling needs similar consideration to `GdmLiveAudio.ts`. For educational/internal use, direct key usage might be acceptable if the page isn't publicly indexed or if it's behind auth.

### 2. Development Environment (Using `importmap`)

*   The project uses `index.html` with `importmap` and ES modules loaded directly from `esm.sh`. This is suitable for local development.
*   Serve the project files using any static file server.
*   Access `index.html` in your browser.
*   For features relying on `process.env.API_KEY` directly (like `GdmLiveAudio.ts` or `AdminWorkshopPage.tsx` in their current form during development), you might need to manually replace `process.env.API_KEY` in the code with your key for testing, or use a development server that can inject environment variables (though `importmap` setups don't usually have complex build/dev servers by default).

### 3. Production Deployment (Recommended)

1.  **Implement a Serverless Proxy**:
    *   Create a serverless function (e.g., `api/gemini-proxy.ts`) that takes requests from your frontend, adds your secure `GEMINI_API_KEY_SERVER`, calls the Google Gemini API, and returns the response.
2.  **Transition to a Build Tool**:
    *   Use a build tool like **Vite** or Create React App.
    *   This will bundle your code, manage dependencies via `package.json`, and handle environment variables for the build.
    *   Remove the `importmap` from `index.html` and load the bundled JavaScript.
3.  **Deploy to a Platform with Serverless Support**:
    *   Deploy your application to a platform like **Vercel** or **Netlify**.
    *   These platforms offer:
        *   Static site hosting for your React app.
        *   Serverless function hosting for your API proxy.
        *   Secure environment variable management.
        *   Automatic HTTPS.
        *   CI/CD integration.

## Styling

*   **Tailwind CSS**: Loaded via CDN in `index.html` for development. In a production build (with Vite), Tailwind would be integrated into the build process for optimized CSS.
*   **Custom CSS**: Global styles, CSS variables for theming, and animations are in `index.html`.

## Custom Elements

*   **`<gdm-live-audio>`**: Lit-based component for native Gemini voice. API key security is paramount (see above).

This updated README provides a more accurate picture of the project's architecture, security considerations, and recommended deployment practices.
