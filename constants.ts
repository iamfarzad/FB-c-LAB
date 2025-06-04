
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002';

export const API_KEY_ERROR_MESSAGE = "API Key for Gemini not configured. Please ensure `process.env.API_KEY` is set. Some features will be unavailable.";
export const GENERIC_ERROR_MESSAGE = "Sorry, I encountered an error. Please try again or contact support if the issue persists.";
export const CHAT_INIT_ERROR_MESSAGE = "Failed to initialize AI chat session. Please try refreshing the page.";

export const FBC_BRAND_NAME = "F.B/c";
export const AI_ASSISTANT_NAME = "Farzad AI Assistant"; // New constant
export const FBC_TAGLINE = "AI Consulting & Workshops for the Modern Enterprise";

export const INITIAL_AI_CHAT_MESSAGE = `Hi! I'm the ${AI_ASSISTANT_NAME}, here to help you discover how AI can transform your business. What's your name?`;

export const LEAD_CAPTURE_EMAIL_PROMPT = "To send you a summary of our conversation, could I please get your email address?";
export const LEAD_CAPTURE_BOOKING_PROMPT = "Would you like to book a free 15-minute strategy session to discuss your needs further? I can help you find a time slot.";
export const CALENDLY_PLACEHOLDER_URL = "https://calendly.com/your-fbc-link"; // Replace with actual link

export const SIMULATED_KNOWLEDGE_BASE = {
  "llm_fundamentals": "LLMs (Large Language Models) are advanced AI systems trained on vast amounts of text data to understand, generate, and manipulate human language. Our 'LLM Fundamentals' workshop provides a clear, actionable plan for getting started.",
  "ai_implementation": "We help businesses seamlessly integrate AI into their operations. Our consulting services focus on tailored strategies, process optimization, and measurable ROI. Common pain points we address include X, Y, and Z.",
  "workshops": `We offer two main workshops: 
1.  **AI/LLM Fundamentals for Beginners:** Jumpstart your AI journey with foundational knowledge and practical first steps. (Covers A, B, C)
2.  **Advanced AI Implementation Strategies:** For businesses looking to scale AI solutions and optimize existing processes. (Covers D, E, F)`,
  "consulting_services": `Our AI consulting services provide end-to-end support:
1.  **Strategy & Roadmap:** Defining your AI vision and path to execution.
2.  **Custom AI Development:** Building tailored solutions for your unique challenges.
3.  **Integration & Optimization:** Seamlessly incorporating AI into your workflows and maximizing its impact.
We typically see clients achieve [quantifiable benefit, e.g., '20% increase in efficiency'] within [timeframe, e.g., '3 months'].`,
  "pricing": "Our pricing is tailored to the specific needs and scope of each project. For workshops, we have standard packages. For consulting, we provide custom proposals after an initial consultation. Would you like to schedule a free 15-minute session to discuss your specific requirements?",
  "fbc_expertise": `${FBC_BRAND_NAME} specializes in making AI accessible and actionable for businesses. Our team has [X years] of combined experience in [relevant fields] and has helped companies like [Mention type of company or anonymized example] achieve significant results.`,
};

export const QUALIFICATION_QUESTIONS = [
    "What are your primary business goals right now?",
    "Are you currently using any AI tools or solutions in your business?",
    "What are the biggest challenges you're facing that you think AI could help solve?",
    "Are you looking for general AI education, specific project implementation, or ongoing strategic advice?"
];