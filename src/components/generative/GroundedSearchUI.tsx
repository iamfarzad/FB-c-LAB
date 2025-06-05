import React, { useState } from 'react';
import { performGroundedSearch, GroundedSearchResult } from '../../../services/geminiService'; // Adjusted path
import { WebSource } from '../../../types'; // Assuming WebSource is defined in types.ts at root

const GroundedSearchUI: React.FC = () => {
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

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
      <h2>Grounded Search</h2>
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your search query..."
        rows={3}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        disabled={isLoading}
      />
      <button
        onClick={handleSearch}
        disabled={isLoading}
        style={{ padding: '10px 20px', cursor: isLoading ? 'not-allowed' : 'pointer', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        {isLoading ? 'Searching...' : 'Search'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>}

      {searchResultText && (
        <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '10px', background: '#f9f9f9' }}>
          <h3>Result:</h3>
          <p>{searchResultText}</p>
          {sources.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <h4>Sources:</h4>
              <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                {sources.map((source, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    {source.link ? (
                      <a href={source.link} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>
                        {source.title || source.link}
                      </a>
                    ) : (
                      source.title || 'Unknown source'
                    )}
                    {source.snippet && <p style={{ fontSize: '0.9em', color: '#555', margin: '2px 0 0 0' }}>{source.snippet}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      {!isLoading && !error && !searchResultText && sources.length === 0 && (
        <p style={{ marginTop: '10px' }}>Search results and sources will appear here.</p>
      )}
    </div>
  );
};

export default GroundedSearchUI;
