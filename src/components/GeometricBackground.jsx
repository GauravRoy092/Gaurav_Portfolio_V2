import React from 'react';
import { motion } from 'framer-motion';

const GeometricBackground = ({ variant = 'hero' }) => {
  const floatAnimation = {
    y: [0, -15, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  const renderShapes = () => {
    switch (variant) {
      case 'hero':
        return (
          <>
            <motion.circle cx="10%" cy="20%" r="40" fill="#4285F4" opacity="0.1" animate={floatAnimation} />
            <motion.rect x="80%" y="10%" width="60" height="60" fill="#EA4335" opacity="0.1" animate={{...floatAnimation, transition: { ...floatAnimation.transition, delay: 1 }}} />
            <motion.polygon points="20,100 60,180 100,100" fill="#FBBC05" opacity="0.1" animate={{...floatAnimation, transition: { ...floatAnimation.transition, delay: 2 }}} style={{ x: '70%', y: '60%' }} />
            <motion.circle cx="30%" cy="80%" r="25" fill="#34A853" opacity="0.1" animate={{...floatAnimation, transition: { ...floatAnimation.transition, delay: 1.5 }}} />
          </>
        );
      case 'about':
        return (
          <>
            <motion.circle cx="85%" cy="30%" r="50" fill="#4285F4" opacity="0.08" animate={floatAnimation} />
            <motion.polygon points="50,0 100,100 0,100" fill="#EA4335" opacity="0.08" animate={{...floatAnimation, transition: { ...floatAnimation.transition, delay: 1 }}} style={{ x: '10%', y: '50%' }} />
          </>
        );
      case 'experience':
        return (
          <>
            <motion.rect x="15%" y="15%" width="80" height="80" rx="20" fill="#FBBC05" opacity="0.08" animate={floatAnimation} />
            <motion.circle cx="90%" cy="70%" r="60" fill="#34A853" opacity="0.08" animate={{...floatAnimation, transition: { ...floatAnimation.transition, delay: 2 }}} />
          </>
        );
      case 'projects':
        return (
          <>
            <motion.polygon points="50,0 100,50 50,100 0,50" fill="#4285F4" opacity="0.08" animate={floatAnimation} style={{ x: '10%', y: '20%' }} />
            <motion.circle cx="80%" cy="80%" r="70" fill="#EA4335" opacity="0.08" animate={{...floatAnimation, transition: { ...floatAnimation.transition, delay: 1.5 }}} />
          </>
        );
      case 'contact':
        return (
          <>
            <motion.rect x="75%" y="15%" width="90" height="90" rx="45" fill="#34A853" opacity="0.1" animate={floatAnimation} />
            <motion.polygon points="50,0 100,100 0,100" fill="#FBBC05" opacity="0.1" animate={{...floatAnimation, transition: { ...floatAnimation.transition, delay: 1 }}} style={{ x: '20%', y: '70%' }} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="geometric-background">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {renderShapes()}
      </svg>
    </div>
  );
};

export default GeometricBackground;
