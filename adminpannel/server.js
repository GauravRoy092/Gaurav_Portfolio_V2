#!/usr/bin/env bun
// ==========================================================================
// PORTFOLIO STUDIO — local-only content editor. Never ships to Netlify.
// --------------------------------------------------------------------------
// Run:  bun run studio   → the Studio, at http://127.0.0.1:4321
//       bun run dev      → the portfolio, at localhost:5173 (separate terminal)
//
// Why nobody can ever see this on your live site:
//   • Netlify only uploads `dist/`, and the Studio is not imported by the
//     site — so it simply does not exist in the deployed build.
//   • This process binds to 127.0.0.1 (localhost) only.
//   • Every /api/* call must carry an `x-studio: 1` header, which blocks
//     cross-site requests from any other page in your browser.
//
// What it writes:
//   • src/content/projects.json · posts.json · feed.json
//   • public/images/<projects|blog|feed>/  (uploads, auto-optimized)
//   • adminpannel/.backups/ (a snapshot of the previous file before each write)
//   • adminpannel/.activity.json (a local history of adds / edits / hides)
//
// What it never does: no git, no GitHub, no deploys, nothing sent anywhere.
// Pasting a link makes one outbound request to read that page's public
// title/cover so the card can be filled in — everything else is local.
// ==========================================================================

import path from 'node:path';
import os from 'node:os';
import { mkdir, rename, readdir, unlink } from 'node:fs/promises';
import { parseFeedItem } from '../src/lib/feed.js';

const ROOT = path.resolve(import.meta.dir, '..');
const PUBLIC_DIR = path.join(import.meta.dir, 'public');
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const IMAGES_DIR = path.join(ROOT, 'public', 'images');
const BACKUP_DIR = path.join(import.meta.dir, '.backups');
const ACTIVITY_PATH = path.join(import.meta.dir, '.activity.json');
const HOST = '127.0.0.1';
const PORT = Number(process.env.STUDIO_PORT || 4321);
const MAX_UPLOAD_BYTES = 30 * 1024 * 1024;
const MAX_IMAGE_WIDTH = 1600;
const WEBP_QUALITY = 80;
const BACKUP_KEEP = 30;
const ACTIVITY_KEEP = 300;

const STORES = {
  projects: { file: 'projects.json' },
  posts: { file: 'posts.json' },
  feed: { file: 'feed.json' },
};
const IMAGE_FOLDERS = new Set(['projects', 'blog', 'feed']);

let sharp = null;
try {
  sharp = (await import('sharp')).default;
  console.log('· sharp loaded — uploads will be resized and converted to webp');
} catch {
  console.warn('· sharp not available — uploads will be stored without optimization');
}

// --------------------------------------------------------------------------
// small helpers
// --------------------------------------------------------------------------

const json = (data, status = 200) => Response.json(data, { status });
const fail = (error, status = 400) => json({ ok: false, error }, status);

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';

const relPublic = (abs) =>
  '/' + path.relative(path.join(ROOT, 'public'), abs).split(path.sep).join('/');

const storePath = (name) => path.join(CONTENT_DIR, STORES[name].file);

async function readStore(name) {
  return JSON.parse(await Bun.file(storePath(name)).text());
}

async function run(cmd, args = []) {
  const proc = Bun.spawn([cmd, ...args], { cwd: ROOT, stdout: 'pipe', stderr: 'pipe' });
  const out = await new Response(proc.stdout).text();
  const err = await new Response(proc.stderr).text();
  return { code: await proc.exited, out, err };
}

// fetch with a hard timeout so a slow/hanging remote page never freezes the Studio.
async function fetchWithTimeout(url, options = {}, ms = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
}

const decodeEntities = (text) =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;/gi, "'")
    .replace(/&nbsp;/g, ' ');

