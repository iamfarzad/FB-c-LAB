
import React, { useState } from 'react';
import { ChatMessage, MessageSender, MessageType, Theme, WebSource, FormType } from '../../types';
import { AlertTriangle, Image as ImageIcon, Search, CheckCircle, ExternalLink, Info, CalendarDays, Maximize2, Volume2, Download, Send } from 'lucide-react';
import { CALENDLY_PLACEHOLDER_URL } from '../../constants';
import { StructuredResponseCard } from './interaction/StructuredResponseCard';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  theme: Theme;
  isPanelFullscreen?: boolean;
  onExpandRequest?: (message: ChatMessage) => void;
  onFormSubmit?: (messageId: string, formData: Record<string, string>) => void;
}

const generateFilename = (message: ChatMessage): string => {
  const timestamp = new Date(message.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
  let extension = 'dat';
  let baseName = message.text ? message.text.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30) : `download-${message.id.substring(0,5)}`;

  if (message.type === MessageType.IMAGE) {
    if (message.imageUrl?.startsWith('data:image/png')) extension = 'png';
    else if (message.imageUrl?.startsWith('data:image/jpeg') || message.imageUrl?.startsWith('data:image/jpg')) extension = 'jpg';
    else extension = 'jpg'; // Default image extension
    baseName = message.text ? `image-${baseName}` : `ai-generated-image-${message.id.substring(0,5)}`;
  }
  
  return `fbc-ai-${baseName}-${timestamp}.${extension}`;
};


