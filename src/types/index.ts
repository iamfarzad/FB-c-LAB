// Explicit exports from root types.ts to fix import issues
export { 
  Theme,
  MessageSender, 
  MessageType,
  LiveAudioTranscriptType
} from '../../types';

export type { 
  WebSource, 
  FormType, 
  ChatMessage, 
  ToolAction, 
  Service, 
  Testimonial, 
  GroundingChunkWeb, 
  GroundingChunk, 
  GroundingMetadata, 
  Candidate, 
  GeminiResponse, 
  LiveAudioMessage
} from '../../types';

// Additional local interfaces
export interface FormField {
  name: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

 