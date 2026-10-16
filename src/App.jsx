import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ScrollProgress from './components/ScrollProgress';
import CommandPalette from './components/CommandPalette';

// Lazy load pages — each page becomes its own chunk
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Experience = lazy(() => import('./pages/Experience'));
const Projects = lazy(() => import('./pages/Projects'));
const Contact = lazy(() => import('./pages/Contact'));

// Claude-style minimal loading fallback
const PageLoader = () => (
  <div className="page-loader" aria-label="Loading page">
    <div className="claude-loader">
      <span className="claude-loader-spark">✦</span>
      <span className="claude-loader-text">claude-code · initializing...</span>
    </div>
  </div>
);

function App() {
  const location = useLocation();
  const [navScrolled, setNavScrolled] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Navbar scroll shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global Cmd+K or Ctrl+K shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <div className={`app-container ${navScrolled ? 'nav-scrolled' : ''}`}>
      <ScrollProgress />
      <Navbar 
        scrolled={navScrolled} 
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} 
      />
      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/experience" element={<Experience />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />

      {/* Claude Code Command Palette Modal */}
      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />

      {/* Claude Ambient Warm Lighting */}
      <div className="claude-ambient-light claude-ambient-top" />
      <div className="claude-ambient-light claude-ambient-bottom" />
    </div>
  );
}

export default App;
