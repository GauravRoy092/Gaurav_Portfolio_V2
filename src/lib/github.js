// ==========================================================================
// GITHUB — live repository stats for the compact project cards.
// --------------------------------------------------------------------------
// Star counts are fetched once, then cached in localStorage for 6 hours.
// That keeps the unauthenticated GitHub API (60 requests/hour/IP) well out
// of the danger zone, and a failed fetch simply means the card omits the
// stat instead of showing a wrong number.
// ==========================================================================

import { useEffect, useState } from 'react';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const CACHE_PREFIX = 'gh-stars:';

// Human label for the repo host, so buttons read naturally on any platform
// ("View Code on GitHub", "View Code on GitLab", ...).
export function repoHostLabel(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host === 'github.com') return 'GitHub';
    if (host === 'gitlab.com') return 'GitLab';
    if (host === 'bitbucket.org') return 'Bitbucket';
    return host;
  } catch {
    return 'Repository';
  }
}

// 'https://github.com/owner/repo' → 'owner/repo' (null for non-GitHub URLs).
export function parseGitHubRepo(url) {
  if (!url) return null;
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.replace(/^www\./, '');
    if (host !== 'github.com') return null;
    const [owner, repo] = pathname.split('/').filter(Boolean);
    if (!owner || !repo) return null;
    return `${owner}/${repo.replace(/\.git$/, '')}`;
  } catch {
    return null;
  }
}

const readCache = (repo) => {
  try {
    const raw = window.localStorage.getItem(CACHE_PREFIX + repo);
    if (!raw) return null;
    const { count, at } = JSON.parse(raw);
    if (typeof count !== 'number' || !at || Date.now() - at > CACHE_TTL_MS) return null;
    return count;
  } catch {
    return null;
  }
};

const writeCache = (repo, count) => {
  try {
    window.localStorage.setItem(CACHE_PREFIX + repo, JSON.stringify({ count, at: Date.now() }));
  } catch {
    /* storage unavailable (private mode) — stars just refresh every visit */
  }
};

// Returns the star count for a GitHub repo URL, or null while unknown.
export function useGitHubStars(repoUrl) {
  const repo = parseGitHubRepo(repoUrl);
  const [stars, setStars] = useState(() => (repo ? readCache(repo) : null));

  useEffect(() => {
    if (!repo) {
      setStars(null);
      return undefined;
    }

    const cached = readCache(repo);
    if (cached !== null) {
      setStars(cached);
      return undefined;
    }

    let cancelled = false;
    fetch(`https://api.github.com/repos/${repo}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data.stargazers_count !== 'number') return;
        setStars(data.stargazers_count);
        writeCache(repo, data.stargazers_count);
      })
      .catch(() => {
        /* offline or rate-limited — the card simply omits the stat */
      });

    return () => {
      cancelled = true;
    };
  }, [repo]);

  return stars;
}
