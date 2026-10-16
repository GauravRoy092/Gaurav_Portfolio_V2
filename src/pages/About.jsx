import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { summary, skills, education, certifications, personalInfo } from '../data/resume';
import PageTransition from '../components/PageTransition';
import GeometricBackground from '../components/GeometricBackground';
import SectionHeader from '../components/SectionHeader';
import SkillTag from '../components/SkillTag';

const categoryLabels = {
  engineering: 'Robotics, Linux & Systems',
  analytics: 'Analytics & Quantitative Tools',
  core: 'Systems Thinking & Practices',
};

const categoryDescriptions = {
  engineering: 'Kernel diagnostics, robotic fleet telemetry, and automated data pipeline infrastructure.',
  analytics: 'Exploratory data analysis, SQL aggregations, Python data modeling, and executive BI dashboards.',
  core: 'Cross-functional engineering pods, reliability standards, and root-cause diagnostic workflows.',
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
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  };

  return (
    <PageTransition>
      <div className="about-page">
        <GeometricBackground variant="about" />
        <div className="page-container">
          <SectionHeader 
            eyebrow="PROFILE & CAPABILITIES"
            title="Systems Engineering & Empirical Analytics" 
            subtitle="Bridging real-world robotics hardware, Linux diagnostic telemetry, and data intelligence." 
          />
          
          {/* Editorial Bio Card */}
          <motion.div 
            className="about-editorial-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bio-lead-block">
              <span className="bio-quote-spark">✦</span>
              <p className="about-summary-lead">
                {summary}
              </p>
            </div>

            <div className="bio-quick-facts">
              <div className="quick-fact-item">
                <span className="fact-label">CURRENT ROLE</span>
                <span className="fact-value">Robotics Engineer @ GreyOrange</span>
              </div>
              <div className="quick-fact-item">
                <span className="fact-label">CORE DOMAINS</span>
                <span className="fact-value">Fleet Telemetry · Linux · Data Pipelines</span>
              </div>
              <div className="quick-fact-item">
                <span className="fact-label">BASE</span>
                <span className="fact-value">{personalInfo.location}</span>
              </div>
              <div className="quick-fact-item">
                <span className="fact-label">CREDENTIAL</span>
                <span className="fact-value">Google Data Analytics Certified</span>
              </div>
            </div>
          </motion.div>

          {/* Technical Skills & Capabilities */}
          <div className="skills-section">
            <div className="section-eyebrow">
              <span className="eyebrow-spark">✦</span>
              <span className="eyebrow-text">TECHNICAL CAPABILITIES</span>
            </div>
            <h3 className="skills-heading">Engineering & Analytical Toolchain</h3>
            <p className="skills-subtext">
              Categorized toolsets utilized across autonomous fleet deployments and large-scale data investigations.
            </p>

            <div className="skills-grid">
              {Object.entries(skills).map(([category, skillList], catIdx) => (
                <motion.div 
                  key={category} 
                  className="skill-category"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-40px" }}
                  variants={containerVariants}
                >
                  <div className="category-header">
                    <span className="category-index">0{catIdx + 1}</span>
                    <div>
                      <h4 className="category-title">{categoryLabels[category]}</h4>
                      <p className="category-desc">{categoryDescriptions[category]}</p>
                    </div>
                  </div>
                  <div className="tags-container">
                    {skillList.map((skill, index) => (
                      <motion.div key={index} variants={itemVariants}>
                        <SkillTag label={skill} variant={category === 'engineering' ? 'terracotta' : 'default'} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Education & Credentials */}
          <div className="credentials-split-grid">
            <div className="education-section">
              <div className="section-eyebrow">
                <span className="eyebrow-spark">✦</span>
                <span className="eyebrow-text">ACADEMIC FOUNDATION</span>
              </div>
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
                    <h4 className="edu-degree">{education.degree} in {education.field}</h4>
                    <p className="edu-institution">{education.institution}</p>
                  </div>
                  <span className="edu-duration">{education.duration}</span>
                </div>
                <div className="edu-body">
                  <div className="edu-badge-row">
                    <span className="edu-cgpa-badge">CGPA: {education.cgpa} / 10.0</span>
                    <span className="edu-specialization">Hardware & Embedded Systems Focus</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <div className="certifications-section">
              <div className="section-eyebrow">
                <span className="eyebrow-spark">✦</span>
                <span className="eyebrow-text">VERIFIED CERTIFICATIONS</span>
              </div>
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
                  <div className="cert-badge">
                    <span className="cert-spark">✦</span>
                  </div>
                  <div className="cert-info">
                    <h4 className="cert-title">{cert.title}</h4>
                    <p className="cert-issuer">Issued by {cert.issuer} · {cert.date}</p>
                    <span className="cert-domain">Data Cleaning · SQL · R & Python · Visualization</span>
                  </div>
                  <a 
                    href={cert.credentialUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary btn-sm cert-btn"
                  >
                    <span>Verify Credential</span>
                    <span>↗</span>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default About;
