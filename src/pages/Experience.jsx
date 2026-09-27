import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { experience } from '../data/resume';
import PageTransition from '../components/PageTransition';
import GeometricBackground from '../components/GeometricBackground';
import SectionHeader from '../components/SectionHeader';

const ExperienceCard = ({ exp, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const isEven = index % 2 === 0;
  const dotColors = ['#4285F4', '#EA4335', '#34A853', '#FBBC04'];

  return (
    <motion.div 
      ref={ref}
      className={`timeline-item ${isEven ? 'left' : 'right'}`}
      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: isEven ? -20 : 20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="timeline-dot" style={{ backgroundColor: dotColors[index % dotColors.length] }}></div>
      <div className="experience-card">
        <div className="exp-header">
          <h3 className="exp-company">{exp.company}</h3>
          <div className="exp-badges">
            <span className="exp-type-badge">{exp.type}</span>
            <span className="exp-period-badge">{exp.period}</span>
          </div>
        </div>
        <p className="exp-role">{exp.role}</p>
        <div className="exp-meta">
          <span className="exp-location">📍 {exp.location}</span>
          <span className="exp-duration">{exp.duration}</span>
        </div>
        <ul className="exp-bullets">
          {exp.bullets.map((bullet, idx) => (
            <li key={idx}>{bullet}</li>
          ))}
        </ul>
        {exp.tags && (
          <div className="exp-tags">
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
          <SectionHeader title="Experience" subtitle="My professional journey so far" />
          
          <div className="timeline-container">
            <div className="timeline-line"></div>
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
