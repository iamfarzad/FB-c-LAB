import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, MessageSquare, Menu, X, Search, ChevronRight } from 'lucide-react'; 
import { Theme } from '../../types';
import { FBC_BRAND_NAME } from '../../constants';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onToggleChat: () => void; 
  isChatOpen: boolean;      
}

// Clean, Modern Tech Logo Component
const TechFBCLogo: React.FC<{ theme: Theme }> = ({ theme }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Clean color scheme
  const primaryColor = theme === Theme.DARK ? '#f97316' : '#ea580c';
  const textColor = theme === Theme.DARK ? '#ffffff' : '#1f2937';
  const subtleAccent = theme === Theme.DARK ? '#fb923c' : '#f97316';

  return (
    <div 
      className="relative group cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center space-x-3">
        {/* Modern geometric icon */}
        <div className="relative">
          <div 
            className={`w-8 h-8 rounded-lg transition-all duration-300 flex items-center justify-center
              ${isHovered ? 'scale-110 rotate-3' : 'scale-100'}`}
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${subtleAccent})`,
              boxShadow: isHovered 
                ? `0 8px 25px ${primaryColor}40, 0 0 0 1px ${primaryColor}20` 
                : `0 2px 8px ${primaryColor}20`
            }}
          >
            {/* Clean geometric pattern */}
            <div className="relative w-4 h-4">
              <div 
                className="absolute inset-0 border-2 border-white/90 rounded-sm transform rotate-45"
                style={{
                  borderColor: theme === Theme.DARK ? '#ffffff' : '#ffffff',
                }}
              />
              <div 
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  backgroundColor: theme === Theme.DARK ? '#ffffff' : '#ffffff',
                }}
              />
            </div>
          </div>
          
          {/* Subtle glow effect on hover */}
          {isHovered && (
            <div 
              className="absolute inset-0 w-8 h-8 rounded-lg animate-pulse"
              style={{
                background: `radial-gradient(circle, ${primaryColor}30 0%, transparent 70%)`,
                filter: 'blur(4px)',
              }}
            />
          )}
        </div>
        
        {/* Clean typography */}
        <div className="flex flex-col">
          <div 
            className="font-bold text-xl tracking-tight transition-all duration-300"
            style={{ 
              color: textColor,
              transform: isHovered ? 'translateX(2px)' : 'translateX(0)',
            }}
          >
            <span>FB</span>
            <span style={{ color: primaryColor }}>C</span>
          </div>
          
          {/* Subtle tagline */}
          <div 
            className={`text-xs font-medium tracking-wide uppercase transition-all duration-300 overflow-hidden
              ${isHovered ? 'opacity-100 max-h-4' : 'opacity-60 max-h-3'}`}
            style={{ 
              color: subtleAccent,
              fontSize: '9px',
              letterSpacing: '0.05em'
            }}
          >
            Tech Solutions
          </div>
        </div>
      </div>
      
      {/* Clean hover indicator */}
      <div 
        className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent
          transition-all duration-300 rounded-full ${isHovered ? 'w-full opacity-100' : 'w-0 opacity-0'}`}
      />
    </div>
  );
};

