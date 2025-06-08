import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, Loader2 } from 'lucide-react';
import { Theme } from '@/types';

interface InteractionInputBarProps {
  theme: Theme;
  onSendMessage: (message: string) => void;
  onVoiceModeToggle: () => void;
  isVoiceModeActive: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const InteractionInputBar: React.FC<InteractionInputBarProps> = ({
  theme,
  onSendMessage,
  onVoiceModeToggle,
  isVoiceModeActive,
  disabled = false,
  placeholder = "Type your message...",
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const containerBg = theme === Theme.DARK ? 'bg-gray-800/70' : 'bg-gray-100/70';
  const inputBg = theme === Theme.DARK ? 'bg-gray-700/50' : 'bg-white';
  const textColor = theme === Theme.DARK ? 'text-gray-200' : 'text-gray-800';
  const placeholderColor = theme === Theme.DARK ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const buttonBg = theme === Theme.DARK ? 'hover:bg-gray-700' : 'hover:bg-gray-200';

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className={`relative flex-shrink-0 p-3 sm:p-4 border-t ${containerBg} backdrop-blur-xl`}>
      <div className={`relative flex items-end gap-2 p-1 rounded-xl border border-transparent ${inputBg}`}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full p-2 bg-transparent resize-none outline-none text-base leading-tight ${textColor} ${placeholderColor}`}
          style={{ minHeight: '40px', maxHeight: '120px' }}
          rows={1}
        />
        <div className="flex-shrink-0 flex items-center gap-1">
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={`p-2 rounded-full transition-all duration-200 ${
              canSend
                ? 'bg-orange-500 text-white shadow-lg hover:bg-orange-600'
                : 'bg-gray-700 text-gray-400'
            }`}
            aria-label="Send message"
          >
            {disabled ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
          <button
            onClick={onVoiceModeToggle}
            className={`p-2 rounded-full ${buttonBg} ${
              isVoiceModeActive ? 'text-orange-500' : textColor
            }`}
            aria-label={isVoiceModeActive ? 'Turn off voice mode' : 'Turn on voice mode'}
          >
            <Mic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InteractionInputBar;