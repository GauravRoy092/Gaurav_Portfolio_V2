import React from 'react';
import { personalInfo } from '../data/resume';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-accent">
        <div className="accent-line blue"></div>
        <div className="accent-line red"></div>
        <div className="accent-line yellow"></div>
        <div className="accent-line green"></div>
      </div>
      <div className="footer-content">
        <p className="footer-name">Gaurav Roy</p>
        <div className="footer-links">
          <a href={`https://github.com/${personalInfo.github}`} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={`https://linkedin.com/in/${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href={`mailto:${personalInfo.email}`}>Email</a>
        </div>
        <p className="footer-copyright">
          &copy; {currentYear} Gaurav Roy. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
