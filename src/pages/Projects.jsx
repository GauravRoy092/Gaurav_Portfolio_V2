import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { projects } from '../lib/content';
import PageTransition from '../components/PageTransition';
import GeometricBackground from '../components/GeometricBackground';
import SectionHeader from '../components/SectionHeader';
import SkillTag from '../components/SkillTag';
import ProjectCard from '../components/ProjectCard';
import { repoHostLabel } from '../lib/github';
import { webpVariant } from '../lib/images';

// Case study index — YouTube-style compact cards.
// Each card shows only the essentials; clicking it opens the full
// technical report popup built entirely from the project data
// (src/content/projects.json). No hard-coded case study content here.

// Collect every visual attached to a project, de-duplicated, in a
// predictable order: explicit gallery → cover image → phase screenshots.
const buildGallery = (project) => {
  const seen = new Set();
  const items = [];
  const add = (src, title, caption) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    items.push({ src, title, caption });
  };

  (project.gallery || []).forEach(({ src, title, caption }) => add(src, title, caption));
  add(project.image, project.title, '');
  (project.phases || []).forEach((phase) => add(phase.image, phase.title, phase.description));
  return items;
};

// A tab appears only when its content exists, so a simple project with
// just bullets + a repo link still renders a clean single-page popup.
const buildTabs = (project, gallery) => {
  const tabs = [];
  if (project.bullets?.length) tabs.push({ id: 'overview', label: 'Overview' });
  if (project.insights?.length) tabs.push({ id: 'insights', label: 'Key Insights' });
  if (gallery.length) tabs.push({ id: 'gallery', label: 'Visualizations' });
  if (project.phases?.length) tabs.push({ id: 'methodology', label: 'Methodology' });
  return tabs;
};

const GalleryImage = ({ src, alt }) => {
  const webpSrc = webpVariant(src);
  return (
    <picture style={{ display: 'block' }}>
      {webpSrc && <source type="image/webp" srcSet={webpSrc} />}
      <img
        src={src}
        alt={alt || 'Case study visualization'}
        className="modal-chart-img"
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
};

const Projects = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState('');

  const gallery = useMemo(() => (activeModal ? buildGallery(activeModal) : []), [activeModal]);
  const tabs = useMemo(
    () => (activeModal ? buildTabs(activeModal, gallery) : []),
    [activeModal, gallery]
  );
  const currentTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : tabs[0]?.id;

  const openProject = (project) => {
    setActiveModal(project);
    setActiveTab(''); // falls back to the first tab with content
  };

  // Lock body scroll when modal is open + close on Escape
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
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: 'easeOut' },
    },
  };

  return (
    <PageTransition>
      <div className="projects-page">
        <GeometricBackground variant="projects" />
        <div className="page-container">
          <SectionHeader
            eyebrow="EMPIRICAL INVESTIGATIONS"
            title="Case Studies & Analytical Systems"
            subtitle="Large-scale consumer credit diagnostics, telemetry logging, and operational automation architectures."
          />

          <div className="blog-grid-heading">
            <span className="section-eyebrow">
              <span className="eyebrow-spark">✦</span>
              <span className="eyebrow-text">SELECTED WORK</span>
            </span>
            <span className="blog-archive-count">
              {projects.length} {projects.length === 1 ? 'case study' : 'case studies'}
            </span>
          </div>

          <p className="yt-grid-hint">
            Select any card to open the full technical report — visualizations, findings, and
            methodology.
          </p>

          <motion.div
            className="yt-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {projects.map((project, index) => (
              <motion.div key={project.title} variants={cardVariants}>
                <ProjectCard project={project} index={index} onOpen={openProject} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Full technical report popup — rendered from project data */}
        {typeof document !== 'undefined' &&
          createPortal(
            <AnimatePresence>
              {activeModal && (
                <motion.div
                  key="case-study-modal"
                  className="modal-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActiveModal(null)}
                >
                  <motion.div
                    className="modal-container"
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${activeModal.title} — technical report`}
                    initial={{ opacity: 0, scale: 0.96, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 15 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="modal-header">
                      <div>
                        <div className="modal-tags">
                          {activeModal.featured && (
                            <span className="featured-tag">
                              <span className="badge-spark">✦</span>
                              <span>FLAGSHIP CASE STUDY</span>
                            </span>
                          )}
                          {activeModal.domain && (
                            <span className="domain-tag">{activeModal.domain}</span>
                          )}
                          {activeModal.scale && (
                            <span className="scale-tag">{activeModal.scale}</span>
                          )}
                        </div>
                        <h2 className="modal-title">{activeModal.title}</h2>
                        {activeModal.summary && (
                          <p className="modal-subtitle">{activeModal.summary}</p>
                        )}
                        {activeModal.tech?.length > 0 && (
                          <div className="project-tech">
                            {activeModal.tech.map((tech, idx) => (
                              <SkillTag key={idx} label={tech} />
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        className="modal-close-btn"
                        onClick={() => setActiveModal(null)}
                        aria-label="Close report"
                        type="button"
                      >
                        ×
                      </button>
                    </div>

                    {tabs.length > 1 && (
                      <div className="modal-tabs">
                        {tabs.map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            className={`modal-tab ${currentTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                          >
                            <span className="tab-spark">✦</span> {tab.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="modal-body">
                      {currentTab === 'overview' && (
                        <div className="tab-pane">
                          <h4 className="tab-section-heading">Project Overview</h4>
                          <ul className="project-details modal-overview-list">
                            {activeModal.bullets.map((bullet, idx) => (
                              <li key={idx}>
                                <span className="bullet-chevron">›</span>
                                <span className="bullet-text">{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentTab === 'insights' && (
                        <div className="tab-pane">
                          <h4 className="tab-section-heading">Empirical Findings</h4>
                          <div className="insights-detailed-list">
                            {activeModal.insights.map((insight, idx) => (
                              <div key={idx} className="insight-card">
                                <div className="insight-card-header">
                                  <span className="insight-num">
                                    {String(idx + 1).padStart(2, '0')}
                                  </span>
                                  <h5>{insight.title}</h5>
                                </div>
                                <p>{insight.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentTab === 'gallery' && (
                        <div className="tab-pane">
                          <h4 className="tab-section-heading">Analytics Deliverables</h4>
                          <div className="modal-gallery-grid">
                            {gallery.map((item) => (
                              <figure key={item.src} className="modal-gallery-item">
                                {item.title && <h5>{item.title}</h5>}
                                {item.caption && <p>{item.caption}</p>}
                                <GalleryImage src={item.src} alt={item.title} />
                              </figure>
                            ))}
                          </div>
                        </div>
                      )}

                      {currentTab === 'methodology' && (
                        <div className="tab-pane">
                          <h4 className="tab-section-heading">Engineering Workflow</h4>
                          {activeModal.phases.map((phase, idx) => (
                            <div key={idx} className="timeline-phase">
                              <div className="phase-marker">{phase.phase}</div>
                              <div className="phase-content">
                                <h5>{phase.title}</h5>
                                <p>{phase.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="modal-footer">
                      {activeModal.githubUrl ? (
                        <a
                          href={activeModal.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm github-btn"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                          </svg>
                          <span>View Code on {repoHostLabel(activeModal.githubUrl)} ↗</span>
                        </a>
                      ) : (
                        <Link to="/contact" className="btn btn-primary btn-sm">
                          <span>Inquire About Solution ↗</span>
                        </Link>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setActiveModal(null)}
                        type="button"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )}
      </div>
    </PageTransition>
  );
};

export default Projects;