// Keep the last N snapshots of each content file so every write is undoable.
async function snapshotStore(name, text) {
  const dir = path.join(BACKUP_DIR, name);
  await mkdir(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  await Bun.write(path.join(dir, `${stamp}.json`), text);
  const files = (await readdir(dir)).filter((file) => file.endsWith('.json')).sort();
  const stale = files.slice(0, Math.max(0, files.length - BACKUP_KEEP));
  for (const file of stale) await unlink(path.join(dir, file)).catch(() => {});
}

// --------------------------------------------------------------------------
// validation
// --------------------------------------------------------------------------

function validateStore(name, items) {
  if (!Array.isArray(items)) return 'Expected a JSON array.';
  for (const item of items) {
    if (name === 'feed') {
      if (typeof item === 'string') {
        if (!item.trim()) return 'Feed links cannot be empty.';
        continue;
      }
      if (!item || typeof item !== 'object') return 'Feed items must be a URL string or an object.';
      if (!String(item.url || '').trim()) return 'Every feed item needs a url.';
      continue;
    }
    if (!item || typeof item !== 'object') return 'Every item must be an object.';
    if (!String(item.title || '').trim()) return 'Every item needs a title.';
    if (name === 'posts' && item.content !== undefined && !Array.isArray(item.content)) {
      return 'Post content must be an array of blocks.';
    }
  }
  return null;
}

// --------------------------------------------------------------------------
// content health (shown on the overview)
// --------------------------------------------------------------------------

const titleOf = (item) =>
  typeof item === 'string' ? item : item?.title || item?.url || item?.slug || '(untitled)';

async function contentHealth(storeData) {
  const issues = [];
  const imageExists = async (src) => {
    if (!src || typeof src !== 'string' || !src.startsWith('/')) return true; // external or empty
    return Bun.file(path.join(ROOT, 'public', src.replace(/^\//, ''))).exists();
  };
  const push = (store, item, problems) => issues.push({ store, title: titleOf(item), problems });

  for (const project of storeData.projects) {
    if (isHidden(project)) continue;
    const problems = [];
    if (!project.image) problems.push('no card thumbnail (a generated cover will be drawn)');
    else if (!(await imageExists(project.image))) problems.push(`thumbnail missing on disk: ${project.image}`);
    if (!project.summary) problems.push('no summary');
    if (!project.bullets?.length) problems.push('no overview bullets');
    if (!project.publishedAt) problems.push('no published date');
    for (const shot of [...(project.gallery || []), ...(project.phases || [])]) {
      if (shot?.src && !(await imageExists(shot.src))) problems.push(`gallery image missing on disk: ${shot.src}`);
      if (shot?.image && !(await imageExists(shot.image))) problems.push(`phase image missing on disk: ${shot.image}`);
    }
    if (problems.length) push('projects', project, problems);
  }

  const slugs = new Set();
  for (const post of storeData.posts) {
    if (isHidden(post)) continue;
    const problems = [];
    if (!post.excerpt) problems.push('no excerpt (cards read better with one)');
    if (!post.thumbnail) problems.push('no thumbnail (a generated cover will be drawn)');
    else if (!(await imageExists(post.thumbnail))) problems.push(`thumbnail missing on disk: ${post.thumbnail}`);
    if (!post.content?.length) problems.push('empty content — the article page would be blank');
    if (!post.publishedAt) problems.push('no published date');
    if (post.slug) {
      if (slugs.has(post.slug)) problems.push(`duplicate slug: ${post.slug}`);
      else slugs.add(post.slug);
    } else problems.push('no slug');
    if (problems.length) push('posts', post, problems);
  }

  for (const entry of storeData.feed) {
    if (isHidden(entry)) continue;
    const url = typeof entry === 'string' ? entry : entry?.url;
    try {
      new URL(url);
    } catch {
      push('feed', entry, [`invalid URL: ${url || '(empty)'}`]);
    }
  }

  return { issues };
}

// --------------------------------------------------------------------------
// activity log — a running history of everything the Studio changed, newest
// first. Stored in adminpannel/.activity.json (inside the gitignored folder).
// --------------------------------------------------------------------------

const itemKey = (item) =>
  typeof item === 'string' ? item : item?.id || item?.slug || item?.url || item?.title || JSON.stringify(item);

const isHidden = (item) => Boolean(item && typeof item === 'object' && item.hidden);

function diffStores(name, before, after) {
  const events = [];
  const beforeMap = new Map(before.map((item) => [itemKey(item), item]));
  const afterMap = new Map(after.map((item) => [itemKey(item), item]));

  for (const [key, item] of afterMap) {
    if (!beforeMap.has(key)) {
      events.push({ action: 'added', store: name, title: titleOf(item) });
      continue;
    }
    const old = beforeMap.get(key);
    if (isHidden(old) !== isHidden(item)) {
      events.push({ action: isHidden(item) ? 'hidden' : 'restored', store: name, title: titleOf(item) });
    } else if (JSON.stringify(old) !== JSON.stringify(item)) {
      events.push({ action: 'edited', store: name, title: titleOf(item) });
    }
  }
  for (const [key, item] of beforeMap) {
    if (!afterMap.has(key)) events.push({ action: 'removed', store: name, title: titleOf(item) });
  }

  return events;
}

async function readActivity() {
  try {
    const log = JSON.parse(await Bun.file(ACTIVITY_PATH).text());
    return Array.isArray(log) ? log : [];
  } catch {
    return [];
  }
}

async function logActivity(events) {
  if (!events.length) return;
  const log = await readActivity();
  const time = new Date().toISOString();
  log.unshift(...events.map((event) => ({ time, ...event })));
  await Bun.write(ACTIVITY_PATH, JSON.stringify(log.slice(0, ACTIVITY_KEEP), null, 2) + '\n');
}

// --------------------------------------------------------------------------
// image uploads (resize → webp + compressed fallback)
// --------------------------------------------------------------------------

async function uniqueBaseName(dir, base) {
  const exts = ['png', 'jpg', 'jpeg', 'webp', 'avif'];
  for (let i = 1; i < 500; i += 1) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    let taken = false;
    for (const ext of exts) {
      if (await Bun.file(path.join(dir, `${candidate}.${ext}`)).exists()) {
        taken = true;
        break;
      }
    }
    if (!taken) return candidate;
  }
  return `${base}-${Date.now()}`;
}

// HEIC/HEIF (iPhone photos) aren't readable by sharp's prebuilt binaries,
// so fall back to macOS `sips` to normalize them to PNG first.
async function prepareBuffer(buf, filename) {
  const detect = async (candidate) => {
    if (!sharp) return null;
    try {
      const meta = await sharp(candidate).metadata();
      return meta.format || null;
    } catch {
      return null;
    }
  };

  const direct = await detect(buf);
  if (direct) return { buffer: buf, format: direct };

  if (process.platform === 'darwin') {
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const inPath = path.join(os.tmpdir(), `studio-${stamp}${path.extname(filename) || '.img'}`);
    const outPath = `${inPath}.png`;
    try {
      await Bun.write(inPath, buf);
      const conv = await run('sips', ['-s', 'format', 'png', inPath, '--out', outPath]);
      if (conv.code === 0 && (await Bun.file(outPath).exists())) {
        const converted = Buffer.from(await Bun.file(outPath).arrayBuffer());
        const format = await detect(converted);
        if (format) return { buffer: converted, format };
      }
    } catch {
      // fall through — the original file is stored untouched below
    } finally {
      await unlink(inPath).catch(() => {});
      await unlink(outPath).catch(() => {});
    }
  }

  return null;
}

// Shared pipeline: resize + webp + compressed fallback into public/images/<folder>.
async function processImageBuffer(buf, originalName, folder, requestedName) {
  const dir = path.join(IMAGES_DIR, folder);
  await mkdir(dir, { recursive: true });
  const base = await uniqueBaseName(dir, slugify(requestedName || originalName || 'image'));
  const prepared = await prepareBuffer(buf, originalName || '');
  if (!prepared) return null;

  const pipeline = sharp(prepared.buffer, { failOn: 'none' })
    .rotate()
    .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true });

  const webpBuf = await pipeline.clone().webp({ quality: WEBP_QUALITY }).toBuffer();
  const webpPath = path.join(dir, `${base}.webp`);
  await Bun.write(webpPath, webpBuf);

  const fallbackExt = prepared.format === 'png' ? 'png' : prepared.format === 'gif' ? 'png' : 'jpg';
  const fallbackBuf =
    fallbackExt === 'png'
      ? await pipeline.clone().png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer()
      : await pipeline.clone().jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  const fallbackPath = path.join(dir, `${base}.${fallbackExt}`);
  await Bun.write(fallbackPath, fallbackBuf);

  const finalMeta = await sharp(webpBuf).metadata();
  return {
    path: relPublic(fallbackPath), // content files point here; <picture> swaps in the webp
    webp: relPublic(webpPath),
    originalBytes: buf.length,
    webpBytes: webpBuf.length,
    fallbackBytes: fallbackBuf.length,
    width: finalMeta.width,
    height: finalMeta.height,
    warning: prepared.format === 'gif' ? 'Animated GIFs are stored as a static frame.' : undefined,
  };
}

async function handleUpload(req, url) {
  const folder = url.searchParams.get('kind') || 'projects';
  if (!IMAGE_FOLDERS.has(folder)) return fail('Unknown upload target.');

  const form = await req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return fail('No file was uploaded.');
  if (file.size === 0) return fail('The uploaded file is empty.');
  if (file.size > MAX_UPLOAD_BYTES) return fail('Image is larger than 30 MB.');

  const requested = url.searchParams.get('name') || file.name.replace(/\.[^.]+$/, '');
  const original = Buffer.from(await file.arrayBuffer());
  const processed = await processImageBuffer(original, file.name, folder, requested);

  if (!processed) {
    // Never lose the file: store it untouched when it can't be processed.
    const dir = path.join(IMAGES_DIR, folder);
    await mkdir(dir, { recursive: true });
    const ext = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] || 'png').toLowerCase();
    const base = await uniqueBaseName(dir, slugify(requested));
    const outPath = path.join(dir, `${base}.${ext}`);
    await Bun.write(outPath, original);
    return json({
      ok: true,
      path: relPublic(outPath),
      originalBytes: file.size,
      warning: 'Saved without optimization — this file type could not be processed.',
    });
  }

  return json({ ok: true, ...processed });
}

