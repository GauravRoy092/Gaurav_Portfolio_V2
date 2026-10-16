import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const SectionHeader = ({ eyebrow, title, subtitle, align = 'left' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div className={`section-header align-${align}`} ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        {eyebrow && (
          <div className="section-eyebrow">
            <span className="eyebrow-spark">✦</span>
            <span className="eyebrow-text">{eyebrow}</span>
          </div>
        )}
        <h2 className="section-title">
          {title}
        </h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        <div className="section-header-hairline" />
      </motion.div>
    </div>
  );
};

export default SectionHeader;
