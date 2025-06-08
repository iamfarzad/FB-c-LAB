import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, MessageSquare, Menu, X, Search, Languages } from 'lucide-react'; 
import { Theme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

const TechFBCLogo: React.FC<{ theme: Theme }> = ({ theme }) => (
  <div className="flex items-center space-x-4">
    {/* Minimalist icon */}
    <div className="relative group">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105">
        <span className="font-semibold text-sm">F</span>
      </div>
      <div className="absolute -inset-1 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
    
    {/* Clean typography */}
    <div className="hidden sm:flex flex-col">
      <div className={`font-medium text-lg leading-none tracking-tight transition-colors duration-300
        ${theme === Theme.DARK ? 'text-white' : 'text-gray-900'}`}>
        F.B/c
      </div>
      <div className={`text-xs font-normal mt-0.5 transition-colors duration-300
        ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-500'}`}>
      </div>
    </div>
  </div>
);

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onToggleChat, isChatOpen }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { targetLanguage, setTargetLanguage } = useLanguage();

  const navLinks = [
    { text: 'Home', to: '/' },
    { text: 'About', to: '/about' },
    { text: 'Services', to: '/services' },
    { text: 'Workshop', to: '/workshop' },
    { text: 'Contact', to: '/contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const handleTranslatePage = async () => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    const newLanguage = targetLanguage === 'en' ? 'no' : 'en';
    setTargetLanguage(newLanguage);
    
    setTimeout(() => {
      setIsTranslating(false);
    }, 1000);
  };

  const headerText = theme === Theme.DARK ? 'text-white' : 'text-black';

  return (
    <>
      <header className={`sticky top-0 z-[60] transition-all duration-300 
        ${headerText} ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Brand Logo */}
            <Link to="/" className="flex-shrink-0" onClick={closeMobileMenu}>
              <TechFBCLogo theme={theme} />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex flex-grow justify-center items-center space-x-1 lg:space-x-2 max-w-2xl mx-4">
              {navLinks.map(link => (
                <Link
                  key={link.text}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 relative
                    ${location.pathname === link.to
                      ? (theme === Theme.DARK 
                        ? 'text-orange-400 border border-orange-500/30 shadow-lg shadow-orange-500/10' 
                        : 'text-orange-600 border border-orange-500/20 shadow-lg shadow-orange-500/10')
                      : (theme === Theme.DARK 
                        ? 'text-gray-300 border border-transparent hover:border-gray-700/50' 
                        : 'text-gray-700 border border-transparent hover:border-gray-200/50')
                    }`}
                  onClick={closeMobileMenu}
                >
                  {link.text}
                  {location.pathname === link.to && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Search button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                className={cn(
                  "hidden md:flex group",
                  isSearchOpen && "text-orange-500"
                )}
                title="Search"
                aria-label="Search"
              >
                <Search size={18} className="transition-transform duration-300 group-hover:rotate-12" />
              </Button>

              {/* Chat button */}
              <Button
                variant={isChatOpen ? "primary" : "ghost"}
                size="icon"
                onClick={onToggleChat}
                className={cn(
                  "relative group",
                  isChatOpen && "shadow-lg shadow-orange-500/25"
                )}
                title={isChatOpen ? "Close AI Assistant Panel" : "Open AI Assistant Panel"}
                aria-label={isChatOpen ? "Close AI Assistant Panel" : "Open AI Assistant Panel"}
                aria-expanded={isChatOpen}
              >
                <MessageSquare size={18} className="transition-transform duration-300 group-hover:rotate-12" />
                {isChatOpen && (
                  <>
                    <div className="absolute inset-0 rounded-xl animate-ping opacity-20" />
                    <div className="absolute inset-0 rounded-xl opacity-20 animate-pulse" />
                  </>
                )}
              </Button>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleTheme}
                className="group overflow-hidden"
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                <div className="transition-transform duration-500 group-hover:rotate-180">
                  {theme === Theme.DARK ? <Sun size={18} /> : <Moon size={18} />}
                </div>
              </Button>

              {/* Translation Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleTranslatePage}
                disabled={isTranslating}
                title={targetLanguage === 'en' ? 'Translate to Norwegian' : 'Switch back to English'}
              >
                <Languages className={cn("w-5 h-5", isTranslating && "animate-pulse")} />
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMobileMenu}
                className="md:hidden"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                <div className="transition-transform duration-300">
                  {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </div>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Search bar */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isSearchOpen ? 'max-h-16 opacity-100 py-3' : 'max-h-0 opacity-0 py-0'
        }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex items-center rounded-lg px-3 py-2 backdrop-blur-md ${
              theme === Theme.DARK 
                ? 'bg-black/20 border border-gray-700/50' 
                : 'bg-white/20 border border-gray-200/50'
            }`}>
              <Search size={18} className={theme === Theme.DARK ? 'text-gray-400' : 'text-gray-500'} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                className={`ml-2 w-full bg-transparent border-none focus:outline-none focus:ring-0 ${
                  theme === Theme.DARK ? 'text-gray-200 placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'
                }`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                className="ml-2 h-6 w-6"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-full w-80 shadow-xl z-[70] transition-transform duration-300 ease-in-out backdrop-blur-xl border-l
          ${theme === Theme.DARK 
            ? 'bg-black/90 border-gray-700' 
            : 'bg-white/90 border-gray-200'
          }
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className={`flex items-center justify-between p-4 border-b
            ${theme === Theme.DARK ? 'border-gray-700' : 'border-gray-200'}`}>
            <TechFBCLogo theme={theme} />
            <Button
              variant="ghost"
              size="icon"
              onClick={closeMobileMenu}
            >
              <X size={20} />
            </Button>
          </div>

          <nav className="p-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.text}
                to={link.to}
                onClick={closeMobileMenu}
                className={`flex items-center py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105
                  ${location.pathname === link.to
                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                    : `${theme === Theme.DARK 
                        ? 'text-gray-300 hover:bg-white/5' 
                        : 'text-gray-700 hover:bg-black/5'
                      } border border-transparent`
                  }`}
              >
                {link.text}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[65]"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
};