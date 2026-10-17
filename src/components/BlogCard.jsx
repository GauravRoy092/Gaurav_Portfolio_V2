import React from 'react';
import { Link } from 'react-router-dom';
import { webpVariant } from '../lib/images';
import { formatCardTime } from '../lib/time';

// YouTube-style compact dispatch card for the blog page.
// Used for both kinds of posts:
//   • internal — field notes stored in src/content/posts.json → opens /blog/:slug
//   • external — curated links (Medium / LinkedIn / Reddit / any URL)
//                → opens the original post in a new tab

const HeartIcon = () => (
  <svg className="yt-meta-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const AVATAR_GLYPH = {
  fieldnote: '✦',
  medium: 'M',
  linkedin: 'in',
  reddit: 'r/',
  web: '↗',
};

const BlogCard = ({ item, index = 0 }) => {
  const time = formatCardTime(item);
  const hasLikes = typeof item.likes === 'number' && item.likes >= 0;
  const isInternal = item.kind === 'internal';
  const sourceKey = item.sourceKey || 'fieldnote';
  const excerpt = item.excerpt || item.note || '';
  const webpSrc = webpVariant(item.thumbnail);

  // Thumbnail corner chip: reading time for field notes (the "duration"),
  // source name for external posts.
  const chip = isInternal ? item.readTime && `${item.readTime} read` : item.sourceLabel;

  const overlay = isInternal ? (
    <Link to={item.to} className="yt-card-overlay" aria-label={`Read: ${item.title}`} />
  ) : (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="yt-card-overlay"
      aria-label={`${item.title} — open on ${item.sourceLabel} (opens in a new tab)`}
    />
  );

  return (
    <article className="yt-card">
      <div className="yt-thumb">
        {item.thumbnail ? (
          <picture>
            {webpSrc && <source type="image/webp" srcSet={webpSrc} />}
            <img
              src={item.thumbnail}
              alt={`${item.title} — cover`}
              className="yt-thumb-img"
              loading="lazy"
              decoding="async"
            />
          </picture>
        ) : (
          <div className={`yt-thumb-placeholder yt-ph-${sourceKey}`} aria-hidden="true">
            <span className="yt-ph-glyph">{AVATAR_GLYPH[sourceKey] || '✦'}</span>
            {item.placeholderText && <span className="yt-ph-label">{item.placeholderText}</span>}
          </div>
        )}

        {item.flag && (
          <span className="yt-flag">
            <span className="yt-flag-spark">✦</span> {item.flag}
          </span>
        )}
        {chip && (
          <span className="yt-thumb-chip">
            {chip}
            {!isInternal && <span className="yt-chip-arrow" aria-hidden="true"> ↗</span>}
          </span>
        )}
      </div>

      <div className="yt-card-body">
        <h3 className="yt-card-title">{item.title}</h3>

        <p className="yt-card-channel">
          <span className={`yt-avatar yt-avatar-${sourceKey}`} aria-hidden="true">
            {AVATAR_GLYPH[sourceKey] || '✦'}
          </span>
          <span className="yt-channel-name">{item.channelLabel}</span>
        </p>

        {excerpt && <p className="yt-card-excerpt">{excerpt}</p>}

        {(hasLikes || time) && (
          <p className="yt-card-meta">
            {hasLikes && (
              <span className="yt-meta-item">
                <HeartIcon />
                {item.likes} {item.likes === 1 ? 'like' : 'likes'}
              </span>
            )}
            {hasLikes && time && (
              <span className="yt-meta-dot" aria-hidden="true">
                ·
              </span>
            )}
            {time && <span className="yt-meta-item">{time}</span>}
          </p>
        )}
      </div>

      {overlay}
    </article>
  );
};

export default BlogCard;
