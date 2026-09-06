import React, { useState, useEffect } from 'react';
import { LiquidLogo } from './LiquidLogo';
import { Sparkles, Menu, X, ArrowUpRight, LogIn, User as UserIcon } from 'lucide-react';
import { smoothScrollTo, getStickyHeaderHeight } from '../utils/smoothScroll';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onLaunch: () => void;
  onSignIn?: (mode?: 'signin' | 'signup') => void;
  currentView?: 'home' | 'services' | 'workspace';
  onNavigateView?: (view: 'home' | 'services' | 'workspace', targetSection?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLaunch,
  onSignIn,
  currentView = 'home',
  onNavigateView,
}) => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(currentView === 'services' ? 'services' : 'hero');

  useEffect(() => {
    if (currentView === 'services') {
      setActiveSection('services');
      return;
    }

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      setScrolled(scrollY > 30);

      // 1. Top of page is always Hero
      if (scrollY < 100) {
        setActiveSection('hero');
        return;
      }

      // 2. Near bottom of page highlights Creator/Footer
      const isBottom =
        window.innerHeight + scrollY >= document.documentElement.scrollHeight - 80;
      if (isBottom) {
        setActiveSection('creator');
        return;
      }

      // 3. Dynamic header offset tracking for intermediate sections
      const headerOffset = getStickyHeaderHeight() + 24;
      const sections = ['evolution', 'how-it-works', 'mentor', 'evidence', 'creator'];
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Active when section top reaches near header and section bottom hasn't scrolled past
          if (rect.top <= headerOffset + 40 && rect.bottom > headerOffset) {
            setActiveSection(section);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const navLinks = [
    { label: 'Home', href: '#hero', id: 'hero' },
    { label: 'Services', href: '#services', id: 'services' },
    { label: 'Evolution', href: '#evolution', id: 'evolution' },
    { label: 'How It Works', href: '#how-it-works', id: 'how-it-works' },
    { label: 'AI Mentor', href: '#mentor', id: 'mentor' },
    { label: 'Evidence', href: '#evidence', id: 'evidence' },
    { label: 'Creator', href: '#creator', id: 'creator' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, linkId: string, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (linkId === 'services') {
      if (onNavigateView) {
        onNavigateView('services');
      } else {
        window.location.hash = '#services';
      }
      return;
    }

    // Navigating to Home sections
    if (currentView === 'services') {
      if (onNavigateView) {
        onNavigateView('home', linkId);
      } else {
        window.location.hash = href;
      }
      return;
    }

    smoothScrollTo(href, {
      updateHash: true,
    });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-4 sm:pt-6 transition-all duration-300">
      <nav
        id="main-navigation"
        className={`w-full max-w-6xl transition-all duration-300 rounded-2xl sm:rounded-full px-4 sm:px-6 py-3 flex items-center justify-between ${
          scrolled
            ? 'liquid-glass-surface shadow-2xl shadow-black/50 border-white/10'
            : 'bg-white/[0.02] backdrop-blur-md border border-white/5'
        }`}
      >
        {/* Brand Logo */}
        <a
          href="#hero"
          onClick={(e) => handleLinkClick(e, 'hero', '#hero')}
          className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg"
          id="nav-logo-link"
        >
          <LiquidLogo size="sm" />
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.id, link.href)}
                id={`nav-link-${link.id}`}
                className={`relative px-3.5 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                )}
              </a>
            );
          })}
        </div>

        {/* Primary CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <button
              onClick={onLaunch}
              id="btn-nav-user-profile"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-pill text-xs font-medium text-slate-200 hover:text-white transition-all duration-200 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-white text-[10px]">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="max-w-[100px] truncate hidden sm:inline">{user.displayName || user.email?.split('@')[0]}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </button>
          ) : (
            <button
              onClick={() => onSignIn ? onSignIn('signin') : onLaunch()}
              id="btn-nav-signin"
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button
            onClick={onLaunch}
            id="btn-nav-launch-ideaforge"
            className="group relative inline-flex items-center gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white transition-all duration-300 overflow-hidden cursor-pointer bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span>{user ? 'Workspace' : 'Get Started'}</span>
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="btn-mobile-menu-toggle"
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 border border-white/10"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-menu"
          className="md:hidden fixed inset-x-4 top-20 liquid-glass-surface rounded-2xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.id, link.href)}
                className={`px-4 py-2.5 text-base font-medium rounded-xl transition-colors ${
                  activeSection === link.id
                    ? 'text-white bg-white/15 font-semibold'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            {!user && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onSignIn) onSignIn('signin');
                  else onLaunch();
                }}
                className="w-full py-2.5 rounded-xl font-medium text-slate-300 hover:text-white bg-white/5 border border-white/10 text-center flex items-center justify-center gap-2 text-sm"
              >
                <span>Sign In to Account</span>
              </button>
            )}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLaunch();
              }}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-cyan-500 text-center flex items-center justify-center gap-2"
            >
              <span>{user ? 'Enter Workspace' : 'Launch IdeaForge'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
