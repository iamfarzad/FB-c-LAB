import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Image as ImageIcon, Search as SearchIcon, XCircle, MicOff } from 'lucide-react';
import { Theme } from '../../../types';

type InputMode = 'text' | 'image' | 'search';

interface InteractionInputBarProps {
  theme: Theme;
  onSendMessage: (messageText: string, imageBase64?: string, imageMimeType?: string) => void;
  onActivateVoiceMode: () => void;
  isAiThinking: boolean;
  isPanelFullscreen?: boolean;
  isPanelVoiceActive: boolean;
  onDeactivateVoiceMode: () => void;
  interimTranscript?: string; 
}

export const InteractionInputBar: React.FC<InteractionInputBarProps> = ({
  theme,
  onSendMessage,
  onActivateVoiceMode,
  isAiThinking,
  isPanelFullscreen,
  isPanelVoiceActive,
  onDeactivateVoiceMode,
  interimTranscript,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isPanelVoiceActive && interimTranscript) {
      setMessageInput(interimTranscript);
    } else if (!isPanelVoiceActive && messageInput === interimTranscript) {
      // Clear if voice deactivated and input shows old interim.
    }
  }, [isPanelVoiceActive, interimTranscript, messageInput]);


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isPanelVoiceActive) { 
      setMessageInput(e.target.value);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`; 
    }
  }, [messageInput]);

  const resetInputState = (keepVoiceActive = false) => {
    if (!keepVoiceActive || !interimTranscript) {
        setMessageInput('');
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; 
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result?.toString().split(',')[1];
        if (base64String) {
          onSendMessage(messageInput || `Describe this attached image`, base64String, file.type);
          resetInputState(isPanelVoiceActive);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendOrMicToggle = useCallback(() => {
    console.log('[InteractionInputBar DEBUG] handleSendOrMicToggle called', { 
      isPanelVoiceActive, 
      messageInput, 
      messageInputTrimmed: messageInput.trim(),
      inputMode, 
      isAiThinking,
      shouldActivateVoice: messageInput.trim() === '' && inputMode === 'text' && !isAiThinking
    });
    
    if (isPanelVoiceActive) { 
      console.log('[InteractionInputBar DEBUG] Deactivating voice mode');
      onDeactivateVoiceMode();
      resetInputState(false); 
      return;
    }

    if (messageInput.trim() === '' && inputMode === 'text' && !isAiThinking) { 
        console.log('[InteractionInputBar DEBUG] Conditions met - calling onActivateVoiceMode()');
        try {
          onActivateVoiceMode();
          console.log('[InteractionInputBar DEBUG] onActivateVoiceMode() called successfully');
        } catch (error) {
          console.error('[InteractionInputBar ERROR] onActivateVoiceMode() failed:', error);
        }
    } else if (messageInput.trim() !== '') { 
        console.log('[InteractionInputBar DEBUG] Sending message instead of activating voice');
        if (isAiThinking) return; 

        let messageToSend = messageInput.trim();
        if (inputMode === 'image') {
            messageToSend = `generate image: ${messageToSend}`;
        } else if (inputMode === 'search') {
            messageToSend = `search web: ${messageToSend}`;
        }
        onSendMessage(messageToSend);
        resetInputState(false); 
    } else {
        console.log('[InteractionInputBar DEBUG] No action taken - conditions not met for voice or send');
    }
  }, [messageInput, onSendMessage, onActivateVoiceMode, onDeactivateVoiceMode, isAiThinking, inputMode, isPanelVoiceActive]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (messageInput.trim() !== '' && !isAiThinking && !isPanelVoiceActive) { 
        handleSendOrMicToggle();
      }
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  let placeholderText = "Send a message or tap mic to speak...";
  if (isPanelVoiceActive) {
    placeholderText = "Listening... Tap mic to stop.";
  } else if (inputMode === 'image') {
    placeholderText = "Describe image to generate...";
  } else if (inputMode === 'search') {
    placeholderText = "Enter web search query...";
  }
  
  const inputBarContainerBg = isPanelFullscreen 
    ? (theme === Theme.DARK ? 'bg-black border-[var(--border-dark)]' : 'bg-gray-100 border-[var(--border-light)]')
    : (theme === Theme.DARK ? 'bg-gray-800 border-[var(--border-dark)]' : 'bg-gray-100 border-[var(--border-light)]');


  const mainInputContainerBaseStyle = `flex items-center w-full px-2 py-1 rounded-full shadow-sm transition-all border-2`;
  const mainInputContainerColors = isPanelVoiceActive 
    ? (theme === Theme.DARK ? 'bg-gray-700 text-[var(--accent-color)] border-[var(--accent-color)] animate-pulse-bg-custom' : 'bg-orange-100 text-[var(--accent-color-darker)] border-[var(--accent-color)] animate-pulse-bg-custom')
    : (theme === Theme.DARK
      ? 'bg-gray-700 text-gray-200 border-gray-600 hover:border-[var(--accent-color)] focus-within:border-[var(--accent-color)]'
      : 'bg-gray-100 text-gray-800 border-gray-300 hover:border-[var(--accent-color)] focus-within:border-[var(--accent-color)]');
  
  const iconButtonColor = theme === Theme.DARK ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700';
  
  const modeButtonBase = `p-1.5 rounded-md transition-colors text-xs flex items-center gap-1`;
  const modeButtonActive = theme === Theme.DARK ? 'bg-[var(--accent-color)] text-white' : 'bg-orange-200 text-[var(--accent-color-darker)]';
  const modeButtonInactive = theme === Theme.DARK ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300';

  return (
    <div className={`flex-shrink-0 p-2 sm:p-3 border-t ${inputBarContainerBg}`}>
      {!isPanelVoiceActive && (
        <div className="flex items-center justify-center gap-2 mb-2">
          <button
            onClick={() => setInputMode('text')}
            className={`${modeButtonBase} ${inputMode === 'text' ? modeButtonActive : modeButtonInactive}`}
            disabled={isAiThinking}
            title="Text Input Mode"
          >
            Text
          </button>
          <button
            onClick={() => setInputMode(inputMode === 'image' ? 'text' : 'image')}
            className={`${modeButtonBase} ${inputMode === 'image' ? modeButtonActive : modeButtonInactive}`}
            disabled={isAiThinking}
            title="Image Generation Mode"
          >
            <ImageIcon size={14} /> Image
          </button>
          <button
            onClick={() => setInputMode(inputMode === 'search' ? 'text' : 'search')}
            className={`${modeButtonBase} ${inputMode === 'search' ? modeButtonActive : modeButtonInactive}`}
            disabled={isAiThinking}
            title="Web Search Mode"
          >
            <SearchIcon size={14} /> Search
          </button>
        </div>
      )}

      <div 
        className={`${mainInputContainerBaseStyle} ${mainInputContainerColors}`}
      >
        {!isPanelVoiceActive && ( 
            <>
            <button
                onClick={triggerFileSelect}
                title="Attach image file"
                className={`p-2 rounded-full ${iconButtonColor} transition-colors`}
                disabled={isAiThinking}
                aria-label="Attach image file"
            >
                <Paperclip size={20} />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            </>
        )}
        
        <textarea
          ref={textareaRef}
          rows={1}
          value={messageInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholderText}
          className={`flex-1 mx-1 p-1.5 bg-transparent border-none focus:outline-none resize-none leading-tight text-sm placeholder:text-current placeholder:opacity-60
                      ${theme === Theme.DARK ? 'text-gray-200 placeholder-gray-400' : 'text-gray-800 placeholder-gray-500'}
                      ${isPanelVoiceActive ? 'italic' : ''} 
                    `}
          disabled={(isAiThinking && !isPanelVoiceActive) || (isPanelVoiceActive && !interimTranscript) } 
          aria-label="Chat message input"
          style={{ maxHeight: '100px' }} 
          readOnly={isPanelVoiceActive} 
        />
        
        <button 
          onClick={handleSendOrMicToggle}
          className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center
            ${isPanelVoiceActive ? 
              (theme === Theme.DARK ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-red-500 text-white hover:bg-red-600') 
            : (messageInput.trim() === '' && inputMode === 'text' && !isAiThinking ? 
              (theme === Theme.DARK ? 'bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color-hover)]' : 'bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color-hover)]') 
            : (isAiThinking ? 
              (theme === Theme.DARK ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-gray-400 text-gray-200 cursor-not-allowed') 
            : (theme === Theme.DARK ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-green-500 text-white hover:bg-green-600')) 
            )}`}
          aria-label={isPanelVoiceActive ? "Stop Listening" : (messageInput.trim() === '' && inputMode === 'text' && !isAiThinking ? "Activate Voice Input" : "Send Message")}
          title={isPanelVoiceActive ? "Stop Listening" : (messageInput.trim() === '' && inputMode === 'text' && !isAiThinking ? "Activate Voice Input" : "Send Message")}
          disabled={!isPanelVoiceActive && isAiThinking && messageInput.trim() !== ''} 
        >
          {isPanelVoiceActive ? <MicOff size={18} /> : (messageInput.trim() === '' && inputMode === 'text' && !isAiThinking ? <Mic size={18} /> : <Send size={18} />)}
        </button>
      </div>
    </div>
  );
};