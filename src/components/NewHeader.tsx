import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sun, Moon, MessageSquare, Search, X, Menu } from 'lucide-react';
import { cn } from '../lib/utils';
import { Theme, useTheme } from '../contexts/ThemeContext';
import { Navigation } from './Navigation';
import type { NavigationItem } from './Navigation';

interface HeaderProps {
  className?: string;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
}

export function Header({ 
  className = '', 
  onToggleChat,
  isChatOpen = false 
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Navigation items
  const navItems: NavigationItem[] = [
    { name: 'Home', href: '/' },
    { 
      name: 'Services', 
      href: '/services',
      children: [
        { name: 'AI Consulting', href: '/services/ai-consulting' },
        { name: 'Workshops', href: '/services/workshops' },
        { name: 'Custom Solutions', href: '/services/custom-solutions' },
      ]
    },
    { 
      name: 'About', 
      href: '/about',
      children: [
        { name: 'Our Team', href: '/about/team' },
        { name: 'Mission', href: '/about/mission' },
        { name: 'Testimonials', href: '/about/testimonials' },
      ]
    },
    { name: 'Contact', href: '/contact' },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // Focus search input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const toggleTheme = () => {
    setTheme(theme === Theme.DARK ? Theme.LIGHT : Theme.DARK);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchQuery = searchInputRef.current?.value.trim();
    if (searchQuery) {
      // Handle search navigation
      console.log('Searching for:', searchQuery);
      // router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const headerClasses = cn(
    'sticky top-0 z-50 w-full transition-all duration-300',
    isScrolled 
      ? 'bg-background/90 backdrop-blur-md border-b border-border/50 py-2 shadow-sm' 
      : 'bg-background/80 py-4',
    className
  );

  return (
    <>
      <header ref={headerRef} className={headerClasses}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  AI Assistant Pro
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <Navigation 
                items={navItems} 
                className="ml-10 flex items-center space-x-8"
              />
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Search Button - Desktop */}
              <button
                onClick={toggleSearch}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={`Switch to ${theme === Theme.DARK ? 'light' : 'dark'} mode`}
              >
                {theme === Theme.DARK ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* Chat Toggle */}
              {onToggleChat && (
                <button
                  onClick={onToggleChat}
                  className={`p-2 rounded-full transition-colors ${
                    isChatOpen 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
                >
                  <MessageSquare className="h-5 w-5" />
                </button>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={() => {
                  const nav = document.querySelector('.mobile-nav');
                  nav?.classList.toggle('hidden');
                }}
                aria-label="Toggle menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="mobile-nav md:hidden mt-4 pb-4 hidden">
            <Navigation 
              items={navItems} 
              className="flex flex-col space-y-2"
            />
          </div>
        </div>

        {/* Search Overlay */}
        {isSearchOpen && (
          <div className="absolute inset-x-0 top-full bg-background/95 backdrop-blur-sm shadow-lg z-50">
            <div className="container mx-auto px-4 py-4">
              <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="block w-full pl-10 pr-12 py-3 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary focus:border-transparent focus:outline-none"
                    placeholder="Search..."
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

export default Header;
