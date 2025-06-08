import { useTheme, Theme } from '../contexts/ThemeContext'
import { InteractiveGridPattern } from './magicui/interactive-grid-pattern'
import { cn } from '../lib/utils'

export function AppBackground() {
  const { resolvedTheme } = useTheme()

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div className={`absolute inset-0 ${
        resolvedTheme === Theme.DARK 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
      }`} />
      
      {/* Interactive Grid Pattern - exact match to demo */}
      <InteractiveGridPattern
        className={cn(
          "[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />
      
      {/* Animated geometric patterns */}
      <div className="absolute inset-0">
        {/* Large circle - top right */}
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 ${
          resolvedTheme === Theme.DARK ? 'bg-orange-500/10' : 'bg-orange-500/5'
        } animate-pulse`} />
        
        {/* Medium circle - bottom left */}
        <div className={`absolute -bottom-32 -left-32 w-64 h-64 rounded-full opacity-15 ${
          resolvedTheme === Theme.DARK ? 'bg-black/10' : 'bg-blue-500/5'
        } animate-bounce-gentle`} />
        
        {/* Small floating elements */}
        <div className={`absolute top-1/4 left-1/4 w-4 h-4 rounded-full ${
          resolvedTheme === Theme.DARK ? 'bg-orange-400/20' : 'bg-orange-400/10'
        } animate-float`} style={{ animationDelay: '0s' }} />
        
        <div className={`absolute top-1/3 right-1/3 w-3 h-3 rounded-full ${
          resolvedTheme === Theme.DARK ? 'bg-black/20' : 'bg-blue-400/10'
        } animate-float`} style={{ animationDelay: '2s' }} />
        
        <div className={`absolute bottom-1/4 right-1/4 w-2 h-2 rounded-full ${
          resolvedTheme === Theme.DARK ? 'bg-purple-400/20' : 'bg-purple-400/10'
        } animate-float`} style={{ animationDelay: '4s' }} />
      </div>
      
      {/* Subtle noise texture */}
      <div className={`absolute inset-0 opacity-[0.015] ${
        resolvedTheme === Theme.DARK ? 'bg-white' : 'bg-black'
      }`} style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />
    </div>
  );
} 