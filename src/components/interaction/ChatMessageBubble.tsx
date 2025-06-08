import React from 'react';
import { Bot, User, Maximize2, RefreshCw, Copy, Check, AlertTriangle } from 'lucide-react';
import { Theme, MessageSender, ChatMessage, WebSource, MessageType } from '@/types';
import { StructuredResponseCard } from './StructuredResponseCard'; // Assuming this component exists
import { Loading } from '../ui/Loading'; // Assuming a simple loading spinner component exists

// Helper to check for and parse structured JSON data
const tryParseStructuredData = (text: string): any | null => {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      return null;
    }
  }
  return null;
};

interface ChatMessageBubbleProps {
  message: ChatMessage;
  theme: Theme;
  onExpandClick?: (message: ChatMessage) => void;
  onRetry?: (message: ChatMessage) => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ 
  message, 
  theme,
  onExpandClick,
  onRetry,
}) => {
  const [copied, setCopied] = React.useState(false);
  
  const isUser = message.sender === MessageSender.USER;
  const Icon = isUser ? User : Bot;

  const bubbleAlignment = isUser ? 'justify-end' : 'justify-start';
  const bubbleColor = isUser
    ? 'bg-blue-600 text-white'
    : (theme === Theme.DARK ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800');
  
  const errorColor = 'bg-red-500/10 border border-red-500/30 text-red-400';
  
  const structuredData = tryParseStructuredData(message.text || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Renders the main content of the bubble
  const renderContent = () => {
    if (message.isLoading) {
      return <Loading />;
    }
    
    if (message.type === MessageType.ERROR) {
      return (
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-400" />
          <span>{message.text || 'An error occurred.'}</span>
        </div>
      );
    }
    
    if (structuredData) {
      return <StructuredResponseCard data={structuredData} theme={theme} />;
    }
    
    return (
      <>
        <div className="prose prose-sm dark:prose-invert max-w-none break-words" dangerouslySetInnerHTML={{ __html: (message.text || '').replace(/\n/g, '<br />') }} />
        
        {message.imageUrl && (
          <div className="mt-2">
            <img src={message.imageUrl} alt="Uploaded content" className="max-w-xs h-auto rounded-md" />
          </div>
        )}

        {message.images && message.images.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {message.images.map((img, index) => (
              <img key={index} src={`data:${img.mimeType};base64,${img.base64Data}`} alt={`Generated content ${index + 1}`} className="w-full h-auto rounded-md" />
            ))}
          </div>
        )}
      </>
    );
  };
  
  // Renders web sources below the bubble
  const renderSources = () => {
    if (!message.sources || message.sources.length === 0) return null;
    return (
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        <h4 className="font-bold mb-1">Sources:</h4>
        <ul className="space-y-1 list-decimal list-inside">
          {message.sources.map((source: WebSource, index: number) => (
            <li key={index}>
              <a href={source.uri} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500">
                {source.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className={`flex items-start gap-3 my-2 ${bubbleAlignment}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
          <Icon size={20} />
        </div>
      )}
      
      {/* Add 'group' class here to enable group-hover for children */}
      <div className="group relative">
        <div className={`max-w-xl rounded-lg px-4 py-3 ${message.type === MessageType.ERROR ? errorColor : bubbleColor}`}>
          {renderContent()}
        </div>
        
        {renderSources()}

        {/* Action buttons on hover */}
        <div className="absolute top-0 right-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-black/10 backdrop-blur-sm rounded-bl-lg rounded-tr-lg">
          {/* Always show copy button for non-loading, non-error AI messages */}
          {!isUser && !message.isLoading && message.type !== MessageType.ERROR && (
            <button onClick={handleCopy} className="p-1 hover:bg-white/20 rounded" title="Copy">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
          {/* Show retry button only for error messages */}
          {message.type === MessageType.ERROR && onRetry && (
            <button onClick={() => onRetry(message)} className="p-1 hover:bg-white/20 rounded" title="Retry">
              <RefreshCw size={14} />
            </button>
          )}
          {/* Show expand button for any message that can be expanded */}
          {onExpandClick && (
            <button onClick={() => onExpandClick(message)} className="p-1 hover:bg-white/20 rounded" title="Expand">
              <Maximize2 size={14} />
            </button>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full flex-shrink-0 bg-blue-600 flex items-center justify-center text-white">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
};

export const MemoizedChatMessageBubble = React.memo(ChatMessageBubble); 