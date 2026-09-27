import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { projects } from '../data/resume';
import PageTransition from '../components/PageTransition';
import GeometricBackground from '../components/GeometricBackground';
import SectionHeader from '../components/SectionHeader';
import SkillTag from '../components/SkillTag';

const Projects = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' }
    }
  };

  return (
    <PageTransition>
      <div className="projects-page">
        <GeometricBackground variant="projects" />
        <div className="page-container">
          <SectionHeader title="Projects" subtitle="Some of my notable work" />
          
          <motion.div 
            className="projects-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {projects.map((project, index) => (
              <motion.div key={index} className="project-card" variants={cardVariants}>
                <div className="project-header">
                  <h3 className="project-title">{project.title}</h3>
                  <span className="project-date">{project.date}</span>
                </div>
                
                <div className="project-tech">
                  {project.tech.map((tech, idx) => (
                    <SkillTag key={idx} label={tech} />
                  ))}
                </div>

                <ul className="project-details">
                  {project.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>

                {project.hasDemo && (
                  <div className="project-actions">
                    <button className="btn btn-secondary btn-sm">
                      View Demo →
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Projects;
