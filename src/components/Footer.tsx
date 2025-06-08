import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import { Theme } from '../../types';
import { FBC_BRAND_NAME } from '../../constants';
import { Container } from './layout/Container';

interface FooterProps {
  theme?: Theme;
}

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Integrations', href: '/integrations' },
      { name: 'Updates', href: '/updates' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'Tutorials', href: '/tutorials' },
      { name: 'API Reference', href: '/api' },
      { name: 'Community', href: '/community' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Security', href: '/security' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  },
];

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com', icon: Github },
  { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { name: 'Discord', href: 'https://discord.com', icon: MessageCircle },
];

export function Footer({ theme = Theme.DARK }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const textMuted = theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600';
  const textHover = theme === Theme.DARK ? 'hover:text-white' : 'hover:text-gray-900';

  return (
    <footer className={`relative border-t backdrop-blur-xl transition-all duration-300 
      ${theme === Theme.DARK 
        ? 'bg-black/80 border-gray-800 text-white' 
        : 'bg-white/80 border-gray-200 text-gray-900'
      }`}>
      {/* Background pattern */}
      <div className="absolute inset-0 -z-10">
        <div className={`absolute inset-0 opacity-[0.01] ${
          theme === Theme.DARK ? 'bg-white' : 'bg-black'
        }`} style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      <Container>
        {/* Main Footer Content */}
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand and tagline */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="inline-block">
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  {FBC_BRAND_NAME}
                </span>
              </Link>
              <p className={`text-sm leading-relaxed ${textMuted}`}>
                Empowering developers with AI tools to build the future. Simple, powerful, and open source.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-2 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-lg transition-all duration-200 group hover:scale-110 ${textMuted} ${textHover}`}
                    aria-label={`${social.name} (opens in new tab)`}
                  >
                    <social.icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-4">
              {footerLinks.map((section) => (
                <div key={section.title}>
                  <h3 className={`text-sm font-semibold mb-4 ${theme === Theme.DARK ? 'text-white' : 'text-gray-900'}`}>
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          to={link.href}
                          className={`text-sm ${textMuted} ${textHover} transition-colors inline-block`}
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div 
            className={`my-8 h-px w-full ${theme === Theme.DARK ? 'bg-gray-800' : 'bg-gray-200'}`}
            aria-hidden="true"
          />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`text-sm text-center md:text-left ${textMuted}`}>
              &copy; {currentYear} {FBC_BRAND_NAME}. All rights reserved.
            </p>
            
            <div className="flex items-center space-x-6">
              <Link 
                to="/privacy" 
                className={`text-sm ${textMuted} ${textHover} transition-colors`}
              >
                Privacy Policy
              </Link>
              <Link 
                to="/terms" 
                className={`text-sm ${textMuted} ${textHover} transition-colors`}
              >
                Terms of Service
              </Link>
              <Link 
                to="/cookies" 
                className={`text-sm ${textMuted} ${textHover} transition-colors`}
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
