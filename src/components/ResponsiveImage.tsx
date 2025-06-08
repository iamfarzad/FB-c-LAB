import React from 'react';

// Make the props similar to a standard img tag
interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ src, alt, className, ...props }) => {
  // You can add logic here later for different resolutions if needed
  return <img src={src} alt={alt} className={`max-w-full h-auto ${className}`} {...props} />;
};
