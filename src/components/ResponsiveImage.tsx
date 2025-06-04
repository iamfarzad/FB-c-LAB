import NextImage, { ImageProps as NextImageProps } from 'next/image';
import { useState, useEffect } from 'react';

interface ResponsiveImageProps extends Omit<NextImageProps, 'src' | 'alt' | 'width' | 'height'> {
  src: string;
  alt: string;
  aspectRatio?: number; // width / height
  containerClassName?: string;
  sizes?: string;
}

export function ResponsiveImage({
  src,
  alt,
  aspectRatio = 16 / 9,
  className = '',
  containerClassName = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px',
  ...props
}: ResponsiveImageProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setIsMounted(true);
    
    const updateDimensions = () => {
      if (typeof window === 'undefined') return;
      
      const container = document.getElementById('responsive-image-container');
      if (!container) return;
      
      const width = container.offsetWidth;
      const height = width / aspectRatio;
      
      setDimensions({ width, height });
    };

    // Initial update
    updateDimensions();
    
    // Update on window resize
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [aspectRatio]);

  if (!isMounted) {
    return (
      <div 
        className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 ${containerClassName}`}
        style={{ aspectRatio }}
      />
    );
  }

  return (
    <div 
      id="responsive-image-container" 
      className={`relative w-full ${containerClassName}`}
      style={{ aspectRatio }}
    >
      <NextImage
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={`object-cover ${className}`}
        {...props}
      />
    </div>
  );
}

export default ResponsiveImage;
