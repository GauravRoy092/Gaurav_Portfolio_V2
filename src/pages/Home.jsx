import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { personalInfo, summary } from '../data/resume';
import PageTransition from '../components/PageTransition';
import GeometricBackground from '../components/GeometricBackground';
import ClaudeCodeTerminal from '../components/ClaudeCodeTerminal';

const Home = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="home-page">
        <GeometricBackground variant="hero" />
        
        {/* Editorial Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <motion.div 
              className="hero-badge"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="hero-badge-spark">✦</span>
              <span className="hero-badge-text">Robotics Engineer & Systems Analytics · GreyOrange</span>
            </motion.div>

            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
            >
              Engineering resilient robotics telemetry and scalable data systems.
            </motion.h1>
            
            <motion.p 
              className="hero-lead"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
            >
              I am <span className="hero-highlight">{personalInfo.name}</span>, a robotics engineer optimizing autonomous bot fleets through Linux telemetry pipelines, log analytics, and empirical data modeling.
            </motion.p>

            <motion.div 
              className="hero-meta-strip"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              <span className="meta-pill">📍 {personalInfo.location}</span>
              <span className="meta-pill">⚡ GreyOrange AMR Fleet</span>
              <span className="meta-pill">🎓 Google Data Analytics Certified</span>
            </motion.div>

            <motion.div 
              className="hero-cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
            >
              <Link to="/projects" className="btn btn-primary">
                <span>Explore Case Studies</span>
                <span className="btn-arrow">→</span>
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                <span>Initiate Contact</span>
              </Link>
              <a 
                href={`https://github.com/${personalInfo.github}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-ghost"
              >
                <span>GitHub ↗</span>
              </a>
            </motion.div>
          </div>

          {/* Interactive Claude Code CLI Terminal Showcase */}
          <motion.div 
            className="hero-terminal-wrapper"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: 'easeOut' }}
          >
            <div className="terminal-caption">
              <span className="terminal-caption-spark">✦</span>
              <span>Interactive Claude Code Session · Click tabs below to run diagnostics</span>
            </div>
            <ClaudeCodeTerminal />
          </motion.div>
        </section>

        {/* Quantitative Metrics Section */}
        <section className="highlights-section">
          <div className="section-eyebrow align-center">
            <span className="eyebrow-spark">✦</span>
            <span className="eyebrow-text">MEASURABLE IMPACT</span>
          </div>

          <motion.div 
            className="highlights-grid"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <Link 
              to="/experience" 
              className="stat-card stat-card-link"
              aria-label="View Experience: 3 Organizations"
            >
              <div className="stat-card-header">
                <span className="stat-index">01</span>
                <span className="stat-arrow-icon">↗</span>
              </div>
              <span className="stat-number">3</span>
              <span className="stat-label">Organizations</span>
              <p className="stat-desc">
                Engineering at GreyOrange, DotPe, and Engineers India Ltd (EIL).
              </p>
              <span className="stat-action">
                Review work history <span className="stat-arrow">→</span>
              </span>
            </Link>

            <Link 
              to="/experience" 
              className="stat-card stat-card-link"
              aria-label="View Experience: 21+ Months Experience"
            >
              <div className="stat-card-header">
                <span className="stat-index">02</span>
                <span className="stat-arrow-icon">↗</span>
              </div>
              <span className="stat-number">21+</span>
              <span className="stat-label">Months Experience</span>
              <p className="stat-desc">
                Hands-on telemetry analysis, operational pipelines, and systems support.
              </p>
              <span className="stat-action">
                Inspect timeline <span className="stat-arrow">→</span>
              </span>
            </Link>

            <Link 
              to="/projects" 
              className="stat-card stat-card-link"
              aria-label="View Projects: 2.3M+ Records Analyzed"
            >
              <div className="stat-card-header">
                <span className="stat-index">03</span>
                <span className="stat-arrow-icon">↗</span>
              </div>
              <span className="stat-number">2.3M+</span>
              <span className="stat-label">Records Analyzed</span>
              <p className="stat-desc">
                Large-scale credit risk modeling and inventory diagnostics with SQL & Python.
              </p>
              <span className="stat-action">
                View project architecture <span className="stat-arrow">→</span>
              </span>
            </Link>
          </motion.div>
        </section>

        {/* Engineering Philosophy / Principles Section */}
        <section className="philosophy-section">
          <div className="philosophy-container">
            <div className="section-eyebrow">
              <span className="eyebrow-spark">✦</span>
              <span className="eyebrow-text">CORE PRINCIPLES</span>
            </div>
            <h2 className="philosophy-title">
              How I approach engineering and analytical systems
            </h2>

            <div className="philosophy-grid">
              <div className="philosophy-card">
                <span className="philosophy-num">01</span>
                <h3 className="philosophy-card-title">Telemetry as Ground Truth</h3>
                <p className="philosophy-card-body">
                  Whether monitoring an autonomous robotic fleet or validating enterprise pipelines, raw kernel and activity logs reveal failure modes long before dashboards do.
                </p>
              </div>

              <div className="philosophy-card">
                <span className="philosophy-num">02</span>
                <h3 className="philosophy-card-title">Statistical Rigor over Intuition</h3>
                <p className="philosophy-card-body">
                  Intuition often predicts volume aligns with risk. In my 2.26M+ record study, empirical modeling proved high-income cohorts default similarly under debt leverage.
                </p>
              </div>

              <div className="philosophy-card">
                <span className="philosophy-num">03</span>
                <h3 className="philosophy-card-title">Cross-Functional Integration</h3>
                <p className="philosophy-card-body">
                  Data only creates value when integrated into production backend systems. I bridge the gap between analytics, systems tooling, and operational teams.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};

export default Home;
