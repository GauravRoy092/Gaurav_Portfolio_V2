import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';

const Navbar = ({ scrolled, onOpenCommandPalette }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { path: '/', label: 'Overview' },
    { path: '/about', label: 'About' },
    { path: '/experience', label: 'Experience' },
    { path: '/projects', label: 'Case Studies' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} role="navigation" aria-label="Main Navigation">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-logo" aria-label="Gaurav Roy — Home">
          <span className="logo-monogram">GR</span>
          <span className="logo-spark">✦</span>
          <span className="logo-subtext">systems</span>
        </NavLink>
        
        <div className="desktop-menu">
          <div className="nav-links-cluster">
            {navLinks.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path} 
                className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="navbar-status-pill" title="Current status">
            <span className="status-dot-pulse" />
            <span className="status-pill-text">Robotics @ GreyOrange</span>
          </div>

          {/* Claude Code Command Palette trigger */}
          <button
            type="button"
            className="cmd-launcher-btn"
            onClick={onOpenCommandPalette}
            title="Press ⌘K or Ctrl+K to open launcher"
            aria-label="Open command palette"
          >
            <span className="cmd-spark-icon">✦</span>
            <span className="cmd-kbd-tag">
              <kbd className="cmd-kbd-key">⌘</kbd>
              <kbd className="cmd-kbd-key">K</kbd>
            </span>
          </button>

          {/* Dark mode toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="theme-icon">
              {theme === 'light' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </span>
          </button>
        </div>

        <div className="mobile-menu-actions">
          {/* Mobile Command Palette trigger */}
          <button
            type="button"
            className="cmd-launcher-btn mobile-cmd-btn"
            onClick={onOpenCommandPalette}
            aria-label="Open command palette"
          >
            <span className="cmd-spark-icon">✦</span>
          </button>

          {/* Mobile dark mode toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <span className="theme-icon">
              {theme === 'light' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </span>
          </button>

          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="mobile-status-row">
              <span className="status-dot-pulse" />
              <span>Gaurav Roy · Robotics Telemetry & Systems</span>
            </div>
            {navLinks.map((link) => (
              <NavLink 
                key={link.path} 
                to={link.path} 
                className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>{link.label}</span>
                <span className="mobile-nav-arrow">→</span>
              </NavLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
