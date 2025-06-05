"use client";

import { cn } from "../../lib/utils";
import { InteractiveGridPattern } from "../magicui/interactive-grid-pattern";
import { useTheme } from "../../contexts/ThemeContext";

export function BackgroundPattern({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={cn("fixed inset-0 -z-10", className)}>
      <InteractiveGridPattern
        className={cn(
          "h-full w-full",
          isDark 
            ? "opacity-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.8))]"
            : "opacity-80 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,white)]",
          "[&>div]:h-full [&>div]:w-full"
        )}
        size={60}
        cellSize={2}
        interactive
      />
    </div>
  );
}