# Axeom Studio — Operational Dashboard

Production-ready, mobile-first operational dashboard for Axeom Studio (Pack 153 challenge). Built with Next.js (App Router), TypeScript, Tailwind CSS, Lucide React, and PapaParse. Runs entirely client-side — no backend required.

## Tech Stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Tailwind CSS v4
- Lucide React (icons)
- PapaParse (client-side CSV parsing)
- clsx + tailwind-merge (utility class composition)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev

# 3. Open http://localhost:3000
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## How It Works

1. **Add New Files** — Click the prominent upload button in the header to select multiple CSV/txt files. PapaParse parses them instantly in the browser and the dashboard state updates reactively.
2. **10-Second Priority Test** — Four cards surface what to do first on mobile: overdue invoices, unbilled completed shoots, at-risk client, and lost leads/messages.
3. **Suggestion Engine** — Click "Suggest reminder email" or "Draft invoice" buttons. The system only *suggests*; a confirmation toast simulates manual owner approval before anything is "sent."
4. **Client Directory** — Searchable, unified client profiles that merge variant name spellings across all CSVs, linking bookings, invoices, messages, and tasks.

## Supported Files

`bookings.csv`, `invoices.csv`, `leads.csv`, `payments.csv`, `production_board.csv`, `costs.csv`, `team.csv`, `messages.txt`

## Deploy to Vercel

Push to a GitHub repo, import it in Vercel, and deploy. Zero configuration — the App Router app deploys as a static site.

## File Structure

```
app/
  layout.tsx        Root layout + fonts + metadata
  page.tsx          Main dashboard (state, tabs, toast)
  globals.css       Tailwind imports + animations
components/
  file-upload-area.tsx   Drag-and-drop CSV upload + PapaParse
  priority-cards.tsx     The 4 priority cards (10-second test)
  suggestion-modal.tsx   Human-in-the-loop suggestion modal
  client-directory.tsx   Searchable unified client directory
lib/
  types.ts          TypeScript interfaces
  parsers.ts        PapaParse wrappers, client matching, risk scoring, formatting
  utils.ts          cn() tailwind-merge helper
```
