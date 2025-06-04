
import React, { useRef, useEffect, useState } from 'react';
import { Theme } from '../../../types';
import { MessageSquare, ArrowDown } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  imageUrl?: string;
  attachments?: File[];
  isLoading?: boolean;
  error?: string;
}

interface InteractionMessagesAreaProps {
  theme: Theme;
  messages: Message[];
  isTyping?: boolean;
  onExpandRequest?: (message: Message) => void;
  onRetry?: (messageId: string) => void;
  onFormSubmit?: (formData: any) => void;
  isFullscreen?: boolean;
  emptyStatePrompts?: string[];
}

export const InteractionMessagesArea: React.FC<InteractionMessagesAreaProps> = ({
  theme,
  messages,
  isTyping = false,
  onExpandRequest,
  onRetry,
  onFormSubmit,
  isFullscreen = false,
  emptyStatePrompts = []
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);

  // Theme-based styling
  const containerBg = theme === Theme.DARK 
    ? 'bg-black/50' 
    : 'bg-white/50';
  
  const textColor = theme === Theme.DARK ? 'text-white' : 'text-black';
  const mutedTextColor = theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600';
  const scrollButtonBg = theme === Theme.DARK 
    ? 'bg-white/10 hover:bg-white/20' 
    : 'bg-black/10 hover:bg-black/20';

  // Scroll handling
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setHasNewMessages(false);
  };

  // Monitor scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom);
      if (isNearBottom) setHasNewMessages(false);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom) {
      scrollToBottom('smooth');
    } else {
      setHasNewMessages(true);
    }
  }, [messages]);

  // Initial scroll
  useEffect(() => {
    scrollToBottom('auto');
  }, []);

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Messages Container */}
      <div
        ref={containerRef}
        className={`
          flex-1 overflow-y-auto
          ${containerBg} backdrop-blur-xl
          ${isFullscreen ? '' : 'rounded-t-xl'}
          transition-all duration-200
        `}
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
            {emptyStatePrompts.length > 0 && (
              <div className="grid gap-2 w-full max-w-md">
                {emptyStatePrompts.map((prompt, index) => (
                  <button
                    key={index}
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
          <div className="flex flex-col min-h-full p-4 sm:p-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`
                  flex flex-col max-w-3xl mx-auto w-full
                  ${index > 0 ? 'mt-6' : ''}
                `}
              >
                {/* Message Component would go here */}
                {/* This is a placeholder for the ChatMessageBubble component */}
                <div className={`
                  flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}
                `}>
                  {/* Placeholder for actual message content */}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center space-x-2 mt-6 max-w-3xl mx-auto w-full">
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
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom()}
          className={`
            absolute bottom-4 right-4 p-2 rounded-full shadow-lg
            transition-all duration-200 transform
            ${scrollButtonBg} ${textColor}
            ${hasNewMessages ? 'animate-bounce' : ''}
          `}
          title="Scroll to bottom"
        >
          <ArrowDown size={20} className={hasNewMessages ? 'text-orange-500' : ''} />
          {hasNewMessages && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full" />
          )}
        </button>
      )}
    </div>
  );
};

export default InteractionMessagesArea;
