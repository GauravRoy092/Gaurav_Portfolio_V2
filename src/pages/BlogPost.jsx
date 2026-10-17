import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { getPostBySlug, sortedPosts } from '../lib/content';
import PageTransition from '../components/PageTransition';

// Individual dispatch reader.
// Renders the content blocks documented in src/lib/content.js.

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

// When a post was brought over from LinkedIn, the Studio appends a line like
// “*Originally shared on LinkedIn:* https://…” — render that as a real button
// (opens the original post in a new tab) instead of showing the raw URL.
const SOURCE_LINK_RE = /^\*?(?:Originally )?(?:shared|posted) on LinkedIn:?\*?\s*(https?:\/\/\S+)\s*$/;

// Minimal inline markdown: **bold** and *italic* only (matches blog.js docs).
const renderInline = (text) => {
  if (!text) return null;
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(pattern).filter((part) => part !== '');

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
};

const Block = ({ block }) => {
  switch (block.type) {
    case 'h2':
      return (
        <h2 className="blog-article-heading" id={slugify(block.text)}>
          <span className="blog-heading-spark">✦</span>
          <span>{block.text}</span>
        </h2>
      );

    case 'ul':
      return (
        <ul className="blog-article-list">
          {block.items.map((item, idx) => (
            <li key={idx}>
              <span className="blog-list-marker">›</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );

    case 'code':
      return (
        <figure className="blog-code-block">
          <figcaption className="blog-code-header">
            <span className="blog-code-dots">
              <span className="blog-code-dot" />
              <span className="blog-code-dot" />
              <span className="blog-code-dot" />
            </span>
            <span className="blog-code-lang">{block.lang || 'shell'}</span>
          </figcaption>
          <pre className="blog-code-pre">
            <code>{block.code}</code>
          </pre>
        </figure>
      );

    case 'quote':
      return (
        <blockquote className="blog-quote">
          <span className="blog-quote-glyph">✦</span>
          <p className="blog-quote-text">{renderInline(block.text)}</p>
          {block.cite && <cite className="blog-quote-cite">— {block.cite}</cite>}
        </blockquote>
      );

    case 'callout':
      return (
        <aside className="blog-callout">
          <div className="blog-callout-header">
            <span className="blog-callout-spark">✦</span>
            <span className="blog-callout-title">{block.title || 'Note'}</span>
          </div>
          <p className="blog-callout-text">{renderInline(block.text)}</p>
        </aside>
      );

    case 'p':
    default: {
      const source = String(block.text || '').match(SOURCE_LINK_RE);
      if (source) {
        return (
          <p className="blog-article-paragraph blog-source-line">
            <a
              className="blog-source-btn"
              href={source[1]}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>Open on LinkedIn</span>
              <span className="blog-source-arrow" aria-hidden="true">↗</span>
            </a>
          </p>
        );
      }
      return <p className="blog-article-paragraph">{renderInline(block.text)}</p>;
    }
  }
};

// Adjacent-post card — internal neighbours open the article page, external
// ones (LinkedIn / Medium imports) open the original post in a new tab.
const PostNavLink = ({ post, direction }) => {
  const label = direction === 'prev' ? '← Newer' : 'Older →';
  const className = `blog-post-nav-card${direction === 'next' ? ' blog-post-nav-card-right' : ''}`;
  if (post.externalUrl) {
    return (
      <a href={post.externalUrl} target="_blank" rel="noopener noreferrer" className={className}>
        <span className="blog-post-nav-label">{label}</span>
        <span className="blog-post-nav-title">{post.title}</span>
      </a>
    );
  }
  return (
    <Link to={`/blog/${post.slug}`} className={className}>
      <span className="blog-post-nav-label">{label}</span>
      <span className="blog-post-nav-title">{post.title}</span>
    </Link>
  );
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const [progress, setProgress] = useState(0);
  const [activeHeading, setActiveHeading] = useState('');

  // The three source posts share the same date bucket (e.g. "Oct 2026"),
  // so pick neighbours positionally to stay consistent with the index order.
  const { prevPost, nextPost } = useMemo(() => {
    const idx = sortedPosts.findIndex((p) => p.slug === slug);
    if (idx === -1) return { prevPost: null, nextPost: null };
    return {
      prevPost: idx > 0 ? sortedPosts[idx - 1] : null,
      nextPost: idx < sortedPosts.length - 1 ? sortedPosts[idx + 1] : null,
    };
  }, [slug]);

  const headings = useMemo(
    () =>
      (post?.content || [])
        .filter((block) => block.type === 'h2')
        .map((block) => ({ id: slugify(block.text), text: block.text })),
    [post]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Posts brought over from LinkedIn / Medium open at the source — the blog
  // card links straight there, so anyone landing on the internal URL is
  // forwarded instead of seeing an article page.
  useEffect(() => {
    if (post?.externalUrl) window.location.replace(post.externalUrl);
  }, [post]);

  // Reading progress indicator for the article body
  useEffect(() => {
    if (!post) return;
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  // Highlight the section currently in view
  useEffect(() => {
    if (!post || headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveHeading(visible.target.id);
      },
      { rootMargin: '-120px 0px -65% 0px', threshold: 0 }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [post, headings]);

  // Unknown slug — recover gracefully instead of rendering a blank page
  if (!post) {
    return (
      <PageTransition>
        <div className="blog-page">
          <div className="page-container">
            <div className="blog-notfound">
              <span className="blog-notfound-spark">✦</span>
              <h2 className="blog-notfound-title">Dispatch not found</h2>
              <p className="blog-notfound-text">
                No field note exists at <code className="blog-inline-code">/blog/{slug}</code>.
              </p>
              <Link to="/blog" className="btn btn-primary">
                <span>Back to Blog</span>
                <span className="btn-arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Being forwarded to the original post (see the effect above).
  if (post.externalUrl) return null;

  return (
    <PageTransition>
      <div className="blog-page">
        {/* Reading progress bar */}
        <div
          className="blog-reading-progress"
          style={{ transform: `scaleX(${progress / 100})` }}
          aria-hidden="true"
        />

        <div className="blog-geometric-background" aria-hidden="true">
          <div className="anthropic-ambient-mesh" />
          <div className="anthropic-grid-overlay" />
        </div>

        <div className="page-container">
          <Link to="/blog" className="blog-back-link">
            <span className="blog-back-arrow">←</span>
            <span>All posts</span>
          </Link>

          {/* Article masthead */}
          <motion.header
            className="blog-article-header"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="featured-badge-row">
              <span className="featured-tag">
                <span className="badge-spark">✦</span>
                <span>FIELD NOTE</span>
              </span>
              <span className="blog-readtime-tag">{post.readTime} read</span>
            </div>

            <h1 className="blog-article-title">{post.title}</h1>
            <p className="blog-article-excerpt">{post.excerpt}</p>

            <div className="blog-article-metabar">
              <span className="blog-meta-date">{post.date}</span>
              <span className="blog-meta-dot">·</span>
              <span className="blog-article-author">Gaurav Roy</span>
            </div>

            <div className="blog-card-tags">
              {post.tags?.map((tag) => (
                <span key={tag} className="blog-tag">{tag}</span>
              ))}
            </div>
          </motion.header>

          <div className="blog-article-layout">
            {/* Sticky table of contents */}
            {headings.length > 0 && (
              <aside className="blog-toc" aria-label="On this page">
                <span className="blog-toc-label">ON THIS PAGE</span>
                <ul className="blog-toc-list">
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        className={`blog-toc-link ${activeHeading === heading.id ? 'active' : ''}`}
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </aside>
            )}

            <motion.article
              className="blog-article-body"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            >
              {post.content.map((block, idx) => (
                <Block key={idx} block={block} />
              ))}
            </motion.article>
          </div>

          {/* Prev / next navigation */}
          {(prevPost || nextPost) && (
            <nav className="blog-post-nav" aria-label="Adjacent dispatches">
              {prevPost ? (
                <PostNavLink post={prevPost} direction="prev" />
              ) : (
                <span className="blog-post-nav-spacer" />
              )}
              {nextPost && <PostNavLink post={nextPost} direction="next" />}
            </nav>
          )}

          <div className="blog-article-footer">
            <Link to="/blog" className="btn btn-secondary btn-sm">
              <span>← All posts</span>
            </Link>
            <Link to="/contact" className="btn btn-primary btn-sm">
              <span>Discuss this work</span>
              <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default BlogPost;
