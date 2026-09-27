import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { personalInfo } from '../data/resume';
import PageTransition from '../components/PageTransition';
import GeometricBackground from '../components/GeometricBackground';
import SectionHeader from '../components/SectionHeader';

const Contact = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [formStatus, setFormStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.append('access_key', 'd169629b-8f99-44c5-8738-4647811077b4');
    formData.set('subject', 'New portfolio contact message');
    formData.set('from_name', 'Gaurav Roy Portfolio');

    setIsSubmitting(true);
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('Form submission failed');
      }

      form.reset();
      setFormStatus('success');
      setTimeout(() => setFormStatus(null), 5000);
    } catch {
      setFormStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="contact-page">
        <GeometricBackground variant="contact" />
        <div className="page-container">
          <SectionHeader title="Get in Touch" subtitle="I'd love to hear from you" />
          
          <div className="contact-layout">
            <motion.div 
              className="contact-info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <h3>Contact Information</h3>
              <p>Feel free to reach out for opportunities or just to say hi!</p>
              
              <div className="info-items">
                <div className="info-item">
                  <span className="info-icon">📧</span>
                  <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
                </div>
                <div className="info-item">
                  <span className="info-icon">📱</span>
                  <a href={`tel:${personalInfo.phone}`}>{personalInfo.phone}</a>
                </div>
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <span>{personalInfo.location}</span>
                </div>
              </div>

              <div className="social-links">
                <a href={`https://linkedin.com/in/${personalInfo.linkedin}`} target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
                <a href={`https://github.com/${personalInfo.github}`} target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                  GitHub
                </a>
              </div>
            </motion.div>

            <motion.div 
              className="contact-form-container"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
            >
              <form className="contact-form" onSubmit={handleSubmit}>
                <input type="checkbox" name="botcheck" style={{ display: 'none' }} tabIndex="-1" autoComplete="off" aria-hidden="true" />
                <div className="form-group">
                  <input type="text" id="name" name="name" required placeholder=" " />
                  <label htmlFor="name">Name</label>
                </div>
                
                <div className="form-group">
                  <input type="email" id="email" name="email" required placeholder=" " />
                  <label htmlFor="email">Email</label>
                </div>
                
                <div className="form-group">
                  <textarea id="message" name="message" required rows="4" placeholder=" "></textarea>
                  <label htmlFor="message">Message</label>
                </div>
                
                <button type="submit" className="btn btn-primary submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending…' : 'Send Message'}
                </button>
                
                {formStatus === 'success' && (
                  <motion.div 
                    className="form-success"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    ✅ Message sent successfully! I'll get back to you soon.
                  </motion.div>
                )}
                {formStatus === 'error' && (
                  <motion.div className="form-success" role="alert" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    Sorry, your message could not be sent. Please try again or email me directly.
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Contact;
