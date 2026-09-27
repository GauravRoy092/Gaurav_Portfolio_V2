import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '../data/resume';
import PageTransition from '../components/PageTransition';
import GeometricBackground from '../components/GeometricBackground';
import SectionHeader from '../components/SectionHeader';
import SkillTag from '../components/SkillTag';

const Projects = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'charts' | 'methodology'

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeModal) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setActiveModal(null);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [activeModal]);

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
          <SectionHeader 
            title="Projects" 
            subtitle="Data engineering, predictive analytics, and business intelligence systems" 
          />
          
          <motion.div 
            className="projects-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {projects.map((project, index) => {
              if (project.featured) {
                return (
                  <motion.div 
                    key={index} 
                    className="project-card featured-project-card" 
                    variants={cardVariants}
                  >
                    <div className="featured-badge-row">
                      <span className="featured-tag">⭐ FEATURED CASE STUDY</span>
                      {project.domain && <span className="domain-tag">{project.domain}</span>}
                      {project.scale && <span className="scale-tag">{project.scale}</span>}
                    </div>

                    <div className="project-header">
                      <div>
                        <h3 className="project-title featured-title">{project.title}</h3>
                        <p className="featured-summary">{project.summary}</p>
                      </div>
                      <span className="project-date">{project.date}</span>
                    </div>
                    
                    <div className="project-tech">
                      {project.tech.map((tech, idx) => (
                        <SkillTag key={idx} label={tech} />
                      ))}
                    </div>

                    {/* Insights highlights */}
                    {project.insights && (
                      <div className="featured-insights-grid">
                        {project.insights.map((insight, idx) => (
                          <div key={idx} className="insight-mini-card">
                            <span className="insight-mini-title">{insight.title}</span>
                            <p className="insight-mini-desc">{insight.description}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Image Preview Banner */}
                    {project.image && (
                      <div 
                        className="project-preview-wrapper"
                        onClick={() => {
                          setActiveModal(project);
                          setActiveTab('charts');
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label="Click to enlarge dashboard preview"
                      >
                        <img 
                          src={project.image} 
                          alt="Credit Risk Interactive Heatmap Dashboard" 
                          className="project-preview-img"
                        />
                        <div className="preview-overlay">
                          <span className="preview-cta">🔍 Click to Explore Analytics & Charts</span>
                        </div>
                      </div>
                    )}

                    <ul className="project-details">
                      {project.bullets.map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>

                    <div className="project-actions featured-actions">
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setActiveModal(project);
                          setActiveTab('insights');
                        }}
                      >
                        📊 View Case Study & Visuals
                      </button>
                      
                      {project.githubUrl && (
                        <a 
                          href={project.githubUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-secondary btn-sm github-btn"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                          </svg>
                          GitHub Repo ↗
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              }

              // Standard companion project card
              return (
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

                  {project.githubUrl && (
                    <div className="project-actions">
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-secondary btn-sm"
                      >
                        GitHub Repo ↗
                      </a>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Deep Dive Case Study Modal */}
        <AnimatePresence>
          {activeModal && (
            <motion.div 
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
            >
              <motion.div 
                className="modal-container"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <div>
                    <div className="modal-tags">
                      <span className="domain-tag">{activeModal.domain}</span>
                      <span className="scale-tag">{activeModal.scale}</span>
                    </div>
                    <h2 className="modal-title">{activeModal.title}</h2>
                    <p className="modal-subtitle">{activeModal.summary}</p>
                  </div>
                  <button 
                    className="modal-close-btn"
                    onClick={() => setActiveModal(null)}
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>

                <div className="modal-tabs">
                  <button 
                    className={`modal-tab ${activeTab === 'insights' ? 'active' : ''}`}
                    onClick={() => setActiveTab('insights')}
                  >
                    💡 Key Insights
                  </button>
                  <button 
                    className={`modal-tab ${activeTab === 'charts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('charts')}
                  >
                    📈 Visualizations & Dashboards
                  </button>
                  <button 
                    className={`modal-tab ${activeTab === 'methodology' ? 'active' : ''}`}
                    onClick={() => setActiveTab('methodology')}
                  >
                    🛠 Methodology & SQL
                  </button>
                </div>

                <div className="modal-body">
                  {/* TAB 1: Key Business Insights */}
                  {activeTab === 'insights' && (
                    <div className="tab-pane">
                      <h4 className="tab-section-heading">Empirical Portfolio Discoveries</h4>
                      <div className="insights-detailed-list">
                        <div className="insight-card">
                          <div className="insight-card-header">
                            <span className="insight-num">01</span>
                            <h5>The Volume vs. Risk Paradox</h5>
                          </div>
                          <p>
                            While <strong>Debt Consolidation</strong> accounts for the vast majority of loan originations, 
                            <strong> Small Business</strong> loans exhibit the highest peak charge-off rate (nearly <strong>30%</strong>).
                            High capital velocity in low-margin segments creates disproportionate portfolio drag.
                          </p>
                        </div>

                        <div className="insight-card">
                          <div className="insight-card-header">
                            <span className="insight-num">02</span>
                            <h5>The Income Insulation Myth</h5>
                          </div>
                          <p>
                            High annual income does <em>not</em> proportionally mitigate default risk. Borrowers in top income brackets defaulted at statistically similar rates to lower tiers due to high debt-to-income (DTI) leverage and aggressive debt assumption.
                          </p>
                        </div>

                        <div className="insight-card">
                          <div className="insight-card-header">
                            <span className="insight-num">03</span>
                            <h5>Collateral & Housing Discrepancy</h5>
                          </div>
                          <p>
                            Renters exhibit a baseline default rate roughly <strong>5% higher</strong> than borrowers holding active mortgages, despite borrowing smaller average principal amounts. Real estate equity functions as a strong implicit behavioral hedge.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Visualizations & Dashboards */}
                  {activeTab === 'charts' && (
                    <div className="tab-pane">
                      <h4 className="tab-section-heading">Analytics Deliverables</h4>
                      
                      <div className="chart-item">
                        <h5>Interactive Heatmap Risk Dashboard (Plotly & ipywidgets)</h5>
                        <p>Real-time visual tool utilizing a heatmap gradient to pinpoint portfolio vulnerabilities by borrower purpose, yield, and charge-off velocity.</p>
                        <img 
                          src="/images/projects/credit_risk_heatmap.png" 
                          alt="Interactive Risk Heatmap" 
                          className="modal-chart-img"
                        />
                      </div>

                      <div className="charts-split-row">
                        <div className="chart-item">
                          <h5>10-Year Origination Trajectory</h5>
                          <p>Year-over-year loan origination volume tracking growth velocity vs. stabilization.</p>
                          <img 
                            src="/images/projects/origination_volume_trend.png" 
                            alt="Origination Volume Trend" 
                            className="modal-chart-img"
                          />
                        </div>
                        <div className="chart-item">
                          <h5>Macro Default Distribution</h5>
                          <p>Historical ratio of fully paid principals versus charged-off assets across 2.26M loans.</p>
                          <img 
                            src="/images/projects/macro_default_distribution.png" 
                            alt="Macro Default Distribution" 
                            className="modal-chart-img"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Methodology */}
                  {activeTab === 'methodology' && (
                    <div className="tab-pane">
                      <h4 className="tab-section-heading">Four-Phase Engineering Workflow</h4>
                      
                      <div className="timeline-phase">
                        <div className="phase-marker">Phase 1</div>
                        <div className="phase-content">
                          <h5>Data Architecture & SQL Aggregation</h5>
                          <p>
                            Cleaned and queried 2.26M records (~1.1 GB Lending Club dataset). Built custom SQL logic to segment borrowers into income brackets and isolated housing collateral default probabilities.
                          </p>
                        </div>
                      </div>

                      <div className="timeline-phase">
                        <div className="phase-marker">Phase 2</div>
                        <div className="phase-content">
                          <h5>Exploratory Data Analysis (EDA)</h5>
                          <p>
                            Constructed static visual wireframes using Python (Matplotlib & Seaborn) to establish baseline benchmark metrics, volume cycles, and cohort risk curves.
                          </p>
                        </div>
                      </div>

                      <div className="timeline-phase">
                        <div className="phase-marker">Phase 3 & 4</div>
                        <div className="phase-content">
                          <h5>Business Logic & Interactive Dashboard</h5>
                          <p>
                            Calculated risk-adjusted yield and charge-off velocity. Transitioned static queries into an interactive stakeholder dashboard powered by Plotly Express and ipywidgets with dynamic filtering.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  {activeModal.githubUrl && (
                    <a 
                      href={activeModal.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn btn-primary btn-sm"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '6px' }}>
                        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                      </svg>
                      View Full Code on GitHub ↗
                    </a>
                  )}
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setActiveModal(null)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default Projects;
