import React, { useState } from 'react';
import { generateImage, GeneratedImageData } from '../../../services/geminiService';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Alert, AlertDescription } from '../ui/Alert';
import { Loading } from '../ui/Loading';
import { Badge } from '../ui/Badge';
import { Sparkles, Image as ImageIcon, Download } from 'lucide-react';
import { useTheme, Theme } from '../../contexts/ThemeContext';

interface DisplayImage {
  src: string;
  alt: string;
  mimeType: string;
}

const ImageGeneratorUI: React.FC = () => {
  const { theme } = useTheme();
  const [prompt, setPrompt] = useState<string>('');
  const [displayImages, setDisplayImages] = useState<DisplayImage[]>([]);
  const [generatedText, setGeneratedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError('');
    setDisplayImages([]);
    setGeneratedText('');

    try {
      const result: GeneratedImageData = await generateImage(prompt);
      if (result.images && result.images.length > 0) {
        const newDisplayImages = result.images.map((img, index) => ({
          src: `data:${img.mimeType};base64,${img.base64Data}`,
          alt: `Generated image ${index + 1} for prompt: ${prompt}`,
          mimeType: img.mimeType,
        }));
        setDisplayImages(newDisplayImages);
      } else {
        setError('No images were generated. The model might have returned only text.');
      }
      setGeneratedText(result.text || 'No text was generated alongside the image.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Image generation failed:', errorMessage);
      setError(`Image generation failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = (imageData: DisplayImage, index: number) => {
    const link = document.createElement('a');
    link.href = imageData.src;
    link.download = `generated-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600">
            <ImageIcon size={20} className="text-white" />
          </div>
          AI Image Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label className={`text-sm font-medium ${
            theme === Theme.DARK ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Image Description *
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate... (e.g., 'A futuristic city skyline at sunset with flying cars')"
            rows={4}
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
              <Loading variant="spinner" size="sm" className="mr-2" />
              Generating Image...
            </>
          ) : (
            <>
              <Sparkles size={18} className="mr-2" />
              Generate Image
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Generated Text */}
        {generatedText && generatedText !== 'No text was generated alongside the image.' && (
          <Alert>
            <AlertDescription>
              <strong>AI Response:</strong> {generatedText}
            </AlertDescription>
          </Alert>
        )}

        {/* Generated Images */}
        {displayImages.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-purple-500" />
                  Generated Images ({displayImages.length})
                </div>
                <Badge variant="success" className="text-xs">
                  Ready for download
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {displayImages.map((img, index) => (
                  <Card key={index} className={`
                    group relative overflow-hidden transition-all duration-200 hover:scale-[1.02]
                    ${theme === Theme.DARK 
                      ? 'bg-gray-900/50 border-gray-700' 
                      : 'bg-gray-50 border-gray-200'
                    }
                  `}>
                    <CardContent className="p-4">
                      <div className="relative">
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="w-full h-auto rounded-lg shadow-lg"
                          style={{ maxHeight: '300px', objectFit: 'contain' }}
                        />
                        
                        {/* Overlay with download button */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                          <Button
                            onClick={() => downloadImage(img, index)}
                            variant="secondary"
                            size="sm"
                            className="bg-white/90 text-black hover:bg-white"
                          >
                            <Download size={16} className="mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            Image {index + 1}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {img.mimeType}
                          </Badge>
                        </div>
                        
                        <p className={`text-xs leading-relaxed ${
                          theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {img.alt}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder State */}
        {!isLoading && !error && displayImages.length === 0 && generatedText === '' && (
          <div className={`
            text-center py-12 rounded-lg border-2 border-dashed
            ${theme === Theme.DARK 
              ? 'border-gray-700 text-gray-400' 
              : 'border-gray-300 text-gray-500'
            }
          `}>
            <ImageIcon size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Ready to Create</h3>
            <p className="text-sm">Describe an image and watch AI bring it to life</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageGeneratorUI;