// Download a remote image (e.g. a link's og:image) and run it through the same optimizer.
async function fetchImage(body) {
  const url = String(body?.url || '').trim();
  if (!/^https?:\/\//i.test(url)) return fail('No image URL provided.');
  const folder = IMAGE_FOLDERS.has(body?.kind) ? body.kind : 'feed';

  let res;
  try {
    res = await fetchWithTimeout(url, { headers: { 'user-agent': 'Mozilla/5.0 (Macintosh) Portfolio-Studio/1.0' } }, 20000);
  } catch {
    return fail('Could not download that image.');
  }
  if (!res.ok) return fail(`The image responded with ${res.status}.`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) return fail('The downloaded image was empty.');
  if (buf.length > MAX_UPLOAD_BYTES) return fail('Image is larger than 30 MB.');

  const processed = await processImageBuffer(buf, 'fetched-image', folder, body?.name || 'link-cover');
  if (!processed) return fail('That image format could not be processed.');
  return json({ ok: true, ...processed });
}

// Fetch a page's real title/description/og:image so a pasted link becomes a proper card.
async function fetchLink(body) {
  const url = String(body?.url || '').trim();
  if (!/^https?:\/\//i.test(url)) return fail('Enter a full http(s) URL.');

  // Reddit post permalinks serve clean JSON at <url>.json — far more reliable
  // than its HTML for reading the title and preview image.
  let host = '';
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return fail('That link is not a valid URL.');
  }
  if (/(^|\.)reddit\.com$/i.test(host)) {
    try {
      const jsonUrl = `${url.replace(/\/+$/, '').replace(/\?.*$/, '')}.json`;
      const rres = await fetchWithTimeout(jsonUrl, { headers: { 'user-agent': 'Mozilla/5.0 (Macintosh) Portfolio-Studio/1.0' } }, 15000);
      if (rres.ok) {
        const data = await rres.json().catch(() => null);
        const post = data?.[0]?.data?.children?.[0]?.data;
        if (post?.title) {
          const preview = post.preview?.images?.[0]?.source?.url;
          return json({
            ok: true,
            fetched: true,
            title: decodeEntities(String(post.title)),
            description: decodeEntities(String(post.selftext || '').slice(0, 400)),
            imageUrl: preview
              ? decodeEntities(preview)
              : typeof post.thumbnail === 'string' && /^https?:\/\//i.test(post.thumbnail)
                ? post.thumbnail
                : '',
          });
        }
      }
    } catch {
      // fall through to the normal HTML fetch
    }
  }

  let res;
  try {
    res = await fetchWithTimeout(url, { headers: { 'user-agent': 'Mozilla/5.0 (Macintosh) Portfolio-Studio/1.0' } }, 15000);
  } catch {
    return json({
      ok: true,
      fetched: false,
      error: 'Could not reach that page (some sites block automated requests — the URL-derived title still works).',
    });
  }
  if (!res.ok) return json({ ok: true, fetched: false, error: `The page responded with ${res.status}.` });
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return json({ ok: true, fetched: false, error: 'That URL is not an HTML page.' });

  const html = (await res.text()).slice(0, 400000);

  // Short links (lnkd.in, etc.) redirect to the real post — judge the LinkedIn
  // structured-data branch by where we landed, not where we started.
  let finalHost = host;
  try {
    finalHost = new URL(res.url || url).hostname.toLowerCase();
  } catch {
    // keep the original host
  }

  // LinkedIn post pages carry a schema.org SocialMediaPosting block with the
  // real headline, the full post text, cover image, and publish date. The og
  // tags only expose hashtags, so prefer the structured data when present.
  if (/(^|\.)linkedin\.com$/i.test(finalHost)) {
    const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const script of scripts) {
      let node = null;
      try {
        const data = JSON.parse(script[1]);
        node = Array.isArray(data) ? data.find((entry) => entry?.['@type'] === 'SocialMediaPosting') : data;
      } catch {
        continue;
      }
      if (!node || node['@type'] !== 'SocialMediaPosting') continue;
      const title = decodeEntities(String(node.headline || '').trim());
      const text = decodeEntities(String(node.articleBody || '').trim());
      const imageUrl = typeof node.image?.url === 'string' ? decodeEntities(node.image.url) : '';
      const publishedAt = String(node.datePublished || '').slice(0, 10);
      if (!title && !text) continue;
      return json({ ok: true, fetched: true, title, description: text, imageUrl, publishedAt });
    }
    // No structured data found — fall through to the generic og parsing below.
  }

  const pick = (patterns) => {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return decodeEntities(match[1].trim());
    }
    return '';
  };

  let imageUrl = pick([
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ]);
  if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
    try {
      imageUrl = new URL(imageUrl, url).toString();
    } catch {
      imageUrl = '';
    }
  }

  const title = pick([
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]);
  const description = pick([
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i,
    /<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
  ]);

  // Some sites answer with a bare brand name ("Reddit", "LinkedIn") instead of
  // real preview data. A card titled "Reddit" is worse than the URL-derived title.
  const generic = new Set(['reddit', 'linkedin', 'medium', 'sign in to linkedin', 'linkedin login']);
  if (!imageUrl && !description && generic.has(title.trim().toLowerCase())) {
    return json({
      ok: true,
      fetched: false,
      error: 'That site did not share any preview details — the card will use the link itself.',
    });
  }

  return json({ ok: true, fetched: true, title, description, imageUrl });
}

