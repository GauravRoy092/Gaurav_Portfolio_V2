// ==========================================================================
// PORTFOLIO STUDIO — local-only admin UI (plain HTML/JS, no build step).
// Talks to adminpannel/server.js over /api/*. Everything it writes lands in
// src/content/*.json and public/images/*, which the site reads directly.
// ==========================================================================

import {
  markdownToBlocks,
  blocksToMarkdown,
  suggestReadTime,
  excerptFromBlocks,
  slugify,
} from './markdown.js';

// --------------------------------------------------------------------------
// tiny helpers
// --------------------------------------------------------------------------

const h = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else if (key === 'value') node.value = value;
    else if (key === 'checked') node.checked = value;
    else node.setAttribute(key, value);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
};

async function api(path, options = {}) {
  const headers = { 'x-studio': '1' };
  if (typeof options.body === 'string') headers['content-type'] = 'application/json';
  const res = await fetch(path, { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok || !data || data.ok === false) {
    const error = new Error(data?.error || `Request failed (${res.status})`);
    error.data = data;
    throw error;
  }
  return data;
}

const toastEl = h('div', { class: 'toast hidden' });
let toastTimer = null;
function toast(message, isError = false) {
  toastEl.textContent = message;
  toastEl.className = `toast${isError ? ' error' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.className = 'toast hidden';
  }, isError ? 7000 : 3000);
}

const fmtBytes = (bytes) => {
  if (typeof bytes !== 'number' || Number.isNaN(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const today = () => new Date().toISOString().slice(0, 10);

const makeId = (prefix, seed) =>
  `${prefix}-${slugify(seed).slice(0, 40) || 'item'}-${Math.random().toString(36).slice(2, 6)}`;

// --------------------------------------------------------------------------
// state
// --------------------------------------------------------------------------

const state = {
  view: 'chat', // chat | linkedin | overview | activity | projects | posts | feed
  content: { projects: [], posts: [], feed: [] },
  derivedFeed: [],
  health: null,
  activity: null, // null = not loaded yet; [] = loaded event list
  editing: null, // { store, index, isNew, item, dirty, md?, slugTouched?, resolved?, fetched?, fetching? }
  search: { projects: '', posts: '', feed: '' },
  filter: { projects: 'all', posts: 'all', feed: 'all' },
  bulkOpen: false,
  bulkText: '',
  chat: { title: '', kind: 'posts', file: null, link: '', sending: false },
  chatLog: [],
  liLog: [], // the LinkedIn type screen keeps its own conversation
};

const STORE_META = {
  projects: {
    label: 'Case Studies',
    noun: 'case study',
    hint: 'These show on /projects as case study cards.',
  },
  posts: {
    label: 'Blog Posts',
    noun: 'blog post',
    hint: 'These show on /blog as field notes.',
  },
  feed: {
    label: 'Links',
    noun: 'link',
    hint: 'These show in the “Signals I’m reading” section.',
  },
};

function markDirty() {
  if (state.editing) state.editing.dirty = true;
}

// --------------------------------------------------------------------------
// boot + top-level render
// --------------------------------------------------------------------------

async function boot() {
  try {
    const data = await api('/api/bootstrap');
    state.content = data.content;
    state.derivedFeed = data.derivedFeed;
    state.health = data.health;
    render();
  } catch (err) {
    document.body.replaceChildren(
      h('main', { class: 'main' },
        h('h2', {}, 'Studio could not start'),
        h('p', {}, err.message),
      ),
    );
  }
}

async function refreshBootstrap() {
  const data = await api('/api/bootstrap');
  state.content = data.content;
  state.derivedFeed = data.derivedFeed;
  state.health = data.health;
  render();
}

function render() {
  document.body.replaceChildren(
    h('div', { class: 'layout' }, sidebar(), h('main', { class: 'main' }, mainView())),
    toastEl,
  );
}

// --------------------------------------------------------------------------
// sidebar
// --------------------------------------------------------------------------

function sidebar() {
  const navItem = (key, label, count) =>
    h('button', {
      class: state.view === key && !state.editing ? 'active' : '',
      onclick: () => {
        state.view = key;
        state.editing = null;
        render();
      },
    },
      h('span', {}, label),
      count != null ? h('span', { class: 'count' }, String(count)) : null,
    );

  return h('aside', { class: 'sidebar' },
    h('div', {},
      h('h1', {}, 'Portfolio Studio'),
      h('div', { class: 'sub' }, 'local only — never deployed'),
    ),
    h('nav', { class: 'nav' },
      navItem('chat', 'ChatGPT type'),
      navItem('linkedin', 'LinkedIn type'),
      navItem('overview', 'Overview'),
      navItem('activity', 'Activity'),
      navItem('projects', 'Case Studies', state.content.projects.length),
      navItem('posts', 'Blog Posts', state.content.posts.length),
      navItem('feed', 'Links', state.content.feed.length),
    ),
    h('div', { class: 'sidebar-footer' },
      h('div', {}, 'Everything here stays on this computer. When you are happy with the local site, commit + push yourself — only the portfolio gets deployed.'),
    ),
  );
}

function mainView() {
  if (state.editing) return editorView();
  switch (state.view) {
    case 'chat':
      return chatView();
    case 'linkedin':
      return linkedinView();
    case 'activity':
      return activityView();
    case 'projects':
    case 'posts':
    case 'feed':
      return listView(state.view);
    default:
      return overviewView();
  }
}

// --------------------------------------------------------------------------
// overview
// --------------------------------------------------------------------------

function healthBox() {
  const health = state.health;
  if (!health) return null;
  const { issues } = health;
  if (!issues.length) {
    return h('div', { class: 'help' },
      h('h3', {}, 'Content health'),
      h('p', { class: 'muted' }, 'No issues found — images, excerpts, and slugs all look good.'),
    );
  }
  return h('div', { class: 'help' },
    h('h3', {}, `Content health — ${issues.length} thing${issues.length === 1 ? '' : 's'} to look at`),
    h('ul', {}, ...issues.map((issue) =>
      h('li', {},
        h('strong', {}, issue.title),
        ` (${(STORE_META[issue.store]?.label || issue.store).toLowerCase()}) — `,
        issue.problems.join('; '),
      ),
    )),
  );
}

function overviewView() {
  const countBy = (list, key) => list.filter((item) => item && typeof item === 'object' && item[key]).length;
  const card = (label, list, hint) => {
    const drafts = countBy(list, 'draft');
    const hiddenCount = countBy(list, 'hidden');
    const bits = [];
    if (drafts) bits.push(`${drafts} draft${drafts === 1 ? '' : 's'}`);
    if (hiddenCount) bits.push(`${hiddenCount} hidden`);
    return h('div', { class: 'card' },
      h('h3', {}, label),
      h('div', { class: 'big' }, `${list.length - drafts - hiddenCount} shown on the site`),
      h('p', {}, bits.length ? `${bits.join(' · ')} — not visible anywhere` : 'everything visible'),
      h('p', {}, hint),
    );
  };

  return h('div', {},
    h('div', { class: 'view-head' }, h('h2', {}, 'Overview')),
    h('p', { class: 'view-sub' }, 'Everything you add or change here writes straight into the site files — the local site updates immediately. Commit and push yourself when you want it live.'),
    h('div', { class: 'cards' },
      card('Case studies', state.content.projects, 'Shown on /projects'),
      card('Blog posts', state.content.posts, 'Shown on /blog'),
      card('Links', state.content.feed, 'Shown in Signals'),
    ),
    healthBox(),
    h('div', { class: 'help' },
      h('h3', {}, 'Daily workflow'),
      h('ol', {},
        h('li', {}, 'Run ', h('code', {}, 'bun run dev'), ' (your site, localhost:5173) and ', h('code', {}, 'bun run studio'), ' (this Studio, 127.0.0.1:4321) — one terminal each.'),
        h('li', {}, 'Add or edit content here. Saving updates the files; your open site window reloads instantly.'),
        h('li', {}, 'When you are happy, commit + push yourself (GitHub Desktop, or ', h('code', {}, 'git push'), ') — Netlify deploys the portfolio only; the Studio folder is ignored by git and never deployed.'),
      ),
    ),
    h('div', { class: 'help' },
      h('h3', {}, 'Blog formatting cheat sheet'),
      h('p', { class: 'muted' }, 'The blog editor takes markdown. These lines become the site’s styled blocks:'),
      h('ul', {},
        h('li', {}, h('code', {}, '## Heading'), ' — section heading'),
        h('li', {}, h('code', {}, '- item'), ' — bullet list'),
        h('li', {}, h('code', {}, '> quote'), ' + ', h('code', {}, '> — Author'), ' — pull quote with citation'),
        h('li', {}, h('code', {}, '!! Note title'), ' then the text on the next line — highlighted callout'),
        h('li', {}, h('code', {}, '```bash'), ' … ', h('code', {}, '```'), ' — code block (any language name, or none)'),
      ),
      h('p', { class: 'muted' }, 'Bold (**text**), italics (*text*), and links pass through exactly as written.'),
    ),
    h('div', { class: 'help' },
      h('h3', {}, 'Images'),
      h('p', { class: 'muted' }, 'Upload from any folder (Downloads works fine). The Studio resizes to max 1600px, writes a .webp plus a compressed fallback, and shows you the size saved. Draft items stay hidden from the site until you untick “Draft”.'),
    ),
    h('div', { class: 'help' },
      h('h3', {}, 'Links — faster ways to add'),
      h('ul', {},
        h('li', {}, 'Paste several URLs at once with ', h('strong', {}, 'Bulk paste links'), ' on the Links page.'),
        h('li', {}, 'Open any link and click ', h('strong', {}, 'Fetch page details'), ' — the Studio pulls the real title, description, and cover image from the page (and can download the cover, optimized, with one click).'),
      ),
    ),
    h('div', { class: 'help' },
      h('h3', {}, 'Your own LinkedIn posts'),
      h('p', { class: 'muted' }, 'The LinkedIn type screen (sidebar) reads a pasted LinkedIn post — the real headline, cover, and full text — then you choose where it goes: Link only, Blog post, or Case study. Nothing is saved until you choose.'),
    ),
  );
}

// --------------------------------------------------------------------------
// chat ("ChatGPT type") — one box: title + image + destination
// --------------------------------------------------------------------------

let chatMsgSeq = 0;

const CHAT_KINDS = [
  { value: 'projects', label: 'Case study' },
  { value: 'posts', label: 'Blog post' },
  { value: 'feed', label: 'Link' },
];

const chatKindFolder = (kind) => (kind === 'posts' ? 'blog' : kind === 'projects' ? 'projects' : 'feed');

function chatMessageEl(msg) {
  if (msg.role === 'user') {
    return h('div', { class: 'msg user' },
      h('p', { class: 'msg-text' }, msg.title),
      h('p', { class: 'msg-meta' },
        `${CHAT_KINDS.find((k) => k.value === msg.kind)?.label || msg.kind}${msg.fileName ? ` · ${msg.fileName} (${fmtBytes(msg.fileSize)})` : ''}`),
    );
  }
  return h('div', { class: 'msg studio', id: `chat-msg-${msg.id}` },
    h('p', { class: 'msg-text' }, msg.text),
    msg.actions?.length
      ? h('div', { class: 'msg-actions' }, ...msg.actions.map((build) => build()))
      : null,
  );
}

// Shared composer row (image + title + destination + Add). It lives on both
// the ChatGPT type screen and the LinkedIn type screen.
function buildComposer(log, inputId) {
  const chat = state.chat;

  const fileInput = h('input', { type: 'file', accept: 'image/*', class: 'hidden-file' });
  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    state.chat.file = file;
    render();
  });

  const attachBtn = h('button', {
    type: 'button',
    class: 'btn',
    title: 'Attach an image — it is resized and converted to webp automatically',
    onclick: () => fileInput.click(),
  }, chat.file ? 'Change image' : '+ Image');

  const kindSelect = h('select', {
    onchange: (e) => {
      state.chat.kind = e.target.value;
      render();
    },
  }, ...CHAT_KINDS.map((kind) => h('option', { value: kind.value }, kind.label)));
  kindSelect.value = chat.kind;

  const sendBtn = h('button', { class: 'btn primary', disabled: chat.sending, onclick: () => chatSend(sendBtn, log, inputId) }, chat.sending ? 'Adding…' : 'Add');

  const input = h('textarea', {
    id: inputId,
    class: 'chat-input',
    rows: 1,
    placeholder: chat.kind === 'feed' ? 'Paste a link URL (https://…)' : 'Type a title…',
    oninput: (e) => {
      state.chat.title = e.target.value;
    },
    onkeydown: (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatSend(sendBtn, log, inputId);
      }
    },
  }, chat.title);

  const chip = chat.file
    ? h('div', { class: 'attach-chip' },
        `${chat.file.name} — ${fmtBytes(chat.file.size)}`,
        h('button', { type: 'button', title: 'Remove', onclick: () => { state.chat.file = null; render(); } }, '✕'),
      )
    : null;

  return [chip, h('div', { class: 'composer-row' }, attachBtn, fileInput, input, kindSelect, sendBtn)];
}

function chatView() {
  const chat = state.chat;

  if (!state.chatLog.length) {
    chatMsgSeq += 1;
    state.chatLog.push({
      id: chatMsgSeq,
      role: 'studio',
      text: 'Type a title, attach an image if you want, pick where it goes, and press Add. It is saved straight into your site files — your local site shows it immediately. Got a LinkedIn, Medium, or Reddit post? Paste it in the link box below (one of your own LinkedIn posts? try the LinkedIn type screen). When you are happy, commit + push yourself — only the portfolio gets deployed.',
    });
  }

  const stream = h('div', { class: 'chat-stream', id: 'chat-stream' }, ...state.chatLog.map(chatMessageEl));

  const linkInput = h('input', {
    id: 'chat-link-input',
    type: 'text',
    placeholder: 'https://www.linkedin.com/… · medium.com/… · reddit.com/…',
    oninput: (e) => {
      state.chat.link = e.target.value;
    },
    onkeydown: (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addLinkFlow(linkBtn);
      }
    },
  }, chat.link);
  const linkBtn = h('button', { class: 'btn primary', disabled: chat.sending, onclick: () => addLinkFlow(linkBtn) }, chat.sending ? 'Adding…' : 'Add link');

  return h('div', { class: 'chat-wrap' },
    h('div', { class: 'view-head' }, h('h2', {}, 'ChatGPT type')),
    h('p', { class: 'view-sub' }, 'Title → image → where it goes → Add. Everything stays on this computer — your local site updates instantly.'),
    stream,
    h('div', { class: 'composer' },
      h('div', { class: 'link-box' },
        h('span', { class: 'field-label' }, 'Paste a post link — LinkedIn · Medium · Reddit'),
        h('div', { class: 'composer-row' }, linkInput, linkBtn),
        h('p', { class: 'hint' }, 'Adds the card to Links and reads the real title + cover from the page when the site allows it.'),
      ),
      ...buildComposer(state.chatLog, 'chat-input'),
    ),
  );
}

async function chatSend(btn, log = state.chatLog, inputId = 'chat-input') {
  const chat = state.chat;
  if (chat.sending) return;
  const title = chat.title.trim();
  const kind = chat.kind;

  if (!title) {
    toast(kind === 'feed' ? 'Paste a link URL first.' : 'Type a title first.', true);
    document.getElementById(inputId)?.focus();
    return;
  }
  if (kind === 'feed' && !/^https?:\/\//i.test(title)) {
    toast('For a Link, paste the full URL (it starts with http).', true);
    return;
  }

  const userMsg = {
    id: (chatMsgSeq += 1),
    role: 'user',
    title,
    kind,
    fileName: chat.file?.name,
    fileSize: chat.file?.size,
  };
  const studioMsg = { id: (chatMsgSeq += 1), role: 'studio', text: 'Adding…' };

  chat.sending = true;
  log.push(userMsg, studioMsg);
  if (log.length > 60) log.splice(0, log.length - 60);
  render();

  try {
    let thumbnail = '';
    let imageNote = '';
    if (chat.file) {
      const res = await uploadImage(chat.file, chatKindFolder(kind), title);
      thumbnail = res.path;
      imageNote = res.warning
        ? ` · ${res.warning}`
        : ` · image: ${fmtBytes(res.originalBytes)} → webp ${fmtBytes(res.webpBytes)}`;
    }

    let value;
    if (kind === 'projects') {
      value = {
        id: makeId('proj', title), title, domain: '', date: '', publishedAt: today(),
        summary: '', image: thumbnail, tech: [], bullets: [], insights: [], gallery: [], phases: [], draft: false,
      };
    } else if (kind === 'posts') {
      const taken = new Set(state.content.posts.map((post) => post.slug).filter(Boolean));
      let slug = slugify(title);
      let n = 2;
      while (taken.has(slug)) slug = `${slugify(title)}-${n++}`;
      value = {
        id: makeId('post', title), slug, title, excerpt: '', date: '', publishedAt: today(),
        readTime: '', tags: [], thumbnail, draft: false, content: [],
      };
    } else {
      value = compactFeedItem({ url: title, thumbnail });
    }

    state.content[kind].unshift(value);
    await putStore(kind);

    studioMsg.text =
      kind === 'posts'
        ? `Saved to Blog posts as “${title}”. It has no body text yet — open the editor to write it.`
        : kind === 'projects'
          ? `Saved to Case studies as “${title}”. Title and image are set — add the summary and insights in the editor when you like.`
          : 'Saved to Links. The card title is derived from the URL automatically.';
    studioMsg.text += imageNote + ' Your local site shows it now.';

    if (kind !== 'feed') {
      const wantedId = value.id;
      studioMsg.actions = [() => h('button', {
        class: 'btn small',
        onclick: () => {
          const index = state.content[kind].findIndex((item) => item && typeof item === 'object' && item.id === wantedId);
          startEdit(kind, index >= 0 ? index : 0);
        },
      }, 'Open editor')];
    }

    chat.title = '';
    chat.file = null;
  } catch (err) {
    studioMsg.text = `Could not save: ${err.message}`;
  }

  state.chat.sending = false;
  await refreshBootstrap();
  if (state.view === 'chat' || state.view === 'linkedin') {
    document.getElementById(inputId)?.focus();
    window.scrollTo(0, document.body.scrollHeight);
  }
}

async function addLinkFlow(btn) {
  const chat = state.chat;
  if (chat.sending) return;
  const url = chat.link.trim();
  if (!/^https?:\/\//i.test(url)) {
    toast('Paste the full post link (it starts with http).', true);
    document.getElementById('chat-link-input')?.focus();
    return;
  }

  const userMsg = { id: (chatMsgSeq += 1), role: 'user', title: url, kind: 'feed' };
  const studioMsg = { id: (chatMsgSeq += 1), role: 'studio', text: 'Reading the link…' };

  chat.sending = true;
  state.chatLog.push(userMsg, studioMsg);
  if (state.chatLog.length > 60) state.chatLog.splice(0, state.chatLog.length - 60);
  render();

  let label = 'Link';
  try {
    const resolved = await api('/api/resolve-link', { method: 'POST', body: JSON.stringify({ url }) });
    label = resolved.parsed?.sourceLabel || label;
  } catch {
    // keep the generic label
  }

  let fetched = { fetched: false };
  try {
    fetched = await api('/api/fetch-link', { method: 'POST', body: JSON.stringify({ url }) });
  } catch {
    fetched = { fetched: false };
  }

  let thumbnail = '';
  let imageNote = '';
  if (fetched.fetched && fetched.imageUrl) {
    try {
      const up = await api('/api/fetch-image', {
        method: 'POST',
        body: JSON.stringify({ url: fetched.imageUrl, kind: 'feed', name: fetched.title || 'link-cover' }),
      });
      thumbnail = up.path;
      imageNote = ` · cover image saved (${fmtBytes(up.originalBytes)} → webp ${fmtBytes(up.webpBytes)})`;
    } catch {
      imageNote = ' · the cover image could not be downloaded';
    }
  }

  try {
    state.content.feed.unshift(compactFeedItem({ url, title: fetched.fetched ? fetched.title : undefined, thumbnail }));
    await putStore('feed');
  } catch (err) {
    studioMsg.text = `Could not save the link: ${err.message}`;
    chat.sending = false;
    render();
    return;
  }

  studioMsg.text = fetched.fetched && fetched.title
    ? `Added to Links: “${fetched.title}” — ${label}. The card is in your feed now.`
    : `Added to Links — ${label}. ${fetched.error || 'The page could not be read, so the card uses the link itself.'}`;
  studioMsg.text += imageNote + ' Your local site shows it now.';

  chat.link = '';
  chat.sending = false;
  await refreshBootstrap();
  if (state.view === 'chat') {
    document.getElementById('chat-link-input')?.focus();
    window.scrollTo(0, document.body.scrollHeight);
  }
}

// --------------------------------------------------------------------------
// linkedin ("LinkedIn type") — paste one of your own posts, then choose where
// it lands: Link only, Blog post, or Case study.
// --------------------------------------------------------------------------

function linkedinView() {
  const chat = state.chat;

  if (!state.liLog.length) {
    chatMsgSeq += 1;
    state.liLog.push({
      id: chatMsgSeq,
      role: 'studio',
      text: 'Paste one of your LinkedIn posts below and press Read post — the Studio reads its real headline, cover, and full text, then asks where it should go: Link only, Blog post, or Case study. Nothing is saved until you choose.',
    });
  }

  const stream = h('div', { class: 'chat-stream', id: 'li-stream' }, ...state.liLog.map(chatMessageEl));

  const linkInput = h('input', {
    id: 'li-link-input',
    type: 'text',
    placeholder: 'https://www.linkedin.com/feed/update/… or linkedin.com/posts/…',
    oninput: (e) => {
      state.chat.link = e.target.value;
    },
    onkeydown: (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        linkedinReadFlow(readBtn);
      }
    },
  }, chat.link);
  const readBtn = h('button', { class: 'btn primary', disabled: chat.sending, onclick: () => linkedinReadFlow(readBtn) }, chat.sending ? 'Reading…' : 'Read post');

  return h('div', { class: 'chat-wrap' },
    h('div', { class: 'view-head' }, h('h2', {}, 'LinkedIn type')),
    h('p', { class: 'view-sub' }, 'Bring your own LinkedIn posts onto the site — Link only, a blog card that opens the post in a new tab, or a case study. Everything stays on this computer.'),
    stream,
    h('div', { class: 'composer' },
      h('div', { class: 'link-box' },
        h('span', { class: 'field-label' }, 'Your LinkedIn post link'),
        h('div', { class: 'composer-row' }, linkInput, readBtn),
        h('p', { class: 'hint' }, 'Public posts share their headline, cover, and full text. If LinkedIn refuses to share one, the Studio says so — you can still save it as Link only.'),
      ),
      ...buildComposer(state.liLog, 'li-input'),
    ),
  );
}

// "Oct 2026"-style label for a YYYY-MM-DD date.
function monthYearLabel(iso) {
  const date = iso ? new Date(`${iso}T00:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Hashtags inside the post text become the item's tags.
function hashtagsFromText(text) {
  const found = String(text || '').match(/#[A-Za-z0-9_]+/g) || [];
  return [...new Set(found.map((tag) => tag.slice(1)))].slice(0, 6);
}

// LinkedIn bodies use single line breaks for structure — make each remaining
// line its own paragraph, and drop a first line that just repeats the title.
function linkedinBodyLines(text, title) {
  const lines = String(text || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const firstSlug = slugify(lines[0] || '');
  if (firstSlug && title && firstSlug === slugify(title)) lines.shift();
  return lines;
}

async function linkedinReadFlow(btn) {
  const chat = state.chat;
  if (chat.sending) return;
  const url = chat.link.trim();
  if (!/^https?:\/\//i.test(url)) {
    toast('Paste your LinkedIn post link first (it starts with http).', true);
    document.getElementById('li-link-input')?.focus();
    return;
  }

  const userMsg = { id: (chatMsgSeq += 1), role: 'user', title: url, kind: 'feed' };
  const studioMsg = { id: (chatMsgSeq += 1), role: 'studio', text: 'Reading your LinkedIn post…' };

  chat.sending = true;
  state.liLog.push(userMsg, studioMsg);
  if (state.liLog.length > 60) state.liLog.splice(0, state.liLog.length - 60);
  render();

  let label = 'LinkedIn';
  try {
    const resolved = await api('/api/resolve-link', { method: 'POST', body: JSON.stringify({ url }) });
    label = resolved.parsed?.sourceLabel || label;
  } catch {
    // keep the generic label
  }

  let fetched = { fetched: false };
  try {
    fetched = await api('/api/fetch-link', { method: 'POST', body: JSON.stringify({ url }) });
  } catch {
    fetched = { fetched: false };
  }

  const text = String(fetched.description || '').trim();
  const firstLine = text.split('\n').map((line) => line.trim()).find(Boolean) || '';
  const title = String(fetched.title || '').trim() || firstLine.slice(0, 90);
  const publishedAt = String(fetched.publishedAt || '').trim();

  let thumbnail = '';
  let imageNote = '';
  if (fetched.fetched && fetched.imageUrl) {
    try {
      const up = await api('/api/fetch-image', {
        method: 'POST',
        body: JSON.stringify({ url: fetched.imageUrl, kind: 'feed', name: title || 'linkedin-post' }),
      });
      thumbnail = up.path;
      imageNote = ` · cover saved (${fmtBytes(up.originalBytes)} → webp ${fmtBytes(up.webpBytes)})`;
    } catch {
      imageNote = ' · the cover image could not be downloaded';
    }
  }

  const readable = Boolean(fetched.fetched && (title || text));
  const bodyLines = linkedinBodyLines(text, title);
  const bodyBlocks = markdownToBlocks(bodyLines.join('\n\n'));

  studioMsg.text = readable
    ? `Found it — “${title}”${publishedAt ? ` · ${publishedAt}` : ''}${imageNote}. Where should it go — Link only, Blog post, or Case study?`
    : `I could not read that ${label} post${fetched.error ? ` (${fetched.error})` : ''}${imageNote}. You can still save it as Link only.`;

  // One action at a time; each button disables itself after it succeeds.
  let busy = false;
  const choice = (key, label, doneLabel, run) => () =>
    h('button', {
      class: 'btn small',
      disabled: Boolean(studioMsg.done?.[key] || busy),
      onclick: async () => {
        busy = true;
        try {
          await run();
          studioMsg.done = { ...(studioMsg.done || {}), [key]: true };
        } catch (err) {
          toast(err.message, true);
        }
        busy = false;
        await refreshBootstrap();
      },
    }, studioMsg.done?.[key] ? doneLabel : label);

  const addOpenButton = (store, id) => {
    studioMsg.actions.push(() => h('button', {
      class: 'btn small',
      onclick: () => {
        const index = state.content[store].findIndex((item) => item && typeof item === 'object' && item.id === id);
        if (index >= 0) startEdit(store, index);
        else toast('That item moved — open the list to find it.', true);
      },
    }, store === 'posts' ? 'Open blog post' : 'Open case study'));
  };

  studioMsg.actions = [
    choice('link', 'Link only', 'Added to Links ✓', async () => {
      state.content.feed.unshift(compactFeedItem({ url, title: readable ? title : undefined, thumbnail }));
      await putStore('feed');
      studioMsg.text = `Added to Links — “${title || url}” is in Signals now.`;
    }),
  ];

  if (readable) {
    studioMsg.actions.push(
      choice('post', 'Add to Blog', 'Added to Blog ✓', async () => {
        const taken = new Set(state.content.posts.map((post) => post.slug).filter(Boolean));
        const base = slugify(title) || 'linkedin-post';
        let slug = base;
        let n = 2;
        while (taken.has(slug)) slug = `${base}-${n++}`;
        const blocks = [
          ...bodyBlocks,
          { type: 'p', text: `*Originally shared on LinkedIn:* ${url}` },
        ];
        const value = {
          id: makeId('post', title),
          slug,
          title,
          excerpt: excerptFromBlocks(bodyBlocks, 200),
          date: monthYearLabel(publishedAt),
          publishedAt: publishedAt || today(),
          readTime: suggestReadTime(blocks),
          tags: hashtagsFromText(text),
          thumbnail,
          externalUrl: url, // the blog card opens the original post in a new tab
          draft: false,
          content: blocks,
        };
        state.content.posts.unshift(value);
        await putStore('posts');
        studioMsg.text = `Added to Blog posts as “${title}” — the card opens the original ${label} post in a new tab. Open the editor to adjust it.`;
        addOpenButton('posts', value.id);
      }),
      choice('project', 'Add to Case study', 'Added to Case study ✓', async () => {
        const bullets = bodyLines
          .filter((line) => !/^(#[A-Za-z0-9_]+\s*)+$/.test(line))
          .slice(0, 16);
        const value = {
          id: makeId('proj', title),
          title,
          domain: 'LinkedIn',
          date: monthYearLabel(publishedAt),
          publishedAt: publishedAt || today(),
          summary: excerptFromBlocks(bodyBlocks, 240),
          image: thumbnail,
          tech: hashtagsFromText(text),
          bullets,
          insights: [],
          gallery: [],
          phases: [],
          draft: false,
        };
        state.content.projects.unshift(value);
        await putStore('projects');
        studioMsg.text = `Added to Case studies as “${title}” — it is on your local site now. Open the editor to add insights and screenshots.`;
        addOpenButton('projects', value.id);
      }),
    );
  }

  chat.link = '';
  chat.sending = false;
  await refreshBootstrap();
  if (state.view === 'linkedin') {
    document.getElementById('li-link-input')?.focus();
    window.scrollTo(0, document.body.scrollHeight);
  }
}

// --------------------------------------------------------------------------
// lists
// --------------------------------------------------------------------------

function visibleItems(storeName) {
  const query = state.search[storeName].trim().toLowerCase();
  const filter = state.filter[storeName];
  return state.content[storeName]
    .map((item, index) => ({ item, index }))
    .filter(({ item, index }) => {
      const isObject = item && typeof item === 'object';
      const hidden = isObject && item.hidden === true;
      if (filter === 'published' && (hidden || (isObject && item.draft))) return false;
      if (filter === 'draft' && (hidden || !(isObject && item.draft))) return false;
      if (filter === 'hidden' && !hidden) return false;
      if (!query) return true;
      if (isObject) {
        const derived = storeName === 'feed' ? state.derivedFeed[index] : null;
        const haystack = [
          item.title,
          item.domain,
          item.slug,
          item.url,
          derived?.title,
          derived?.sourceLabel,
          (item.tags || []).join(' '),
          (item.tech || []).join(' '),
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(query);
      }
      return String(item).toLowerCase().includes(query);
    });
}

function fillRows(storeName, container) {
  const list = visibleItems(storeName);
  if (!list.length) {
    container.replaceChildren(h('p', { class: 'hint' },
      state.content[storeName].length
        ? 'Nothing matches the current search/filter.'
        : `No ${STORE_META[storeName].label.toLowerCase()} yet — use the button above.`));
  } else {
    container.replaceChildren(...list.map(({ item, index }) => rowView(storeName, item, index)));
  }
  const counter = document.getElementById(`count-${storeName}`);
  if (counter) counter.textContent = `${list.length} of ${state.content[storeName].length} shown`;
}

function refreshRows(storeName) {
  const container = document.getElementById(`rows-${storeName}`);
  if (container) fillRows(storeName, container);
}

async function addBulkLinks(btn) {
  const urls = state.bulkText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => /^https?:\/\//i.test(line));
  if (!urls.length) return toast('Paste at least one full http(s) URL (one per line).', true);
  const existing = new Set(state.content.feed.map((item) => (typeof item === 'string' ? item : item?.url)));
  const fresh = urls.filter((url) => !existing.has(url));
  if (!fresh.length) return toast('Those links are already in the feed.');
  btn.disabled = true;
  state.content.feed.unshift(...fresh);
  try {
    await putStore('feed');
    toast(`Added ${fresh.length} link${fresh.length === 1 ? '' : 's'}.`);
    state.bulkText = '';
    state.bulkOpen = false;
  } catch (err) {
    toast(err.message, true);
  }
  await refreshBootstrap();
}

function listView(storeName) {
  const meta = STORE_META[storeName];

  const searchInput = h('input', {
    type: 'text',
    placeholder: `Search ${meta.label.toLowerCase()}…`,
    value: state.search[storeName],
    oninput: (e) => {
      state.search[storeName] = e.target.value;
      refreshRows(storeName);
    },
  });

  const filterSelect = h('select', {
    onchange: (e) => {
      state.filter[storeName] = e.target.value;
      refreshRows(storeName);
    },
  },
    h('option', { value: 'all' }, 'All'),
    h('option', { value: 'published' }, 'Published only'),
    h('option', { value: 'draft' }, 'Drafts only'),
    h('option', { value: 'hidden' }, 'Hidden only'),
  );
  filterSelect.value = state.filter[storeName];

  const rows = h('div', { class: 'rows', id: `rows-${storeName}` });
  fillRows(storeName, rows);

  const children = [
    h('div', { class: 'view-head' },
      h('h2', {}, meta.label),
      h('button', { class: 'btn primary', onclick: () => startNew(storeName) }, `+ New ${meta.noun}`),
    ),
    h('p', { class: 'view-sub' }, meta.hint),
    h('div', { class: 'list-controls' },
      searchInput,
      filterSelect,
      storeName === 'feed'
        ? h('button', {
            class: 'btn small',
            onclick: () => {
              state.bulkOpen = !state.bulkOpen;
              render();
            },
          }, 'Bulk paste links')
        : null,
      h('span', { class: 'hint count-hint', id: `count-${storeName}` },
        `${visibleItems(storeName).length} of ${state.content[storeName].length} shown`),
    ),
  ];

  if (storeName === 'feed' && state.bulkOpen) {
    children.push(
      h('div', { class: 'help' },
        h('h3', {}, 'Bulk paste links'),
        h('p', { class: 'muted' }, 'One URL per line — each becomes a link card. Titles are derived from the URLs; open any row later to fetch the real page title or add your take.'),
        h('textarea', {
          rows: 6,
          placeholder: 'https://…\nhttps://…',
          oninput: (e) => {
            state.bulkText = e.target.value;
          },
        }, state.bulkText),
        h('div', { class: 'actions-bar' },
          h('button', { class: 'btn primary', onclick: (event) => addBulkLinks(event.currentTarget) }, 'Add links'),
          h('button', { class: 'btn', onclick: () => { state.bulkOpen = false; render(); } }, 'Close'),
        ),
      ),
    );
  }

  children.push(rows);
  return h('div', {}, ...children);
}

function rowView(storeName, item, index) {
  const isFeed = storeName === 'feed';
  const derived = isFeed ? state.derivedFeed[index] : null;
  const isObject = item && typeof item === 'object';
  const title = isFeed
    ? (isObject && item.title) || derived?.title || (isObject ? item.url : item) || 'Link'
    : item.title || '(untitled)';

  const badges = [];
  if (isObject) {
    if (item.hidden) badges.push(h('span', { class: 'badge hidden' }, 'hidden'));
    if (item.draft) badges.push(h('span', { class: 'badge draft' }, 'draft'));
    if (item.pinned) badges.push(h('span', { class: 'badge' }, 'pinned'));
    if (item.featured) badges.push(h('span', { class: 'badge featured' }, 'featured'));
  }

  const metaParts = [];
  if (isFeed) {
    const url = isObject ? item.url : item;
    if (derived?.sourceLabel) metaParts.push(derived.sourceLabel);
    if (url) metaParts.push(url);
  } else {
    if (item.domain) metaParts.push(item.domain);
    if (item.date) metaParts.push(item.date);
    if (item.slug) metaParts.push(`/blog/${item.slug}`);
  }

  const actions = h('div', { class: 'row-actions' },
    h('button', { class: 'btn small', onclick: () => startEdit(storeName, index) }, 'Edit'),
    h('button', { class: 'btn small', title: 'Move up', onclick: () => moveItem(storeName, index, -1) }, '↑'),
    h('button', { class: 'btn small', title: 'Move down', onclick: () => moveItem(storeName, index, 1) }, '↓'),
  );
  if (storeName === 'projects' || storeName === 'posts') {
    actions.append(
      h('button', { class: 'btn small', onclick: () => duplicateItem(storeName, index) }, 'Copy'),
      h('button', { class: 'btn small', onclick: () => convertItem(storeName, index) },
        storeName === 'projects' ? '→ Blog post' : '→ Case study'),
    );
  }
  actions.append(h('button', {
    class: 'btn small',
    title: isObject && item.hidden
      ? 'Bring it back — the entry was never deleted, it is only skipped.'
      : 'Hide without deleting — the entry stays in the content file and the site skips it.',
    onclick: () => setHidden(storeName, index, !(isObject && item.hidden)),
  }, isObject && item.hidden ? 'Restore' : 'Hide'));

  return h('div', { class: isObject && item.hidden ? 'row hidden-row' : 'row' },
    h('div', { class: 'row-main' },
      h('p', { class: 'row-title' }, title, ...badges),
      h('p', { class: 'row-meta' }, metaParts.filter(Boolean).join(' · ')),
    ),
    actions,
  );
}

async function putStore(storeName) {
  await api(`/api/content/${storeName}`, {
    method: 'PUT',
    body: JSON.stringify({ items: state.content[storeName] }),
  });
  state.activity = null; // the log just changed — reload it next time Activity is shown
}

async function moveItem(storeName, index, delta) {
  const list = state.content[storeName];
  const target = index + delta;
  if (target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
  try {
    await putStore(storeName);
    toast('Reordered.');
  } catch (err) {
    toast(err.message, true);
  }
  await refreshBootstrap();
}

// Hide = "delete" without deleting: the entry stays in the content file
// (marked "hidden": true) and the site skips it everywhere. Restore removes
// the flag again. Nothing here ever erases content.
async function setHidden(storeName, index, hidden) {
  const list = state.content[storeName];
  const current = list[index];
  if (hidden) {
    if (typeof current === 'string') {
      list[index] = { url: current, hidden: true };
    } else {
      current.hidden = true;
    }
  } else if (current && typeof current === 'object') {
    delete current.hidden;
    // tidy up: a link that was only a URL goes back to being a plain string
    const keys = Object.keys(current);
    if (keys.length === 1 && keys[0] === 'url') list[index] = current.url;
  }

  try {
    await putStore(storeName);
    toast(hidden
      ? 'Hidden — the entry stays in the file, the site skips it now.'
      : 'Restored — it is back on the site.');
  } catch (err) {
    toast(err.message, true);
  }
  await refreshBootstrap();
}

async function duplicateItem(storeName, index) {
  const copy = structuredClone(state.content[storeName][index]);
  copy.title = `${copy.title} (copy)`;
  copy.draft = true;
  copy.id = makeId(storeName === 'projects' ? 'proj' : 'post', copy.title);
  if (storeName === 'posts' && copy.slug) copy.slug = `${copy.slug}-copy`;
  state.content[storeName].splice(index + 1, 0, copy);
  try {
    await putStore(storeName);
    toast('Duplicated as a draft.');
  } catch (err) {
    toast(err.message, true);
  }
  await refreshBootstrap();
}

async function convertItem(storeName, index) {
  const item = state.content[storeName][index];
  const toPosts = storeName === 'projects';
  const question = toPosts
    ? 'Convert this case study into a blog post? Shared fields (title, dates, image, tags) carry over; section-specific fields (insights, phases, scale) are dropped.'
    : 'Convert this blog post into a case study? Shared fields carry over; the formatting blocks become overview bullets.';
  if (!confirm(question)) return;

  if (toPosts) {
    const content = [];
    if (item.bullets?.length) content.push({ type: 'ul', items: item.bullets });
    for (const insight of item.insights || []) {
      if (insight.title) content.push({ type: 'h2', text: insight.title });
      if (insight.description) content.push({ type: 'p', text: insight.description });
    }
    const post = {
      id: makeId('post', item.title),
      slug: slugify(item.title),
      title: item.title,
      excerpt: item.summary || excerptFromBlocks(content),
      date: item.date || '',
      publishedAt: item.publishedAt || '',
      readTime: suggestReadTime(content),
      thumbnail: item.image || '',
      tags: item.tech || [],
      draft: true,
      content,
    };
    if (typeof item.likes === 'number') post.likes = item.likes;
    state.content.projects.splice(index, 1);
    state.content.posts.unshift(post);
  } else {
    const bullets = [];
    for (const block of item.content || []) {
      if (block.type === 'p' && block.text) bullets.push(block.text);
      else if (block.type === 'h2' && block.text) bullets.push(`${block.text}:`);
      else if (block.type === 'ul') bullets.push(...(block.items || []));
    }
    const project = {
      id: makeId('proj', item.title),
      title: item.title,
      domain: '',
      date: item.date || '',
      publishedAt: item.publishedAt || '',
      summary: item.excerpt || '',
      image: item.thumbnail || '',
      tech: item.tags || [],
      bullets,
      insights: [],
      gallery: [],
      phases: [],
      draft: true,
    };
    if (typeof item.likes === 'number') project.likes = item.likes;
    state.content.posts.splice(index, 1);
    state.content.projects.unshift(project);
  }

  try {
    await putStore('projects');
    await putStore('posts');
    toast('Moved to the other section (as a draft).');
  } catch (err) {
    toast(err.message, true);
  }
  await refreshBootstrap();
}

// --------------------------------------------------------------------------
// activity — full history + everything you have made (hide / restore)
// --------------------------------------------------------------------------

async function loadActivity() {
  try {
    const res = await api('/api/activity');
    state.activity = res.events || [];
  } catch {
    state.activity = [];
  }
}

const ACTIVITY_LABELS = {
  added: 'Added',
  edited: 'Edited',
  hidden: 'Hidden',
  restored: 'Restored',
  removed: 'Removed',
};

const activityTime = (iso) => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

function activityRow(storeName, item, index) {
  const isObject = item && typeof item === 'object';
  const isFeed = storeName === 'feed';
  const derived = isFeed ? state.derivedFeed[index] : null;
  const title = isFeed
    ? (isObject && item.title) || derived?.title || (isObject ? item.url : item) || 'Link'
    : (isObject && item.title) || '(untitled)';

  const badges = [];
  if (isObject) {
    if (item.hidden) badges.push(h('span', { class: 'badge hidden' }, 'hidden'));
    if (item.draft) badges.push(h('span', { class: 'badge draft' }, 'draft'));
  }

  const metaParts = [STORE_META[storeName].noun];
  if (isFeed) {
    const url = isObject ? item.url : item;
    if (derived?.sourceLabel) metaParts.push(derived.sourceLabel);
    if (url) metaParts.push(url);
  } else {
    if (item.date) metaParts.push(item.date);
    if (item.publishedAt) metaParts.push(item.publishedAt);
  }

  const actions = h('div', { class: 'row-actions' },
    h('button', { class: 'btn small', onclick: () => startEdit(storeName, index) }, 'Open editor'),
    h('button', {
      class: 'btn small',
      title: isObject && item.hidden
        ? 'Bring it back — the entry was never deleted, it is only skipped.'
        : 'Hide without deleting — the entry stays in the content file and the site skips it.',
      onclick: () => setHidden(storeName, index, !(isObject && item.hidden)),
    }, isObject && item.hidden ? 'Restore' : 'Hide'),
  );

  return h('div', { class: isObject && item.hidden ? 'row hidden-row' : 'row' },
    h('div', { class: 'row-main' },
      h('p', { class: 'row-title' }, title, ...badges),
      h('p', { class: 'row-meta' }, metaParts.filter(Boolean).join(' · ')),
    ),
    actions,
  );
}

function activityView() {
  if (state.activity === null) {
    loadActivity().then(() => {
      if (state.view === 'activity') render();
    });
  }

  const groups = [];
  for (const storeName of ['projects', 'posts', 'feed']) {
    const items = state.content[storeName];
    if (!items.length) continue;
    groups.push(h('div', { class: 'activity-group' },
      h('h4', {}, `${STORE_META[storeName].label} (${items.length})`),
      h('div', { class: 'rows' }, ...items.map((item, index) => activityRow(storeName, item, index))),
    ));
  }

  const events = state.activity;
  const logBox = events === null
    ? h('p', { class: 'muted' }, 'Loading…')
    : events.length
      ? h('div', { class: 'event-list' }, ...events.slice(0, 60).map((event) =>
          h('div', { class: 'event' },
            h('span', { class: 'event-time' }, activityTime(event.time)),
            h('span', { class: `event-action ${event.action}` }, ACTIVITY_LABELS[event.action] || event.action),
            h('span', { class: 'event-title' }, event.title || '(untitled)'),
            h('span', { class: 'event-store' }, STORE_META[event.store]?.label || ''),
          ),
        ))
      : h('p', { class: 'muted' }, 'Nothing yet — every add, edit, hide, and restore shows up here.');

  return h('div', {},
    h('div', { class: 'view-head' }, h('h2', {}, 'Activity')),
    h('p', { class: 'view-sub' }, 'The history of everything you changed, plus every item you have made. Hiding is “delete” without deleting: the entry stays in the content file (marked "hidden": true) and the site skips it completely. Press Restore any time.'),
    h('div', { class: 'help' },
      h('h3', {}, 'Recent activity'),
      logBox,
    ),
    h('div', { class: 'help' },
      h('h3', {}, 'Everything you have made'),
      groups.length ? groups : h('p', { class: 'muted' }, 'Nothing yet — add something from the ChatGPT type screen.'),
    ),
  );
}

// --------------------------------------------------------------------------
// editors — shared pieces
// --------------------------------------------------------------------------

function cancelEdit() {
  if (state.editing?.dirty && !confirm('Discard unsaved changes?')) return;
  state.editing = null;
  render();
}

function editorView() {
  const ed = state.editing;
  const wrap = (title, ...children) =>
    h('div', {},
      h('div', { class: 'breadcrumb' },
        h('button', { onclick: cancelEdit }, `← ${STORE_META[ed.store].label}`),
      ),
      h('h2', {}, title),
      h('hr', { class: 'divider' }),
      ...children,
    );

  if (ed.store === 'projects') return projectEditor(ed, wrap);
  if (ed.store === 'posts') return postEditor(ed, wrap);
  return feedEditor(ed, wrap);
}

function textField(label, value, onChange, opts = {}) {
  const input = h('input', {
    type: opts.type || 'text',
    value: value ?? '',
    placeholder: opts.placeholder || '',
    oninput: (e) => {
      markDirty();
      onChange(e.target.value);
    },
  });
  return h('label', { class: `field${opts.span2 ? ' span-2' : ''}` },
    h('span', { class: 'field-label' }, label),
    opts.trailing ? h('div', { style: 'display:flex; gap:8px; align-items:center;' }, input, opts.trailing) : input,
    opts.hint ? h('span', { class: 'field-hint' }, opts.hint) : null,
  );
}

function textAreaField(label, value, onChange, opts = {}) {
  return h('label', { class: `field${opts.span2 ? ' span-2' : ''}` },
    h('span', { class: 'field-label' }, label),
    h('textarea', {
      class: opts.markdown ? 'markdown' : '',
      rows: opts.rows || 4,
      placeholder: opts.placeholder || '',
      oninput: (e) => {
        markDirty();
        onChange(e.target.value);
      },
    }, value ?? ''),
    opts.hint ? h('span', { class: 'field-hint' }, opts.hint) : null,
  );
}

function checkboxField(label, checked, onChange) {
  return h('label', { class: 'checkbox-line' },
    h('input', {
      type: 'checkbox',
      checked: !!checked,
      onchange: (e) => {
        markDirty();
        onChange(e.target.checked);
      },
    }),
    label,
  );
}

function numberField(label, value, onChange, opts = {}) {
  return textField(label, value ?? '', (v) => {
    const trimmed = v.trim();
    onChange(trimmed === '' ? null : Number(trimmed));
  }, { ...opts, type: 'number' });
}

function tagsField(label, values, onChange, hint) {
  return textField(label, (values || []).join(', '), (v) => {
    onChange(v.split(',').map((s) => s.trim()).filter(Boolean));
  }, { hint });
}

async function uploadImage(file, kind, nameSeed) {
  const formData = new FormData();
  formData.append('file', file);
  const name = encodeURIComponent(slugify(nameSeed || file.name));
  return api(`/api/upload?kind=${kind}&name=${name}`, { method: 'POST', body: formData });
}

const uploadSummary = (res) =>
  res.warning
    ? res.warning
    : `${fmtBytes(res.originalBytes)} → webp ${fmtBytes(res.webpBytes)} · fallback ${fmtBytes(res.fallbackBytes)}`;

function imageField(label, kind, value, onChange, opts = {}) {
  const stats = h('span', { class: 'upload-stats' });
  const preview = h('img', { class: 'img-preview', alt: '', src: value || '' });
  if (!value) preview.style.display = 'none';

  const pathInput = h('input', {
    type: 'text',
    value: value || '',
    placeholder: '/images/…',
    oninput: (e) => {
      markDirty();
      onChange(e.target.value);
      preview.src = e.target.value;
      preview.style.display = e.target.value ? 'block' : 'none';
    },
  });

  const fileInput = h('input', { type: 'file', accept: 'image/*', class: 'hidden-file' });
  const chooseBtn = h('button', { type: 'button', class: 'btn small', onclick: () => fileInput.click() }, 'Upload image…');

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    chooseBtn.disabled = true;
    chooseBtn.textContent = 'Optimizing…';
    stats.textContent = '';
    try {
      const res = await uploadImage(file, kind, opts.nameSeed?.() || file.name);
      pathInput.value = res.path;
      onChange(res.path);
      markDirty();
      preview.src = res.path;
      preview.style.display = 'block';
      stats.textContent = uploadSummary(res);
    } catch (err) {
      toast(err.message, true);
    } finally {
      chooseBtn.disabled = false;
      chooseBtn.textContent = 'Upload image…';
      fileInput.value = '';
    }
  });

  return h('div', { class: 'field' },
    h('span', { class: 'field-label' }, label),
    h('div', { style: 'display:flex; gap:10px; align-items:center; margin-bottom:6px;' },
      chooseBtn,
      h('span', { class: 'img-drop-hint' }, 'max 1600px wide · webp + fallback auto-generated'),
    ),
    pathInput,
    stats,
    preview,
  );
}

function miniImageInput(kind, value, onChange) {
  const fileInput = h('input', { type: 'file', accept: 'image/*', class: 'hidden-file' });
  const btn = h('button', { type: 'button', class: 'btn small', onclick: () => fileInput.click() }, 'Upload');
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;
    btn.disabled = true;
    btn.textContent = '…';
    try {
      const res = await uploadImage(file, kind, file.name);
      input.value = res.path;
      onChange(res.path);
      markDirty();
      toast(uploadSummary(res));
    } catch (err) {
      toast(err.message, true);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Upload';
      fileInput.value = '';
    }
  });
  const input = h('input', {
    type: 'text',
    value: value || '',
    placeholder: '/images/…',
    oninput: (e) => {
      markDirty();
      onChange(e.target.value);
    },
  });
  return h('div', { style: 'display:flex; gap:8px;' }, input, btn);
}

function repeaterField(label, items, buildRow, opts = {}) {
  const list = h('div', { class: 'repeater' });
  const refresh = () => {
    list.replaceChildren(...items.map((item, index) => buildRow(item, index, refresh)));
  };
  refresh();
  const addBtn = h('button', {
    type: 'button',
    class: 'btn small',
    onclick: () => {
      markDirty();
      items.push(opts.newItem ? opts.newItem() : {});
      refresh();
    },
  }, opts.addLabel || '+ Add');
  return h('div', { class: 'field' },
    h('span', { class: 'field-label' }, label),
    list,
    addBtn,
  );
}

function removeBtn(onClick) {
  return h('button', { type: 'button', class: 'btn small danger', onclick: onClick }, 'Remove');
}

function editorButtons(ed) {
  return h('div', { class: 'actions-bar' },
    h('button', { class: 'btn primary', onclick: () => saveEditor(ed) }, 'Save'),
    h('button', { class: 'btn', onclick: cancelEdit }, 'Cancel'),
    h('span', { class: 'hint' }, 'Saving writes the file instantly — your local site picks it up right away.'),
  );
}

// --------------------------------------------------------------------------
// editor — case studies
// --------------------------------------------------------------------------

function projectEditor(ed, wrap) {
  const item = ed.item;
  if (!item.insights) item.insights = [];
  if (!item.gallery) item.gallery = [];
  if (!item.phases) item.phases = [];
  if (!item.bullets) item.bullets = [];
  const nameSeed = () => item.title || 'case-study';

  const insights = repeaterField('Key insights (popup → Key Insights tab)', item.insights,
    (row, index, refresh) => h('div', { class: 'repeater-row' },
      textField('Title', row.title, (v) => { row.title = v; }),
      textAreaField('Description', row.description, (v) => { row.description = v; }, { rows: 2 }),
      removeBtn(() => { markDirty(); item.insights.splice(index, 1); refresh(); }),
    ),
    { addLabel: '+ Add insight', newItem: () => ({ title: '', description: '' }) });

  const gallery = repeaterField('Gallery images (popup → Visualizations tab)', item.gallery,
    (row, index, refresh) => h('div', { class: 'repeater-row' },
      h('label', { class: 'field' },
        h('span', { class: 'field-label' }, 'Image'),
        miniImageInput('projects', row.src, (v) => { row.src = v; }),
      ),
      textField('Title', row.title, (v) => { row.title = v; }),
      textAreaField('Caption', row.caption, (v) => { row.caption = v; }, { rows: 2 }),
      removeBtn(() => { markDirty(); item.gallery.splice(index, 1); refresh(); }),
    ),
    { addLabel: '+ Add image', newItem: () => ({ src: '', title: '', caption: '' }) });

  const phases = repeaterField('Methodology phases (popup → Methodology tab)', item.phases,
    (row, index, refresh) => h('div', { class: 'repeater-row' },
      h('div', { class: 'form-grid' },
        textField('Phase label', row.phase, (v) => { row.phase = v; }, { placeholder: 'Phase 1' }),
        textField('Title', row.title, (v) => { row.title = v; }),
      ),
      textAreaField('Description', row.description, (v) => { row.description = v; }, { rows: 2 }),
      h('label', { class: 'field' },
        h('span', { class: 'field-label' }, 'Optional screenshot'),
        miniImageInput('projects', row.image, (v) => { row.image = v; }),
      ),
      removeBtn(() => { markDirty(); item.phases.splice(index, 1); refresh(); }),
    ),
    { addLabel: '+ Add phase', newItem: () => ({ phase: '', title: '', description: '' }) });

  return wrap(ed.isNew ? 'New case study' : 'Edit case study',
    h('div', { class: 'form-grid' },
      textField('Title *', item.title, (v) => { item.title = v; }, { span2: true }),
      textField('Domain (the card’s “channel” line)', item.domain, (v) => { item.domain = v; }, { placeholder: 'Consumer Finance & Credit Risk' }),
      textField('Date label', item.date, (v) => { item.date = v; }, { placeholder: 'Sept 2026' }),
      textField('Published date (optional)', item.publishedAt, (v) => { item.publishedAt = v; }, { type: 'date' }),
      textField('Scale chip', item.scale, (v) => { item.scale = v; }, { placeholder: '2.26M+ Loan Records' }),
      numberField('Likes (blank = live GitHub stars)', item.likes, (v) => { item.likes = v ?? undefined; if (v == null) delete item.likes; }),
      textField('GitHub URL', item.githubUrl, (v) => { item.githubUrl = v; }),
      tagsField('Tech tags (comma separated)', item.tech, (v) => { item.tech = v; }),
    ),
    imageField('Card thumbnail (16:9 works best)', 'projects', item.image, (v) => { item.image = v; }, { nameSeed }),
    textAreaField('Summary (top of the popup)', item.summary, (v) => { item.summary = v; }, { rows: 3 }),
    checkboxField('Featured — adds the ✦ Flagship badge', item.featured, (v) => { item.featured = v; }),
    checkboxField('Draft — keep hidden from the live site', item.draft, (v) => { item.draft = v; }),
    checkboxField('Hidden — keep it out of the site completely (the entry stays in the file; restore from Activity)', item.hidden, (v) => { if (v) item.hidden = true; else delete item.hidden; }),
    textAreaField('Overview bullets (one per line)', item.bullets.join('\n'),
      (v) => { item.bullets = v.split('\n').map((s) => s.trim()).filter(Boolean); },
      { rows: 6, hint: 'Shown in the popup’s Overview tab. Code files reference these as plain lines.' }),
    insights,
    gallery,
    phases,
    editorButtons(ed),
  );
}

// --------------------------------------------------------------------------
// editor — blog posts
// --------------------------------------------------------------------------

function postEditor(ed, wrap) {
  const item = ed.item;
  if (!item.tags) item.tags = [];
  if (typeof ed.md !== 'string') ed.md = blocksToMarkdown(item.content);
  const nameSeed = () => item.slug || item.title || 'post';

  const slugInput = textField('Slug (the URL: /blog/…)', item.slug, (v) => {
    item.slug = v;
    ed.slugTouched = true;
  });

  // When set, the card on /blog opens this URL in a new tab and the internal
  // article page forwards to it — used for posts brought over from LinkedIn.
  const externalField = textField('External URL', item.externalUrl, (v) => {
    const next = v.trim();
    if (next) item.externalUrl = next;
    else delete item.externalUrl;
  }, { placeholder: 'https://… (blank = normal article page)' });

  const titleField = textField('Title *', item.title, (v) => {
    item.title = v;
    if (!ed.slugTouched) {
      item.slug = slugify(v);
      const input = slugInput.querySelector('input');
      if (input) input.value = item.slug;
    }
  }, { span2: true });

  // ---- markdown + preview ----
  const previewEl = h('div', { class: 'preview' });
  previewEl.style.display = 'none';
  let previewVisible = false;

  const renderPreview = () => {
    const blocks = markdownToBlocks(ed.md || '');
    previewEl.replaceChildren(
      h('h3', { class: 'pv-title' }, item.title || 'Untitled'),
      item.excerpt ? h('p', { class: 'pv-excerpt' }, item.excerpt) : null,
      ...blocks.map((block) => {
        switch (block.type) {
          case 'h2':
            return h('h3', { class: 'pv-h2' }, block.text);
          case 'ul':
            return h('ul', {}, ...(block.items || []).map((line) => h('li', {}, line)));
          case 'code':
            return h('pre', {}, block.code);
          case 'quote':
            return h('blockquote', {}, block.text, block.cite ? h('div', {}, `— ${block.cite}`) : null);
          case 'callout':
            return h('div', { class: 'pv-callout' },
              block.title ? h('span', { class: 'pv-callout-title' }, block.title) : null,
              block.text,
            );
          default:
            return h('p', {}, block.text);
        }
      }),
    );
  };

  const previewBtn = h('button', {
    type: 'button',
    class: 'btn small',
    onclick: () => {
      previewVisible = !previewVisible;
      if (previewVisible) renderPreview();
      previewEl.style.display = previewVisible ? 'block' : 'none';
      previewBtn.textContent = previewVisible ? 'Hide preview' : 'Show preview';
    },
  }, 'Show preview');

  const mdField = textAreaField('Content (markdown)', ed.md, (v) => {
    ed.md = v;
  }, { markdown: true, rows: 22, hint: 'Cheat sheet on the Overview page. Bold/italics/links pass through as written.' });
  mdField.querySelector('textarea').addEventListener('input', () => {
    if (previewVisible) renderPreview();
  });

  const readTimeField = textField('Read time', item.readTime, (v) => { item.readTime = v; }, {
    placeholder: '6 min',
    trailing: h('button', {
      type: 'button',
      class: 'btn small',
      onclick: () => {
        item.readTime = suggestReadTime(markdownToBlocks(ed.md || ''));
        const input = readTimeField.querySelector('input');
        if (input) input.value = item.readTime;
        markDirty();
      },
    }, 'Suggest'),
  });

  return wrap(ed.isNew ? 'New blog post' : 'Edit blog post',
    h('div', { class: 'form-grid' },
      titleField,
      slugInput,
      externalField,
      textField('Date label', item.date, (v) => { item.date = v; }, { placeholder: 'Oct 2026' }),
      textField('Published date (optional)', item.publishedAt, (v) => { item.publishedAt = v; }, { type: 'date' }),
      readTimeField,
      numberField('Likes (optional)', item.likes, (v) => { item.likes = v ?? undefined; if (v == null) delete item.likes; }),
      tagsField('Tags (comma separated)', item.tags, (v) => { item.tags = v; }),
      textAreaField('Excerpt (card preview text)', item.excerpt, (v) => { item.excerpt = v; }, { rows: 2, span2: true, hint: 'Left blank? It is filled from the first paragraph on save.' }),
    ),
    imageField('Card thumbnail', 'blog', item.thumbnail, (v) => { item.thumbnail = v; }, { nameSeed }),
    checkboxField('Featured — adds a prominent flag on the card', item.featured, (v) => { item.featured = v; }),
    checkboxField('Draft — keep hidden from the live site', item.draft, (v) => { item.draft = v; }),
    checkboxField('Hidden — keep it out of the site completely (the entry stays in the file; restore from Activity)', item.hidden, (v) => { if (v) item.hidden = true; else delete item.hidden; }),
    h('div', { class: 'field' },
      h('span', { class: 'field-label' }, 'Body'),
      h('div', { style: 'display:flex; gap:8px; align-items:center; margin-bottom:8px;' }, previewBtn),
      mdField,
    ),
    previewEl,
    editorButtons(ed),
  );
}

// --------------------------------------------------------------------------
// editor — links
// --------------------------------------------------------------------------

function feedEditor(ed, wrap) {
  const item = ed.item;
  if (!item.tags) item.tags = [];

  const derivedLine = h('p', { class: 'hint' });
  const showDerived = () => {
    const parsed = ed.resolved;
    if (!parsed) {
      derivedLine.textContent = ed.item.url ? 'Click “Check link” or leave the field to preview the derived title.' : '';
      return;
    }
    derivedLine.textContent = parsed.titleIsPlaceholder
      ? `Source detected: ${parsed.sourceLabel} — this URL carries no title, so add one below for a good card.`
      : `Derived from the link: “${parsed.title}” — ${parsed.sourceLabel}.`;
  };

  const resolve = async () => {
    const url = String(item.url || '').trim();
    if (!url) return;
    try {
      const res = await api('/api/resolve-link', { method: 'POST', body: JSON.stringify({ url }) });
      ed.resolved = res.parsed;
      showDerived();
    } catch (err) {
      toast(err.message, true);
    }
  };

  const fetchDetails = async () => {
    const url = String(item.url || '').trim();
    if (!url) return toast('Paste a URL first.', true);
    ed.fetching = true;
    render();
    try {
      const res = await api('/api/fetch-link', { method: 'POST', body: JSON.stringify({ url }) });
      ed.fetched = res;
      if (res.fetched && res.title && !String(item.title || '').trim()) {
        item.title = res.title;
        markDirty();
      }
    } catch (err) {
      ed.fetched = { fetched: false, error: err.message };
    }
    ed.fetching = false;
    render();
  };

  const useFetchedImage = async (btn) => {
    const imageUrl = ed.fetched?.imageUrl;
    if (!imageUrl) return;
    btn.disabled = true;
    btn.textContent = 'Downloading…';
    try {
      const res = await api('/api/fetch-image', {
        method: 'POST',
        body: JSON.stringify({ url: imageUrl, kind: 'feed', name: item.title || item.url || 'link-cover' }),
      });
      item.thumbnail = res.path;
      markDirty();
      toast(uploadSummary(res));
    } catch (err) {
      toast(err.message, true);
    }
    render();
  };

  const fetchedBox = () => {
    const f = ed.fetched;
    if (!f) return null;
    if (!f.fetched) {
      return h('div', { class: 'fetched-box' },
        h('p', { class: 'muted' }, f.error || 'Could not fetch that page.'),
      );
    }
    return h('div', { class: 'fetched-box' },
      h('p', {}, h('strong', {}, 'Fetched from the page:'), ` ${f.title || '(no title found)'}`),
      f.description ? h('p', { class: 'muted' }, f.description.slice(0, 220)) : null,
      f.imageUrl
        ? h('div', {},
            h('img', { src: f.imageUrl, alt: '' }),
            h('button', { class: 'btn small', onclick: (event) => useFetchedImage(event.currentTarget) }, 'Use as thumbnail (optimized on download)'),
          )
        : h('p', { class: 'muted' }, 'No cover image found on that page — you can still upload one below.'),
    );
  };

  const urlField = textField('URL *', item.url, (v) => {
    item.url = v;
    ed.resolved = null;
    ed.fetched = null;
    showDerived();
  }, {
    span2: true,
    trailing: h('div', { style: 'display:flex; gap:8px;' },
      h('button', { type: 'button', class: 'btn small', onclick: resolve }, 'Check link'),
      h('button', {
        type: 'button',
        class: 'btn small',
        onclick: fetchDetails,
      }, ed.fetching ? 'Fetching…' : 'Fetch page details'),
    ),
  });
  urlField.querySelector('input').addEventListener('blur', () => {
    if (!ed.resolved) resolve();
  });

  return wrap(ed.isNew ? 'New link' : 'Edit link',
    h('div', { class: 'form-grid' },
      urlField,
    ),
    derivedLine,
    fetchedBox(),
    h('div', { class: 'form-grid' },
      textField('Title (optional — overrides the derived one)', item.title, (v) => { item.title = v; }, { span2: true, placeholder: 'Leave blank to use the title from the link' }),
      textAreaField('Your take (one line shown on the card)', item.note, (v) => { item.note = v; }, { rows: 2, span2: true }),
      textField('Date label', item.date, (v) => { item.date = v; }, { placeholder: 'Sept 2026' }),
      textField('Published date (optional)', item.publishedAt, (v) => { item.publishedAt = v; }, { type: 'date' }),
      numberField('Likes (optional)', item.likes, (v) => { item.likes = v ?? undefined; if (v == null) delete item.likes; }),
      tagsField('Tags (comma separated)', item.tags, (v) => { item.tags = v; }),
    ),
    imageField('Card thumbnail (optional)', 'feed', item.thumbnail, (v) => { item.thumbnail = v; }),
    checkboxField('Pinned — floats to the top of the feed', item.pinned, (v) => { item.pinned = v; }),
    checkboxField('Draft — keep hidden from the live site', item.draft, (v) => { item.draft = v; }),
    checkboxField('Hidden — keep it out of the site completely (the entry stays in the file; restore from Activity)', item.hidden, (v) => { if (v) item.hidden = true; else delete item.hidden; }),
    editorButtons(ed),
  );
}

// --------------------------------------------------------------------------
// creating / saving
// --------------------------------------------------------------------------

function startNew(storeName) {
  let item;
  if (storeName === 'projects') {
    item = {
      id: '', title: '', domain: '', date: '', publishedAt: today(), tech: [],
      summary: '', image: '', bullets: [], insights: [], gallery: [], phases: [], draft: true,
    };
  } else if (storeName === 'posts') {
    item = {
      id: '', slug: '', title: '', excerpt: '', date: '', publishedAt: today(),
      readTime: '', tags: [], thumbnail: '', draft: true, content: [],
    };
  } else {
    item = { url: '', title: '', note: '', date: '', publishedAt: '', likes: null, tags: [], thumbnail: '', pinned: false, draft: false };
  }
  state.editing = { store: storeName, index: -1, isNew: true, item, dirty: false, md: '', slugTouched: false, resolved: null };
  render();
}

function startEdit(storeName, index) {
  let item = structuredClone(state.content[storeName][index]);
  if (storeName === 'feed' && typeof item === 'string') item = { url: item };
  state.editing = {
    store: storeName,
    index,
    isNew: false,
    item,
    dirty: false,
    md: storeName === 'posts' ? blocksToMarkdown(item.content) : '',
    slugTouched: true,
    resolved: null,
  };
  render();
}

function compactFeedItem(item) {
  const clean = {};
  for (const [key, value] of Object.entries(item)) {
    if (value == null || value === '' || value === false) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    clean[key] = value;
  }
  const keys = Object.keys(clean);
  if (keys.length === 1 && keys[0] === 'url') return clean.url; // store plain strings for bare links
  return clean;
}

function finalizePost(ed) {
  const item = ed.item;
  item.content = markdownToBlocks(ed.md || '');
  if (!item.slug) item.slug = slugify(item.title);
  const taken = new Set(
    state.content.posts
      .map((post, index) => (ed.isNew || index !== ed.index ? post.slug : null))
      .filter(Boolean),
  );
  let slug = item.slug;
  let n = 2;
  while (taken.has(slug)) slug = `${item.slug}-${n++}`;
  item.slug = slug;
  if (!item.excerpt) item.excerpt = excerptFromBlocks(item.content);
  if (!item.readTime) item.readTime = suggestReadTime(item.content);
  if (!item.id) item.id = makeId('post', item.slug);
}

async function saveEditor(ed) {
  const storeName = ed.store;
  const list = state.content[storeName];

  if (storeName === 'projects' && !String(ed.item.title || '').trim()) return toast('Give the case study a title first.', true);
  if (storeName === 'posts' && !String(ed.item.title || '').trim()) return toast('Give the blog post a title first.', true);
  if (storeName === 'feed' && !String(ed.item.url || '').trim()) return toast('Paste a URL first.', true);

  if (storeName === 'projects' && !ed.item.id) ed.item.id = makeId('proj', ed.item.title);
  if (storeName === 'posts') finalizePost(ed);

  const value = storeName === 'feed' ? compactFeedItem(ed.item) : ed.item;
  if (ed.isNew) list.unshift(value);
  else list[ed.index] = value;

  try {
    await putStore(storeName);
    toast('Saved — your local site reflects it now.');
    state.editing = null;
  } catch (err) {
    toast(err.message, true);
  }
  await refreshBootstrap();
}

// --------------------------------------------------------------------------
// keyboard: ⌘S / Ctrl+S saves the open editor
// --------------------------------------------------------------------------

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault();
    if (state.editing) saveEditor(state.editing);
  }
});

boot();
