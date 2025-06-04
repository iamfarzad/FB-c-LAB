import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Brain, X, Trash2, Maximize, Minimize, Mic, Send, Paperclip, Info, Lightbulb, Zap, MessageSquare as ChatIcon, ChevronDown, LayoutPanelLeft, PanelLeftClose } from 'lucide-react'; // Updated import
import { Theme, ChatMessage, MessageSender, MessageType, WebSource } from '../../../types';
import { FBC_BRAND_NAME, AI_ASSISTANT_NAME } from '../../../constants';
import { InteractionMessagesArea } from './InteractionMessagesArea';
import { InteractionInputBar } from './InteractionInputBar';
import { NativeLiveAudioWrapper } from '../liveaudio/NativeLiveAudioWrapper';
import { ExpandedMessageDisplay } from './ExpandedMessageDisplay';
import { ChatSidePanel } from './ChatSidePanel'; // Import ChatSidePanel
import { GdmLiveAudio } from '../liveaudio/GdmLiveAudio';
import { FullScreenVoiceOverlay } from '../liveaudio/FullScreenVoiceOverlay'; 

interface UnifiedInteractionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  chatHistory: ChatMessage[];
  onSendMessage: (messageText: string, imageBase64?: string, imageMimeType?: string) => Promise<void>;
  onClearChat: () => void;
  isAiThinking: boolean;
  onLiveUserSpeechFinal: (text: string) => void;
  onLiveAiSpeechText: (text: string) => void;
  initialUserMessage?: string;
  onFormSubmit: (messageId: string, formData: Record<string, string>) => void; // Added prop
}

