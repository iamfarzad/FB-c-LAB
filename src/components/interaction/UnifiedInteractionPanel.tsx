/// <reference path="../../../global.d.ts" />
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Brain, X, Trash2, Maximize, Minimize, Mic, Send, Paperclip, Info, Lightbulb, Zap, MessageSquare, ChevronDown, LayoutPanelLeft, PanelLeftClose, Settings, Maximize2, Minimize2 } from 'lucide-react'; // Updated import
import { Theme, ChatMessage, MessageSender, MessageType, WebSource } from '../../../types';
import { FBC_BRAND_NAME, AI_ASSISTANT_NAME } from '../../../constants';
import { ChatMessagesArea } from './ChatMessagesArea';
import { InteractionInputBar } from './InteractionInputBar';
import { ChatSidePanel } from './ChatSidePanel';
import { ExpandedMessageDisplay } from './ExpandedMessageDisplay';
import { generateImage, performGroundedSearch, generateDocumentation } from '../../../services/geminiService';

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
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [expandedMessageContent, setExpandedMessageContent] = useState<ChatMessage | null>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [quickReplies] = useState([
    "Tell me about your AI consulting services",
    "What workshops do you offer?",
    "How can AI help my business?",
    "I'd like to schedule a consultation",
    "What's your experience with AI implementation?"
  ]);

  // Auto-send initial message if provided
  useEffect(() => {
    if (initialUserMessage && isOpen) {
      onSendMessage(initialUserMessage);
    }
  }, [initialUserMessage, isOpen, onSendMessage]);

  // Escape key handling with proper hierarchy
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (expandedMessageContent) {
          setExpandedMessageContent(null);
        } else if (isSidePanelOpen) {
          setIsSidePanelOpen(false);
        } else if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, isFullscreen, isSidePanelOpen, expandedMessageContent]);

  const handleClearChatAndSession = () => {
    onClearChat();
  };

  const handleExpandMessageContent = (message: ChatMessage) => {
    setExpandedMessageContent(message);
  };

  const handleCollapseMessageContent = () => setExpandedMessageContent(null);

  const handleDownloadTranscript = () => {
    // Implementation for downloading chat transcript
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
    // For now, we'll handle attachments as image analysis if it's an image
    if (attachments && attachments.length > 0) {
      const imageFile = attachments.find(file => file.type.startsWith('image/'));
      if (imageFile) {
        // Convert to base64 and send as image analysis
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          const [, base64Data] = base64.split(',');
          onSendMessage(message, base64Data, imageFile.type);
        };
        reader.readAsDataURL(imageFile);
        return;
      }
    }
    
    // Regular text message
    onSendMessage(message);
  };

  // Handle image generation
  const handleImageGeneration = async (prompt: string) => {
    try {
      // Add user message for image generation request
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_user`,
        sender: MessageSender.USER,
        type: MessageType.TEXT,
        text: `Generate image: ${prompt}`,
        timestamp: Date.now()
      };
      
      // Add AI thinking message
      const thinkingMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai_thinking`,
        sender: MessageSender.AI,
        type: MessageType.TEXT,
        text: 'Generating image...',
        timestamp: Date.now(),
        isLoading: true
      };

      // This would need to be handled by the parent component
      // For now, we'll use the regular onSendMessage with a special format
      await onSendMessage(`🎨 Generate image: ${prompt}`);
      
    } catch (error) {
      console.error('Image generation failed:', error);
      // Handle error - could show error message in chat
    }
  };

  // Handle web search
  const handleWebSearch = async (query: string) => {
    try {
      // Add user message for search request
      await onSendMessage(`🔍 Search: ${query}`);
    } catch (error) {
      console.error('Web search failed:', error);
    }
  };

  // Handle documentation generation
  const handleDocumentationGeneration = async (prompt: string) => {
    try {
      // Add user message for documentation request
      await onSendMessage(`📚 Generate docs: ${prompt}`);
    } catch (error) {
      console.error('Documentation generation failed:', error);
    }
  };

  const handleSummarizeChat = async () => {
    setIsLoadingSummary(true);
    try {
      // Implementation for chat summarization
      // This would call the summarizeChatHistory service
    } catch (error) {
      console.error('Failed to summarize chat:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleGenerateFollowUpBrief = async () => {
    setIsLoadingSummary(true);
    try {
      // Implementation for follow-up brief generation
      // This would call the generateFollowUpBrief service
    } catch (error) {
      console.error('Failed to generate follow-up brief:', error);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Theme-based styling
  const overlayBg = theme === Theme.DARK 
    ? 'bg-black/80 backdrop-blur-sm' 
    : 'bg-black/50 backdrop-blur-sm';
  
  const panelBg = theme === Theme.DARK 
    ? 'bg-gray-900/95 border-white/10' 
    : 'bg-white/95 border-black/10';
  
  const headerBg = theme === Theme.DARK 
    ? 'bg-gray-800/90 border-white/10' 
    : 'bg-gray-100/90 border-black/10';
  
  const textColor = theme === Theme.DARK ? 'text-white' : 'text-black';
  const mutedTextColor = theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600';
  const buttonBg = theme === Theme.DARK ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20';

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[70] ${overlayBg} transition-opacity duration-300`}
        onClick={onClose}
      />

      {/* Main Panel */}
      <div className={`
        fixed z-[80] backdrop-blur-xl border shadow-2xl transition-all duration-300 ease-out
        ${panelBg}
        ${isFullscreen 
          ? 'inset-0' 
          : 'top-4 right-4 bottom-4 w-[90vw] max-w-4xl rounded-2xl'
        }
      `}>
        {/* Header */}
        <div className={`
          flex items-center justify-between p-4 border-b backdrop-blur-sm
          ${headerBg}
          ${isFullscreen ? 'rounded-none' : 'rounded-t-2xl'}
        `}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl ${buttonBg}`}>
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

          <div className="flex items-center space-x-2">
            {/* Side Panel Toggle */}
            <button
              onClick={toggleSidePanel}
              className={`
                p-2 rounded-xl transition-all duration-200
                ${isSidePanelOpen 
                  ? 'bg-orange-500/20 text-orange-500 border border-orange-500/30' 
                  : `${buttonBg} ${mutedTextColor} hover:text-orange-500`
                }
              `}
              title={isSidePanelOpen ? "Close side panel (Esc)" : "Open tools & analytics"}
            >
              {isSidePanelOpen ? <PanelLeftClose size={18} /> : <LayoutPanelLeft size={18} />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className={`
                p-2 rounded-xl transition-all duration-200
                ${buttonBg} ${mutedTextColor} hover:text-orange-500
              `}
              title={isFullscreen ? "Exit fullscreen (Esc)" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* Clear Chat */}
            <button
              onClick={handleClearChatAndSession}
              className={`
                p-2 rounded-xl transition-all duration-200
                ${buttonBg} ${mutedTextColor} hover:text-red-500
              `}
              title="Clear chat history"
            >
              <Trash2 size={18} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className={`
                p-2 rounded-xl transition-all duration-200
                ${buttonBg} ${mutedTextColor} hover:text-red-500
              `}
              title="Close chat (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex h-[calc(100%-80px)]">
          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
              <ChatMessagesArea
                theme={theme}
                messages={chatHistory}
                isAiThinking={isAiThinking}
                isPanelFullscreen={isFullscreen}
                onExpandRequest={handleExpandMessageContent}
                onSendMessage={handleQuickReply}
                isPanelVoiceActive={false}
                onFormSubmit={onFormSubmit}
              />
            </div>

            {/* Input Bar */}
            <InteractionInputBar
              theme={theme}
              onSendMessage={handleInputBarSendMessage}
              onImageGeneration={handleImageGeneration}
              onWebSearch={handleWebSearch}
              onDocumentationGeneration={handleDocumentationGeneration}
              isFullscreen={isFullscreen}
              disabled={isAiThinking}
              placeholder="Type your message..."
            />
          </div>

          {/* Side Panel */}
          {isSidePanelOpen && (
            <ChatSidePanel
              isOpen={isSidePanelOpen}
              theme={theme}
              onClose={() => setIsSidePanelOpen(false)}
              chatHistory={chatHistory}
              onDownloadTranscript={handleDownloadTranscript}
              onSummarizeChat={handleSummarizeChat}
              onGenerateFollowUpBrief={handleGenerateFollowUpBrief}
              summaryData={summaryData}
              isLoading={isLoadingSummary}
            />
          )}
        </div>

        {/* Footer hint */}
        <div className={`
          absolute bottom-2 left-1/2 transform -translate-x-1/2
          text-xs ${mutedTextColor} flex items-center space-x-2
          ${isFullscreen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          transition-opacity duration-300 pointer-events-none
        `}>
          <span>Press</span>
          <kbd className={`
            px-1.5 py-0.5 rounded text-xs font-mono
            ${theme === Theme.DARK ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}
          `}>
            Esc
          </kbd>
          <span>to close</span>
        </div>
      </div>

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
