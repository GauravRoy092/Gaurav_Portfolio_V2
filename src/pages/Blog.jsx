import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { sortedPosts } from '../lib/content';
import { parseFeedItem } from '../lib/feed';
import PageTransition from '../components/PageTransition';
import SectionHeader from '../components/SectionHeader';
import BlogCard from '../components/BlogCard';
import SharedFeed from '../components/SharedFeed';

// Blog index — YouTube-style compact dispatch cards.
// Posts come from src/content/posts.json (edited in the local Studio).
// Each card shows thumbnail + title + author + likes + age. Clicking opens the
// full article at /blog/:slug — or, for posts brought over from LinkedIn /
// Medium (they carry an externalUrl), the original post in a new tab.

const Blog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const dispatchItems = useMemo(
    () =>
      sortedPosts.map((post, index) => {
        const shared = {
          key: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          thumbnail: post.thumbnail,
          tags: post.tags,
          date: post.date,
          publishedAt: post.publishedAt,
          likes: post.likes,
          channelLabel: 'Gaurav Roy',
          flag: index === 0 ? 'Latest' : '',
        };

        // Posts brought over from LinkedIn / Medium / any link: the card opens
        // the original post in a new tab (YouTube-style), exactly like the
        // feed cards lower down the page.
        if (post.externalUrl) {
          const source = parseFeedItem(post.externalUrl);
          return {
            ...shared,
            kind: 'external',
            url: post.externalUrl,
            sourceKey: source.source,
            sourceLabel: source.sourceLabel,
            placeholderText: post.tags?.[0] || source.sourceLabel,
          };
        }

        return {
          ...shared,
          kind: 'internal',
          to: `/blog/${post.slug}`,
          readTime: post.readTime,
          sourceKey: 'fieldnote',
          sourceLabel: 'Field Note',
          placeholderText: post.tags?.[0] || 'Field Note',
        };
      }),
    []
  );

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
      <div className="blog-page">
        <div className="blog-geometric-background" aria-hidden="true">
          <div className="anthropic-ambient-mesh" />
          <div className="anthropic-grid-overlay" />
        </div>

        <div className="page-container">
          <SectionHeader
            eyebrow="FIELD NOTES & DISPATCHES"
            title="Engineering Blog"
            subtitle="Long-form notes from production systems — robotics telemetry, Linux diagnostics, and large-scale data forensics. Written to be re-read, not skimmed."
          />

          {/* Empty state when no posts are published — hidden for now.
              Uncomment to show a placeholder when blog.js has no posts.
          {dispatchItems.length === 0 && (
            <motion.div
              className="blog-notfound"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <span className="blog-notfound-spark">✦</span>
              <h2 className="blog-notfound-title">No Posts Published Yet</h2>
              <p className="blog-notfound-text">
                Engineering field notes and telemetry dispatches are currently in preparation.
              </p>
            </motion.div>
          )}
          */}

          {dispatchItems.length > 0 && (
            <>
              <div className="blog-grid-heading">
                <span className="section-eyebrow">
                  <span className="eyebrow-spark">✦</span>
                  <span className="eyebrow-text">DISPATCHES</span>
                </span>
                <span className="blog-archive-count">
                  {dispatchItems.length} {dispatchItems.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              <motion.div
                className="yt-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {dispatchItems.map((item, index) => (
                  <motion.div key={item.key} variants={cardVariants}>
                    <BlogCard item={item} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}

          {/* Curated link feed — links live in src/content/feed.json (edited in the local Studio). */}
          <SharedFeed />
        </div>
      </div>
    </PageTransition>
  );
};

export default Blog;
