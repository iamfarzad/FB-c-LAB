"use client";

import { cn } from "../../lib/utils";
import { InteractiveGridPattern } from "../magicui/interactive-grid-pattern";
import { useTheme } from "../../contexts/ThemeContext";

export function BackgroundPattern({ className }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute inset-0 h-[200%] w-full -translate-y-1/4">
        <InteractiveGridPattern
          className={cn(
            "h-full w-full skew-y-12",
            isDark 
              ? "opacity-45 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]"
              : "opacity-45 [mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
            isDark ? "text-white/10" : "text-black/10",
            "[&>div]:h-full [&>div]:w-full"
          )}
          size={60}
          cellSize={2}
          interactive
        />
      </div>
    </div>
  );
}