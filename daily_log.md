# Axeom Studio — Daily Execution Log

## Day 1 (Oct 2026)
- 10:00 to 14:00: Examined Pack 153 dataset files (bookings.csv, invoices.csv, leads.csv, payments.csv, production_board.csv, costs.csv, team.csv, messages.txt).
- What I changed my mind about: Initially planned a Node.js Express backend, but pivoted to a pure Next.js client-side App Router structure for zero-config Vercel deployment.
- What went wrong & fix: Parsing errors on missing headers in messages.txt. Fixed by implementing custom line-by-line regex parsing in parsers.ts.

## Day 2 (Oct 2026)
- 11:00 to 16:30: Built core dashboard UI with Tailwind CSS and Lucide React icons. Implemented 10-second priority action cards.
- Where AI was wrong: AI assistant hardcoded "Unknown client" for parsed message lines and misaligned column headers (r.amount instead of r.price).
- How I caught it: Noticed $0.00 unbilled totals and 177 unlinked messages on the UI. Instructed AI to rewrite parsers.ts with strict fuzzy name/email lookup and proper price/service column keys.

## Day 3 (Oct 2026)
- 09:30 to 13:00: Verified updated totals ($33,610 overdue, $103,300 unbilled, Carmen Ibarra at-risk).
- Final Polish: Generated test builds (npm run build and npm run lint), verified mobile responsive viewport, and finalized project documentation.