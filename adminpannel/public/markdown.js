// ==========================================================================
// MARKDOWN ⇄ CONTENT BLOCKS
// --------------------------------------------------------------------------
// The Studio's blog editor is a plain markdown textarea. This module converts
// between that markdown and the typed content blocks the site renders
// (documented in src/lib/content.js).
//
//   ## Heading       → { type: 'h2', text }
//   plain text       → { type: 'p', text }
//   - item           → { type: 'ul', items: [...] }
//   ```lang ... ```  → { type: 'code', lang, code }
//   > quote          → { type: 'quote', text }        (cite: '> — Author')
//   !! Title         → { type: 'callout', title, text }
//
// Everything else (bold, italics, links) passes through as plain text, which
// is exactly how the site renders it.
// ==========================================================================

const FENCE_RE = /^```(\S*)\s*$/;
const H2_RE = /^##\s+(.*)$/;
const UL_RE = /^[-*]\s+(.*)$/;
const QUOTE_RE = /^>\s?(.*)$/;
const CITE_RE = /^—\s?(.*)$/;
const CALLOUT_RE = /^!!(\s(.*))?$/;

const isBlockStart = (line) =>
  FENCE_RE.test(line.trim()) ||
  H2_RE.test(line) ||
  UL_RE.test(line) ||
  QUOTE_RE.test(line) ||
  CALLOUT_RE.test(line);

export function markdownToBlocks(markdown) {
  const lines = String(markdown ?? '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let paragraph = [];
  let i = 0;

  const flushParagraph = () => {
    const text = paragraph.join(' ').trim();
    if (text) blocks.push({ type: 'p', text });
    paragraph = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fence = line.trim().match(FENCE_RE);
    if (fence) {
      flushParagraph();
      const lang = fence[1] || '';
      const codeLines = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1; // consume closing fence (or end of text)
      blocks.push({ type: 'code', lang, code: codeLines.join('\n') });
      continue;
    }

    // Blank line ends the current paragraph
    if (line.trim() === '') {
      flushParagraph();
      i += 1;
      continue;
    }

    // Heading
    const heading = line.match(H2_RE);
    if (heading) {
      flushParagraph();
      blocks.push({ type: 'h2', text: heading[1].trim() });
      i += 1;
      continue;
    }

    // Bullet list (consecutive bullet lines form one list)
    if (UL_RE.test(line)) {
      flushParagraph();
      const items = [];
      while (i < lines.length && UL_RE.test(lines[i])) {
        items.push(lines[i].match(UL_RE)[1].trim());
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Quote (a "> — cite" line inside the quote becomes the citation)
    if (QUOTE_RE.test(line)) {
      flushParagraph();
      const quoted = [];
      while (i < lines.length && QUOTE_RE.test(lines[i])) {
        quoted.push(lines[i].match(QUOTE_RE)[1]);
        i += 1;
      }
      const textParts = [];
      let cite = '';
      for (const part of quoted) {
        const citeMatch = part.match(CITE_RE);
        if (citeMatch) cite = citeMatch[1].trim();
        else textParts.push(part.trim());
      }
      const block = { type: 'quote', text: textParts.join(' ').trim() };
      if (cite) block.cite = cite;
      blocks.push(block);
      continue;
    }

    // Callout: "!! Title" (or just "!!") followed by one paragraph
    const callout = line.match(CALLOUT_RE);
    if (callout) {
      flushParagraph();
      const title = (callout[2] || '').trim();
      i += 1;
      const textLines = [];
      while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines[i])) {
        textLines.push(lines[i].trim());
        i += 1;
      }
      const block = { type: 'callout', text: textLines.join(' ').trim() };
      if (title) block.title = title;
      blocks.push(block);
      continue;
    }

    // "\!!" keeps a literal "!!" at the start of a paragraph
    if (line.startsWith('\\!!')) {
      paragraph.push(line.replace(/^\\!!/, '!!'));
      i += 1;
      continue;
    }

    paragraph.push(line.trim());
    i += 1;
  }

  flushParagraph();
  return blocks;
}

export function blocksToMarkdown(blocks) {
  const chunks = [];
  for (const block of blocks || []) {
    switch (block.type) {
      case 'h2':
        if (block.text) chunks.push(`## ${block.text}`);
        break;
      case 'ul':
        if (block.items?.length) chunks.push(block.items.map((item) => `- ${item}`).join('\n'));
        break;
      case 'code':
        chunks.push('```' + (block.lang || '') + '\n' + (block.code || '') + '\n```');
        break;
      case 'quote': {
        let quoted = `> ${block.text || ''}`;
        if (block.cite) quoted += `\n> — ${block.cite}`;
        chunks.push(quoted);
        break;
      }
      case 'callout':
        chunks.push((block.title ? `!! ${block.title}` : '!!') + '\n' + (block.text || ''));
        break;
      case 'p':
      default:
        // Escape paragraphs that would otherwise read as a callout marker.
        if (block.text) chunks.push(/^!!/.test(block.text) ? `\\${block.text}` : block.text);
    }
  }
  return chunks.join('\n\n');
}

// Rough word count (code excluded) → "5 min" style reading time.
export function suggestReadTime(blocks) {
  let words = 0;
  for (const block of blocks || []) {
    if (block.type === 'code') continue;
    if (block.type === 'ul') words += (block.items || []).join(' ').split(/\s+/).filter(Boolean).length;
    else words += String(block.text || '').split(/\s+/).filter(Boolean).length;
  }
  return `${Math.max(1, Math.round(words / 220))} min`;
}

// First paragraph text, trimmed to a sensible excerpt length. Prefers a
// paragraph long enough to read as an excerpt — LinkedIn-style posts often
// open with tiny one-line stubs ("1. DSA") that make poor card text.
export function excerptFromBlocks(blocks, max = 180) {
  const paragraphs = (blocks || []).filter((block) => block.type === 'p' && block.text);
  const chosen = paragraphs.find((block) => block.text.trim().length >= 60) || paragraphs[0];
  if (!chosen) return '';
  const text = chosen.text.trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
