import { ReactNode, useEffect } from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { AppBackground } from './AppBackground';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}



export default function Layout({ 
  children, 
  title = 'AI Assistant Pro', 
  description = 'Your intelligent assistant for productivity and creativity',
  className = '' 
}: LayoutProps) {
  const { theme } = useTheme();

  useEffect(() => {
    // Update document title and meta tags
    document.title = title;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === Theme.DARK ? '#0a0a0a' : '#f8fafc');
    }
  }, [title, description, theme]);

  return (
    <div className={`relative min-h-screen flex flex-col ${className}`}>
      {/* App Background */}
      <AppBackground />
      
      {/* Skip to main content for better accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md transition-colors duration-200"
      >
        Skip to main content
      </a>
      
      <main 
        id="main-content" 
        className="flex-grow flex flex-col w-full max-w-[100vw] overflow-x-hidden"
      >
        {children}
      </main>
      
      {/* Ensure proper spacing for mobile devices with bottom navigation */}
      <div className="h-16 sm:h-0" />
    </div>
  );
}
