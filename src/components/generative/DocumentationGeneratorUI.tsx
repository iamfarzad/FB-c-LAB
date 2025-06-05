import React, { useState } from 'react';
import { generateDocumentation, DocumentationResult } from '../../../services/geminiService'; // Adjusted path

const DocumentationGeneratorUI: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [systemInstruction, setSystemInstruction] = useState<string>('');
  const [generatedDoc, setGeneratedDoc] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  // TODO: Add state for generationConfig if UI controls are added for it.

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for documentation.');
      return;
    }
    setIsLoading(true);
    setError('');
    setGeneratedDoc('');

    try {
      // Using default model and no specific generationConfig from UI for now
      const result: DocumentationResult = await generateDocumentation(
        prompt,
        systemInstruction || undefined, // Pass undefined if empty, so proxy uses its default
        // undefined // Placeholder for generationConfig
      );
      setGeneratedDoc(result.text);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Documentation generation failed:', errorMessage);
      setError(`Documentation generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
      <h2>Documentation Generator</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter the main prompt or content for documentation (e.g., code snippet, feature description)..."
        rows={8}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        disabled={isLoading}
      />
      <textarea
        value={systemInstruction}
        onChange={(e) => setSystemInstruction(e.target.value)}
        placeholder="Optional: System instructions (e.g., 'You are a helpful AI technical writer. Generate Markdown documentation for the following Go code...')"
        rows={3}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        disabled={isLoading}
      />
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        style={{ padding: '10px 20px', cursor: isLoading ? 'not-allowed' : 'pointer', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        {isLoading ? 'Generating...' : 'Generate Documentation'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>}

      {generatedDoc && (
        <div style={{ marginTop: '20px', border: '1px solid #eee', padding: '15px', background: '#f9f9f9', borderRadius: '4px' }}>
          <h3>Generated Documentation:</h3>
          {/* Using a div with whiteSpace: 'pre-wrap' for basic Markdown-like display.
              A proper Markdown renderer (e.g., react-markdown) would be better for rich text. */}
          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: '1.6' }}>
            {generatedDoc}
          </div>
        </div>
      )}
      {!isLoading && !error && !generatedDoc && (
        <p style={{ marginTop: '10px' }}>Generated documentation will appear here.</p>
      )}
    </div>
  );
};

export default DocumentationGeneratorUI;
