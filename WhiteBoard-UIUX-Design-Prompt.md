# White Board — Frontend & UI/UX Design Prompt

### A Detailed Visual & Interaction Design Brief for AI Design Tools (Google Stitch, Figma AI, or a Frontend Design Agent)

---

## How to Use This Document

This brief is written so it can be fed section-by-section into Google Stitch (or a similar AI UI generator), or handed to a frontend/UI-UX design agent as a standalone spec. It defines the brand's visual identity once, then breaks it into role-specific design systems, screen-by-screen prompts, and the writing/microcopy rules that keep the whole product feeling like one coherent thing rather than four different apps stitched together.

---

## 1. Brand Identity Recap (Ground Every Design Decision in This)

- **Name:** White Board
- **Motto:** *Ask. Learn. Become.*
- **Core metaphor:** A blank white board — the surface where a question turns into an idea, and an idea turns into understanding. This should show up as **openness, unfinished/in-progress visual cues, and a sense that the interface is a space for thinking**, not as literal chalkboard or classroom textures.
- **Personality:** intelligent, optimistic, inclusive, modern, trustworthy, academic without being institutional or intimidating.
- **What to avoid:** graduation caps, apples, chalk textures, stock photos of classrooms, generic "EdTech blue," anything that reads as corporate LMS software.

The product serves four very different audiences (learners, parents, institutions, scholarship partners) under one brand. The design challenge is **one visual language, four distinct moods** — like a single publication with different sections, not four unrelated products.

---

## 2. Design Plan (Token System)

### 2.1 Color

Avoid the generic AI-generated defaults (warm cream + terracotta, near-black + acid accent, or the identical-rounded-card SaaS kit). White Board's palette should feel like **a well-used notebook, not a corporate dashboard**: warm neutral paper tones as the base, with a confident ink-blue as the anchor color, and marker-bright accents used sparingly and meaningfully — never decoratively.

**Base palette (named, 6 core hex values):**

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F7F5F0` | Primary background — warm, slightly textured paper tone, not stark white |
| `ink` | `#1C2033` | Primary text — deep ink-navy, not pure black |
| `board-blue` | `#2A4B7C` | Primary brand anchor — a confident, slightly desaturated blue reminiscent of ink/marker, used for primary actions and identity moments |
| `chalk-grey` | `#8B8D98` | Secondary text, metadata, disabled states |
| `line` | `#E4E1D8` | Borders, dividers — warm-toned, not cool grey |
| `signal` | `#C4472A` | Single alert/urgent accent (deadlines, errors) — a burnt-clay red, used very sparingly |

**Role-specific accent extensions** (layered on top of the base, never replacing it):

| Role | Accent | Hex | Feeling |
|---|---|---|---|
| Learner | `spark-coral` | `#E8674A` | energetic, encouraging |
| Learner | `grow-green` | `#3F8F6E` | progress, mastery |
| Parent | `calm-teal` | `#3E6F71` | steady, reassuring |
| Institution | `slate-blue` | `#4A5578` | structured, operational |
| Scholarship | `trust-gold` | `#B08B3F` | credibility, opportunity |

### 2.2 Type

- **Display/Headline face:** A humanist sans with real character — **Fraunces** (a serif with warmth and a slightly editorial feel) for large moments: hero headlines, the "Ask. Learn. Become." motto treatment, empty-state headlines. This gives White Board an academic-but-not-stiff voice that a generic grotesque sans wouldn't.
- **UI/body face:** **Inter** or **Public Sans** for all interface text, form labels, body copy, and data — legible at small sizes on low-end Android screens, neutral enough not to compete with the display face.
- **Two families only.** Do not introduce a third face for "special" moments — vary weight and size instead.
- **Type scale:** Follow a modular scale (1.25 ratio) rather than arbitrary pixel jumps — e.g., 14 / 16 / 20 / 25 / 31 / 39 / 49px. Line length capped under 80 characters for body text; serif headline text gets slightly more line-height than the sans body.
- Avoid tracked-out all-caps labels, single-word bold/italic accents inside headlines, and unnecessary "eyebrow" labels above every section — these read as generated-template tells, not intentional design.

### 2.3 Layout

- **Alignment:** Left-aligned content as the default (this is a working, reading-heavy product) — reserve center alignment for singular moments (empty states, the motto, onboarding).
- **Grid:** 12-column responsive grid on desktop/institution views; single-column, card-stacked layout on mobile learner/parent views.
- **Structural devices used meaningfully, not decoratively:**
  - Numbered steps only where content is genuinely sequential (e.g., the scholarship application workflow — Draft → Submitted → Under Review → Decision)
  - Dividers/hairlines to separate distinct data categories on dense dashboards (institution/admin), not on every card
  - Progress bars as an actual data visualization (subject mastery, application status), not a decorative motif repeated everywhere

