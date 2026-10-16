import React from 'react';

const SkillTag = ({ label, variant = 'default', prefix }) => {
  return (
    <span className={`skill-tag skill-tag-${variant}`}>
      {prefix && <span className="skill-tag-prefix">{prefix}</span>}
      <span className="skill-tag-label">{label}</span>
    </span>
  );
};

export default SkillTag;
