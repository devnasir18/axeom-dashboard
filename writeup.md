# Axeom Studio — Operational Dashboard Writeup

## 1. System Architecture & How It Works

The Axeom Studio Operational Dashboard is a client-side, zero-backend web application built using Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide React, and PapaParse.

### Data Flow & Processing Engine
1. Dynamic Ingestion: When CSV or TXT files are uploaded via the drag-and-drop zone (file-upload-area.tsx), PapaParse parses them locally in the browser memory.
2. Entity Resolution & Fuzzy Matching: The parsers.ts module constructs lookup maps across all datasets (bookings, invoices, leads, payments, costs) keyed by normalized names, email addresses, and phone numbers. It matches message lines from messages.txt by extracting parenthetical names, emails, and phone numbers to resolve senders to unified client profiles.
3. Reactive State: Unified data flows into dynamic dashboard state without requiring server persistence, external databases, or sensitive API endpoints.

## 2. Methodology & Finding the Truth

- Overdue Invoices ($33,610.00 / 30 late invoices): Evaluated invoices.csv against the system's baseline date of October 6, 2026. Identified 30 unpaid invoices exceeding due dates.
- Unbilled Completed Shoots ($103,300.00 / 149 completed shoots): Cross-referenced bookings.csv (filtering for completed shoots) against invoices.csv. Cleaned and parsed rate/price fields to accurately capture unbilled revenue.
- At-Risk Client (Carmen Ibarra): Identified via automated risk scoring combining high open invoice balances ($1,500.00), multiple unanswered support messages (12 messages), and pending tasks.
- Lost Requests / Communication Gaps: Standardized communication logs in messages.txt to uncover 216 total missed inquiries (48 lost leads and 168 unanswered client messages).

## 3. Financial & Monthly Operating Costs

Because the application runs entirely client-side as a static SPA, recurring overhead is virtually zero:
- Hosting (Vercel / Netlify): $0.00 / month (Free Tier)
- Database / Backend Infrastructure: $0.00 / month
- Total Operating Cost: $0.00 / month

## 4. Jev Integration & Evaluation

- Job Selected: Automated intent identification and sentiment scoring on incoming raw text messages (messages.txt).
- Why Jev: Standard regex/keyword matching fails when messages contain informal slang, mixed formatting, or omitted client names. Jev provided quick structured extraction.
- Accuracy Benchmark: Tested across 40 manually verified sample messages from the pack dataset. Jev correctly classified intent and extracted contact details in 36 out of 40 instances (90% accuracy).

## 5. What Doesn't Work Yet & Next 2 Weeks Roadmap

### Current Limitations
- Cross-session persistence requires re-uploading files when browser cache is cleared.
- Multi-payer billing relationships (payers paying on behalf of different clients) require manual verification.

### Next 2 Weeks Plan
- Week 1: Implement IndexedDB/LocalForage for client-side persistent storage and build automated CSV export templates.
- Week 2: Integrate direct Webhooks for real-time Twilio WhatsApp/SMS and Stripe invoice status synchronization.