// New component for enhanced nav links
const EnhancedNavLink: React.FC<{
  to: string;
  text: string;
  theme: Theme;
  isActive: boolean;
  onClick?: () => void;
}> = ({ to, text, theme, isActive, onClick }) => {
  const navLinkText = theme === Theme.DARK ? 'text-gray-300' : 'text-gray-600';
  const navLinkHoverBg = theme === Theme.DARK ? 'hover:bg-gray-800/60' : 'hover:bg-gray-100/60';
  const activeClasses = isActive ? 
    (theme === Theme.DARK ? 'bg-gray-800/80 text-orange-400' : 'bg-gray-100/80 text-orange-600') : '';

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 whitespace-nowrap
        ${navLinkText} ${navLinkHoverBg} hover:scale-105 backdrop-blur-sm
        group overflow-hidden ${activeClasses}`}
    >
      <span className="relative z-10">{text}</span>
      
      {/* Enhanced hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-orange-400/20 to-orange-500/20 
        opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" 
        style={{
          backgroundSize: '200% 100%',
          animation: 'gradient-shift 3s ease infinite'
        }}
      />
      
      {/* Enhanced underline effect */}
      <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600
        group-hover:w-full group-hover:left-0 transition-all duration-300 rounded-full"
        style={{
          boxShadow: theme === Theme.DARK 
            ? '0 0 8px rgba(249, 115, 22, 0.5)' 
            : '0 0 5px rgba(249, 115, 22, 0.3)'
        }}
      />
      
      {/* Active indicator dot */}
      {isActive && (
        <div className="absolute -right-0.5 -top-0.5 w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"
          style={{
            boxShadow: '0 0 5px rgba(249, 115, 22, 0.8)'
          }}
        />
      )}
    </Link>
  );
};

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onToggleChat, isChatOpen }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();

  const navLinks = [
    { to: '/', text: 'Home' },
    { to: '/services', text: 'Services' },
    { to: '/workshop', text: 'Workshop' },
    { to: '/about', text: 'About' },
    { to: '/contact', text: 'Contact Us' },
  ];

  const accentColor = 'var(--accent-color)'; // Orange
  
  // Enhanced glassmorphism header with scroll effect
  const headerBg = theme === Theme.DARK 
    ? `${isScrolled ? 'bg-black/90' : 'bg-black/80'} backdrop-blur-xl border-b border-gray-800/50` 
    : `${isScrolled ? 'bg-white/90' : 'bg-white/80'} backdrop-blur-xl border-b border-gray-200/50`;
  
  const headerText = theme === Theme.DARK ? 'text-white' : 'text-gray-900';

  // Mobile menu styling with enhanced effects
  const mobileMenuBg = theme === Theme.DARK 
    ? 'bg-black/95 backdrop-blur-xl border-gray-800/50' 
    : 'bg-white/95 backdrop-blur-xl border-gray-200/50';

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Focus search input when opened
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

  return (
    <>
      <header className={`sticky top-0 z-[60] transition-all duration-300 
        ${headerBg} ${headerText} ${isScrolled ? 'py-2' : 'py-4'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Enhanced tech-focused brand logo */}
            <Link to="/" className="flex-shrink-0" onClick={closeMobileMenu}>
              <TechFBCLogo theme={theme} />
            </Link>

            {/* Desktop navigation - NOW VISIBLE ON MOST SCREENS */}
            <nav className="flex flex-grow justify-center items-center space-x-1 lg:space-x-2 max-w-2xl mx-4">
              {navLinks.map(link => (
                <EnhancedNavLink
                  key={link.text}
                  to={link.to}
                  text={link.text}
                  theme={theme}
                  isActive={location.pathname === link.to}
                />
              ))}
            </nav>

            {/* Enhanced action buttons */}
            <div className="flex items-center space-x-2">
              {/* Search button - hidden on small screens */}
              <button
                onClick={toggleSearch}
                className={`hidden md:flex relative p-3 rounded-xl transition-all duration-300 items-center backdrop-blur-sm
                  group hover:scale-110 active:scale-95 border
                  ${theme === Theme.DARK 
                    ? (isSearchOpen 
                      ? 'bg-gray-800 text-orange-400 border-orange-500/50' 
                      : 'text-gray-300 hover:bg-gray-800/60 border-gray-700/50')
                    : (isSearchOpen 
                      ? 'bg-gray-100 text-orange-600 border-orange-500/50' 
                      : 'text-gray-700 hover:bg-gray-100/60 border-gray-200/50')
                  }`}
                title="Search"
                aria-label="Search"
              >
                <Search size={18} className="transition-transform duration-300 group-hover:rotate-12" />
              </button>

              {/* Chat button with enhanced effects */}
              <button
                onClick={onToggleChat}
                className={`relative p-3 rounded-xl transition-all duration-300 flex items-center backdrop-blur-sm
                  group hover:scale-110 active:scale-95
                  ${theme === Theme.DARK 
                    ? (isChatOpen 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                      : 'text-gray-300 hover:bg-gray-800/60 border border-gray-700/50')
                    : (isChatOpen 
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                      : 'text-gray-700 hover:bg-gray-100/60 border border-gray-200/50')
                  }`}
                title={isChatOpen ? "Close AI Assistant Panel" : "Open AI Assistant Panel"}
                aria-label={isChatOpen ? "Close AI Assistant Panel" : "Open AI Assistant Panel"}
                aria-expanded={isChatOpen}
              >
                <MessageSquare size={18} className="transition-transform duration-300 group-hover:rotate-12" />
                {isChatOpen && (
                  <>
                    <div className="absolute inset-0 rounded-xl bg-orange-500 animate-ping opacity-20" />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 opacity-20 animate-pulse" />
                  </>
                )}
              </button>

              {/* Enhanced theme toggle with animation */}
              <button
                onClick={onToggleTheme}
                className={`relative p-3 rounded-xl transition-all duration-300 backdrop-blur-sm
                  group hover:scale-110 active:scale-95 border overflow-hidden
                  ${theme === Theme.DARK 
                    ? 'text-gray-300 hover:bg-gray-800/60 border-gray-700/50' 
                    : 'text-gray-700 hover:bg-gray-100/60 border-gray-200/50'}`}
                title="Toggle Theme"
                aria-label="Toggle Theme"
              >
                <div className="transition-transform duration-500 group-hover:rotate-180">
                  {theme === Theme.DARK ? <Sun size={18} /> : <Moon size={18} />}
                </div>
              </button>

              {/* Enhanced mobile menu button - only shows on very small screens */}
              <button
                onClick={toggleMobileMenu}
                className={`hidden relative p-3 rounded-xl transition-all duration-300 backdrop-blur-sm
                  group hover:scale-110 active:scale-95 border
                  ${theme === Theme.DARK 
                    ? (isMobileMenuOpen 
                      ? 'bg-gray-800 text-orange-400 border-orange-500/50' 
                      : 'text-gray-300 hover:bg-gray-800/60 border-gray-700/50')
                    : (isMobileMenuOpen 
                      ? 'bg-gray-100 text-orange-600 border-orange-500/50' 
                      : 'text-gray-700 hover:bg-gray-100/60 border-gray-200/50')
                  }`}
                title="Toggle Mobile Menu"
                aria-label="Toggle Mobile Menu"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="transition-transform duration-300">
                  {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced search bar */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isSearchOpen ? 'max-h-16 opacity-100 py-3' : 'max-h-0 opacity-0 py-0'
        }`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`flex items-center rounded-lg px-3 py-2 ${
              theme === Theme.DARK ? 'bg-gray-800/80 border border-gray-700/50' : 'bg-gray-100/80 border border-gray-200/50'
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
              <button 
                onClick={toggleSearch}
                className={`ml-2 ${theme === Theme.DARK ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Enhanced accent line with gradient and pulse effect */}
        <div 
          className="h-0.5 relative overflow-hidden"
          style={{ backgroundColor: accentColor }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-300 to-transparent 
            opacity-50 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-transparent to-orange-500 
            opacity-30 animate-gradient-shift" 
            style={{ 
              backgroundSize: '200% 100%',
              animation: 'gradient-shift 3s ease infinite'
            }}
          />
        </div>
      </header>

      {/* Enhanced Mobile Menu with animations - hidden since nav is now always visible */}
      <div 
        ref={mobileMenuRef}
        className={`hidden fixed top-[${isScrolled ? '57px' : '73px'}] left-0 right-0 z-50 transform transition-all duration-300 ease-in-out border-b
          ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
          ${mobileMenuBg}`}
      >
        <nav className="container mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link, index) => (
              <EnhancedNavLink
                key={link.text}
                to={link.to}
                text={link.text}
                theme={theme}
                isActive={location.pathname === link.to}
                onClick={closeMobileMenu}
              />
            ))}
          </div>
        </nav>
      </div>

      {/* Enhanced mobile menu backdrop with blur */}
      {isMobileMenuOpen && (
        <div 
          className="hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeMobileMenu}
        />
      )}

      {/* Add enhanced keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
};
