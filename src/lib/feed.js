// ==========================================================================
// FEED PARSER — turns a pasted link into a display-ready curated card.
// --------------------------------------------------------------------------
// Design goals: simple + reliable + reusable.
//   • No network calls, no build step, no dependencies.
//   • A plain URL string is enough — the title/context are derived from it.
//   • An optional object form lets you override the title and add your take.
//   • Never throws: a malformed URL still produces a working link card.
// ==========================================================================

// Small words that stay lowercase inside a derived title (unless first/last).
const SMALL_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'into',
  'nor', 'of', 'on', 'onto', 'or', 'over', 'per', 'the', 'to', 'up', 'via',
  'vs', 'with',
]);

// Medium appends a content hash to the slug, e.g. "...-7a575a4180ab".
const MEDIUM_HASH = /-[0-9a-f]{8,}$/i;
// Trailing file extensions we don't want in a derived title.
const FILE_EXT = /\.(html?|php|aspx?|jsp)$/i;

// Tracking parameters we strip so the same post always resolves to one URL.
const TRACKING_PARAMS = /^(utm_|si$|ref$|ref_src$|igshid$|mc_cid$|mc_eid$|fbclid$|gclid$)/i;

// Remove tracking query params while preserving any meaningful ones.
function stripTracking(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const entries = [...u.searchParams.entries()];
    u.search = '';
    for (const [key, value] of entries) {
      if (!TRACKING_PARAMS.test(key)) u.searchParams.append(key, value);
    }
    return u.toString();
  } catch {
    return rawUrl;
  }
}

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