// --------------------------------------------------------------------------
// static files + api routes
// --------------------------------------------------------------------------

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

async function serveStatic(pathname) {
  const clean = pathname === '/' ? '/index.html' : pathname;
  const target = path.join(PUBLIC_DIR, path.normalize(clean));
  if (!target.startsWith(PUBLIC_DIR)) return new Response('Forbidden', { status: 403 });
  const file = Bun.file(target);
  if (!(await file.exists())) return new Response('Not found', { status: 404 });
  return new Response(file, {
    headers: {
      'content-type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream',
      'cache-control': 'no-store',
    },
  });
}

async function bootstrap() {
  const [projects, posts, feed] = await Promise.all([
    readStore('projects'),
    readStore('posts'),
    readStore('feed'),
  ]);
  const derivedFeed = feed.map((item) => {
    const parsed = parseFeedItem(item);
    return { title: parsed.title, sourceLabel: parsed.sourceLabel, isPlaceholder: parsed.titleIsPlaceholder };
  });
  const content = { projects, posts, feed };
  const health = await contentHealth(content);
  return json({ ok: true, content, derivedFeed, health, root: ROOT, port: PORT });
}

async function saveStore(name, items) {
  const error = validateStore(name, items);
  if (error) return fail(error);

  const filePath = storePath(name);
  const previous = await Bun.file(filePath).text();
  await snapshotStore(name, previous);

  const text = JSON.stringify(items, null, 2) + '\n';
  const tmpPath = `${filePath}.tmp`;
  await Bun.write(tmpPath, text);
  await rename(tmpPath, filePath);

  let before = [];
  try {
    const parsed = JSON.parse(previous);
    if (Array.isArray(parsed)) before = parsed;
  } catch {
    before = [];
  }
  await logActivity(diffStores(name, before, items));

  return json({ ok: true, saved: STORES[name].file, items: items.length });
}

