import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load pages — each page becomes its own chunk
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Experience = lazy(() => import('./pages/Experience'));
const Projects = lazy(() => import('./pages/Projects'));
const Contact = lazy(() => import('./pages/Contact'));

// Minimal loading fallback
const PageLoader = () => (
  <div className="page-loader">
    <div className="loader-dots">
      <span style={{ background: '#4285F4' }}></span>
      <span style={{ background: '#EA4335' }}></span>
      <span style={{ background: '#FBBC04' }}></span>
      <span style={{ background: '#34A853' }}></span>
    </div>
  </div>
);

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="app-container">
      <Navbar />
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

      {/* Decorative Google Geometric Elements */}
      <div className="geo-element geo-circle-blue"></div>
      <div className="geo-element geo-dot-red"></div>
      <div className="geo-element geo-triangle-yellow"></div>
      <div className="geo-element geo-square-green"></div>
    </div>
  );
}

export default App;