// Split a slug into raw words, dropping Medium's hash and file extensions.
function slugToWords(slug) {
  if (!slug) return [];
  return decodeURIComponent(slug)
    .replace(FILE_EXT, '')
    .replace(MEDIUM_HASH, '')
    .split(/[-_+.]+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

// Every word capitalized — used for publication names (e.g. "Write A Catalyst").
function capitalizeWords(slug) {
  return slugToWords(slug).map(capitalize).join(' ');
}

// Smart title case — lowercase small words, keep leading acronyms, and
// collapse single-letter runs ("a","z") into a range ("A–Z").
function titleizeSlug(slug) {
  const rawWords = slugToWords(slug);
  if (rawWords.length === 0) return '';

  const words = [];
  for (let i = 0; i < rawWords.length; i += 1) {
    if (rawWords[i].length === 1 && rawWords[i + 1]?.length === 1) {
      const run = [];
      while (i < rawWords.length && rawWords[i].length === 1) {
        run.push(rawWords[i].toUpperCase());
        i += 1;
      }
      i -= 1;
      words.push(run.join('–'));
    } else {
      words.push(rawWords[i]);
    }
  }

  return words
    .map((word, index) => {
      const isEdge = index === 0 || index === words.length - 1;
      const lower = word.toLowerCase();
      const isAllCaps = word.length > 1 && word === word.toUpperCase();
      if (isAllCaps) return word;
      if (!isEdge && SMALL_WORDS.has(lower)) return lower;
      return capitalize(word);
    })
    .join(' ');
}

function detectSource(host) {
  if (!host) return 'web';
  if (host === 'medium.com' || host.endsWith('.medium.com')) return 'medium';
  if (host === 'reddit.com' || host.endsWith('.reddit.com') || host === 'redd.it') {
    return 'reddit';
  }
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com') || host === 'lnkd.in') {
    return 'linkedin';
  }
  return 'web';
}

// Pull a human title + context out of a Reddit permalink.
function readRedditPath(segments) {
  const rIndex = segments.indexOf('r');
  const subreddit = rIndex !== -1 ? segments[rIndex + 1] : null;
  const cIndex = segments.indexOf('comments');
  const slug = cIndex !== -1 ? segments[cIndex + 2] : null;
  return { subreddit, slug };
}

// Pull a title slug + publication/author out of a Medium permalink.
function readMediumPath(segments) {
  const first = segments[0] || '';
  if (first.startsWith('@')) {
    return { author: first.slice(1), publication: null, slug: segments[1] };
  }
  // Could be a publication (e.g. "write-a-catalyst") or a bare slug.
  const isPublication = segments.length > 1;
  return {
    author: null,
    publication: isPublication ? capitalizeWords(first) : null,
    slug: segments[segments.length - 1],
  };
}

// "gaurav-roy-6580b222b" -> "Gaurav Roy"
function humanizeAuthor(author) {
  if (!author) return null;
  const cleaned = author
    .replace(/-\d[\w]*$/i, '') // drop trailing vanity id, e.g. -6580b222b
    .replace(/_+/g, '-');
  return capitalizeWords(cleaned) || null;
}

// Pull a title slug + author out of a LinkedIn permalink.
// Two shapes:
//   /posts/<author>_<post-slug>-activity-<id>[-<hash>]   (text is in the URL)
//   /feed/update/urn:li:activity:<id>                    (no text in the URL)
function readLinkedInPath(segments) {
  const postsIndex = segments.indexOf('posts');
  if (postsIndex === -1) {
    // Profile links, e.g. /in/gaurav-roy — use the person as the context.
    const inIndex = segments.indexOf('in');
    if (inIndex !== -1 && segments[inIndex + 1]) {
      return { author: segments[inIndex + 1], slug: '' };
    }
    return { author: null, slug: '' };
  }

  const combined = segments[postsIndex + 1] || '';
  const underscore = combined.indexOf('_');
  const author = underscore !== -1 ? combined.slice(0, underscore) : null;
  let rest = underscore !== -1 ? combined.slice(underscore + 1) : combined;

  // Strip the trailing "-activity-<id>[-<hash>]" segment.
  const activityMatch = rest.match(/-?activity-\d+(-[\w]+)?$/i);
  if (activityMatch) {
    rest = rest.slice(0, activityMatch.index);
  }

  return { author, slug: rest.replace(/-+$/, '') };
}

export function parseFeedItem(item) {
  const raw = typeof item === 'string' ? { url: item } : item || {};
  const url = (raw.url || '').trim();

  let host = '';
  let segments = [];
  try {
    const parsed = new URL(url);
    host = parsed.hostname.replace(/^www\./, '');
    segments = parsed.pathname.split('/').filter(Boolean);
  } catch {
    // Malformed URL — keep going and render a safe link card.
  }

  const source = detectSource(host);
  let publication = null;
  let derivedSlug = '';

  if (source === 'medium') {
    const { publication: pub, slug } = readMediumPath(segments);
    publication = pub;
    if (slug) derivedSlug = slug;
  } else if (source === 'reddit') {
    const { subreddit, slug } = readRedditPath(segments);
    publication = subreddit ? `r/${subreddit}` : null;
    if (slug) derivedSlug = slug;
  } else if (source === 'linkedin') {
    const { author, slug } = readLinkedInPath(segments);
    publication = humanizeAuthor(author);
    derivedSlug = slug || '';
  } else {
    // Generic web page: the last path segment is our best guess at a slug.
    derivedSlug = segments[segments.length - 1] || '';
  }

  const sourceLabel =
    source === 'medium' ? 'Medium'
    : source === 'reddit' ? 'Reddit'
    : source === 'linkedin' ? 'LinkedIn'
    : host || 'Link';

  // Friendly fallback when the URL carries no usable title (e.g. LinkedIn
  // "urn:li:activity" links or a bare homepage).
  const fallbackTitle =
    source === 'medium' ? 'Medium story'
    : source === 'reddit' ? 'Reddit thread'
    : source === 'linkedin' ? 'LinkedIn post'
    : host || 'External link';

  const title =
    (raw.title && raw.title.trim()) ||
    titleizeSlug(derivedSlug) ||
    publication ||
    fallbackTitle;

  return {
    url: stripTracking(url),
    source, // 'medium' | 'reddit' | 'linkedin' | 'web'
    sourceLabel, // 'Medium' | 'Reddit' | 'LinkedIn' | hostname
    publication, // e.g. 'Write A Catalyst' | 'r/robotics' | null
    title, // headline when derivable, else the friendly fallback
    titleIsPlaceholder: !(
      (raw.title && raw.title.trim()) ||
      titleizeSlug(derivedSlug) ||
      publication
    ),
    note: (raw.note && raw.note.trim()) || '',
    date: (raw.date && raw.date.trim()) || '',
    publishedAt: (raw.publishedAt && raw.publishedAt.trim()) || '',
    likes: typeof raw.likes === 'number' && raw.likes >= 0 ? raw.likes : null,
    thumbnail: (raw.thumbnail && raw.thumbnail.trim()) || '',
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    pinned: Boolean(raw.pinned),
  };
}

// Parse a list of items, floating pinned ones to the top (stable otherwise).
export function parseFeedItems(items = []) {
  const parsed = items.map(parseFeedItem);
  const pinned = parsed.filter((entry) => entry.pinned);
  const rest = parsed.filter((entry) => !entry.pinned);
  return [...pinned, ...rest];
}
