import React, { useState, useEffect } from 'react';
import { X, FileText, Download, ChevronDown, ChevronRight, Loader2, MessageSquare, Clock, User, Bot } from 'lucide-react';
import { Theme } from '../../../types';

interface ChatSidePanelProps {
  isOpen: boolean;
  theme: Theme;
  onClose: () => void;
  chatHistory: any[];
  onDownloadTranscript?: () => void;
  onSummarizeChat?: () => void;
  onGenerateFollowUpBrief?: () => void;
  summaryData?: any;
  isLoading?: boolean;
}

export const ChatSidePanel: React.FC<ChatSidePanelProps> = ({
  isOpen,
  theme,
  onClose,
  chatHistory,
  onDownloadTranscript,
  onSummarizeChat,
  onGenerateFollowUpBrief,
  summaryData,
  isLoading = false
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'summary' | 'analytics' | 'export'>('summary');

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Responsive classes
  const panelBg = theme === Theme.DARK 
    ? 'bg-gray-900/95 border-gray-700' 
    : 'bg-white/95 border-gray-200';
  
  const textColor = theme === Theme.DARK ? 'text-white' : 'text-black';
  const mutedTextColor = theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600';
  const cardBg = theme === Theme.DARK ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200';

  const tabs = [
    { id: 'summary', label: 'Summary', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: Clock },
    { id: 'export', label: 'Export', icon: Download }
  ];

  return (
    <div className={`
      h-full w-full flex flex-col overflow-hidden
      ${panelBg} border-l
    `}>
      {/* Enhanced Header */}
      <div className={`
        flex-shrink-0 px-4 py-3 border-b ${theme === Theme.DARK ? 'border-gray-700' : 'border-gray-200'}
        bg-gradient-to-r ${theme === Theme.DARK ? 'from-orange-500/10 to-transparent' : 'from-orange-100/50 to-transparent'}
      `}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${cardBg} border`}>
              <FileText size={16} className="text-orange-500" />
            </div>
            <div>
              <h3 className={`text-sm font-semibold ${textColor}`}>
                Tools
              </h3>
              <p className={`text-xs ${mutedTextColor}`}>
                Analysis & insights
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`
                flex items-center space-x-1 px-2 py-1.5 rounded text-xs font-medium
                transition-all duration-200 flex-1 justify-center
                ${activeTab === id 
                  ? 'bg-orange-500 text-white shadow-lg' 
                  : `${mutedTextColor} hover:bg-orange-500/10 hover:text-orange-500`
                }
              `}
            >
              <Icon size={12} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="p-4 space-y-4">
            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className={`text-xs font-semibold uppercase tracking-wider ${mutedTextColor}`}>
                Quick Actions
              </h4>
              <div className="space-y-2">
                <button
                  onClick={onSummarizeChat}
                  disabled={isLoading || chatHistory.length === 0}
                  className={`
                    flex items-center justify-center space-x-2 p-2 rounded-lg border w-full
                    transition-all duration-200 ${cardBg}
                    ${isLoading || chatHistory.length === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-orange-500/50 hover:bg-orange-500/5'
                    }
                  `}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin text-orange-500" />
                  ) : (
                    <MessageSquare size={14} className="text-orange-500" />
                  )}
                  <span className={`text-xs font-medium ${textColor}`}>
                    Generate Summary
                  </span>
                </button>

                <button
                  onClick={onGenerateFollowUpBrief}
                  disabled={isLoading || chatHistory.length === 0}
                  className={`
                    flex items-center justify-center space-x-2 p-2 rounded-lg border w-full
                    transition-all duration-200 ${cardBg}
                    ${isLoading || chatHistory.length === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:border-orange-500/50 hover:bg-orange-500/5'
                    }
                  `}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin text-orange-500" />
                  ) : (
                    <Clock size={14} className="text-orange-500" />
                  )}
                  <span className={`text-xs font-medium ${textColor}`}>
                    Follow-up Brief
                  </span>
                </button>
              </div>
            </div>

            {/* Summary Content */}
            {summaryData && (
              <div className="space-y-3">
                <h4 className={`text-xs font-semibold uppercase tracking-wider ${mutedTextColor}`}>
                  Summary Results
                </h4>
                {Object.entries(summaryData).map(([key, value]) => (
                  <div key={key} className={`border rounded-lg ${cardBg}`}>
                    <button
                      onClick={() => toggleSection(key)}
                      className={`
                        w-full flex items-center justify-between p-3
                        hover:bg-orange-500/5 transition-colors duration-200
                      `}
                    >
                      <span className={`font-medium capitalize text-sm ${textColor}`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {expandedSections.has(key) ? (
                        <ChevronDown size={14} className="text-orange-500" />
                      ) : (
                        <ChevronRight size={14} className={mutedTextColor} />
                      )}
                    </button>
                    {expandedSections.has(key) && (
                      <div className="px-3 pb-3">
                        <div className={`text-xs leading-relaxed ${textColor}`}>
                          {Array.isArray(value) ? (
                            <ul className="space-y-1">
                              {(value as any[]).map((item, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <div className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                                  <span>{String(item)}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>{String(value)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className={`p-3 rounded-lg border ${cardBg}`}>
                <div className="flex items-center space-x-1 mb-1">
                  <MessageSquare size={12} className="text-orange-500" />
                  <span className={`text-xs font-medium uppercase tracking-wider ${mutedTextColor}`}>
                    Messages
                  </span>
                </div>
                <div className={`text-lg font-bold ${textColor}`}>
                  {chatHistory.length}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg border ${cardBg}`}>
                <div className="flex items-center space-x-1 mb-1">
                  <User size={12} className="text-orange-500" />
                  <span className={`text-xs font-medium uppercase tracking-wider ${mutedTextColor}`}>
                    User
                  </span>
                </div>
                <div className={`text-lg font-bold ${textColor}`}>
                  {chatHistory.filter(msg => msg.sender === 'user').length}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg border ${cardBg}`}>
                <div className="flex items-center space-x-1 mb-1">
                  <Bot size={12} className="text-orange-500" />
                  <span className={`text-xs font-medium uppercase tracking-wider ${mutedTextColor}`}>
                    Assistant
                  </span>
                </div>
                <div className={`text-lg font-bold ${textColor}`}>
                  {chatHistory.filter(msg => msg.sender === 'ai').length}
                </div>
              </div>
              
              <div className={`p-3 rounded-lg border ${cardBg}`}>
                <div className="flex items-center space-x-1 mb-1">
                  <Clock size={12} className="text-orange-500" />
                  <span className={`text-xs font-medium uppercase tracking-wider ${mutedTextColor}`}>
                    Duration
                  </span>
                </div>
                <div className={`text-lg font-bold ${textColor}`}>
                  {chatHistory.length > 0 ? '5m' : '0m'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h4 className={`text-xs font-semibold uppercase tracking-wider ${mutedTextColor}`}>
                Export Options
              </h4>
              <button
                onClick={onDownloadTranscript}
                disabled={chatHistory.length === 0}
                className={`
                  w-full flex items-center justify-center space-x-2 p-3 rounded-lg border
                  transition-all duration-200 ${cardBg}
                  ${chatHistory.length === 0 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-orange-500/50 hover:bg-orange-500/5'
                  }
                `}
              >
                <Download size={14} className="text-orange-500" />
                <span className={`text-sm font-medium ${textColor}`}>
                  Download Transcript
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`
        flex-shrink-0 px-4 py-2 border-t ${theme === Theme.DARK ? 'border-gray-700' : 'border-gray-200'}
        ${theme === Theme.DARK ? 'bg-gray-800/30' : 'bg-gray-50/30'}
      `}>
        <p className={`text-xs text-center ${mutedTextColor}`}>
          AI-powered analysis
        </p>
      </div>
    </div>
  );
};

export default ChatSidePanel;
