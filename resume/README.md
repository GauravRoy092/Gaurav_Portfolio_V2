# Resume — Gaurav Roy, Data Analyst (Google-targeted)

One-page LaTeX resume generated from the portfolio's own data. Nothing here
is invented: every line traces back to `src/data/resume.js` or
`src/content/projects.json`.

## Files

| File | Purpose |
|---|---|
| `main.tex` | The complete resume. This is the only file you need. |
| `README.md` | This guide. |

---

## 1. Getting it onto Overleaf (2 minutes)

1. Go to **overleaf.com** → **New Project** → **Blank Project**.
2. Overleaf opens `main.tex`. Select everything in it (`Cmd+A`) and delete it.
3. Open `resume/main.tex` from this repo, copy everything, paste it into
   Overleaf.
4. Top-right: click **Recompile** (the compiler is pdfLaTeX by default —
   don't change it).
5. The status bar must read **1 / 1** pages. Download the PDF and rename it
   `Gaurav_Roy_Data_Analyst.pdf` before sending.

No other files, packages, or uploads are required.

**If it shows 2 / 2 pages**, work down the trim ladder in section 3.

---

## 2. Enable-when-built checklist

`main.tex` ships with two future projects scaffolded as LaTeX comments —
they are invisible in the compiled PDF and safe to leave as-is. When each
item is done, make the matching edits:

| # | When this is done | Edit `main.tex` |
|---|---|---|
| 1 | You publish an **A/B test study** | Uncomment the `PROJECT 02` block (~9 lines). Then in the **Skills** section, append `, A/B Testing & Experimentation` to the end of the `Data Techniques` line. |
| 2 | You publish a **Looker Studio dashboard** | Uncomment the `PROJECT 03` block. Then add `, Looker Studio` after `Power BI` in the `Languages & Tools` line. |
| 3 | You're confident with **CTEs and window functions** in SQL | In `Languages & Tools`, change `SQL (joins, aggregations, segmentation)` to `SQL (joins, aggregations, CTEs, window functions, segmentation)`. |
| 4 | Your transcript shows **Probability & Statistics** | Uncomment the `Coursework:` line in the Education section. |

To uncomment: delete the leading `%` character on each line, nothing else.
Placeholders like `[Experiment Name]`, `[Dataset/Theme]`, `[N]`, and
`[key KPIs]` must be replaced with real values first.

---

## 3. One-page trim ladder

Apply steps in order; stop as soon as it compiles to 1 page. Each step is
one small edit, no restructuring.

1. Delete the 3rd bullet of the GreyOrange block (the "Partner with
   cross-functional engineering pods…" bullet).
2. Delete the 2nd bullet of the EIL block (the Jira/documentation bullet).
3. Shorten the summary to its first two sentences.
4. Change `bottom=0.30in` to `bottom=0.25in` in the geometry line.

If it's still over after all four, tell the generator to regenerate with a
tighter bullet budget rather than hand-shrinking fonts.

---

## 4. Google data-analyst keyword self-audit

Google screens for these tokens. Each one is already placed in the file,
except the last two (enable via section 2).

| Keyword | Where it lives |
|---|---|
| SQL | Title line, Skills, both project and DotPe bullets |
| Python / Pandas | Title line, Summary, Skills, project tech line |
| Power BI | Title line, Skills, DotPe bullet |
| Excel | Title line, Skills (`Advanced Excel`) |
| Dashboards / Dashboarding | Summary, Skills, DotPe bullet, placeholder Project 03 |
| EDA / Exploratory Data Analysis | Skills |
| Data Cleaning & Validation | Skills, EIL bullets |
| Segmentation / Cohort Analysis | Skills, project bullet |
| KPI Reporting | Skills, GreyOrange bullet |
| Statistics | Education coursework line — **enable only if true** (section 2, item 4) |
| A/B Testing / Experimentation | Project 02 placeholder (section 2, item 1) |
| Looker Studio | Project 03 placeholder (section 2, item 2) |

---

## 5. Verify-before-send flags

Four places in `main.tex` carry a `NOTE` or `VERIFY` comment. Read them
once before you send this anywhere:

1. **Job-title subtitles.** `Robotics Engineer — Telemetry Analytics` and
   `Business Operations Associate — Data & Reporting` use a display-only
   focus label after the dash. It is not the official title. If a recruiter
   or background check cares, delete the `\textemdash{} ...` part of those
   `\entry` lines — the bullets still carry the analytics story.
2. **Statistics coursework.** Commented out. Uncomment only if the course
   is genuinely on your transcript.
3. **A/B placeholder wording.** Deliberately generic; never describe a
   test you didn't run.
4. **Icon links.** The contact line shows `[icon] Portfolio` / `[icon]
   GitHub` / `[icon] LinkedIn` instead of raw URLs (icons come from the
   `fontawesome5` package). The words keep ATS keyword matching safe, but
   if an application portal explicitly asks for the URL text, replace the
   label inside each `\href{...}{...}` with the full address — the link
   itself never changes.

---

## 6. Source of truth & regeneration

The portfolio is the single source of truth:

- `src/data/resume.js` — contact info, summary, skills, experience, education, certifications
- `src/content/projects.json` — project content

When you update either (new job, new project, new cert), ask the agent to
**regenerate `resume/main.tex`** with the same instruction used to create
it, and it will re-apply the retargeted Google framing automatically.
Don't hand-edit both in parallel.

---

## 7. Notes

- This folder is plain text and has zero effect on the Vite build or the
  Netlify deploy.
- If you'd rather not push resume files to GitHub, add `resume/` to
  `.gitignore` at the repo root.
- There is no LaTeX compiler installed on this Mac. Overleaf is the source
  of truth for the 1-page check.