export const UnifiedInteractionPanel: React.FC<UnifiedInteractionPanelProps> = ({
  isOpen,
  onClose,
  theme,
  chatHistory,
  onSendMessage,
  onClearChat,
  isAiThinking,
  onLiveUserSpeechFinal,
  onLiveAiSpeechText,
  initialUserMessage,
  onFormSubmit, // Destructure prop
}) => {
  const [isFullscreenInternal, setIsFullscreenInternal] = useState(false);
  const [expandedMessageContent, setExpandedMessageContent] = useState<ChatMessage | null>(null);
  const [isPanelVoiceActive, setIsPanelVoiceActive] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false); 
  const gdmAudioRef = useRef<GdmLiveAudio>(null);
  const [processedInitialMessage, setProcessedInitialMessage] = useState(false);

  useEffect(() => {
    if (isOpen && initialUserMessage && !processedInitialMessage) {
      if (initialUserMessage.toLowerCase().includes("activate voice mode")) {
        setIsPanelVoiceActive(true);
      } else {
        if (!isPanelVoiceActive) {
            onSendMessage(initialUserMessage);
        }
      }
      setProcessedInitialMessage(true);
    }
    if (!isOpen) {
        setProcessedInitialMessage(false);
        if (isPanelVoiceActive) {
           handleDeactivatePanelVoiceMode();
        }
        setIsSidePanelOpen(false); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialUserMessage, processedInitialMessage, onSendMessage, isPanelVoiceActive]);


  useEffect(() => {
    // Check if the custom element is defined
    if (!customElements.get('gdm-live-audio')) {
      console.warn('[UnifiedInteractionPanel] gdm-live-audio custom element not defined');
    }
    const gdmElement = gdmAudioRef.current;
    if (gdmElement) {
      const handleUserSpeechFinalEvent = (event: Event) => {
        try {
          onLiveUserSpeechFinal((event as CustomEvent<{text: string}>).detail.text);
        } catch (error) {
          console.error('[UnifiedInteractionPanel ERROR] user-speech-final event error:', error);
        }
      };
      const handleAiSpeechTextEvent = (event: Event) => {
        try {
          onLiveAiSpeechText((event as CustomEvent<{text: string}>).detail.text);
        } catch (error) {
          console.error('[UnifiedInteractionPanel ERROR] ai-speech-text event error:', error);
        }
      };
      try {
        (gdmElement as unknown as EventTarget).addEventListener('user-speech-final', handleUserSpeechFinalEvent as EventListener);
        (gdmElement as unknown as EventTarget).addEventListener('ai-speech-text', handleAiSpeechTextEvent as EventListener);
        return () => {
          (gdmElement as unknown as EventTarget).removeEventListener('user-speech-final', handleUserSpeechFinalEvent as EventListener);
          (gdmElement as unknown as EventTarget).removeEventListener('ai-speech-text', handleAiSpeechTextEvent as EventListener);
        };
      } catch (error) {
        console.error('[UnifiedInteractionPanel ERROR] Failed to add event listeners:', error);
      }
    }
  }, [onLiveUserSpeechFinal, onLiveAiSpeechText]);

  const handleActivatePanelVoiceMode = useCallback(() => {
    console.log('[UnifiedInteractionPanel DEBUG] handleActivatePanelVoiceMode called');
    setIsPanelVoiceActive(true);
    console.log('[UnifiedInteractionPanel DEBUG] isPanelVoiceActive set to true');
    
    const tryStartRecording = (attempts = 0) => {
      console.log(`[UnifiedInteractionPanel DEBUG] tryStartRecording attempt ${attempts + 1}`);
      const audioElement = gdmAudioRef.current;
      
      console.log('[UnifiedInteractionPanel DEBUG] gdmAudioRef.current:', {
        exists: !!audioElement,
        hasStartRecording: audioElement && typeof audioElement.startRecording === 'function',
        elementType: audioElement ? audioElement.constructor.name : 'null',
        isCustomElement: audioElement ? audioElement.tagName === 'GDM-LIVE-AUDIO' : false
      });
      
      if (audioElement && typeof audioElement.startRecording === 'function') {
        try {
          console.log('[UnifiedInteractionPanel DEBUG] startRecording() is available, calling now');
          audioElement.startRecording();
          console.log('[UnifiedInteractionPanel DEBUG] startRecording() called successfully');
        } catch (error) {
          console.error('[UnifiedInteractionPanel ERROR] Failed to start recording:', error);
        }
      } else if (attempts < 15) {
        console.log(`[UnifiedInteractionPanel DEBUG] Audio element not ready, retrying in 100ms (attempt ${attempts + 1}/15)`);
        setTimeout(() => tryStartRecording(attempts + 1), 100);
      } else {
        console.error('[UnifiedInteractionPanel ERROR] startRecording() not available after 15 attempts');
        console.log('[UnifiedInteractionPanel DEBUG] Final state:', {
          gdmAudioRefExists: !!gdmAudioRef.current,
          customElementRegistered: !!customElements.get('gdm-live-audio'),
          elementInDOM: document.querySelector('gdm-live-audio')
        });
      }
    };
    setTimeout(() => tryStartRecording(), 200);
  }, []);

  const handleDeactivatePanelVoiceMode = useCallback(() => {
    setIsPanelVoiceActive(false);
    try {
      if (gdmAudioRef.current && typeof gdmAudioRef.current.stopRecording === 'function') {
        gdmAudioRef.current.stopRecording();
      }
    } catch (error) {
      console.error('[UnifiedInteractionPanel ERROR] Failed to stop recording:', error);
    }
  }, []);

  const handleClearChatAndSession = () => {
    onClearChat();
    if (gdmAudioRef.current) {
      gdmAudioRef.current.resetSession();
    }
  };

  const handleExpandMessageContent = (message: ChatMessage) => {
    if (isFullscreenInternal) {
      setExpandedMessageContent(message);
    }
  };
  const handleCollapseMessageContent = () => setExpandedMessageContent(null);

  const quickReplies = [
    { text: `About ${FBC_BRAND_NAME} services`, icon: Info, prompt: `Tell me about ${FBC_BRAND_NAME}'s services.` },
    { text: "AI/LLM Workshops", icon: Lightbulb, prompt: "What AI/LLM workshops do you offer?" },
    { text: "Custom AI Consulting", icon: Zap, prompt: "Can you describe your custom AI consulting?" },
    { text: `Book a consultation`, icon: ChatIcon, prompt: `I'd like to book a consultation.`},
  ];

  const handleQuickReply = (promptText: string) => {
    onSendMessage(promptText);
  };

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const toggleFullscreen = () => {
    setIsFullscreenInternal(!isFullscreenInternal);
  };

  if (!isOpen) return null;

  const panelWrapperClasses = `
    fixed z-[100] transition-all duration-300 ease-in-out
    ${isFullscreenInternal
      ? `inset-0 rounded-none ${theme === Theme.DARK ? 'bg-[var(--card-bg-dark)]' : 'bg-[var(--card-bg-light)]'}` 
      : `top-4 bottom-4 right-4 md:top-6 md:bottom-6 md:right-6 lg:top-8 lg:bottom-8 lg:right-8 rounded-xl shadow-2xl border ${theme === Theme.DARK ? 'bg-[var(--card-bg-dark)] text-[var(--text-dark)] border-[var(--border-dark)]' : 'bg-[var(--card-bg-light)] text-[var(--text-light)] border-[var(--border-light)]'}`
    }
  `;

  const panelInnerClasses = `
    w-full h-full flex flex-col
    ${isFullscreenInternal ? `max-w-full max-h-full ${theme === Theme.DARK ? 'bg-[var(--card-bg-dark)]' : 'bg-[var(--card-bg-light)]'}` : (theme === Theme.DARK ? 'bg-[var(--card-bg-dark)]' : 'bg-white')}
    ${isFullscreenInternal ? 'rounded-none' : 'rounded-xl'}
     overflow-hidden
  `;
  
  const panelHeaderBgClass = isFullscreenInternal
    ? (theme === Theme.DARK ? 'bg-black/80 backdrop-blur-sm border-[var(--border-dark)]' : 'bg-white/80 backdrop-blur-sm border-[var(--border-light)]')
    : (theme === Theme.DARK ? 'bg-gray-800 border-[var(--border-dark)]' : 'bg-gray-100 border-[var(--border-light)]');

  const panelHeaderTextColorClass = theme === Theme.DARK ? 'text-[var(--text-dark)]' : 'text-[var(--text-light)]';

  const panelHeader = (
    <header className={`flex-shrink-0 p-3 sm:p-4 flex justify-between items-center border-b ${panelHeaderBgClass}`}>
      <div className="flex items-center">
        <button 
          onClick={toggleSidePanel} 
          className={`p-1.5 sm:p-2 mr-1 sm:mr-2 rounded-full transition-colors ${theme === Theme.DARK ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} ${panelHeaderTextColorClass}`} 
          title={isSidePanelOpen ? "Close Tools Panel" : "Open Tools Panel"}
          aria-label={isSidePanelOpen ? "Close Tools Panel" : "Open Tools Panel"}
        >
          {isSidePanelOpen ? <PanelLeftClose size={18}/> : <LayoutPanelLeft size={18} />}
        </button>
        <h2 id="interaction-panel-title" className={`text-md sm:text-lg font-semibold flex items-center gap-1.5 sm:gap-2 ${panelHeaderTextColorClass}`}>
          <Brain size={20} style={{ color: 'var(--accent-color)' }} /> {AI_ASSISTANT_NAME}
        </h2>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2">
        <button onClick={handleClearChatAndSession} className={`p-1.5 sm:p-2 rounded-full transition-colors ${theme === Theme.DARK ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} ${panelHeaderTextColorClass}`} title="Clear Chat" aria-label="Clear Chat"><Trash2 size={18} /></button>
        <button onClick={toggleFullscreen} className={`p-1.5 sm:p-2 rounded-full transition-colors ${theme === Theme.DARK ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} ${panelHeaderTextColorClass}`} title={isFullscreenInternal ? "Exit Fullscreen" : "Enter Fullscreen"} aria-label={isFullscreenInternal ? "Exit Fullscreen" : "Enter Fullscreen"}>
          {isFullscreenInternal ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
        <button onClick={onClose} className={`p-1.5 sm:p-2 rounded-full transition-colors ${theme === Theme.DARK ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} ${panelHeaderTextColorClass}`} title="Close Panel" aria-label="Close Panel"><X size={18} /></button>
      </div>
    </header>
  );

  const showQuickReplies = chatHistory.length > 0 && chatHistory.length <= 2 && !isAiThinking && chatHistory.filter(m => m.sender === MessageSender.AI && !m.isLoading).length > 0 && !isPanelVoiceActive;

  return (
    <div className={panelWrapperClasses} role="dialog" aria-modal="true" aria-labelledby="interaction-panel-title">
      <div className={panelInnerClasses}>
        {panelHeader}
        <div className="flex flex-1 overflow-hidden"> 
          <ChatSidePanel 
            isOpen={isSidePanelOpen}
            onClose={toggleSidePanel}
            theme={theme}
            chatHistory={chatHistory}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            {isFullscreenInternal && !isPanelVoiceActive && expandedMessageContent && (
                <div className="flex-grow flex overflow-hidden">
                  <div className={`w-2/3 flex-shrink-0 border-r ${theme === Theme.DARK ? 'border-[var(--border-dark)]' : 'border-[var(--border-light)]'}`}>
                    <ExpandedMessageDisplay
                      message={expandedMessageContent}
                      theme={theme}
                      onCollapse={handleCollapseMessageContent}
                    />
                  </div>
                  <div className="w-1/3 flex flex-col overflow-hidden">
                    <InteractionMessagesArea
                      messages={chatHistory}
                      theme={theme}
                      isAiThinking={isAiThinking}
                      isPanelFullscreen={isFullscreenInternal}
                      onExpandRequest={handleExpandMessageContent}
                      onSendMessage={onSendMessage}
                      isPanelVoiceActive={isPanelVoiceActive}
                      onFormSubmit={onFormSubmit} // Pass prop
                    />
                    <InteractionInputBar
                      theme={theme}
                      onSendMessage={onSendMessage}
                      onActivateVoiceMode={handleActivatePanelVoiceMode}
                      isAiThinking={isAiThinking}
                      isPanelFullscreen={isFullscreenInternal}
                      isPanelVoiceActive={isPanelVoiceActive}
                      onDeactivateVoiceMode={handleDeactivatePanelVoiceMode}
                      interimTranscript={gdmAudioRef.current?.lastUserInterimTranscript}
                    />
                  </div>
                </div>
            )}

            { (!isFullscreenInternal || (isFullscreenInternal && !expandedMessageContent) || isPanelVoiceActive ) && (
              <>
                <InteractionMessagesArea
                    messages={chatHistory}
                    theme={theme}
                    isAiThinking={isAiThinking}
                    isPanelFullscreen={isFullscreenInternal}
                    onExpandRequest={handleExpandMessageContent}
                    onSendMessage={onSendMessage}
                    isPanelVoiceActive={isPanelVoiceActive}
                    onFormSubmit={onFormSubmit} // Pass prop
                />

                <div className="flex-shrink-0">
                  {showQuickReplies && (
                      <div className={`p-2 sm:p-3 border-t ${theme === Theme.DARK ? 'border-[var(--border-dark)]/70' : 'border-[var(--border-light)]/70'} flex-shrink-0`}>
                          <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2">
                              {quickReplies.map((reply) => (
                              <button
                                  key={reply.text}
                                  onClick={() => handleQuickReply(reply.prompt)}
                                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors flex items-center justify-center
                                      ${theme === Theme.DARK
                                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                                          : 'border-gray-400 text-gray-700 hover:bg-gray-100 hover:border-gray-500'}`}
                              >
                              {reply.icon && <reply.icon size={14} className="inline mr-1.5 opacity-80" style={{ color: 'var(--accent-color)' }} />} {reply.text}
                              </button>
                              ))}
                          </div>
                      </div>
                  )}



                  <InteractionInputBar
                      theme={theme}
                      onSendMessage={onSendMessage}
                      onActivateVoiceMode={handleActivatePanelVoiceMode}
                      isAiThinking={isAiThinking}
                      isPanelFullscreen={isFullscreenInternal}
                      isPanelVoiceActive={isPanelVoiceActive}
                      onDeactivateVoiceMode={handleDeactivatePanelVoiceMode}
                      interimTranscript={gdmAudioRef.current?.lastUserInterimTranscript || ''}
                  />
                </div>
              </>
            )}
          </div> 
        </div> 
      </div>
      <gdm-live-audio
          ref={gdmAudioRef}
          theme={theme.toString()}
          style={{ display: 'none' }}
      ></gdm-live-audio>
      
      <FullScreenVoiceOverlay
        isActive={isPanelVoiceActive}
        onClose={handleDeactivatePanelVoiceMode}
        theme={theme}
        gdmAudioRef={gdmAudioRef as React.RefObject<GdmLiveAudio>}
      />
    </div>
  );
};
