
import React, { useState, useCallback } from 'react';
import { Theme, ChatMessage } from '../../../types';
import { summarizeChatHistory, generateFollowUpBrief } from '../../../services/geminiService';
import { X, Download, FileText, Brain, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { FBC_BRAND_NAME } from '../../../constants';

interface ChatSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  chatHistory: ChatMessage[];
}

interface ParsedSummaryItem {
  heading: string;
  bullets: string[];
}

export const ChatSidePanel: React.FC<ChatSidePanelProps> = ({ isOpen, onClose, theme, chatHistory }) => {
  const [summary, setSummary] = useState<string>('');
  const [parsedSummary, setParsedSummary] = useState<ParsedSummaryItem[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [followUpBrief, setFollowUpBrief] = useState<string>('');
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [openSummaryItems, setOpenSummaryItems] = useState<Record<string, boolean>>({});


  const handleSummarize = async () => {
    setIsSummarizing(true);
    setSummary('');
    setParsedSummary([]);
    try {
      const result = await summarizeChatHistory(chatHistory);
      setSummary(result);
      parseAndSetSummary(result);
    } catch (error) {
      setSummary(`Error summarizing: ${error instanceof Error ? error.message : String(error)}`);
      setParsedSummary([]);
    } finally {
      setIsSummarizing(false);
    }
  };
  
  const parseAndSetSummary = (markdownText: string) => {
    const lines = markdownText.split('\n');
    const summaryItems: ParsedSummaryItem[] = [];
    let currentItem: ParsedSummaryItem | null = null;

    lines.forEach(line => {
        const headingMatch = line.match(/^##\s+(.*)/);
        const bulletMatch = line.match(/^[\*\-]\s+(.*)/);

        if (headingMatch) {
            if (currentItem) {
                summaryItems.push(currentItem);
            }
            currentItem = { heading: headingMatch[1].trim(), bullets: [] };
        } else if (bulletMatch && currentItem) {
            currentItem.bullets.push(bulletMatch[1].trim());
        } else if (line.trim() && currentItem && currentItem.bullets.length === 0 && !line.startsWith('#')) {
            // If it's not a heading or bullet but part of the current item's content (and not another heading)
             // For now, we only capture explicit bullets. This could be expanded.
        }
    });

    if (currentItem) {
        summaryItems.push(currentItem);
    }
    setParsedSummary(summaryItems);
    // By default, open the first summary item if available
    if (summaryItems.length > 0) {
        setOpenSummaryItems({ [summaryItems[0].heading]: true });
    } else {
        setOpenSummaryItems({});
    }
  };

  const toggleSummaryItem = (heading: string) => {
    setOpenSummaryItems(prev => ({ ...prev, [heading]: !prev[heading] }));
  };


  const handleGenerateBrief = async () => {
    setIsGeneratingBrief(true);
    setFollowUpBrief('');
    try {
      const result = await generateFollowUpBrief(chatHistory);
      setFollowUpBrief(result);
    } catch (error) {
      setFollowUpBrief(`Error generating brief: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  const handleDownload = () => {
    const userProvidedName = chatHistory.find(msg => msg.sender === 'user' && msg.text?.toLowerCase().includes("my name is"))?.text?.match(/my name is (.*?)(?:,|\.|$)/i)?.[1].trim();
    const userProvidedEmail = chatHistory.find(msg => msg.sender === 'user' && msg.text?.includes("@"))?.text?.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0];

    let content = `Conversation Brief - ${FBC_BRAND_NAME} AI Assistant\n`;
    content += `Date: ${new Date().toLocaleDateString()}\n\n`;

    if (userProvidedName) content += `User Name (Mentioned): ${userProvidedName}\n`;
    if (userProvidedEmail) content += `User Email (Mentioned): ${userProvidedEmail}\n`;
    if (userProvidedName || userProvidedEmail) content += `\n`;
    
    content += "--- CHAT HISTORY ---\n";
    chatHistory.forEach(msg => {
      const senderPrefix = msg.sender === 'user' ? "User" : (msg.sender === 'ai' ? "AI" : "System");
      content += `[${new Date(msg.timestamp).toLocaleTimeString()}] ${senderPrefix}: ${msg.text || (msg.imageUrl ? '[Image]' : '')}\n`;
      if (msg.sources && msg.sources.length > 0) {
        content += `  Sources:\n`;
        msg.sources.forEach(s => content += `    - ${s.title}: ${s.uri}\n`);
      }
    });
    content += "\n--- END OF CHAT HISTORY ---\n\n";

    if (summary) {
      content += "--- CONVERSATION SUMMARY (AI Generated) ---\n";
      // Use parsed summary for better formatting if available
      if(parsedSummary.length > 0){
        parsedSummary.forEach(item => {
            content += `\n## ${item.heading}\n`;
            item.bullets.forEach(bullet => content += `* ${bullet}\n`);
        });
      } else {
          content += summary.replace(/^##\s+/gm, '').replace(/^[\*\-]\s+/gm, '  - '); // Basic formatting
      }
      content += "\n--- END OF SUMMARY ---\n\n";
    }

    if (followUpBrief) {
      content += "--- FOLLOW-UP BRIEF (AI Generated) ---\n";
      content += followUpBrief.replace(/^##\s+/gm, '').replace(/^[\*\-]\s+/gm, '  - '); // Basic formatting
      content += "\n--- END OF BRIEF ---\n";
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `FBC_AI_Chat_Brief_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const panelBg = theme === Theme.DARK ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300';
  const textColor = theme === Theme.DARK ? 'text-gray-200' : 'text-gray-700';
  const buttonBase = `w-full flex items-center justify-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-60`;
  const primaryButton = `${buttonBase} ${theme === Theme.DARK ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'}`;
  const secondaryButton = `${buttonBase} ${theme === Theme.DARK ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`;
  const outputAreaBg = theme === Theme.DARK ? 'bg-gray-900/50 border-gray-700/70' : 'bg-white/70 border-gray-300/70';
  const outputTextColor = theme === Theme.DARK ? 'text-gray-300' : 'text-gray-700';
  const detailsSummaryStyles = `py-2 px-1 cursor-pointer flex justify-between items-center w-full font-medium text-sm ${theme === Theme.DARK ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-700'}`;
  const detailsContentStyles = `pb-2 pl-3 text-xs ${outputTextColor} space-y-1`;


  if (!isOpen) return null;

  return (
    <div className={`h-full w-72 md:w-80 flex-shrink-0 p-4 border-r flex flex-col space-y-4 ${panelBg} ${textColor}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <FileText size={20} className="mr-2 text-[var(--accent-color)]" />
          Conv<span className="text-[var(--accent-color)]">o</span> Tools
        </h3>
        <div className="text-xs text-gray-500 mt-1">
          Smart conversation analysis & insights
        </div>
        <button onClick={onClose} className={`p-1.5 rounded-full ${theme === Theme.DARK ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`} aria-label="Close side panel">
          <X size={18} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-xs">
          <div className="font-medium text-orange-800 dark:text-orange-300 mb-1">Key Context:</div>
          <div className="text-orange-700 dark:text-orange-400 space-y-1">
            <div>• Messages: {chatHistory.length}</div>
            <div>• Voice active: {chatHistory.some(m => m.text?.includes('voice')) ? 'Yes' : 'No'}</div>
            <div>• Topics: AI consulting, services, automation</div>
          </div>
        </div>
        <button onClick={handleSummarize} disabled={isSummarizing || chatHistory.length === 0} className={primaryButton}>
          {isSummarizing ? <Loader2 size={18} className="animate-spin mr-2" /> : <Brain size={18} className="mr-2" />}
          Summarize Chat
        </button>
        <button onClick={handleGenerateBrief} disabled={isGeneratingBrief || chatHistory.length === 0} className={primaryButton}>
          {isGeneratingBrief ? <Loader2 size={18} className="animate-spin mr-2" /> : <FileText size={18} className="mr-2" />}
          Generate Follow-up Brief
        </button>
      </div>
      
      <div className={`flex-grow overflow-y-auto space-y-3 p-3 rounded-lg border ${outputAreaBg}`}>
        {summary && parsedSummary.length > 0 && (
          <div>
            <h4 className={`text-sm font-semibold mb-1.5 ${textColor}`}>Conversation Summary:</h4>
            <div className="space-y-1">
            {parsedSummary.map((item, index) => (
                <details key={index} open={openSummaryItems[item.heading] || false} className={`border-b ${theme === Theme.DARK ? 'border-gray-700/50' : 'border-gray-300/50'}`}>
                    <summary onClick={(e) => { e.preventDefault(); toggleSummaryItem(item.heading);}} className={detailsSummaryStyles}>
                        {item.heading}
                        {openSummaryItems[item.heading] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </summary>
                    <div className={detailsContentStyles}>
                        {item.bullets.length > 0 ? (
                            <ul className="list-disc list-inside pl-2 space-y-0.5">
                                {item.bullets.map((bullet, bIndex) => <li key={bIndex}>{bullet}</li>)}
                            </ul>
                        ) : <p className="italic text-xs">No specific details under this topic.</p>}
                    </div>
                </details>
            ))}
            </div>
          </div>
        )}
        {summary && parsedSummary.length === 0 && !isSummarizing && (
            <div>
                <h4 className={`text-sm font-semibold mb-1.5 ${textColor}`}>Conversation Summary:</h4>
                <div className={`text-xs whitespace-pre-wrap ${outputTextColor}`} dangerouslySetInnerHTML={{__html: summary.replace(/\n/g, '<br/>')}}></div>
            </div>
        )}


        {followUpBrief && (
          <div>
            <h4 className={`text-sm font-semibold mb-1.5 ${textColor}`}>Follow-up Brief:</h4>
            <div className={`text-xs whitespace-pre-wrap ${outputTextColor}`} dangerouslySetInnerHTML={{__html: followUpBrief.replace(/\n/g, '<br/>')}}></div>
          </div>
        )}
      </div>

      <button onClick={handleDownload} disabled={chatHistory.length === 0} className={secondaryButton}>
        <Download size={18} className="mr-2" /> Download Full Brief (.txt)
      </button>
    </div>
  );
};
