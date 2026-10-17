// ==========================================================================
// CONTENT LOADER — the single place the site reads published content from.
// --------------------------------------------------------------------------
// Content lives in JSON under src/content/ and is normally edited through
// the local Studio (`bun run studio`), not by hand:
//   • projects.json — case studies shown on /projects
//   • posts.json    — field notes shown on /blog
//   • feed.json     — "Signals I'm Reading" links (plain URL string or object)
//
// Any item with `"draft": true` is automatically hidden from the site.
// Any item with `"hidden": true` is skipped entirely — the Studio's Hide
// button marks items this way instead of deleting them. The entry (the "code")
// always stays in the content file, so Restore brings it straight back.
//
// Blog post content blocks (posts.json → post.content):
//   { type: 'p',       text }             → paragraph (inline **bold** / *italic*)
//   { type: 'h2',      text }             → section heading
//   { type: 'ul',      items: [...] }     → bullet list
//   { type: 'code',    lang, code }       → terminal-style code block
//   { type: 'quote',   text, cite? }      → pull quote
//   { type: 'callout', title?, text }     → highlighted note card
// ==========================================================================

import rawProjects from '../content/projects.json';
import rawPosts from '../content/posts.json';
import rawFeedItems from '../content/feed.json';

const isVisible = (item) => !item?.draft && !item?.hidden;

// Case studies keep their stored order (newest first is enforced in the Studio).
export const projects = rawProjects.filter(isVisible);

// Posts render newest-first by their free-text `date` label.
export const sortedPosts = rawPosts
  .filter(isVisible)
  .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

export const getPostBySlug = (slug) => sortedPosts.find((post) => post.slug === slug);

export const feedItems = rawFeedItems.filter(isVisible);