**ASCII layout concepts:**

Learner dashboard (mobile-first, card-stacked):
```
┌─────────────────────────────┐
│  Good morning, Amina  ☀      │
│  "What will you learn today?"│
├─────────────────────────────┤
│  ▓▓▓▓▓▓▓▓░░  Math · CBC      │
│  ▓▓▓▓▓░░░░░  English         │
├─────────────────────────────┤
│  Next: Live Class 4:00pm     │
│  [Join Session]              │
├─────────────────────────────┤
│  Practice Quiz Ready →        │
├─────────────────────────────┤
│  🏅 3-day streak              │
└─────────────────────────────┘
  [Home] [Learn] [Classes] [Me]
```

Parent dashboard (desktop, sidebar + content):
```
┌───────┬─────────────────────────────────┐
│ Side  │  Overview — 3 children           │
│ bar   ├─────────────────────────────────┤
│       │  Amina        Juma       Kwame   │
│ Home  │  Math 82%     Eng 70%    Math 91%│
│ Kids  │  ──────────────────────────────  │
│ Sched │  Upcoming: Live class, Tue 4pm    │
│ Bill  │  ──────────────────────────────  │
│       │  Scholarship match found →        │
└───────┴─────────────────────────────────┘
```

Institution dashboard (desktop, data-forward):
```
┌───────┬───────────────────────────────────────┐
│ Side  │  Riverside Academy — 214 learners       │
│ bar   ├──────────────┬──────────────┬──────────┤
│       │  Active       │  Avg. mastery│ Sessions │
│ Prog. │  learners: 214│  74%         │ this wk 12│
│ Educ. ├──────────────┴──────────────┴──────────┤
│ Learn │  [ Learner roster table ]                │
│ Rpt.  │  Name | Curriculum | Progress | Last active│
└───────┴───────────────────────────────────────┘
```

### 2.4 Principles (What Makes This Distinct)

1. **The blank space is intentional** — generous white/paper space signals "room to think," not empty template padding.
2. **One bold move per screen** — the Fraunces headline, a single motion moment, or one accent color used at full saturation. Everything else stays quiet.
3. **Data is drawn, not decorated** — progress bars, mastery rings, and status chips are real visualizations tied to real numbers, never ambient decoration.
4. **Motion answers action** — a card expands when tapped, a progress ring fills when a quiz is scored. No scroll-triggered fade-ins on every section.

---

## 3. Review Against the Brief (Self-Critique Before Building)

- ❌ Generic default would be: cream background + terracotta accent + serif display — **too close to a templated "warm educational" cliché.** Revised: paper-neutral base + ink-blue anchor + sparing marker accents, which ties directly to the "whiteboard/notebook" metaphor instead of a generic warm palette.
- ❌ Generic default would be: identical rounded SaaS cards with the same soft grey shadow everywhere. Revised: cards are used for learner content (where warmth helps), but institution/admin views use table + hairline-divider structures instead of cards, since that data is comparative, not exploratory.
- ❌ Generic default would be: ALL-CAPS eyebrow labels above every dashboard section. Revised: section labels are set in regular-case Inter, medium weight, no tracking — quieter, more editorial.

---

## 4. Role-Specific Design Directives

### 4.1 Learner Interface
- **Mood:** playful, encouraging, momentum-driven
- **Navigation:** bottom tab bar (mobile-first) — Home, Learn, Classes, Me
- **Signature moment:** a mastery ring or streak animation that fills/celebrates on quiz completion — this is the one "bold move" reserved for this surface
- **Empty state example:** "No quiz yet — upload a worksheet and White Board will make you one to practice with." (invitation to act, not an apology)

### 4.2 Parent Dashboard
- **Mood:** calm, clear, reassuring
- **Navigation:** left sidebar (desktop), collapsible drawer (mobile)
- **Signature moment:** a single, clear multi-child comparison view — restrained use of color, one glance tells the parent what needs attention
- **Empty state example:** "Add your first child's profile to start tracking their learning."

### 4.3 Institution Dashboard
- **Mood:** professional, operational, data-forward
- **Navigation:** left sidebar with clear information hierarchy; tables over cards for roster/report data
- **Signature moment:** a clean cohort-progress chart — legible at a glance for a busy administrator
- **Empty state example:** "No learners enrolled yet — invite your first class to get started."

