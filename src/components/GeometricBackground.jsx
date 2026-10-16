import React from 'react';
import { motion } from 'framer-motion';

const GeometricBackground = ({ variant = 'hero' }) => {
  const floatAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const slowPulse = {
    opacity: [0.03, 0.07, 0.03],
    scale: [1, 1.05, 1],
    transition: {
      duration: 10,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="geometric-background" aria-hidden="true">
      {/* Subtle Anthropic Warm Ambient Lighting */}
      <motion.div 
        className="anthropic-ambient-mesh"
        animate={slowPulse}
      />
      
      {/* Fine Anthropic Grid Texture */}
      <div className="anthropic-grid-overlay" />

      {/* Floating Claude Sparks & Architectural Motifs */}
      <svg className="anthropic-floating-svg" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="terracottaGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D97757" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#D97757" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="warmOchreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C99757" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#C99757" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Delicate ambient glow pools */}
        <circle cx="85%" cy="15%" r="220" fill="url(#terracottaGlow)" />
        <circle cx="10%" cy="75%" r="260" fill="url(#warmOchreGlow)" />

        {/* Architectural floating Claude sparks (✦) */}
        {variant === 'hero' && (
          <>
            <motion.g animate={floatAnimation} style={{ transformOrigin: '80% 20%' }}>
              <path 
                d="M 0,-14 L 3,-3 L 14,0 L 3,3 L 0,14 L -3,3 L -14,0 L -3,-3 Z" 
                fill="#D97757" 
                opacity="0.22"
                transform="translate(850, 140)"
              />
            </motion.g>
            <motion.g animate={{ ...floatAnimation, transition: { ...floatAnimation.transition, delay: 2 } }}>
              <path 
                d="M 0,-9 L 2,-2 L 9,0 L 2,2 L 0,9 L -2,2 L -9,0 L -2,-2 Z" 
                fill="#C99757" 
                opacity="0.18"
                transform="translate(120, 320)"
              />
            </motion.g>
            <motion.circle cx="92%" cy="65%" r="3" fill="#D97757" opacity="0.3" animate={floatAnimation} />
            <motion.circle cx="15%" cy="85%" r="2.5" fill="#C99757" opacity="0.25" animate={floatAnimation} />
          </>
        )}

        {variant === 'about' && (
          <>
            <motion.g animate={floatAnimation}>
              <path 
                d="M 0,-12 L 2.5,-2.5 L 12,0 L 2.5,2.5 L 0,12 L -2.5,2.5 L -12,0 L -2.5,-2.5 Z" 
                fill="#D97757" 
                opacity="0.18"
                transform="translate(900, 180)"
              />
            </motion.g>
          </>
        )}

        {variant === 'experience' && (
          <>
            <motion.g animate={floatAnimation}>
              <path 
                d="M 0,-10 L 2,-2 L 10,0 L 2,2 L 0,10 L -2,2 L -10,0 L -2,-2 Z" 
                fill="#D97757" 
                opacity="0.15"
                transform="translate(180, 240)"
              />
            </motion.g>
          </>
        )}

        {variant === 'projects' && (
          <>
            <motion.g animate={floatAnimation}>
              <path 
                d="M 0,-12 L 2.5,-2.5 L 12,0 L 2.5,2.5 L 0,12 L -2.5,2.5 L -12,0 L -2.5,-2.5 Z" 
                fill="#D97757" 
                opacity="0.2"
                transform="translate(860, 160)"
              />
            </motion.g>
          </>
        )}

        {variant === 'contact' && (
          <>
            <motion.g animate={floatAnimation}>
              <path 
                d="M 0,-11 L 2.2,-2.2 L 11,0 L 2.2,2.2 L 0,11 L -2.2,2.2 L -11,0 L -2.2,-2.2 Z" 
                fill="#D97757" 
                opacity="0.18"
                transform="translate(800, 260)"
              />
            </motion.g>
          </>
        )}
      </svg>
    </div>
  );
};

export default GeometricBackground;
