import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from './ThemeProvider';
import { personalInfo } from '../data/resume';

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const actions = [
    {
      category: 'Navigation',
      items: [
        { id: 'nav-home', label: 'Go to Overview', path: '/', icon: '✦', hint: 'Overview' },
        { id: 'nav-about', label: 'Go to About & Systems', path: '/about', icon: '✦', hint: 'Profile' },
        { id: 'nav-experience', label: 'Go to Professional Experience', path: '/experience', icon: '✦', hint: 'Timeline' },
        { id: 'nav-projects', label: 'Go to Case Studies & Projects', path: '/projects', icon: '✦', hint: 'Case Studies' },
        { id: 'nav-contact', label: 'Go to Direct Contact', path: '/contact', icon: '✦', hint: 'Dispatch' },
      ],
    },
    {
      category: 'Preferences',
      items: [
        {
          id: 'action-theme',
          label: `Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`,
          action: () => toggleTheme(),
          icon: theme === 'light' ? '🌙' : '☀️',
          hint: 'Theme',
        },
      ],
    },
    {
      category: 'Quick Actions',
      items: [
        {
          id: 'action-email',
          label: `Copy Email (${personalInfo.email})`,
          action: () => {
            navigator.clipboard?.writeText(personalInfo.email);
            setCopyFeedback('Email copied to clipboard!');
            setTimeout(() => setCopyFeedback(null), 2000);
          },
          icon: '✉️',
          hint: 'Clipboard',
        },
        {
          id: 'action-github',
          label: 'Open GitHub Profile',
          action: () => window.open(`https://github.com/${personalInfo.github}`, '_blank'),
          icon: '↗',
          hint: 'External',
        },
        {
          id: 'action-linkedin',
          label: 'Open LinkedIn Profile',
          action: () => window.open(`https://linkedin.com/in/${personalInfo.linkedin}`, '_blank'),
          icon: '↗',
          hint: 'External',
        },
      ],
    },
  ];

  // Flatten and filter items based on search query
  const filteredItems = actions.flatMap((group) =>
    group.items.filter((item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.hint.toLowerCase().includes(query.toLowerCase())
    )
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setCopyFeedback(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation inside the palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          executeItem(selected);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredItems]);

  const executeItem = (item) => {
    if (item.path) {
      navigate(item.path);
      onClose();
    } else if (item.action) {
      item.action();
      if (!item.id.includes('email')) {
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="cmd-backdrop" onClick={onClose} role="presentation">
          <motion.div
            className="cmd-palette"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Claude Code Command Palette"
          >
            <div className="cmd-input-row">
              <span className="cmd-spark">✦</span>
              <input
                ref={inputRef}
                type="text"
                className="cmd-input"
                placeholder="Type a command or jump to page..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="cmd-kbd-badge">ESC to close</span>
            </div>

            {copyFeedback && (
              <div className="cmd-feedback-bar">
                <span>✓ {copyFeedback}</span>
              </div>
            )}

            <div className="cmd-results">
              {filteredItems.length === 0 ? (
                <div className="cmd-empty">
                  <span>No matching commands found for "{query}"</span>
                </div>
              ) : (
                filteredItems.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`cmd-item ${idx === selectedIndex ? 'selected' : ''}`}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <span className="cmd-item-icon">{item.icon}</span>
                    <span className="cmd-item-label">{item.label}</span>
                    <span className="cmd-item-hint">{item.hint}</span>
                  </button>
                ))
              )}
            </div>

            <div className="cmd-footer">
              <span className="cmd-footer-hint">
                <span>↑↓ Navigate</span>
                <span className="cmd-dot">·</span>
                <span>↵ Select</span>
                <span className="cmd-dot">·</span>
                <span>ESC Close</span>
              </span>
              <span className="cmd-footer-brand">Claude Code Launcher</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
