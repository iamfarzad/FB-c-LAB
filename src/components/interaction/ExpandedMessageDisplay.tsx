
import React from 'react';
import { ChatMessage, MessageType, Theme } from '../../../types';
import { Minimize2, Download } from 'lucide-react'; 

interface ExpandedMessageDisplayProps {
  message: ChatMessage;
  theme: Theme;
  onCollapse: () => void;
}

const generateFilenameForExpanded = (message: ChatMessage): string => {
  const timestamp = new Date(message.timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
  let extension = 'dat';
  let baseName = message.text ? message.text.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30) : `expanded-${message.id.substring(0,5)}`;

  if (message.type === MessageType.IMAGE) {
    if (message.imageUrl?.startsWith('data:image/png')) extension = 'png';
    else if (message.imageUrl?.startsWith('data:image/jpeg') || message.imageUrl?.startsWith('data:image/jpg')) extension = 'jpg';
    else extension = 'jpg'; // Default image extension
    baseName = message.text ? `image-${baseName}` : `ai-generated-image-${message.id.substring(0,5)}`;
  }
  return `fbc-ai-${baseName}-${timestamp}.${extension}`;
};

export const ExpandedMessageDisplay: React.FC<ExpandedMessageDisplayProps> = ({ message, theme, onCollapse }) => {
  
  const handleDownload = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!message.imageUrl) return;
    const link = document.createElement('a');
    link.href = message.imageUrl;
    link.download = generateFilenameForExpanded(message);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderExpandedContent = () => {
    if (message.type === MessageType.IMAGE && message.imageUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
            <img 
              src={message.imageUrl} 
              alt={message.text || "Expanded image"} 
              className="max-w-full max-h-[calc(100%-4rem)] object-contain rounded-lg shadow-lg" 
            />
             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
                <button
                    onClick={handleDownload}
                    style={{ backgroundColor: 'var(--accent-color)' }}
                    className={`p-2.5 rounded-full transition-colors flex items-center gap-2 text-sm font-medium text-white hover:opacity-90`}
                    title="Download Image"
                    aria-label="Download Image"
                >
                    <Download size={18} /> Download
                </button>
            </div>
        </div>
      );
    }
    if (message.text) {
        return (
             <div className={`p-4 rounded-lg overflow-y-auto max-h-full w-full max-w-2xl ${theme === Theme.DARK ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
                <h3 className="text-xl font-semibold mb-3">Details:</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</p>
            </div>
        );
    }
    
    return <p className={`text-lg ${theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700'}`}>No expandable content available for this message type.</p>;
  };

  const wrapperBg = theme === Theme.DARK ? 'bg-[var(--card-bg-dark)]' : 'bg-[var(--card-bg-light)]';
  const collapseButtonBg = theme === Theme.DARK ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-black';

  return (
    <div className={`relative w-full h-full flex flex-col items-center justify-center p-4 ${wrapperBg}`}>
      <button
        onClick={onCollapse}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-colors ${collapseButtonBg}`}
        title="Collapse Content"
        aria-label="Collapse Content"
      >
        <Minimize2 size={20} />
      </button>
      <div className="w-full h-full flex items-center justify-center">
        {renderExpandedContent()}
      </div>
    </div>
  );
};