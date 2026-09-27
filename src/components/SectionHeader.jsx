import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const SectionHeader = ({ title, subtitle, align = 'left' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div className={`section-header align-${align}`} ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h2 className="section-title">
          {title}
          <span className="title-underline"></span>
        </h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </motion.div>
    </div>
  );
};

export default SectionHeader;
