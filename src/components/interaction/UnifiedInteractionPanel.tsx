import { useState, useEffect, FC } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Brain, X, LayoutPanelLeft, PanelLeftClose, Maximize2, Minimize2 } from 'lucide-react';
import { Theme, ChatMessage } from '@/types';
import { ChatMessagesArea } from './ChatMessagesArea';
import { InteractionInputBar } from './InteractionInputBar';
import { ChatSidePanel } from './ChatSidePanel';
import { ExpandedMessageDisplay } from './ExpandedMessageDisplay';
import { FullScreenVoiceOverlay } from '../liveaudio/FullScreenVoiceOverlay';
import { generateClientSummary } from '../../../services/geminiService'; 

interface UnifiedInteractionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  chatHistory: ChatMessage[];
  onSendMessage: (messageText: string, imageBase64?: string, imageMimeType?: string) => Promise<void>;
  isAiThinking: boolean;
  initialUserMessage?: string;
}

export const UnifiedInteractionPanel: FC<UnifiedInteractionPanelProps> = ({
  isOpen, onClose, theme, chatHistory,
  onSendMessage, isAiThinking, initialUserMessage,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isVoiceOverlayActive, setIsVoiceOverlayActive] = useState(false);
  const [expandedMessageContent, setExpandedMessageContent] = useState<ChatMessage | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [userId] = useState(() => uuidv4());

  useEffect(() => {
    if (initialUserMessage && isOpen && chatHistory.length <= 1) { 
      onSendMessage(initialUserMessage);
    }
  }, [initialUserMessage, isOpen, onSendMessage]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expandedMessageContent) setExpandedMessageContent(null);
        else if (isSidePanelOpen) setIsSidePanelOpen(false);
        else if (isFullscreen) setIsFullscreen(false);
        else if (isVoiceOverlayActive) setIsVoiceOverlayActive(false);
        else onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, isFullscreen, isSidePanelOpen, expandedMessageContent, isVoiceOverlayActive]);
  
  const handleSummarizeChat = async () => {
      setIsLoadingSummary(true);
      setSummaryError(null);
      setSummaryData(null);
      try {
        const summaryText = await generateClientSummary(chatHistory);
        setSummaryData({ text: summaryText });
      } catch (error) {
        setSummaryError('Failed to generate summary. Please try again.');
      } finally {
        setIsLoadingSummary(false);
      }
  };
  
  if (!isOpen) return null;

  const textColor = theme === Theme.DARK ? 'text-white' : 'text-gray-900';
  const mutedTextColor = theme === Theme.DARK ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        role="presentation"
      />

      <div className={`relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full flex flex-col z-10 transition-all duration-300
        ${isFullscreen ? 'max-w-full h-full max-h-full rounded-none' : 'max-w-4xl max-h-[90vh]'}`}>
        
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-xl">
              <Brain size={20} className="text-orange-500" />
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${textColor}`}>
                F.B/c AI
              </h2>
              <p className={`text-sm ${mutedTextColor}`}>
                AI Assistant & Consultant
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className={`p-2 rounded-xl transition-all duration-200 ${isSidePanelOpen ? 'text-orange-500 bg-orange-500/10' : `${mutedTextColor} hover:text-orange-500 hover:bg-black/5 dark:hover:bg-white/5`}`}
              aria-label={isSidePanelOpen ? 'Close side panel' : 'Open side panel'}
            >
              {isSidePanelOpen ? <PanelLeftClose size={20} /> : <LayoutPanelLeft size={20} />}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`p-2 rounded-xl transition-all duration-200 ${mutedTextColor} hover:text-orange-500 hover:bg-black/5 dark:hover:bg-white/5`}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button 
              onClick={onClose}
              className={`p-2 rounded-xl transition-all duration-200 ${mutedTextColor} hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5`}
              aria-label="Close panel"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 flex flex-col overflow-hidden">
            <ChatMessagesArea
              messages={chatHistory}
              theme={theme}
              onExpandMessage={setExpandedMessageContent}
            />

            <InteractionInputBar
              onSendMessage={onSendMessage}
              onVoiceModeToggle={() => setIsVoiceOverlayActive(prev => !prev)}
              isVoiceModeActive={isVoiceOverlayActive}
              disabled={isAiThinking}
              theme={theme}
            />
          </main>

          {isSidePanelOpen && (
            <aside className="w-80 border-l border-gray-200 dark:border-gray-700">
              <ChatSidePanel
                onClose={() => setIsSidePanelOpen(false)}
                theme={theme}
                chatHistory={chatHistory}
                onSummarizeChat={handleSummarizeChat}
                summaryData={summaryData}
                isLoading={isLoadingSummary}
                summaryError={summaryError}
              />
            </aside>
          )}
        </div>
      </div>

      {expandedMessageContent && (
        <ExpandedMessageDisplay
          message={expandedMessageContent}
          onClose={() => setExpandedMessageContent(null)}
          theme={theme}
        />
      )}

      {isVoiceOverlayActive && (
        <FullScreenVoiceOverlay
          isActive={isVoiceOverlayActive}
          theme={theme}
          onClose={() => setIsVoiceOverlayActive(false)}
          onTranscription={onSendMessage}
          userId={userId}
        />
      )}
    </div>
  );
};
