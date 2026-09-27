import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { summary, skills, education, certifications } from '../data/resume';
import PageTransition from '../components/PageTransition';
import GeometricBackground from '../components/GeometricBackground';
import SectionHeader from '../components/SectionHeader';
import SkillTag from '../components/SkillTag';

const categoryLabels = {
  engineering: 'Engineering & Systems',
  analytics: 'Analytics & Tools',
  core: 'Core Competencies',
};

const categoryColors = {
  engineering: '#4285F4',
  analytics: '#EA4335',
  core: '#34A853',
};

const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <PageTransition>
      <div className="about-page">
        <GeometricBackground variant="about" />
        <div className="page-container">
          <SectionHeader title="About Me" subtitle="A bit about my background and what I bring to the table" />
          
          <motion.div 
            className="about-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="about-summary-text">{summary}</p>
          </motion.div>

          <div className="skills-section">
            <h3 className="skills-heading">Skills</h3>
            <div className="skills-grid">
              {Object.entries(skills).map(([category, skillList]) => (
                <motion.div 
                  key={category} 
                  className="skill-category"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  variants={containerVariants}
                >
                  <h4 className="category-title">
                    <span className="category-dot" style={{ backgroundColor: categoryColors[category] }}></span>
                    {categoryLabels[category]}
                  </h4>
                  <div className="tags-container">
                    {skillList.map((skill, index) => (
                      <motion.div key={index} variants={itemVariants}>
                        <SkillTag label={skill} color={categoryColors[category]} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="education-section">
            <h3 className="skills-heading">Education</h3>
            <motion.div 
              className="education-card"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="edu-header">
                <div>
                  <h4 className="edu-degree">{education.degree} — {education.field}</h4>
                  <p className="edu-institution">{education.institution}</p>
                </div>
                <span className="edu-duration">{education.duration}</span>
              </div>
              <div className="edu-body">
                <span className="edu-cgpa">CGPA: {education.cgpa}</span>
              </div>
            </motion.div>
          </div>

          <div className="certifications-section">
            <h3 className="skills-heading">Certifications</h3>
            {certifications.map((cert, index) => (
              <motion.div 
                key={index}
                className="certification-card"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="cert-badge" style={{ backgroundColor: cert.color }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div className="cert-info">
                  <h4 className="cert-title">{cert.title}</h4>
                  <p className="cert-issuer">Issued by {cert.issuer} · {cert.date}</p>
                </div>
                <a 
                  href={cert.credentialUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary btn-sm"
                >
                  View Credential →
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default About;
