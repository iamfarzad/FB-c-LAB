import { useCallback, useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketVoiceOptions {
  url?: string;
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

interface SessionConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  history?: any[];
}

export const useWebSocketVoice = (options: UseWebSocketVoiceOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Get WebSocket URL from environment or fallback
  const wsUrl = options.url || 
    process.env.NEXT_PUBLIC_LIVE_SERVER_URL || 
    'ws://localhost:8080/live';

  const connectWebSocket = useCallback(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected');
        return;
      }

      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        options.onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('📨 Received message:', message.type);
          
          setLastMessage(message);
          
          // Handle internal message types
          switch (message.type) {
            case 'session_started':
              console.log(`🎯 Session started: ${message.sessionId}`);
              break;
            case 'gemini_session_started':
              setIsSessionActive(true);
              break;
            case 'gemini_session_ended':
              setIsSessionActive(false);
              break;
            case 'error':
              setError(message.error);
              console.error('❌ Server error:', message.error);
              break;
          }
          
          options.onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
          setError('Failed to parse server message');
        }
      };

      ws.onerror = (event) => {
        console.error('❌ [useWebSocketVoice] WebSocket raw error event:', event);
        setError('WebSocket connection error');
        options.onError?.(event);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsSessionActive(false);
        options.onClose?.();
        
        // Attempt reconnection if not a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          console.log(`🔄 Attempting reconnection in ${delay}ms (attempt ${reconnectAttempts.current + 1})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connectWebSocket();
          }, delay);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setError(error instanceof Error ? error.message : 'Unknown connection error');
    }
  }, [wsUrl, options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsSessionActive(false);
    reconnectAttempts.current = 0;
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      console.log('📤 Sent message:', message.type);
    } else {
      console.warn('WebSocket is not connected');
      setError('WebSocket is not connected');
    }
  }, []);

  // Convenience methods for common operations
  const startSession = useCallback((config: SessionConfig = {}) => {
    sendMessage({
      type: 'start_session',
      config
    });
  }, [sendMessage]);

  const sendText = useCallback((text: string) => {
    sendMessage({
      type: 'user_text',
      text
    });
  }, [sendMessage]);

  const sendAudio = useCallback((audioData: string) => {
    sendMessage({
      type: 'user_audio',
      audioData
    });
  }, [sendMessage]);

  const sendImage = useCallback((imageData: string, mimeType: string = 'image/jpeg') => {
    sendMessage({
      type: 'user_image',
      imageData,
      mimeType
    });
  }, [sendMessage]);

  const endSession = useCallback(() => {
    sendMessage({
      type: 'end_session'
    });
  }, [sendMessage]);

  // Auto-connect on mount if enabled (only in browser)
  useEffect(() => {
    if (typeof window !== 'undefined' && options.autoConnect !== false) {
      connectWebSocket();
    }

    return () => {
      disconnect();
    };
  }, [connectWebSocket, disconnect, options.autoConnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Connection state
    isConnected,
    isSessionActive,
    error,
    lastMessage,
    
    // Connection control
    connect: connectWebSocket,
    disconnect,
    
    // Session control
    startSession,
    endSession,
    
    // Communication methods
    sendMessage,
    sendText,
    sendAudio,
    sendImage,
    
    // Utilities
    clearError: () => setError(null),
    reconnect: () => {
      disconnect();
      setTimeout(connectWebSocket, 1000);
    }
  };
};