import React, { useRef, useEffect, useState } from 'react';
import { Theme, ChatMessage, MessageSender } from '../../../types';
import { MessageSquare, ArrowDown } from 'lucide-react';
import { ChatMessageBubble } from '../ChatMessageBubble';

interface ChatMessagesAreaProps {
  theme: Theme;
  messages: ChatMessage[];
  isAiThinking?: boolean;
  isPanelFullscreen?: boolean;
  onExpandRequest?: (message: ChatMessage) => void;
  onSendMessage?: (message: string) => void;
  isPanelVoiceActive?: boolean;
  onFormSubmit?: (messageId: string, formData: Record<string, string>) => void;
}

export const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  theme,
  messages,
  isAiThinking = false,
  isPanelFullscreen = false,
  onExpandRequest,
  onSendMessage,
  isPanelVoiceActive = false,
  onFormSubmit,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Theme-based styling
  const containerBg = theme === Theme.DARK 
    ? 'bg-black/50' 
    : 'bg-white/50';
  
  const textColor = theme === Theme.DARK ? 'text-white' : 'text-black';
  const mutedTextColor = theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600';
  const scrollButtonBg = theme === Theme.DARK 
    ? 'bg-white/10 hover:bg-white/20' 
    : 'bg-black/10 hover:bg-black/20';

  // Improved scroll to bottom function
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current && containerRef.current) {
      // Use scrollTop instead of scrollIntoView for better control
      const container = containerRef.current;
      if (behavior === 'auto') {
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
      setHasNewMessages(false);
      setShowScrollButton(false);
    }
  };

  // Check if user is near bottom
  const isNearBottom = () => {
    const container = containerRef.current;
    if (!container) return false;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = 100; // pixels from bottom
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // Handle scroll events
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const nearBottom = isNearBottom();
    setShowScrollButton(!nearBottom);
    
    if (nearBottom) {
      setHasNewMessages(false);
    }

    // Detect user scrolling
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 150);
  };

  // Monitor scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll on new messages (only if user is near bottom)
  useEffect(() => {
    if (messages.length === 0) return;

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      if (isNearBottom() || !isUserScrolling) {
        scrollToBottom('smooth');
      } else {
        setHasNewMessages(true);
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [messages.length, isAiThinking]);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('auto');
    }
  }, []);

  const quickReplies = [
    "Tell me about your AI consulting services",
    "What workshops do you offer?",
    "How can AI help my business?",
    "I'd like to book a consultation"
  ];

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Messages Container */}
      <div
        ref={containerRef}
        className={`
          flex-1 overflow-y-auto overflow-x-hidden
          chat-scroll-container
          ${containerBg} backdrop-blur-xl
          ${isPanelFullscreen ? '' : 'rounded-t-xl'}
          transition-all duration-200
          scroll-smooth
        `}
        style={{
          scrollBehavior: 'smooth',
          overscrollBehavior: 'contain'
        }}
      >
        {messages.length === 0 ? (
          // Empty State
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className={`
              p-4 rounded-full mb-4
              ${theme === Theme.DARK ? 'bg-white/5' : 'bg-black/5'}
            `}>
              <MessageSquare size={32} className="text-orange-500" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${textColor}`}>
              Start a Conversation
            </h3>
            <p className={`text-sm mb-6 ${mutedTextColor}`}>
              Choose a prompt or type your own message to begin
            </p>
            {onSendMessage && (
              <div className="grid gap-2 w-full max-w-md">
                {quickReplies.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => onSendMessage(prompt)}
                    className={`
                      p-3 rounded-lg border text-sm text-left transition-all duration-200
                      ${theme === Theme.DARK 
                        ? 'border-white/10 hover:bg-white/5' 
                        : 'border-black/10 hover:bg-black/5'
                      }
                      ${textColor}
                    `}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          // Messages List
          <div className="flex flex-col p-4 sm:p-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className="flex flex-col max-w-3xl mx-auto w-full"
              >
                <ChatMessageBubble
                  message={message}
                  theme={theme}
                  isPanelFullscreen={isPanelFullscreen}
                  onExpandRequest={onExpandRequest}
                  onFormSubmit={onFormSubmit}
                />
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isAiThinking && (
              <div className="flex items-center space-x-2 max-w-3xl mx-auto w-full">
                <div className={`
                  flex space-x-1 px-4 py-3 rounded-2xl
                  ${theme === Theme.DARK ? 'bg-white/5' : 'bg-black/5'}
                `}>
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Messages End Marker */}
            <div ref={messagesEndRef} className="h-1" />
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className={`
            absolute bottom-4 right-4 p-3 rounded-full shadow-lg
            transition-all duration-200 transform hover:scale-105
            ${scrollButtonBg} ${textColor}
            ${hasNewMessages ? 'animate-pulse' : ''}
            z-10
          `}
          title="Scroll to bottom"
        >
          <ArrowDown size={20} className={hasNewMessages ? 'text-orange-500' : ''} />
          {hasNewMessages && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-ping" />
          )}
        </button>
      )}
    </div>
  );
}; 