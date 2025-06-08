import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { Theme } from '../contexts/ThemeContext';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
  children?: NavigationItem[];
}

// Example of how items are structured, will be passed from a parent component (e.g. Header.tsx or Layout.tsx)
// const navigationItems: NavigationItem[] = [
//   { name: 'Home', href: '/' },
//   { name: 'About', href: '/about' },
//   { name: 'Services', href: '/services' },
//   { name: 'Generative Tools', href: '/GenerativeToolsPage' }, // Conventionally page URLs are lowercase
//   { name: 'Contact', href: '/contact' },
// ];


export interface NavigationProps {
  theme: Theme;
  className?: string;
  items: NavigationItem[];
  onNavigate?: () => void;
}

export function Navigation({
  className = '',
  items, // This will be passed from the parent component (e.g., Header or Layout)
  onNavigate,
}: Omit<NavigationProps, 'theme'>) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    onNavigate?.();
  }, [location, onNavigate]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setOpenSubmenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSubmenu = (name: string) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const isActive = (href: string) => {
    return location.pathname === href || 
           (href !== '/' && location.pathname.startsWith(href));
  };

  const renderNavItem = (item: NavigationItem, isMobile = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isItemActive = isActive(item.href);
    
    const baseClasses = cn(
      'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200',
      isItemActive 
        ? 'text-primary-700 dark:text-primary-100'
        : 'text-gray-700 dark:text-gray-300',
      isMobile ? 'w-full text-left' : ''
    );

    return (
      <div key={item.name} className="relative group">
        {hasChildren ? (
          <>
            <button
              className={cn(baseClasses, 'w-full justify-between')}
              onClick={() => toggleSubmenu(item.name)}
              aria-expanded={openSubmenu === item.name}
              aria-haspopup="true"
            >
              <div className="flex items-center">
                {item.icon && <span className="mr-3">{item.icon}</span>}
                {item.name}
              </div>
              <ChevronDown 
                className={cn(
                  'ml-2 h-4 w-4 transition-transform duration-200',
                  openSubmenu === item.name ? 'transform rotate-180' : ''
                )} 
                aria-hidden="true"
              />
            </button>
            
            {/* Desktop Dropdown */}
            {!isMobile && (
              <div className="absolute left-0 mt-1 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  {item.children?.map((child) => (
                    <Link
                      key={child.name}
                      to={child.href}
                      className={cn(
                        'block px-4 py-2 text-sm text-gray-700 dark:text-gray-300',
                        isActive(child.href) && ''
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mobile Dropdown */}
            {isMobile && (
              <div 
                className={cn(
                  'pl-4 overflow-hidden transition-all duration-200',
                  openSubmenu === item.name ? 'max-h-96' : 'max-h-0'
                )}
              >
                {item.children?.map((child) => (
                  <Link
                    key={child.name}
                    to={child.href}
                    className={cn(
                      'block py-2 pl-6 text-sm rounded-md',
                      isActive(child.href)
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                    )}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <Link
            to={item.href}
            className={baseClasses}
            onClick={() => isMobile && setIsOpen(false)}
          >
            {item.icon && <span className="mr-3">{item.icon}</span>}
            {item.name}
          </Link>
        )}
      </div>
    );
  };

  return (
    <nav className={className} ref={navRef}>
      {/* Mobile menu button */}
      <div className="flex items-center md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Open main menu</span>
          {isOpen ? (
            <X className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="block h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex md:items-center md:space-x-4">
        {items.map((item) => renderNavItem(item))}
      </div>

      {/* Mobile Navigation */}
      <div
        className={cn(
          'md:hidden absolute top-full left-0 right-0 shadow-lg rounded-b-lg overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0',
          'z-40'
        )}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {items.map((item) => renderNavItem(item, true))}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
