import React, { useState } from 'react';
import { generateImage, GeneratedImageData } from '../../../services/geminiService'; // Adjusted path

interface DisplayImage {
  src: string;
  alt: string;
  mimeType: string;
}

const ImageGeneratorUI: React.FC = () => {
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
      // Using the default model for now, can add a model selector later
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

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', margin: '20px 0', borderRadius: '8px' }}>
      <h2>Image Generator</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt to generate an image..."
        rows={3}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
        disabled={isLoading}
      />
      <button
        onClick={handleGenerate}
        disabled={isLoading}
        style={{ padding: '10px 20px', cursor: isLoading ? 'not-allowed' : 'pointer', backgroundColor: isLoading ? '#ccc' : '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
      >
        {isLoading ? 'Generating...' : 'Generate Image'}
      </button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>Error: {error}</p>}

      {generatedText && <p style={{ marginTop: '10px', fontStyle: 'italic' }}>Model says: {generatedText}</p>}

      {displayImages.length > 0 && (
        <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {displayImages.map((img, index) => (
            <img
              key={index}
              src={img.src}
              alt={img.alt}
              style={{ maxWidth: '256px', maxHeight: '256px', border: '1px solid #eee', borderRadius: '4px' }}
            />
          ))}
        </div>
      )}
      {!isLoading && !error && displayImages.length === 0 && generatedText === '' && (
         <p style={{ marginTop: '10px' }}>Image display area. Generated images and text will appear here.</p>
      )}
    </div>
  );
};

export default ImageGeneratorUI;
