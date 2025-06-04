
import React, { useEffect, useRef } from 'react';
import { ChatMessage, Theme, MessageSender } from '../../../types';
import { ChatMessageBubble } from '../ChatMessageBubble';
import { MessageCircle, Zap, Info, Lightbulb } from 'lucide-react'; 
import { FBC_BRAND_NAME } from '../../../constants';

interface InteractionMessagesAreaProps {
  messages: ChatMessage[];
  theme: Theme;
  isAiThinking: boolean;
  isPanelFullscreen?: boolean; 
  onExpandRequest?: (message: ChatMessage) => void;
  onSendMessage: (messageText: string) => void;
  isPanelVoiceActive: boolean; 
  onFormSubmit?: (messageId: string, formData: Record<string, string>) => void; // Added prop
}

export const InteractionMessagesArea: React.FC<InteractionMessagesAreaProps> = ({ 
  messages, 
  theme, 
  isAiThinking,
  isPanelFullscreen,
  onExpandRequest,
  onSendMessage,
  isPanelVoiceActive,
  onFormSubmit, // Destructure prop
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  const baseClasses = `flex-1 p-3 sm:p-4 space-y-1.5 overflow-y-auto`;
  
  let areaBgClass = '';
  if (isPanelFullscreen) {
    areaBgClass = theme === Theme.DARK ? 'bg-[var(--background-dark)]' : 'bg-[var(--background-light)]'; 
  } else {
    areaBgClass = theme === Theme.DARK ? 'bg-gray-800' : 'bg-white'; 
  }

  const fullscreenScrollbarStyles = isPanelFullscreen 
    ? `scrollbar-thin ${theme === Theme.DARK ? 'scrollbar-thumb-[var(--accent-color)] scrollbar-track-gray-800' : 'scrollbar-thumb-[var(--accent-color)] scrollbar-track-gray-200'}` 
    : '';
  
  const suggestionCards = [
    { text: "What are the advantages of Next.js?", icon: Zap },
    { text: "Write code for Dijkstra's algorithm", icon: Lightbulb },
    { text: `Tell me about ${FBC_BRAND_NAME}'s services`, icon: Info },
    { text: "What is the weather in San Francisco?", icon: MessageCircle }
  ];

  const showEmptyStateSuggestions = messages.length === 0 && !isAiThinking && !isPanelVoiceActive;

  return (
    <div className={`${baseClasses} ${areaBgClass} ${fullscreenScrollbarStyles}`}>
      {showEmptyStateSuggestions ? (
        <div className={`empty-state text-center p-6 flex flex-col items-center justify-center h-full ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
          <div className="mb-8">
            <h3 className={`text-2xl font-semibold mb-2 ${theme === Theme.DARK ? 'text-gray-100' : 'text-gray-700'}`}>Hello there!</h3>
            <p className={`text-md ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'}`}>How can I help you today?</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 w-full max-w-md lg:max-w-lg">
            {suggestionCards.map((card, index) => (
              <button
                key={index}
                onClick={() => onSendMessage(card.text)}
                className={`p-3 rounded-lg text-left text-sm transition-colors border
                  ${theme === Theme.DARK 
                    ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'}`}
              >
                <div className="flex items-start gap-2">
                  {card.icon && <card.icon size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--accent-color)' }} />}
                  <span>{card.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((msg) => (
          <ChatMessageBubble 
            key={msg.id} 
            message={msg} 
            theme={theme} 
            isPanelFullscreen={isPanelFullscreen}
            onExpandRequest={onExpandRequest}
            onFormSubmit={onFormSubmit} // Pass prop
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
