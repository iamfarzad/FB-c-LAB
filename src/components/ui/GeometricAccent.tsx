import React, { useEffect, useRef } from 'react';
import { Theme } from '@/types';

interface GeometricAccentProps {
  theme: Theme;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: number;
  opacity?: number;
}

export const GeometricAccent: React.FC<GeometricAccentProps> = ({
  theme,
  position = 'top-right',
  size = 400,
  opacity = 0.15
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = size;
    canvas.height = size;
    
    // Animation variables
    let animationFrameId: number;
    let rotation = 0;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;
    
    // Colors based on theme
    const strokeColor = theme === Theme.DARK ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
    const accentColor = 'rgba(249, 115, 22, 0.4)'; // orange-500 with opacity
    
    // Draw function
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw rotating geometric elements
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Outer circle
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Rotating inner elements
      ctx.rotate(rotation);
      
      // Cross lines
      ctx.beginPath();
      ctx.moveTo(-radius, 0);
      ctx.lineTo(radius, 0);
      ctx.moveTo(0, -radius);
      ctx.lineTo(0, radius);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.5;
      ctx.stroke();
      
      // Accent square
      ctx.rotate(rotation * 2);
      ctx.beginPath();
      const squareSize = radius * 0.7;
      ctx.rect(-squareSize/2, -squareSize/2, squareSize, squareSize);
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Accent points at intersections
      const pointRadius = 2;
      ctx.fillStyle = accentColor;
      
      // Points at cardinal directions
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI / 2) + rotation * 3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
      
      // Update rotation for next frame
      rotation += 0.002;
      
      // Continue animation
      animationFrameId = requestAnimationFrame(draw);
    };
    
    // Start animation
    draw();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, size]);
  
  // Position classes
  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0'
  };
  
  return (
    <div className={`absolute ${positionClasses[position]} pointer-events-none z-0`}
         style={{ opacity }}>
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size}
        className="transform -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};
