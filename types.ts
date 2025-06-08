export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum MessageSender {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  SEARCH_RESULT = 'search_result',
  ERROR = 'error',
}

export interface WebSource {
  uri: string;
  title: string;
}

export type FormType = 'name_email_form';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  type: MessageType;
  text?: string;
  imageUrl?: string;
  images?: { base64Data: string; mimeType: string }[];
  sources?: WebSource[];
  timestamp: number;
  isLoading?: boolean;
  isPinned?: boolean;
  error?: string;
  form?: any[];
  attachments?: any[];
  isEditing?: boolean;
  editedTimestamp?: number;
  formType?: FormType;
  formSubmitted?: boolean;
}

export type ToolAction =
  | 'Create an image'
  | 'Search the web'
  | 'Write or code' // Generic text generation
  | 'Run deep research' // Could be specialized search or longer text gen
  | 'Think for longer'; // Potentially for higher quality responses

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[]; // Bullet points for benefits/features
}

export interface Testimonial {
  id:string;
  quote: string;
  name: string;
  title: string;
  company?: string;
  logoUrl?: string; // URL for company logo (optional)
}


// Gemini API related types
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web: GroundingChunkWeb;
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}
export interface Candidate {
  groundingMetadata?: GroundingMetadata;
}
export interface GeminiResponse {
  text: string;
  candidates?: Candidate[];
}

// For GdmLiveAudio events
export enum LiveAudioTranscriptType {
  USER_INTERIM = 'user_interim',
  USER_FINAL = 'user_final',
  AI_SPEECH = 'ai_speech',
}

export interface LiveAudioMessage {
  type: LiveAudioTranscriptType;
  text: string;
}