import React from 'react';
import { Link } from 'react-router-dom';
import { personalInfo } from '../data/resume';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      {/* Anthropic Hairline Divider with Terracotta Spark */}
      <div className="footer-divider-container">
        <div className="footer-hairline" />
        <div className="footer-spark-center">
          <span className="footer-spark-glyph">✦</span>
        </div>
        <div className="footer-hairline" />
      </div>

      <div className="footer-content">
        <div className="footer-brand-column">
          <div className="footer-title-row">
            <span className="footer-name">{personalInfo.name}</span>
            <span className="footer-role-badge">Robotics @ GreyOrange</span>
          </div>
          <p className="footer-bio">
            Engineering telemetry pipelines, Linux diagnostic tooling, and large-scale data architectures for autonomous robotic systems.
          </p>
          <div className="footer-meta-stamp">
            <span>Terminal style inspired by Anthropic & Claude Code</span>
          </div>
        </div>

        <div className="footer-nav-columns">
          <div className="footer-column">
            <h4 className="footer-heading">Navigation</h4>
            <ul className="footer-list">
              <li><Link to="/">Overview</Link></li>
              <li><Link to="/about">About & Skills</Link></li>
              <li><Link to="/experience">Experience</Link></li>
              <li><Link to="/projects">Case Studies</Link></li>
              <li><Link to="/blog">Blog & Notes</Link></li>
              <li><Link to="/contact">Get in Touch</Link></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Connect</h4>
            <ul className="footer-list">
              <li>
                <a href={`https://github.com/${personalInfo.github}`} target="_blank" rel="noopener noreferrer">
                  GitHub ↗
                </a>
              </li>
              <li>
                <a href={`https://linkedin.com/in/${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer">
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <a href={`mailto:${personalInfo.email}`}>
                  {personalInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-bottom-container">
          <span className="footer-copyright">
            &copy; {currentYear} Gaurav Roy. All rights reserved.
          </span>
          <span className="footer-sys-info">
            Designed with Claude Code & Anthropic Design System
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
