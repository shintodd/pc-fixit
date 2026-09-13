# pcfix - Frontend

Next.js 14 (App Router) + TypeScript + Tailwind. Clean, minimal, Apple-inspired
aesthetic: white surfaces, near-black ink, one confident blue accent, system
font stack (renders as SF Pro on Apple devices), generous whitespace, pill
buttons, iMessage-style chat bubbles. Builds clean (`npm run build` verified)
and type-checks clean (`tsc --noEmit`).

## Run it

```bash
npm install
npm run dev
```

## What's here

| Route | What it does |
|---|---|
| `/` | Landing page - hero with a command-line-style input, category grid |
| `/troubleshoot` | Chat diagnosis flow. Reads `?q=` (initial message) and `?topic=` (category context) |
| `/wizard` | Guided decision-tree flow (branching Q&A → result) |
| `/issues/[slug]` | Example SEO content page for a single issue (only `blue-screen` has real content - it's the template pattern) |

## What's stubbed - this is the handoff point

Everything backend/data lives in **`lib/mock-data.ts`**, clearly marked. Specifically:

- **`CATEGORIES` / `ISSUES`** - only a few example entries exist. Seed the real
  set from the Windows error-codes knowledge base (already have this content).
- **`WIZARD_TREE`** - only the first couple of branches are filled in as a
  pattern to follow. Needs the full decision tree per category.
- **`mockDiagnose()`** - currently just waits ~1s and returns a canned reply.
  Replace with the real diagnosis call. Important: ground it in the knowledge
  base (RAG / retrieval), not raw model output - a hallucinated fix for a real
  PC problem is a worse outcome than a generic one. This was flagged as the
  key risk area when we scoped the project.

None of the UI components need to change to wire this up - `Chat.tsx` and
`Wizard.tsx` just call into `lib/mock-data.ts`, so swapping the functions/data
there for real API calls is the whole integration.

## Design tokens

Defined in `tailwind.config.ts` - `ink` / `ink-secondary` / `ink-tertiary` for
text, `surface` / `subtle` for backgrounds, `accent` for the blue CTA/link
color, `critical` / `warn` / `ok` for severity states. Font is the system
stack (`-apple-system, BlinkMacSystemFont, ...`) - no web font to load, so no
external font dependency. Keep new UI within these tokens rather than
introducing new colors.
