import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { experience } from '../data/resume';
import PageTransition from '../components/PageTransition';
import GeometricBackground from '../components/GeometricBackground';
import SectionHeader from '../components/SectionHeader';

const ExperienceCard = ({ exp, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div 
      ref={ref}
      className="claude-timeline-item"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: 'easeOut' }}
    >
      <div className="claude-timeline-marker">
        <div className="marker-dot">
          <span className="marker-spark">✦</span>
        </div>
      </div>

      <div className="experience-card">
        <div className="exp-header">
          <div>
            <div className="exp-company-row">
              <h3 className="exp-company">{exp.company}</h3>
              <span className="exp-role-title">— {exp.role}</span>
            </div>
            <div className="exp-meta-row">
              <span className="exp-location">📍 {exp.location}</span>
              <span className="exp-meta-separator">·</span>
              <span className="exp-duration">{exp.duration}</span>
            </div>
          </div>

          <div className="exp-badges">
            <span className="exp-period-badge">{exp.period}</span>
            <span className="exp-type-badge">{exp.type}</span>
          </div>
        </div>

        <ul className="exp-bullets">
          {exp.bullets.map((bullet, idx) => (
            <li key={idx}>
              <span className="bullet-chevron">›</span>
              <span className="bullet-text">{bullet}</span>
            </li>
          ))}
        </ul>

        {exp.tags && (
          <div className="exp-tags">
            <span className="exp-tags-label">Systems:</span>
            {exp.tags.map((tag, idx) => (
              <span key={idx} className="exp-tag">{tag}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const Experience = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="experience-page">
        <GeometricBackground variant="experience" />
        <div className="page-container">
          <SectionHeader 
            eyebrow="PROFESSIONAL RECORD"
            title="Engineering & Operational Trajectory" 
            subtitle="Track record in robotics telemetry, data pipeline architecture, and enterprise quality assurance." 
          />
          
          <div className="claude-timeline-container">
            <div className="claude-timeline-track" />
            {experience.map((exp, index) => (
              <ExperienceCard key={index} exp={exp} index={index} />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Experience;
