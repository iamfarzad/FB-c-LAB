import React, { useState } from 'react';
import { performGroundedSearch, GroundedSearchResult } from '../../../services/geminiService';
import { WebSource } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Alert, AlertDescription } from '../ui/Alert';
import { Loading } from '../ui/Loading';
import { Search, ExternalLink, Globe } from 'lucide-react';
import { useTheme, Theme } from '../../contexts/ThemeContext';

const GroundedSearchUI: React.FC = () => {
  const { theme } = useTheme();
  const [query, setQuery] = useState<string>('');
  const [searchResultText, setSearchResultText] = useState<string>('');
  const [sources, setSources] = useState<WebSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  // TODO: Add state for conversation history if we want to make search conversational

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSearchResultText('');
    setSources([]);

    try {
      // For now, not passing conversationHistory. This can be added later.
      const result: GroundedSearchResult = await performGroundedSearch(query);
      setSearchResultText(result.text);
      if (result.sources) {
        setSources(result.sources);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Grounded search failed:', errorMessage);
      setError(`Grounded search failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-600">
            <Globe size={20} className="text-white" />
          </div>
          Grounded Search
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Search Input */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${
            theme === Theme.DARK ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Search Query
          </label>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your search query..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading || !query.trim()}
              className="px-6"
            >
              {isLoading ? (
                <Loading variant="dots" size="sm" />
              ) : (
                <>
                  <Search size={16} className="mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search Results */}
        {searchResultText && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Search size={18} className="text-green-500" />
                Search Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Result */}
              <div className={`
                p-4 rounded-lg border
                ${theme === Theme.DARK 
                  ? 'bg-gray-900/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
                }
              `}>
                <p className={`text-sm leading-relaxed ${
                  theme === Theme.DARK ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {searchResultText}
                </p>
              </div>

              {/* Sources */}
              {sources.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ExternalLink size={16} className="text-blue-500" />
                    <h4 className={`font-medium ${
                      theme === Theme.DARK ? 'text-gray-200' : 'text-gray-700'
                    }`}>
                      Sources ({sources.length})
                    </h4>
                  </div>
                  
                  <div className="grid gap-3">
                    {sources.map((source, index) => (
                      <Card key={index} className={`
                        transition-all duration-200 hover:scale-[1.02] cursor-pointer
                        ${theme === Theme.DARK 
                          ? 'hover:bg-gray-800/50' 
                          : 'hover:bg-gray-50'
                        }
                      `}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <ExternalLink size={14} className="text-blue-500 flex-shrink-0" />
                                                               <h5 className={`font-medium text-sm ${
                                   theme === Theme.DARK ? 'text-gray-200' : 'text-gray-700'
                                 }`}>
                                   {source.title || 'Untitled Source'}
                                 </h5>
                               </div>
                               
                               {source.uri && (
                                 <a
                                   href={source.uri}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className="text-xs text-blue-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1"
                                 >
                                   <span className="truncate max-w-xs">{source.uri}</span>
                                   <ExternalLink size={10} />
                                 </a>
                               )}
                            </div>
                            
                            <Badge variant="secondary" className="text-xs">
                              Source {index + 1}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Placeholder State */}
        {!isLoading && !error && !searchResultText && sources.length === 0 && (
          <div className={`
            text-center py-12 rounded-lg border-2 border-dashed
            ${theme === Theme.DARK 
              ? 'border-gray-700 text-gray-400' 
              : 'border-gray-300 text-gray-500'
            }
          `}>
            <Globe size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Ready to Search</h3>
            <p className="text-sm">Enter a query to search the web and get AI-powered insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroundedSearchUI;
