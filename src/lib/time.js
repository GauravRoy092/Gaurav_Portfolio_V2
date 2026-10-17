// ==========================================================================
// TIME UTILITIES — "3 days ago" style relative timestamps for media cards.
// --------------------------------------------------------------------------
// Cards prefer a real ISO date (`publishedAt: '2026-10-05'`) so they can
// render a YouTube-style relative age. When a card only carries the authored
// month label (`date: 'Sept 2026'`), that label is shown exactly as written
// instead of guessing a day.
// ==========================================================================

const DAY_MS = 24 * 60 * 60 * 1000;

const plural = (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'} ago`;

// '2026-10-05' → '1 month ago' (or '' when unparseable).
export function formatRelativeTime(value) {
  if (!value) return '';
  const then = new Date(value);
  if (Number.isNaN(then.getTime())) return '';

  const days = Math.floor((Date.now() - then.getTime()) / DAY_MS);

  if (days <= 0) return 'today';
  if (days < 7) return plural(days, 'day');
  if (days < 30) return plural(Math.floor(days / 7), 'week');
  if (days < 365) return plural(Math.floor(days / 30.44), 'month');
  return plural(Math.floor(days / 365.25), 'year');
}

// Best available age label for a card: relative when an ISO date exists,
// otherwise the authored label (e.g. 'Sept 2026') unchanged.
export function formatCardTime(item) {
  if (!item) return '';
  if (item.publishedAt) {
    const relative = formatRelativeTime(item.publishedAt);
    if (relative) return relative;
  }
  return item.date || '';
}
