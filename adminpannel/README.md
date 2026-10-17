# Portfolio Studio (`adminpannel/`)

Your **local-only** content editor for the portfolio. It edits the JSON files
the site reads (`src/content/*.json`) and optimizes uploaded images. That is
all it does — **it never touches git or GitHub**. You commit and push yourself
when you are ready.

> **Nobody can see this on your live site.** The Studio is backed up in this
> repo for safekeeping, but it is never deployed — Netlify only uploads `dist/`,
> and the site never imports anything from here anyway, so the Studio physically
> does not exist in the deployed build. Your backups and activity log stay on
> this computer. The server also binds to `127.0.0.1` (localhost) only. No login
> needed, because there is nothing to log into remotely.

## Running it

```bash
bun run dev        # the portfolio, at localhost:5173
bun run studio     # the Studio, at http://127.0.0.1:4321
```

Run them in two terminals — both stay open while you work. Your browser opens
the Studio automatically (`--no-open` to skip).

## The workflow

1. Edit or add content in the Studio.
2. Your local site window hot-reloads immediately, so you see the change.
3. Happy with it? Commit + push yourself — GitHub Desktop, or:

   ```bash
   git add -A && git commit -m "content update" && git push
   ```

   Netlify rebuilds the live site in about a minute. `git add -A` also backs up
   the Studio, but Netlify only deploys `dist/` — the live site stays
   portfolio-only, and a Studio-only change skips the rebuild (`netlify.toml`).

## Quick add — “ChatGPT type”

The first item in the sidebar is a one-box composer, made for fast use:

1. **Type a title** (or paste a link URL).
2. **+ Image** if you want a thumbnail — it is resized and converted to webp
   automatically when you press Add.
3. Pick **Case study / Blog post / Link**.
4. Press **Add** — the item is written into the site files immediately, as
   published, and your local site shows it right away. (Every item gets an
   “Open editor” button in case you want to flesh it out.)

## Paste a post link (LinkedIn · Medium · Reddit)

Below the composer there is a second box just for links. Paste a LinkedIn,
Medium, or Reddit post URL, press **Add link** (or Enter), and the Studio:

- reads the page’s real **title** and description (Reddit is read through its
  clean `.json` view, and public LinkedIn posts through their schema.org data
  — both far more reliable than plain HTML),
- downloads the **cover image** if there is one and optimizes it like any
  other upload,
- saves it as a card in **Links**.

When a site refuses to share preview details (non-public or login-walled
posts), the card is still added — it just uses the link itself and you can set
a title and image in the editor. Nothing is ever posted or sent anywhere; the
only network request is the one reading the page you pasted.

## LinkedIn type — your own posts

The **LinkedIn type** screen (second item in the sidebar) is built around your
own LinkedIn posts. Paste a public post link and press **Read post** — the
Studio reads its real headline, cover image, and full text, then asks where it
should go:

- **Link only** — a card in **Links** (the “Signals I’m reading” feed) with
  the real title and cover.
- **Add to Blog** — a **card on /blog** that opens the original post in a new
  tab — clicking the card goes straight to LinkedIn, never to an in-between
  article page (even the internal /blog/… URL forwards there). Behind the card
  it is stored as a normal blog post: your headline as the title, the post
  text line-by-line as paragraphs, the cover as the thumbnail, and the
  hashtags as tags. A first line that just repeats the headline is skipped.
- **Add to Case study** — a case study: the cover as the card thumbnail, the
  opening paragraph as the summary, the post’s lines as its overview bullets,
  and the hashtags as tech tags.

Any blog post can also be pointed at an external URL from its editor (the
**External URL** field) — its card then opens that link in a new tab too, and
clearing the field brings back the normal article page.

Nothing is saved until you choose a destination, and each choice leaves an
**Open editor** button behind. The same title → image → Add composer as the
ChatGPT type screen sits right below, so you can file anything else while you
are there. If LinkedIn refuses to share a post (private or deleted), the
Studio says so and you can still save it as Link only.

## Finding and checking content

- **Search + filters** sit above every list — search by title, domain, slug,
  URL, or tags, and show published, draft, or hidden items only.
