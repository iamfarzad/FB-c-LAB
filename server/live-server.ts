import WebSocket from 'ws';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createServer } from 'http';
import { parse } from 'url';

// Environment variables
const PORT = process.env.PORT || 8080;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is required');
}

// Initialize Gemini AI
const genai = new GoogleGenerativeAI(GEMINI_API_KEY);

interface ClientSession {
  id: string;
  ws: WebSocket;
  geminiSession?: any;
  isActive: boolean;
  startTime: number;
}

class LiveServer {
  private wss: WebSocket.Server;
  private sessions: Map<string, ClientSession> = new Map();
  private server: any;

  constructor() {
    // Create HTTP server
    this.server = createServer();
    
    // Create WebSocket server
    this.wss = new WebSocket.Server({ 
      server: this.server,
      path: '/live'
    });

    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers() {
    this.wss.on('connection', (ws: WebSocket, req: any) => {
      const sessionId = this.generateSessionId();
      console.log(`🔌 New connection: ${sessionId}`);

      const session: ClientSession = {
        id: sessionId,
        ws,
        isActive: true,
        startTime: Date.now()
      };

      this.sessions.set(sessionId, session);

      // Send welcome message
      this.sendMessage(ws, {
        type: 'session_started',
        sessionId,
        message: 'Connected to live server'
      });

      ws.on('message', async (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(sessionId, message);
        } catch (error) {
          console.error('❌ Message parsing error:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        console.log(`🔌 Connection closed: ${sessionId}`);
        this.cleanupSession(sessionId);
      });

      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for ${sessionId}:`, error);
        this.cleanupSession(sessionId);
      });
    });
  }

  private async handleMessage(sessionId: string, message: any) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) {
      return;
    }

    console.log(`📨 Received message from ${sessionId}:`, message.type);

    try {
      switch (message.type) {
        case 'start_session':
          await this.startGeminiSession(session, message.config || {});
          break;
        
        case 'user_text':
          await this.handleUserText(session, message.text);
          break;
        
        case 'user_audio':
          await this.handleUserAudio(session, message.audioData);
          break;
        
        case 'user_image':
          await this.handleUserImage(session, message.imageData, message.mimeType);
          break;
        
        case 'end_session':
          await this.endGeminiSession(session);
          break;
        
        default:
          console.warn(`⚠️ Unknown message type: ${message.type}`);
          this.sendError(session.ws, `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`❌ Error handling message:`, error);
      this.sendError(session.ws, `Failed to process ${message.type}`);
    }
  }

  private async startGeminiSession(session: ClientSession, config: any) {
    try {
      const model = genai.getGenerativeModel({ 
        model: config.model || 'gemini-2.0-flash-exp',
        generationConfig: {
          temperature: config.temperature || 0.7,
          maxOutputTokens: config.maxTokens || 1000,
        }
      });

      // For live sessions, we'll use a simple chat session for now
      // In the future, this could be upgraded to use Gemini Live Audio API
      const chat = model.startChat({
        history: config.history || [],
      });

      session.geminiSession = chat;

      this.sendMessage(session.ws, {
        type: 'gemini_session_started',
        message: 'Gemini session initialized'
      });

      console.log(`✅ Gemini session started for ${session.id}`);
    } catch (error) {
      console.error('❌ Failed to start Gemini session:', error);
      this.sendError(session.ws, 'Failed to initialize Gemini session');
    }
  }

  private async handleUserText(session: ClientSession, text: string) {
    if (!session.geminiSession) {
      this.sendError(session.ws, 'No active Gemini session');
      return;
    }

    try {
      // Send typing indicator
      this.sendMessage(session.ws, {
        type: 'ai_thinking',
        message: 'Processing your message...'
      });

      const result = await session.geminiSession.sendMessage(text);
      const response = await result.response;
      const responseText = response.text();

      // Send the response back
      this.sendMessage(session.ws, {
        type: 'ai_response',
        text: responseText,
        timestamp: Date.now()
      });

      console.log(`💬 Text response sent to ${session.id}`);
    } catch (error) {
      console.error('❌ Text processing error:', error);
      this.sendError(session.ws, 'Failed to process text message');
    }
  }

  private async handleUserAudio(session: ClientSession, audioData: string) {
    if (!session.geminiSession) {
      this.sendError(session.ws, 'No active Gemini session');
      return;
    }

    try {
      // For now, send a placeholder response
      // TODO: Implement actual audio processing with Gemini Live Audio API
      this.sendMessage(session.ws, {
        type: 'ai_response',
        text: 'Audio processing is not yet implemented. Please use text input.',
        timestamp: Date.now()
      });

      console.log(`🎤 Audio received from ${session.id} (placeholder response sent)`);
    } catch (error) {
      console.error('❌ Audio processing error:', error);
      this.sendError(session.ws, 'Failed to process audio');
    }
  }

  private async handleUserImage(session: ClientSession, imageData: string, mimeType: string) {
    if (!session.geminiSession) {
      this.sendError(session.ws, 'No active Gemini session');
      return;
    }

    try {
      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: mimeType || 'image/jpeg'
        }
      };

      const result = await session.geminiSession.sendMessage([
        'Analyze this image and describe what you see.',
        imagePart
      ]);
      
      const response = await result.response;
      const responseText = response.text();

      this.sendMessage(session.ws, {
        type: 'ai_response',
        text: responseText,
        timestamp: Date.now()
      });

      console.log(`🖼️ Image analysis sent to ${session.id}`);
    } catch (error) {
      console.error('❌ Image processing error:', error);
      this.sendError(session.ws, 'Failed to process image');
    }
  }

  private async endGeminiSession(session: ClientSession) {
    session.geminiSession = null;
    this.sendMessage(session.ws, {
      type: 'gemini_session_ended',
      message: 'Session ended'
    });
    console.log(`🔚 Gemini session ended for ${session.id}`);
  }

  private sendMessage(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.sendMessage(ws, {
      type: 'error',
      error,
      timestamp: Date.now()
    });
  }

  private cleanupSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.geminiSession = null;
      this.sessions.delete(sessionId);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public start() {
    this.server.listen(PORT, () => {
      console.log(`🚀 Live WebSocket server running on port ${PORT}`);
      console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}/live`);
    });
  }

  public getStats() {
    return {
      activeSessions: this.sessions.size,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }
}

// Start the server
const liveServer = new LiveServer();
liveServer.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down live server...');
  process.exit(0);
});

export default liveServer;