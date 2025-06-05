import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Image, 
  FileText, 
  Smile, 
  Square, 
  Loader2,
  X,
  Plus,
  Camera,
  Video
} from 'lucide-react';
import { Theme } from '../../../types';

interface InteractionInputBarProps {
  theme: Theme;
  onSendMessage: (message: string, attachments?: File[]) => void;
  isFullscreen?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export const InteractionInputBar: React.FC<Omit<InteractionInputBarProps, 'onVoiceModeToggle' | 'isVoiceMode' | 'isListening' | 'interimTranscript'>> = ({
  theme,
  onSendMessage,
  isFullscreen = false,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 2000
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Theme-based styling
  const containerBg = theme === Theme.DARK 
    ? 'bg-black/90 border-white/10' 
    : 'bg-white/90 border-black/10';
  
  const inputBg = theme === Theme.DARK 
    ? 'bg-white/5 border-white/10 focus:border-orange-500/50' 
    : 'bg-black/5 border-black/10 focus:border-orange-500/50';
  
  const textColor = theme === Theme.DARK ? 'text-white' : 'text-black';
  const placeholderColor = theme === Theme.DARK ? 'placeholder-gray-400' : 'placeholder-gray-500';
  const buttonBg = theme === Theme.DARK ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20';

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = isFullscreen ? 200 : 120;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  }, [isFullscreen]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Handle message sending
  const handleSend = useCallback(() => {
    const finalMessage = message.trim();
    if (finalMessage && !disabled) {
      onSendMessage(finalMessage, attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [message, attachments, disabled, onSendMessage]);

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    setShowAttachmentMenu(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setAttachments(prev => [...prev, ...files]);
  };

  // Remove attachment
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Close attachment menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setShowAttachmentMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const attachmentOptions = [
    { icon: Image, label: 'Image', accept: 'image/*', color: 'text-blue-500' },
    { icon: FileText, label: 'Document', accept: '.pdf,.doc,.docx,.txt', color: 'text-green-500' },
    { icon: Camera, label: 'Camera', accept: 'image/*', capture: 'environment', color: 'text-purple-500' },
    { icon: Video, label: 'Video', accept: 'video/*', color: 'text-red-500' }
  ];

  const displayMessage = message;
  const canSend = (displayMessage.trim().length > 0 || attachments.length > 0) && !disabled;
  const characterCount = displayMessage.length;
  const isNearLimit = characterCount > maxLength * 0.8;

  return (
    <div className={`
      relative flex-shrink-0 p-3 sm:p-4 border-t backdrop-blur-xl
      ${containerBg} ${isDragOver ? 'border-orange-500/50 bg-orange-500/5' : ''}
      transition-all duration-200
    `}>
      {/* Drag Overlay */}
      {isDragOver && (
        <div className={`
          absolute inset-0 flex items-center justify-center
          bg-orange-500/10 border-2 border-dashed border-orange-500/50 rounded-lg
          backdrop-blur-sm z-10
        `}>
          <div className="text-center">
            <Paperclip size={32} className="text-orange-500 mx-auto mb-2" />
            <p className={`text-sm font-medium ${textColor}`}>Drop files to attach</p>
          </div>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg border
                  ${theme === Theme.DARK ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}
                `}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {file.type.startsWith('image/') ? (
                    <Image size={16} className="text-blue-500 flex-shrink-0" />
                  ) : (
                    <FileText size={16} className="text-green-500 flex-shrink-0" />
                  )}
                  <span className={`text-sm truncate ${textColor}`}>
                    {file.name}
                  </span>
                  <span className={`text-xs ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({(file.size / 1024).toFixed(1)}KB)
                  </span>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className={`
                    p-1 rounded-full transition-colors
                    ${theme === Theme.DARK ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'}
                  `}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Text Input Only (voice mode parked) */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            w-full px-4 py-3 rounded-xl border resize-none
            ${inputBg} ${textColor} ${placeholderColor}
            focus:outline-none focus:ring-2 focus:ring-orange-500/20
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          style={{ minHeight: '48px' }}
          rows={1}
        />
        
        {/* Character Counter */}
        {characterCount > 0 && (
          <div className={`
            absolute bottom-2 right-2 text-xs
            ${isNearLimit ? 'text-orange-500' : theme === Theme.DARK ? 'text-gray-400' : 'text-gray-500'}
          `}>
            {characterCount}/{maxLength}
          </div>
        )}
      </div>

      {/* Send Button Only */}
      <div className="flex space-x-2">
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`
            p-2.5 sm:p-3 rounded-xl transition-all duration-200
            ${canSend 
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg transform hover:scale-105' 
              : `${buttonBg} opacity-50 cursor-not-allowed ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-500'}`
            }
          `}
          title="Send message (Enter)"
        >
          {disabled ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,video/*"
      />

      {/* Quick Actions (Mobile) */}
      <div className="sm:hidden mt-3 flex justify-center space-x-4">
        <button
          onClick={() => setMessage(prev => prev + '👍')}
          className={`p-2 rounded-lg ${buttonBg} transition-colors`}
        >
          <Smile size={16} className="text-orange-500" />
        </button>
      </div>
    </div>
  );
};

export default InteractionInputBar;