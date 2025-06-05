/// <reference path="../../../global.d.ts" />
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Brain, X, Trash2, Maximize, Minimize, Mic, Send, Paperclip, Info, Lightbulb, Zap, MessageSquare, ChevronDown, LayoutPanelLeft, PanelLeftClose, Settings, Maximize2, Minimize2 } from 'lucide-react'; // Updated import
import { Theme, ChatMessage, MessageSender, MessageType, WebSource } from '../../../types';
import { FBC_BRAND_NAME, AI_ASSISTANT_NAME } from '../../../constants';
import { ChatMessagesArea } from './ChatMessagesArea';
import { InteractionInputBar } from './InteractionInputBar';
import { ChatSidePanel } from './ChatSidePanel';
import { ExpandedMessageDisplay } from './ExpandedMessageDisplay';

interface UnifiedInteractionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  chatHistory: ChatMessage[];
  onSendMessage: (messageText: string, imageBase64?: string, imageMimeType?: string) => Promise<void>;
  onClearChat: () => void;
  isAiThinking: boolean;
  initialUserMessage?: string;
  onFormSubmit: (messageId: string, formData: Record<string, string>) => void; // Added prop
}

export const UnifiedInteractionPanel: React.FC<Omit<UnifiedInteractionPanelProps, 'onLiveUserSpeechFinal' | 'onLiveAiSpeechText'> > = ({
  isOpen,
  onClose,
  theme,
  chatHistory,
  onSendMessage,
  onClearChat,
  isAiThinking,
  initialUserMessage,
  onFormSubmit,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedMessageContent, setExpandedMessageContent] = useState<ChatMessage | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [quickReplies] = useState([
    "Tell me about your AI consulting services",
    "What workshops do you offer?",
    "How can AI help my business?",
    "I'd like to schedule a consultation",
    "What's your experience with AI implementation?"
  ]);

  // Auto-send initial message
  useEffect(() => {
    if (isOpen && initialUserMessage && chatHistory.length === 0) {
      onSendMessage(initialUserMessage);
    }
  }, [isOpen, initialUserMessage, chatHistory.length, onSendMessage]);

  const handleClearChatAndSession = () => {
    onClearChat();
  };

  const handleExpandMessageContent = (message: ChatMessage) => {
    setExpandedMessageContent(message);
  };

  const handleCollapseMessageContent = () => setExpandedMessageContent(null);

  const handleDownloadTranscript = () => {
    // Implementation for downloading transcript
    console.log('Download transcript');
  };

  const handleQuickReply = (promptText: string) => {
    onSendMessage(promptText);
  };

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle input bar message sending
  const handleInputBarSendMessage = (message: string, attachments?: File[]) => {
    // For now, just send the text message
    onSendMessage(message);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Main Panel */}
      <div className={`fixed z-50 transition-all duration-300 ease-out ${
        isFullscreen 
          ? 'inset-0' 
          : 'top-4 right-4 bottom-4 w-full max-w-md sm:max-w-lg lg:max-w-xl'
      }`}>
        <div className={`h-full flex flex-col glass border shadow-2xl ${
          theme === Theme.DARK 
            ? 'border-white/20 bg-black/90' 
            : 'border-black/20 bg-white/90'
        } animate-fade-in-scale`}>
          
          {/* Enhanced Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            theme === Theme.DARK ? 'border-white/10' : 'border-black/10'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                theme === Theme.DARK ? 'bg-orange-500/10' : 'bg-orange-500/10'
              }`}>
                <MessageSquare size={20} className="text-orange-500" />
              </div>
              <div>
                <h2 className={`font-semibold ${
                  theme === Theme.DARK ? 'text-white' : 'text-black'
                }`}>
                  AI Assistant
                </h2>
                <p className={`text-xs ${
                  theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {chatHistory.length} messages
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className={`touch-target p-2 rounded-lg transition-all duration-200 hover-lift ${
                  theme === Theme.DARK 
                    ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                    : 'hover:bg-black/10 text-gray-600 hover:text-black'
                } focus-ring`}
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>

              {/* Side Panel Toggle */}
              <button
                onClick={toggleSidePanel}
                className={`touch-target p-2 rounded-lg transition-all duration-200 hover-lift ${
                  isSidePanelOpen
                    ? 'bg-orange-500/20 text-orange-500'
                    : theme === Theme.DARK 
                      ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                      : 'hover:bg-black/10 text-gray-600 hover:text-black'
                } focus-ring`}
                aria-label="Toggle side panel"
              >
                <Settings size={18} />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className={`touch-target p-2 rounded-lg transition-all duration-200 hover-lift ${
                  theme === Theme.DARK 
                    ? 'hover:bg-white/10 text-gray-400 hover:text-white' 
                    : 'hover:bg-black/10 text-gray-600 hover:text-black'
                } focus-ring`}
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden">
            <ChatMessagesArea
              theme={theme}
              messages={chatHistory}
              isAiThinking={isAiThinking}
              isPanelFullscreen={isFullscreen}
              onExpandRequest={handleExpandMessageContent}
              onFormSubmit={onFormSubmit}
            />
          </div>

          {/* Quick Replies */}
          {chatHistory.length === 0 && (
            <div className={`p-4 border-t ${
              theme === Theme.DARK ? 'border-white/10' : 'border-black/10'
            }`}>
              <p className={`text-sm mb-3 ${
                theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Quick start:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickReplies.slice(0, 3).map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className={`px-3 py-2 text-xs rounded-lg border transition-all duration-200 hover-lift ${
                      theme === Theme.DARK 
                        ? 'border-white/20 text-gray-300 hover:border-orange-500/50 hover:text-orange-500' 
                        : 'border-black/20 text-gray-700 hover:border-orange-500/50 hover:text-orange-500'
                    } mobile-optimized`}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Input Bar */}
          <div className={`border-t ${
            theme === Theme.DARK ? 'border-white/10' : 'border-black/10'
          }`}>
            <InteractionInputBar
              theme={theme}
              onSendMessage={handleInputBarSendMessage}
              isFullscreen={isFullscreen}
              placeholder="Ask about AI consulting, services, or anything else..."
            />
          </div>

          {/* Enhanced Footer */}
          <div className={`px-4 py-2 border-t ${
            theme === Theme.DARK ? 'border-white/10 bg-black/20' : 'border-black/10 bg-white/20'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearChatAndSession}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    theme === Theme.DARK 
                      ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                      : 'text-gray-600 hover:text-black hover:bg-black/10'
                  } mobile-optimized`}
                >
                  Clear Chat
                </button>
              </div>
              
              <div className={`text-xs ${
                theme === Theme.DARK ? 'text-gray-500' : 'text-gray-500'
              }`}>
                Powered by AI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <ChatSidePanel
        isOpen={isSidePanelOpen}
        theme={theme}
        onClose={() => setIsSidePanelOpen(false)}
        chatHistory={chatHistory}
        onDownloadTranscript={handleDownloadTranscript}
        summaryData={summaryData}
        isLoading={isLoadingSummary}
      />

      {/* Expanded Message Display */}
      {expandedMessageContent && (
        <ExpandedMessageDisplay
          message={expandedMessageContent}
          theme={theme}
          onClose={handleCollapseMessageContent}
        />
      )}
    </>
  );
};
