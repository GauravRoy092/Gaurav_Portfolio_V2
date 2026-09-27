import React from 'react';

const SkillTag = ({ label, color }) => {
  const style = color ? { borderLeftColor: color } : {};

  return (
    <div className="skill-tag" style={style}>
      {label}
    </div>
  );
};

export default SkillTag;