export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, theme, isPanelFullscreen, onExpandRequest, onFormSubmit }) => {
  const isUser = message.sender === MessageSender.USER;
  const isSystem = message.sender === MessageSender.SYSTEM;
  const isAI = message.sender === MessageSender.AI;

  const wasSpoken = isAI && message.text && message.text.length < 200 && Math.random() > 0.5; 

  const bubbleAlignment = isUser ? 'justify-end' : 'justify-start';
  
  let bubbleBaseStyle = 'rounded-2xl border';
  let bubbleColor = '';
  let linkTextColorUser = ''; 

  if (isUser) {
    bubbleColor = theme === Theme.DARK 
      ? 'bg-gray-700 text-gray-100 border-gray-600/50' 
      : 'bg-gray-200 text-gray-800 border-gray-300/50';
    linkTextColorUser = theme === Theme.DARK ? 'text-orange-300 hover:text-orange-200' : 'text-orange-600 hover:text-orange-700';
  } else if (isSystem && message.type === MessageType.ERROR) {
    bubbleColor = theme === Theme.DARK 
      ? 'bg-red-800 text-red-100 border-red-700/50' 
      : 'bg-red-100 text-red-700 border-red-300/50';
  } else if (isSystem) { 
     // System messages (non-error) are handled separately below
  } else { // AI messages
    if (message.type === MessageType.SEARCH_RESULT) {
      bubbleColor = theme === Theme.DARK 
        ? 'bg-gray-800 border-gray-700/80' 
        : 'bg-gray-100 border-gray-300/80';
      bubbleBaseStyle = 'rounded-xl border';
    } else { 
      bubbleColor = theme === Theme.DARK 
        ? 'bg-orange-700 text-orange-50 border-orange-800/50' 
        : 'bg-orange-100 text-orange-800 border-orange-300/50';
    }
  }

  const handleDownload = (event: React.MouseEvent) => {
    event.stopPropagation(); 
    if (!message.imageUrl) return;
    const link = document.createElement('a');
    link.href = message.imageUrl;
    link.download = generateFilename(message);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExpandClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onExpandRequest && message.imageUrl) {
      onExpandRequest(message);
    }
  };

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const handleFormSubmitInternal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onFormSubmit && !message.formSubmitted) {
      onFormSubmit(message.id, formValues);
    }
  };

  const renderNameEmailForm = () => {
    const inputBg = theme === Theme.DARK ? 'bg-gray-600 border-gray-500 text-orange-50 placeholder-orange-200/70' : 'bg-orange-50 border-orange-300 text-orange-700 placeholder-orange-500/70';
    const submitButtonBg = theme === Theme.DARK ? 'bg-orange-500 hover:bg-orange-400 text-white' : 'bg-orange-600 hover:bg-orange-700 text-white';
    const disabledSubmitButtonBg = theme === Theme.DARK ? 'bg-gray-500 text-gray-300' : 'bg-gray-300 text-gray-500';
    
    if (message.formSubmitted) {
      return <p className="text-sm italic mt-2">Information received. Thank you!</p>;
    }

    return (
      <form onSubmit={handleFormSubmitInternal} className="mt-3 space-y-3">
        <div>
          <label htmlFor={`name-${message.id}`} className="block text-xs font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            id={`name-${message.id}`}
            value={formValues.name || ''}
            onChange={handleFormInputChange}
            required
            className={`w-full p-2 text-sm rounded-md shadow-sm focus:ring-1 focus:ring-offset-1 ${inputBg} focus:ring-offset-orange-600 focus:ring-orange-500`}
            disabled={message.formSubmitted}
          />
        </div>
        <div>
          <label htmlFor={`email-${message.id}`} className="block text-xs font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            id={`email-${message.id}`}
            value={formValues.email || ''}
            onChange={handleFormInputChange}
            required
            className={`w-full p-2 text-sm rounded-md shadow-sm focus:ring-1 focus:ring-offset-1 ${inputBg} focus:ring-offset-orange-600 focus:ring-orange-500`}
            disabled={message.formSubmitted}
          />
        </div>
        <button 
          type="submit" 
          className={`w-full py-2 px-4 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${message.formSubmitted ? disabledSubmitButtonBg : submitButtonBg}`}
          disabled={message.formSubmitted}
        >
          <Send size={14} /> Submit
        </button>
      </form>
    );
  };


  const renderContent = () => {
    if (message.isLoading) {
      return <div className="animate-pulse">Thinking...</div>;
    }
    switch (message.type) {
      case MessageType.IMAGE:
        // ... (image rendering logic remains the same)
        const imageTextColor = isUser 
            ? (theme === Theme.DARK ? 'text-gray-200' : 'text-gray-700')
            : (theme === Theme.DARK ? 'text-orange-200' : 'text-orange-700');
        return (
          <div className="relative group/image">
            {message.text && <p className={`mb-1.5 text-sm ${imageTextColor}`}>{message.text}</p>}
            {message.imageUrl ? (
                <div 
                    className="relative overflow-hidden rounded-md cursor-pointer"
                    onClick={isPanelFullscreen && onExpandRequest ? handleExpandClick : undefined} 
                    role={isPanelFullscreen && onExpandRequest ? "button" : undefined}
                    aria-label={isPanelFullscreen && onExpandRequest ? "Expand image" : undefined}
                >
                    <img 
                        src={message.imageUrl} 
                        alt={message.text || "Generated image"} 
                        className="block max-w-xs sm:max-w-sm md:max-w-md max-h-60 sm:max-h-72 object-contain rounded-md bg-black/10 dark:bg-black/20" 
                    />
                    <div className="absolute top-1.5 right-1.5 flex flex-col gap-1.5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 focus-within:opacity-100">
                        {isPanelFullscreen && onExpandRequest && message.imageUrl && (
                        <button
                            onClick={handleExpandClick}
                            className={`p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-white/70`}
                            title="Expand Image"
                            aria-label="Expand Image"
                        >
                            <Maximize2 size={16} />
                        </button>
                        )}
                        <button
                            onClick={handleDownload}
                            className={`p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white focus:outline-none focus:ring-2 focus:ring-white/70`}
                            title="Download Image"
                            aria-label="Download Image"
                        >
                            <Download size={16} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-center text-sm opacity-75">
                    <ImageIcon size={16} className="mr-1" /> Image (URL missing or loading)
                </div>
            )}
          </div>
        );
      case MessageType.SEARCH_RESULT:
        // ... (search result rendering logic remains the same)
        const textColor = theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700';
        const sourceLinkColor = theme === Theme.DARK ? 'text-orange-400 hover:text-orange-300' : 'text-orange-500 hover:text-orange-600';
        const headingColor = theme === Theme.DARK ? 'text-orange-300' : 'text-orange-600';
        return (
          <div className={`p-1.5 sm:p-2 ${textColor}`}>
            <div className="flex items-start mb-2">
              <Search size={18} className={`mr-2.5 mt-0.5 shrink-0 ${headingColor}`} />
              <p className={`font-medium text-base whitespace-pre-wrap ${textColor}`}>{message.text || "Search results:"}</p>
            </div>
            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-opacity-20 dark:border-gray-600/60 border-gray-300/60">
                <h4 className={`text-sm font-semibold mb-1.5 ${headingColor} flex items-center`}><Info size={14} className="mr-1.5"/>Sources:</h4>
                <ul className="space-y-1.5">
                  {message.sources.slice(0, 3).map((source, idx) => (
                    <li key={idx} className="text-xs flex items-start">
                       <ExternalLink size={12} className={`mr-1.5 mt-0.5 shrink-0 ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-500'}`} />
                      <a
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`hover:underline break-all ${sourceLinkColor}`}
                        title={source.title}
                      >
                        {source.title || source.uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case MessageType.ERROR:
        // ... (error rendering logic remains the same)
        return (
          <div className={`flex items-center ${theme === Theme.DARK ? 'text-red-300' : 'text-red-600'}`}>
            <AlertTriangle size={18} className="mr-2 shrink-0" />
            <p className="text-sm">{message.text || 'An error occurred.'}</p>
          </div>
        );
      case MessageType.TEXT:
      default:
        const sanitizedText = message.text?.replace(/<audio data-src=".*?"><\/audio>/g, '').trim() || "";
        
        // Try to render structured response card first (only for AI messages)
        if (!isUser && message.text) {
          const structuredCard = (
            <StructuredResponseCard 
              data={message.text} 
              theme={theme} 
              onAction={(action, data) => {
                console.log('Structured card action:', action, data);
                // Handle actions like "book_consultation", "learn_more", etc.
              }}
            />
          );
          
          // If structured card renders (not null), use it
          if (structuredCard) {
            return (
              <div className="flex flex-col space-y-3">
                {structuredCard}
                {message.formType === 'name_email_form' && renderNameEmailForm()}
                {wasSpoken && !message.formType && ( 
                  <span title="This message was also spoken by the AI" className={`mt-1.5 self-start ${theme === Theme.DARK ? 'text-orange-300/70' : 'text-orange-600/70'}`}>
                    <Volume2 size={12} />
                  </span>
                )}
              </div>
            );
          }
        }
        
        // Fallback to regular text rendering
        const parts = sanitizedText.split(/(\[.*?\]\(.*?\))/g) || [];
        const linkColorAI = theme === Theme.DARK ? 'text-orange-200 hover:text-orange-100' : 'text-orange-600 hover:text-orange-700';

        return (
            <div className="flex flex-col">
                <p className="whitespace-pre-wrap">
                    {parts.map((part, index) => {
                        const match = part.match(/\[(.*?)\]\((.*?)\)/);
                        if (match) {
                            const linkText = match[1];
                            const linkUrl = match[2];
                            const isCalendlyLink = linkUrl === CALENDLY_PLACEHOLDER_URL;
                            const currentLinkTextColor = isUser ? linkTextColorUser : linkColorAI;
                            return (
                                <a
                                    key={index}
                                    href={linkUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`underline font-medium ${currentLinkTextColor}`}
                                >
                                    {isCalendlyLink && <CalendarDays size={13} className="inline-block mr-1 mb-0.5" />}
                                    {isCalendlyLink ? "Book a Consultation" : linkText}
                                    {!isCalendlyLink && <ExternalLink size={12} className="inline-block ml-1" />}
                                </a>
                            );
                        }
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = part;
                        return tempDiv.textContent || tempDiv.innerText || "";
                    })}
                </p>
                {message.formType === 'name_email_form' && renderNameEmailForm()}
                {wasSpoken && !message.formType && ( 
                    <span title="This message was also spoken by the AI" className={`mt-1.5 self-start ${theme === Theme.DARK ? 'text-orange-300/70' : 'text-orange-600/70'}`}>
                        <Volume2 size={12} />
                    </span>
                )}
            </div>
        );
    }
  };

  if (isSystem && message.type !== MessageType.ERROR) {
     return (
        <div className={`text-xs px-4 py-1.5 my-2 text-center rounded-full mx-auto max-w-md flex items-center justify-center gap-2 shadow-sm
            ${theme === Theme.DARK ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-gray-200 text-gray-600 border border-gray-300'}`}>
            <CheckCircle size={14} className="shrink-0 text-green-500" />
            <span>{message.text}</span>
        </div>
     )
  }

  const timestampColor = isUser 
    ? (theme === Theme.DARK ? 'text-gray-400/80' : 'text-gray-500/80')
    : (theme === Theme.DARK ? 'text-orange-300/80' : 'text-orange-500/80');
  
  const imageTimestampColor = isUser 
    ? (theme === Theme.DARK ? 'text-gray-300/80' : 'text-gray-600/80')
    : (theme === Theme.DARK ? 'text-orange-200/80' : 'text-orange-600/80');

  return (
    <div className={`flex ${bubbleAlignment} my-1.5 group`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] break-words shadow-sm
          ${bubbleBaseStyle} ${bubbleColor}
          ${message.type === MessageType.SEARCH_RESULT ? 'w-full md:w-[90%]' : ''}
          ${message.type === MessageType.IMAGE || message.formType === 'name_email_form' ? 'p-2 sm:p-3' : 'p-3'} 
        `}
        role="log"
        aria-live={message.sender === MessageSender.AI ? "polite" : undefined}
      >
        {renderContent()}
        {message.type !== MessageType.SEARCH_RESULT && message.type !== MessageType.IMAGE && !message.formType && (
            <div className={`text-xs mt-1.5 opacity-0 group-hover:opacity-60 transition-opacity duration-300 ${isUser ? 'text-right' : 'text-left'} ${timestampColor}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        )}
         {message.type === MessageType.IMAGE && !message.formType && (
             <div className={`text-xs mt-1 text-center opacity-0 group-hover:opacity-60 transition-opacity duration-300 ${imageTimestampColor}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        )}
      </div>
    </div>
  );
};
