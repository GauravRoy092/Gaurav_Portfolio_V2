import React from 'react';
import { parseGitHubRepo, useGitHubStars } from '../lib/github';
import { webpVariant } from '../lib/images';
import { formatCardTime } from '../lib/time';

// YouTube-style compact case study card.
// Shows only the at-a-glance facts — thumbnail, title, domain, likes, age.
// The whole card is one click target (the stretched overlay button) that
// opens the full technical report popup; nothing else competes for clicks.

const PLACEHOLDER_VARIANTS = ['terracotta', 'sage', 'sand', 'slate'];

const StarIcon = () => (
  <svg className="yt-meta-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="yt-meta-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const GitHubMark = () => (
  <svg className="yt-avatar-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const initialsOf = (title) =>
  (title || '')
    .split(/\s+/)
    .filter((word) => /[A-Za-z0-9]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

const ProjectCard = ({ project, index = 0, onOpen }) => {
  const stars = useGitHubStars(project.githubUrl);
  const time = formatCardTime(project);
  const isRepoProject = Boolean(parseGitHubRepo(project.githubUrl));

  // Manual `likes` (when set) wins, otherwise the live GitHub star count.
  const usingManualLikes = typeof project.likes === 'number';
  const likes = usingManualLikes ? project.likes : stars;
  const likesNoun = !usingManualLikes && stars !== null ? 'star' : 'like';
  const variant = PLACEHOLDER_VARIANTS[index % PLACEHOLDER_VARIANTS.length];
  const webpSrc = webpVariant(project.image);

  return (
    <article className={`yt-card${project.featured ? ' yt-card-featured' : ''}`}>
      <div className="yt-thumb">
        {project.image ? (
          <picture>
            {webpSrc && <source type="image/webp" srcSet={webpSrc} />}
            <img
              src={project.image}
              alt={`${project.title} — preview`}
              className="yt-thumb-img"
              loading="lazy"
              decoding="async"
            />
          </picture>
        ) : (
          <div className={`yt-thumb-placeholder yt-ph-${variant}`} aria-hidden="true">
            <span className="yt-ph-glyph">{initialsOf(project.title)}</span>
            <span className="yt-ph-label">Case Study</span>
          </div>
        )}

        {project.featured && (
          <span className="yt-flag">
            <span className="yt-flag-spark">✦</span> Flagship
          </span>
        )}
        {project.scale && <span className="yt-thumb-chip">{project.scale}</span>}
      </div>

      <div className="yt-card-body">
        <h3 className="yt-card-title">{project.title}</h3>

        <p className="yt-card-channel">
          <span className="yt-avatar yt-avatar-repo" aria-hidden="true">
            {isRepoProject ? <GitHubMark /> : <span className="yt-avatar-glyph">✦</span>}
          </span>
          <span className="yt-channel-name">{project.domain || 'Case Study'}</span>
        </p>

        {(likes !== null || time) && (
          <p className="yt-card-meta">
            {likes !== null && (
              <span className="yt-meta-item">
                {!usingManualLikes && stars !== null ? <StarIcon /> : <HeartIcon />}
                {likes} {likesNoun}
                {likes === 1 ? '' : 's'}
              </span>
            )}
            {likes !== null && time && (
              <span className="yt-meta-dot" aria-hidden="true">
                ·
              </span>
            )}
            {time && <span className="yt-meta-item">{time}</span>}
          </p>
        )}
      </div>

      {/* Stretched hit area — keeps the card an <article> with a real <h3>
          while the whole surface stays a single accessible control. */}
      <button
        type="button"
        className="yt-card-overlay"
        onClick={() => onOpen(project)}
        aria-label={`Open case study: ${project.title}`}
      />
    </article>
  );
};

export default ProjectCard;