### 4.4 Scholarship & Opportunity Hub
- **Mood:** credible, transparent, hopeful
- **Navigation:** filterable directory (facet sidebar + card grid), consistent status chip system (Draft / Submitted / Under Review / Shortlisted / Approved / Declined / Awarded)
- **Signature moment:** a clear, honest deadline indicator (color shifts from `chalk-grey` → `signal` as a deadline approaches) — never manipulative urgency, just clarity
- **Empty state example:** "No opportunities match your filters yet — try widening your search."

---

## 5. Component & Interaction Guidelines

- **Buttons:** name the action, not the mechanism — "Save changes," "Join class," "Submit application" — never "Submit" alone or "Click here"
- **Focus states:** visible keyboard focus ring on every interactive element (2px, `board-blue`, offset) — required for accessibility, not optional polish
- **Motion:** one orchestrated entrance per screen at most; interaction feedback (button press, toggle, quiz submission) should be immediate and physical-feeling, not decorative
- **Forms:** inline validation with plain-language errors ("Enter a valid email address," not "Invalid input: field 2")
- **Loading states:** skeleton screens that mirror final layout — never a generic spinner on data-heavy institution views
- **Responsive behavior:** design mobile-first for learner/parent surfaces (majority access via mid-range Android); institution/admin surfaces can assume desktop as primary but must degrade gracefully to tablet

---

## 6. Writing & Microcopy Rules

- Write from the user's perspective in plain language — a parent "adds a child's profile," not "creates a learner entity"
- Active voice, consistent vocabulary through a whole flow: if a button says "Publish," the confirmation says "Published," not "Success!"
- Errors state what happened and how to fix it, in the interface's voice — never apologetic, never vague
- Empty states are invitations to act, not apologies for having nothing to show
- No filler, no exclamation-heavy "encouraging" tone in the parent/institution surfaces — save warmth and encouragement for the learner surface specifically

---

## 7. Ready-to-Use Prompts for Google Stitch

**Learner Dashboard (mobile)**
> "Design a mobile learner dashboard for an education app called White Board, motto 'Ask. Learn. Become.' Warm paper-white background (#F7F5F0), deep ink-blue (#2A4B7C) primary accent, coral (#E8674A) and green (#3F8F6E) used sparingly for progress indicators. Card-stacked layout: greeting header, subject progress bars, an upcoming live class card with a join button, a practice quiz prompt, and a streak badge. Rounded cards (12px radius), soft warm shadows, Fraunces serif for the greeting headline, Inter for body and labels. Bottom tab navigation: Home, Learn, Classes, Me. Playful but not childish."

**Parent Dashboard (desktop)**
> "Design a calm desktop parent dashboard for an education platform called White Board. Warm paper-neutral background, ink-navy text, single deep teal accent (#3E6F71), left sidebar navigation. Main content shows progress summaries for three children side by side, an upcoming schedule item, and a scholarship match notification. Minimal card use — prefer clean data rows with hairline dividers. Fraunces serif for section headline, Inter for all data and labels. Calm, reassuring, information-dense but uncluttered."

**Institution Dashboard (desktop)**
> "Design a professional institution admin dashboard for an education platform called White Board. Left sidebar navigation, top summary stats row (active learners, average mastery, sessions this week), and a learner roster table below with columns for name, curriculum, progress, and last active. Slate-blue accent (#4A5578), warm neutral background, hairline table dividers instead of card shadows. Inter throughout for a structured, operational feel. No decorative illustration — data-forward and precise."

**Scholarship & Opportunity Hub**
> "Design a scholarship discovery page for an education platform called White Board. Trustworthy, transparent mood. Left filter sidebar (education level, region, field of study, deadline) and a card grid of opportunities, each with a status chip and deadline indicator that shifts from grey to a warm clay-red as deadlines approach. Gold accent (#B08B3F) for credibility cues like verified badges. Warm paper background, ink-navy text, Fraunces serif for the page headline, Inter for card content."

---

## 8. Quality Floor Checklist (Before Any Screen Ships)

- [ ] Responsive down to a 360px-wide mobile viewport
- [ ] Visible keyboard focus states on all interactive elements
- [ ] Color contrast meets WCAG 2.1 AA across all four role surfaces
- [ ] Reduced-motion preference respected (no forced animation)
- [ ] Only one "bold" visual moment per screen — everything else quiet and disciplined
- [ ] No generic AI-design tells present: no cream+terracotta default palette, no identical-shadow card kit applied everywhere, no ALL-CAPS eyebrow labels, no decorative numbered markers on non-sequential content
- [ ] Empty, loading, and error states designed for every screen — not just the happy path
