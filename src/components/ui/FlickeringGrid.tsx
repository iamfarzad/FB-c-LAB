import React, { useEffect, useRef, useState } from 'react';
import { cn } from "@/lib/utils";

interface FlickeringGridProps {
  className?: string;
  squareSize?: number;
  gridGap?: number;
  maxOpacity?: number;
  flickerChance?: number;
  width?: number;
  height?: number;
  theme?: 'light' | 'dark';
  blur?: number; // Blur amount in pixels
}

export const FlickeringGrid = React.forwardRef<
  HTMLDivElement,
  FlickeringGridProps
>(({ className, squareSize = 4, gridGap = 6, maxOpacity = 0.3, flickerChance = 0.02, width = 800, height = 800, theme = 'light', blur = 0.5 },) => {
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Define color palettes that invert based on theme
  const colorPalettes = {
    light: [
      '#000000', // Black
      '#404040', // Dark grey
      '#808080', // Medium grey
      '#B0B0B0', // Light grey
    ],
    dark: [
      '#FFFFFF', // White
      '#C0C0C0', // Light grey
      '#808080', // Medium grey
      '#505050', // Dark grey
    ]
  };

  const currentPalette = colorPalettes[theme];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isVisible) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Calculate grid dimensions
    const cols = Math.floor(width / (squareSize + gridGap));
    const rows = Math.floor(height / (squareSize + gridGap));

    // Create grid state with opacity and color index
    const grid: Array<Array<{ opacity: number; colorIndex: number }>> = [];
    for (let i = 0; i < rows; i++) {
      grid[i] = [];
      for (let j = 0; j < cols; j++) {
        grid[i][j] = {
          opacity: Math.random() * maxOpacity,
          colorIndex: Math.floor(Math.random() * currentPalette.length)
        };
      }
    }

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Update and draw grid
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const cell = grid[i][j];
          
          // Random flicker - much slower
          if (Math.random() < flickerChance) {
            cell.opacity = Math.random() * maxOpacity;
            // Occasionally change color
            if (Math.random() < 0.3) {
              cell.colorIndex = Math.floor(Math.random() * currentPalette.length);
            }
          } else {
            // Gradual fade - slower fade
            cell.opacity *= 0.98;
          }

          // Draw square if opacity is significant
          if (cell.opacity > 0.01) {
            const baseColor = currentPalette[cell.colorIndex];
            const alpha = Math.floor(cell.opacity * 255).toString(16).padStart(2, '0');
            ctx.fillStyle = `${baseColor}${alpha}`;
            ctx.fillRect(
              j * (squareSize + gridGap),
              i * (squareSize + gridGap),
              squareSize,
              squareSize
            );
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, squareSize, gridGap, maxOpacity, flickerChance, width, height, currentPalette]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(className, 'w-full h-full object-cover')}
      style={{
        filter: blur > 0 ? `blur(${blur}px)` : 'none',
      }}
    />
  );
});

FlickeringGrid.displayName = 'FlickeringGrid';