- The **Overview** page runs a content-health check on every load: missing
  thumbnails, empty excerpts, duplicate slugs, missing dates, and image files
  that don’t exist on disk are all listed there.

## Activity — history, hiding, and restoring

The **Activity** panel (sidebar) is the record of everything:

- **Recent activity** — a running log of every add, edit, hide, and restore
  with the time, so you can see what changed and when.
- **Everything you have made** — every case study, blog post, and link in one
  place, including drafts and hidden items, with **Open editor** / **Hide** /
  **Restore** on each one.

**Nothing in the Studio is ever deleted.** The **Hide** button marks an item
`"hidden": true` inside the content file — the entry (the code) stays exactly
where it was — and the site skips it completely, everywhere. **Restore** simply
removes the marker. You can also tick **Hidden** inside any item’s editor, and
the *Hidden only* filter in each list shows what is currently hidden.

The log lives in `adminpannel/.activity.json` (kept out of git — purely local).

## Adding links in bulk

- **Bulk paste links** (Links page) — paste one URL per line and get one card
  per URL; titles are derived automatically.
- **Fetch page details** (inside any link) — the Studio downloads the page
  and fills in the real title and description, and finds its cover image.
  One click downloads that cover and turns it into an optimized thumbnail.

## Sections

| Section        | Lands on                                         | Drafts hidden? |
| -------------- | ------------------------------------------------ | -------------- |
| **Case Studies** | `/projects` (cards + full technical report popup) | yes            |
| **Blog Posts**   | `/blog` (field-note cards + article page)          | yes            |
| **Links**        | the “Signals I’m reading” feed                     | yes            |

Each section stores to its own file, so content can never leak onto the wrong
page. Use **Copy** to duplicate an item and **→ Blog post / → Case study** to
move something between the two sections (shared fields carry over).

## Images

Click **Upload image…** and pick anything from anywhere (Downloads, Desktop,
screenshots). The Studio:

- resizes to max **1600px** wide (never enlarges smaller images),
- writes an optimized **`.webp`** plus a compressed fallback (`.png`/`.jpg`),
- tells you exactly how much was saved, e.g. `2.4 MB → webp 185 KB`,
- iPhone HEIC photos are converted automatically (via macOS `sips`).

Files land in `public/images/projects/`, `public/images/blog/`, or
`public/images/feed/` — these are part of the portfolio, so they get committed
with your content.

## Blog formatting

The editor is plain markdown; these lines become the site’s styled blocks:

| You write                    | You get                          |
| ---------------------------- | -------------------------------- |
| `## Heading`                 | section heading                  |
| `- item`                     | bullet list                      |
| `> quote` / `> — Author`     | pull quote with citation         |
| `!! Note title` + next line  | highlighted callout              |
| ` ```bash … ``` `            | code block (any language, or none) |

`**bold**`, `*italics*`, and links pass through exactly as written.
**Show preview** renders your post with the site’s own styling.

## Safety nets

- **Nothing is ever deleted** — Hide marks an item `"hidden": true` and leaves
  the entry in the file; the site skips it until you restore it.
- Every write snapshots the previous file into `adminpannel/.backups/<store>/`
  (last 30 kept), and every change is listed in `adminpannel/.activity.json`.
- The Studio is backed up in this repo, but it can never appear on Netlify —
  Netlify only builds and serves `dist/` (the portfolio). The `.backups/`
  folder and `.activity.json` never leave this computer.
- The server only accepts API calls carrying its own `x-studio: 1` header,
  which blocks other websites in your browser from poking at it.
- Content files are plain JSON in `src/content/` — you can always open them
  (or any git commit) and see exactly what changed.

## Troubleshooting

- **“Mix of sharp” / image warning on upload** — run `bun install` once; if
  sharp still fails, uploads are stored unoptimized rather than failing.
- **Link card saved without a title or cover** — that site blocked the
  automated read (LinkedIn often does). Open the card in the editor and set
  the title/image yourself.
- **Reddit link added without details** — the `.json` read was rate-limited;
  try again in a minute.
- **Port 4321 busy** — run with `STUDIO_PORT=4400 bun run studio`.
- **Studio UI doesn’t open** — check the terminal where it was started; visit
  `http://127.0.0.1:4321` manually.
