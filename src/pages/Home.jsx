import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { personalInfo, summary } from '../data/resume';
import PageTransition from '../components/PageTransition';
import GeometricBackground from '../components/GeometricBackground';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const nameVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' },
    },
  };

  return (
    <PageTransition>
      <div className="home-page">
        <GeometricBackground variant="hero" />
        
        <section className="hero-section">
          <div className="hero-content">
            <motion.h1 
              className="hero-title"
              variants={nameVariants}
              initial="hidden"
              animate="visible"
            >
              {personalInfo.name.split('').map((char, index) => (
                <motion.span key={index} variants={letterVariants}>
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.h1>
            
            <motion.h2 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
            >
              {personalInfo.title}
            </motion.h2>

            <motion.p 
              className="hero-tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              {personalInfo.tagline}
            </motion.p>

            <motion.p 
              className="hero-summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
            >
              {summary}
            </motion.p>

            <motion.div 
              className="hero-cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.4 }}
            >
              <Link to="/projects" className="btn btn-primary">View My Work</Link>
              <Link to="/contact" className="btn btn-secondary">Get in Touch</Link>
            </motion.div>
          </div>

          <motion.div 
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 10, 0] }}
            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
            </svg>
          </motion.div>
        </section>

        <section className="highlights-section">
          <motion.div 
            className="highlights-grid"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              to="/experience" 
              className="stat-card stat-card-link"
              aria-label="View Experience: 3 Organizations"
            >
              <span className="stat-number">3</span>
              <span className="stat-label">Organizations</span>
              <span className="stat-action">
                View Experience <span className="stat-arrow">→</span>
              </span>
            </Link>
            <Link 
              to="/experience" 
              className="stat-card stat-card-link"
              aria-label="View Experience: 21+ Months Experience"
            >
              <span className="stat-number">21+</span>
              <span className="stat-label">Months Experience</span>
              <span className="stat-action">
                View Experience <span className="stat-arrow">→</span>
              </span>
            </Link>
            <Link 
              to="/projects" 
              className="stat-card stat-card-link"
              aria-label="View Projects: 2.3M+ Records Analyzed"
            >
              <span className="stat-number">2.3M+</span>
              <span className="stat-label">Records Analyzed</span>
              <span className="stat-action">
                View Projects <span className="stat-arrow">→</span>
              </span>
            </Link>
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Home;
