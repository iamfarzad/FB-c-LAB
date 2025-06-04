import React, { ReactNode } from 'react';
import { useTheme, Theme } from '../contexts/ThemeContext';
import { GeometricAccent } from './ui/GeometricAccent';
import Head from 'next/head';

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

  return (
    <div className={`relative min-h-screen flex flex-col ${className}`}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="theme-color" content={theme === Theme.DARK ? '#000000' : '#ffffff'} />
      </Head>

      {/* Responsive background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="hidden sm:block">
          <GeometricAccent 
            theme={theme} 
            position="top-right" 
            size={500}
            opacity={0.12}
          />
        </div>
        
        <div className="hidden sm:block">
          <GeometricAccent 
            theme={theme} 
            position="bottom-left" 
            size={400}
            opacity={0.08}
          />
        </div>
      </div>
      
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