Bun.serve({
  hostname: HOST,
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const route = url.pathname;

    try {
      if (route.startsWith('/api/')) {
        if (req.headers.get('x-studio') !== '1') return fail('Missing studio header.', 403);

        if (route === '/api/bootstrap' && req.method === 'GET') return await bootstrap();

        if (route === '/api/activity' && req.method === 'GET') {
          return json({ ok: true, events: await readActivity() });
        }

        if (route === '/api/resolve-link' && req.method === 'POST') {
          const body = await req.json().catch(() => ({}));
          const parsed = parseFeedItem(String(body.url || ''));
          return json({ ok: true, parsed });
        }

        if (route === '/api/fetch-link' && req.method === 'POST') {
          const body = await req.json().catch(() => ({}));
          return await fetchLink(body);
        }

        if (route === '/api/fetch-image' && req.method === 'POST') {
          const body = await req.json().catch(() => ({}));
          return await fetchImage(body);
        }

        if (route === '/api/upload' && req.method === 'POST') return await handleUpload(req, url);

        if (route.startsWith('/api/content/') && req.method === 'PUT') {
          const name = route.split('/')[3];
          if (!STORES[name]) return fail('Unknown content store.', 404);
          const body = await req.json().catch(() => null);
          return await saveStore(name, body?.items);
        }

        return fail('Unknown API route.', 404);
      }

      return await serveStatic(route);
    } catch (err) {
      console.error(err);
      return fail(err?.message || 'Internal error', 500);
    }
  },
});

const studioUrl = `http://${HOST}:${PORT}`;
console.log(`\n  Portfolio Studio — local only, never deployed`);
console.log(`  → ${studioUrl}\n  (Ctrl+C to stop)\n`);

if (process.platform === 'darwin' && !process.argv.includes('--no-open')) {
  try {
    Bun.spawn(['open', studioUrl], { stdout: 'ignore', stderr: 'ignore' });
  } catch {
    // opening the browser is a convenience, not a requirement
  }
}
