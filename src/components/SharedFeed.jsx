import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { feedItems } from '../lib/content';
import { parseFeedItems } from '../lib/feed';
import BlogCard from './BlogCard';

// Curated "Signals I'm Reading" section.
// Reads links from src/content/feed.json (edited in the local Studio) and
// shows each as a compact card. External posts open the original
// Medium / LinkedIn / Reddit / web page in a new tab.

const SharedFeed = () => {
  const items = useMemo(() => parseFeedItems(feedItems), []);

  if (!items || items.length === 0) return null;

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
    <section className="shared-feed" aria-label="Signals I'm reading">
      <div className="blog-grid-heading">
        <span className="section-eyebrow">
          <span className="eyebrow-spark" aria-hidden="true">✦</span>
          <span className="eyebrow-text">SIGNALS I'M READING</span>
        </span>
        <span className="blog-archive-count">
          {items.length} {items.length === 1 ? 'pick' : 'picks'}
        </span>
      </div>

      <p className="shared-feed-intro">
        Posts and threads I'm learning from across robotics, telemetry, and data
        systems — the reading I'd hand to a colleague.
      </p>

      <motion.div
        className="yt-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
      >
        {items.map((item, index) => (
          <motion.div key={item.url} variants={cardVariants}>
            <BlogCard
              index={index}
              item={{
                kind: 'external',
                url: item.url,
                title: item.title,
                note: item.note,
                thumbnail: item.thumbnail,
                date: item.date,
                publishedAt: item.publishedAt,
                likes: item.likes,
                sourceKey: item.source,
                sourceLabel: item.sourceLabel,
                channelLabel: item.publication || item.sourceLabel,
                placeholderText: item.publication || item.sourceLabel,
                flag: item.pinned ? 'Pinned' : '',
              }}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default SharedFeed;
