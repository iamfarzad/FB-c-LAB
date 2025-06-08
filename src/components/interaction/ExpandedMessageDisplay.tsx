import React, { useState, useEffect, useRef } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Share2, Copy, Check, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { ChatMessage, MessageType, Theme, WebSource } from '@/types';

interface ExpandedMessageDisplayProps {
  message: ChatMessage;
  theme: Theme;
  onClose: () => void;
  onDownload?: (url: string, filename: string) => void;
}

export const ExpandedMessageDisplay: React.FC<ExpandedMessageDisplayProps> = ({
  message,
  theme,
  onClose,
  onDownload
}) => {
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const imageUrl = message.imageUrl || (message.images && message.images[0]?.base64Data ? `data:${message.images[0].mimeType};base64,${message.images[0].base64Data}` : null);

  // Theme-based styling
  const overlayBg = 'bg-black/80 backdrop-blur-lg';
  const cardBg = theme === Theme.DARK ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200';
  const textColor = theme === Theme.DARK ? 'text-gray-200' : 'text-gray-800';
  const mutedTextColor = theme === Theme.DARK ? 'text-gray-400' : 'text-gray-500';
  const buttonBg = theme === Theme.DARK ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10';

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'f') setIsFullscreen(prev => !prev);
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.text || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Shared from F.B/c AI', text: message.text || '' });
    } else {
      handleCopy();
    }
  };
  
  const handleDownloadClick = () => {
      if (imageUrl && onDownload) {
          const filename = `generated-image-${message.id}.png`;
          onDownload(imageUrl, filename);
      }
  }

  const resetImage = () => {
    setImageScale(1);
    setImageRotation(0);
  };

  // --- UI DEFINITIONS ---
  const actionButtons = [
    { icon: copied ? Check : Copy, label: copied ? 'Copied!' : 'Copy', onClick: handleCopy, show: !!message.text },
    { icon: Share2, label: 'Share', onClick: handleShare, show: !!navigator.share },
    { icon: Download, label: 'Download', onClick: handleDownloadClick, show: !!imageUrl && !!onDownload },
  ];

  const imageControls = [
    { icon: ZoomIn, label: 'Zoom In', onClick: () => setImageScale(prev => Math.min(prev + 0.2, 3)), disabled: imageScale >= 3 },
    { icon: ZoomOut, label: 'Zoom Out', onClick: () => setImageScale(prev => Math.max(prev - 0.2, 0.25)), disabled: imageScale <= 0.25 },
    { icon: RotateCw, label: 'Rotate', onClick: () => setImageRotation(prev => (prev + 90) % 360) },
    { icon: RefreshCw, label: 'Reset', onClick: resetImage },
  ];

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[90] flex items-center justify-center transition-all duration-300 ${overlayBg}`}
      onClick={onClose}
    >
      <div
        className={`relative flex flex-col transition-all duration-300 rounded-lg border shadow-2xl ${cardBg} ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl h-auto max-h-[90vh]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- HEADER --- */}
        <header className="flex items-center justify-between p-3 border-b" style={{ borderColor: theme === Theme.DARK ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
          <div className="flex items-center space-x-2">
            {actionButtons.filter(b => b.show).map((btn, i) => (
              <button key={i} onClick={btn.onClick} className={`p-2 rounded-md ${buttonBg} ${textColor}`} title={btn.label}>
                <btn.icon size={16} />
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsFullscreen(!isFullscreen)} className={`p-2 rounded-md ${buttonBg} ${textColor}`} title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={onClose} className={`p-2 rounded-md ${buttonBg} ${textColor}`} title="Close (Esc)">
              <X size={16} />
            </button>
          </div>
        </header>

        {/* --- CONTENT --- */}
        <main className="flex-1 overflow-auto p-6">
          {message.type === MessageType.IMAGE && imageUrl && (
            <div className="w-full h-full flex items-center justify-center overflow-hidden">
                {!imageLoaded && !imageError && <div className={`${textColor}`}>Loading image...</div>}
                {imageError && <div className={`text-red-500`}>Failed to load image.</div>}
                <img
                    ref={imageRef}
                    src={imageUrl}
                    alt="Expanded content"
                    className="max-w-full max-h-full object-contain transition-transform duration-200 cursor-grab"
                    style={{ transform: `scale(${imageScale}) rotate(${imageRotation}deg)`, visibility: imageLoaded ? 'visible' : 'hidden' }}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                />
            </div>
          )}
          {message.text && (
            <div className={`prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap break-words ${textColor}`}>
              {message.text}
            </div>
          )}
          {message.sources && (
            <div className="mt-6 pt-4 border-t" style={{ borderColor: theme === Theme.DARK ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
              <h4 className={`font-semibold mb-2 ${mutedTextColor}`}>Sources</h4>
              <ul className="space-y-1 list-none p-0">
                {message.sources.map((source: WebSource, index: number) => (
                  <li key={index}>
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {source.title || source.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>

        {/* --- FOOTER --- */}
        {message.type === MessageType.IMAGE && (
          <footer className="flex items-center justify-center p-3 border-t" style={{ borderColor: theme === Theme.DARK ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <div className="flex items-center space-x-2">
              {imageControls.map((btn, i) => (
                <button key={i} onClick={btn.onClick} disabled={btn.disabled} className={`p-2 rounded-md disabled:opacity-50 ${buttonBg} ${textColor}`} title={btn.label}>
                  <btn.icon size={16} />
                </button>
              ))}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default ExpandedMessageDisplay;