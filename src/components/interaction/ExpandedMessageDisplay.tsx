
import React, { useState, useEffect, useRef } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw, Share2, Copy, Check, Maximize2, Minimize2 } from 'lucide-react';
import { ChatMessage, MessageType, Theme } from '../../../types';

interface ExpandedMessageDisplayProps {
  message: ChatMessage;
  theme: Theme;
  onClose: () => void;
  onDownload?: () => void;
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

  // Theme-based styling
  const overlayBg = theme === Theme.DARK 
    ? 'bg-black/95 backdrop-blur-xl' 
    : 'bg-white/95 backdrop-blur-xl';
  
  const cardBg = theme === Theme.DARK 
    ? 'bg-black/90 border-white/10' 
    : 'bg-white/90 border-black/10';
  
  const textColor = theme === Theme.DARK ? 'text-white' : 'text-black';
  const mutedTextColor = theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600';
  const buttonBg = theme === Theme.DARK ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20';

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          if (message.type === MessageType.IMAGE) {
            setImageScale(prev => Math.min(prev + 0.25, 3));
          }
          break;
        case '-':
          if (message.type === MessageType.IMAGE) {
            setImageScale(prev => Math.max(prev - 0.25, 0.25));
          }
          break;
        case 'r':
          if (message.type === MessageType.IMAGE) {
            setImageRotation(prev => (prev + 90) % 360);
          }
          break;
        case 'f':
          setIsFullscreen(prev => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [message.type, onClose]);

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      if (message.type === MessageType.IMAGE && message.content) {
        // For images, copy the URL
        await navigator.clipboard.writeText(message.content);
      } else {
        // For text, copy the content
        await navigator.clipboard.writeText(message.content || '');
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shared Message',
          text: message.content || '',
          url: message.type === MessageType.IMAGE ? message.content : undefined
        });
      } catch (err) {
        console.error('Failed to share:', err);
      }
    } else {
      // Fallback to copy
      handleCopy();
    }
  };

  // Reset image transformations
  const resetImage = () => {
    setImageScale(1);
    setImageRotation(0);
  };

  // Action buttons configuration
  const actionButtons = [
    {
      icon: copied ? Check : Copy,
      label: copied ? 'Copied!' : 'Copy',
      onClick: handleCopy,
      show: true
    },
    {
      icon: Share2,
      label: 'Share',
      onClick: handleShare,
      show: navigator.share !== undefined
    },
    {
      icon: Download,
      label: 'Download',
      onClick: onDownload,
      show: message.type === MessageType.IMAGE && onDownload !== undefined
    },
    {
      icon: isFullscreen ? Minimize2 : Maximize2,
      label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
      onClick: () => setIsFullscreen(!isFullscreen),
      show: true
    }
  ];

  const imageControls = message.type === MessageType.IMAGE ? [
    {
      icon: ZoomIn,
      label: 'Zoom In',
      onClick: () => setImageScale(prev => Math.min(prev + 0.25, 3)),
      disabled: imageScale >= 3
    },
    {
      icon: ZoomOut,
      label: 'Zoom Out',
      onClick: () => setImageScale(prev => Math.max(prev - 0.25, 0.25)),
      disabled: imageScale <= 0.25
    },
    {
      icon: RotateCw,
      label: 'Rotate',
      onClick: () => setImageRotation(prev => (prev + 90) % 360),
      disabled: false
    }
  ] : [];

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        ${overlayBg} ${isFullscreen ? 'p-0' : 'p-4 sm:p-6 lg:p-8'}
        transition-all duration-300 ease-out
      `}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Main Container */}
      <div 
        ref={containerRef}
        className={`
          relative w-full max-w-6xl max-h-full
          ${isFullscreen ? 'w-full h-full max-w-none' : 'rounded-2xl'}
          ${cardBg} border shadow-2xl
          flex flex-col overflow-hidden
          transform transition-all duration-300 ease-out
        `}
      >
        {/* Enhanced Header */}
        <div className={`
          flex-shrink-0 px-4 sm:px-6 py-4 border-b
          ${theme === Theme.DARK ? 'border-white/10' : 'border-black/10'}
          bg-gradient-to-r ${theme === Theme.DARK ? 'from-orange-500/10 to-transparent' : 'from-orange-100/50 to-transparent'}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`
                p-2 rounded-lg border ${theme === Theme.DARK ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}
              `}>
                {message.type === MessageType.IMAGE ? (
                  <div className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded" />
                ) : (
                  <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 rounded" />
                )}
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${textColor}`}>
                  {message.type === MessageType.IMAGE ? 'Image Viewer' : 'Message Viewer'}
                </h3>
                <p className={`text-xs ${mutedTextColor}`}>
                  {message.timestamp ? new Date(message.timestamp).toLocaleString() : 'Expanded view'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {actionButtons.filter(btn => btn.show).map((button, index) => (
                <button
                  key={index}
                  onClick={button.onClick}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    ${buttonBg} ${mutedTextColor} hover:text-orange-500
                    hidden sm:flex items-center justify-center
                  `}
                  title={button.label}
                >
                  <button.icon size={18} />
                </button>
              ))}
              
              <button 
                onClick={onClose}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${buttonBg} ${mutedTextColor} hover:text-red-500
                `}
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Image Controls */}
          {message.type === MessageType.IMAGE && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                {imageControls.map((control, index) => (
                  <button
                    key={index}
                    onClick={control.onClick}
                    disabled={control.disabled}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm
                      transition-all duration-200
                      ${control.disabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : `${buttonBg} hover:bg-orange-500/20 hover:text-orange-500`
                      }
                    `}
                    title={control.label}
                  >
                    <control.icon size={16} />
                    <span className="hidden sm:inline">{control.label}</span>
                  </button>
                ))}
                
                <button
                  onClick={resetImage}
                  className={`
                    px-3 py-2 rounded-lg text-sm transition-all duration-200
                    ${buttonBg} hover:bg-orange-500/20 hover:text-orange-500
                  `}
                >
                  Reset
                </button>
              </div>

              <div className={`text-sm ${mutedTextColor}`}>
                Scale: {Math.round(imageScale * 100)}% | Rotation: {imageRotation}°
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Hint */}
          <div className={`mt-3 text-xs ${mutedTextColor} hidden lg:block`}>
            <span>Shortcuts: </span>
            <kbd className="px-1 py-0.5 bg-black/20 rounded">Esc</kbd> Close • 
            <kbd className="px-1 py-0.5 bg-black/20 rounded">F</kbd> Fullscreen
            {message.type === MessageType.IMAGE && (
              <>
                {' • '}
                <kbd className="px-1 py-0.5 bg-black/20 rounded">+/-</kbd> Zoom • 
                <kbd className="px-1 py-0.5 bg-black/20 rounded">R</kbd> Rotate
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {message.type === MessageType.IMAGE ? (
            <div className="flex items-center justify-center min-h-full p-4 sm:p-6">
              {!imageLoaded && !imageError && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                  <p className={`text-sm ${mutedTextColor}`}>Loading image...</p>
                </div>
              )}
              
              {imageError && (
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-4 rounded-lg ${theme === Theme.DARK ? 'bg-red-500/10' : 'bg-red-100'}`}>
                    <p className={`text-sm ${theme === Theme.DARK ? 'text-red-400' : 'text-red-600'}`}>
                      Failed to load image
                    </p>
                  </div>
                </div>
              )}

              {message.content && (
                <img
                  ref={imageRef}
                  src={message.content}
                  alt="Expanded view"
                  className={`
                    max-w-full max-h-full object-contain transition-all duration-300 ease-out
                    ${!imageLoaded ? 'opacity-0' : 'opacity-100'}
                  `}
                  style={{
                    transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
                    transformOrigin: 'center'
                  }}
                  onLoad={() => {
                    setImageLoaded(true);
                    setImageError(false);
                  }}
                  onError={() => {
                    setImageError(true);
                    setImageLoaded(false);
                  }}
                  draggable={false}
                />
              )}
            </div>
          ) : (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className={`
                prose prose-lg max-w-none
                ${theme === Theme.DARK ? 'prose-invert' : ''}
                ${textColor}
              `}>
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Action Bar */}
        <div className={`
          sm:hidden flex-shrink-0 px-4 py-3 border-t
          ${theme === Theme.DARK ? 'border-white/10 bg-black/50' : 'border-black/10 bg-white/50'}
        `}>
          <div className="flex items-center justify-center space-x-4">
            {actionButtons.filter(btn => btn.show).map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className={`
                  flex flex-col items-center space-y-1 p-2 rounded-lg
                  transition-all duration-200 ${buttonBg}
                `}
              >
                <button.icon size={18} className="text-orange-500" />
                <span className={`text-xs ${mutedTextColor}`}>{button.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpandedMessageDisplay;