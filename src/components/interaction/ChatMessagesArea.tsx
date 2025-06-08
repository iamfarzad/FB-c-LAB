import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Theme, ChatMessage } from '@/types';
import { MessageSquare, ArrowDown } from 'lucide-react';
import { MemoizedChatMessageBubble } from './ChatMessageBubble';
import { VariableSizeList as List } from 'react-window';

interface ChatMessagesAreaProps {
  theme: Theme;
  messages: ChatMessage[];
  isAiThinking?: boolean;
  onSendMessage?: (message: string) => void;
  onExpandMessage: (message: ChatMessage) => void;
}

export const ChatMessagesArea: React.FC<ChatMessagesAreaProps> = ({
  theme,
  messages,
  isAiThinking = false,
  onSendMessage,
  onExpandMessage,
}) => {
  const listRef = useRef<List>(null);
  const sizeMap = useRef<Record<number, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollOffsetRef = useRef(0);

  // Theme-based styling
  const containerBg = theme === Theme.DARK 
    ? 'bg-black/50' 
    : 'bg-white/50';
  
  const textColor = theme === Theme.DARK ? 'text-white' : 'text-black';
  const mutedTextColor = theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600';
  const scrollButtonBg = theme === Theme.DARK 
    ? 'bg-white/10 hover:bg-white/20' 
    : 'bg-black/10 hover:bg-black/20';

  const setSize = useCallback((index: number, size: number) => {
    if (sizeMap.current[index] !== size) {
      sizeMap.current = { ...sizeMap.current, [index]: size };
      if (listRef.current) {
        listRef.current.resetAfterIndex(index);
      }
    }
  }, []);

  const getSize = (index: number) => sizeMap.current[index] || 150; // Default/estimated size

  // Improved scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (listRef.current && messages.length > 0) {
      listRef.current.scrollToItem(messages.length - 1, 'end');
      setHasNewMessages(false);
      setShowScrollButton(false);
    }
  }, [messages.length]);

  // Check if user is near bottom
  const isNearBottom = (scrollOffset: number) => {
    const container = containerRef.current;
    if (!listRef.current || !container) return false;

    // The total height of all items.
    const scrollHeight = listRef.current.props.itemSize(messages.length -1) * messages.length;
    const clientHeight = container.clientHeight;
    
    const threshold = 100; // pixels from bottom
    return scrollHeight - scrollOffset - clientHeight < threshold;
  };

  // Handle scroll events
  const handleScroll = ({ scrollOffset }: { scrollOffset: number }) => {
    scrollOffsetRef.current = scrollOffset;
    const nearBottom = isNearBottom(scrollOffset);
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

  // Monitor scroll position - This effect is no longer needed as onScroll is handled by the List component
  useEffect(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
  }, []);

  // Auto-scroll on new messages (only if user is near bottom)
  useEffect(() => {
    if (messages.length === 0) return;

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      const list = listRef.current;
      if (list) {
        if (isNearBottom(scrollOffsetRef.current) || !isUserScrolling) {
          scrollToBottom();
        } else {
          setHasNewMessages(true);
        }
      } else if (!isUserScrolling) {
        scrollToBottom();
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [messages.length, isAiThinking, scrollToBottom, isUserScrolling]);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const Row = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const message = messages[index];

    useEffect(() => {
      if (rowRef.current) {
        setSize(index, rowRef.current.getBoundingClientRect().height);
      }
    }, [index, setSize, message]); // Reruns when message content might change height

    if (!message) return null;

    return (
      <div style={style}>
        <div ref={rowRef} className="flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6 py-3">
          <MemoizedChatMessageBubble
            key={message.id}
            message={message}
            theme={theme}
            onExpandClick={() => onExpandMessage(message)}
          />
        </div>
      </div>
    );
  }, [messages, theme, onExpandMessage, setSize]);

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
          <List
            ref={listRef}
            height={containerRef.current?.clientHeight || 0}
            itemCount={messages.length + (isAiThinking ? 1 : 0)}
            itemSize={getSize}
            width="100%"
            onScroll={handleScroll}
            overscanCount={5}
          >
            {({ index, style }) => {
              if (index === messages.length && isAiThinking) {
                // Render Typing Indicator as the last item
                return (
                  <div style={style}>
                    <div className="flex items-center space-x-2 max-w-3xl mx-auto w-full px-4 sm:px-6 py-3">
                      <div className={`
                        flex space-x-1 px-4 py-3 rounded-2xl
                        ${theme === Theme.DARK ? 'bg-white/5' : 'bg-black/5'}
                      `}>
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                );
              }
              return <Row index={index} style={style} />;
            }}
          </List>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className={`
            absolute bottom-4 right-4 p-3 rounded-full shadow-lg
            transition-all duration-200 transform hover:scale-105
            ${scrollButtonBg} ${textColor}
            ${hasNewMessages ? 'animate-pulse' : ''}
            z-10
          `}
          title="Scroll to bottom"
          aria-label="Scroll to bottom"
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