import React, { useState } from 'react';
import { generateDocumentation } from '@/services/geminiService';
type DocumentationResult = Awaited<ReturnType<typeof generateDocumentation>>;
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Loading } from '@/components/ui/Loading';
import { FileText, Sparkles } from 'lucide-react';
import { useTheme, Theme } from '@/contexts/ThemeContext';

const DocumentationGeneratorUI: React.FC = () => {
  const { theme } = useTheme();
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
            <FileText size={20} className="text-white" />
          </div>
          Documentation Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Main Prompt Input */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${
            theme === Theme.DARK ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Documentation Prompt *
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter the main prompt or content for documentation (e.g., code snippet, feature description)..."
            rows={6}
            disabled={isLoading}
            className="resize-none"
          />
        </div>

        {/* System Instructions */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${
            theme === Theme.DARK ? 'text-gray-200' : 'text-gray-700'
          }`}>
            System Instructions (Optional)
          </label>
          <Textarea
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            placeholder="Optional: System instructions (e.g., 'You are a helpful AI technical writer. Generate Markdown documentation for the following Go code...')"
            rows={3}
            disabled={isLoading}
            className="resize-none"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loading variant="dots" size="sm" className="mr-2" />
              Generating Documentation...
            </>
          ) : (
            <>
              <Sparkles size={18} className="mr-2" />
              Generate Documentation
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generated Documentation */}
        {generatedDoc && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Generated Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`
                prose prose-sm max-w-none
                ${theme === Theme.DARK ? 'prose-invert' : ''}
                rounded-lg p-4 border
                ${theme === Theme.DARK 
                  ? 'bg-gray-900/50 border-gray-700' 
                  : 'bg-gray-50 border-gray-200'
                }
              `}>
                <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {generatedDoc}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder State */}
        {!isLoading && !error && !generatedDoc && (
          <div className={`
            text-center py-8 rounded-lg border-2 border-dashed
            ${theme === Theme.DARK 
              ? 'border-gray-700 text-gray-400' 
              : 'border-gray-300 text-gray-500'
            }
          `}>
            <FileText size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">Generated documentation will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentationGeneratorUI;
