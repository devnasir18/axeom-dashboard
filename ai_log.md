# Axeom Studio — AI Utilization Log

## 1. AI Tools Used
- Cursor: Primary IDE assistant for real-time code generation, refactoring TypeScript modules, and UI layout creation.
- Gemini: Used for architectural analysis, dataset reconciliation strategy, and documentation structure.

## 2. Prompts & Workflows
- Parser Optimization Prompt: "Fix data mapping in lib/parsers.ts: resolve message senders by matching names/emails/phones to client profiles, and map 'price' and 'service' columns for bookings."
- UI Layout Prompt: "Build 4 clean priority action cards matching the 10-second mobile test layout using Tailwind CSS."

## 3. Instances of AI Error & Corrections
- Error: AI hardcoded "Unknown client" in text message parsing and looked for non-existent r.amount fields in CSV inputs, resulting in missing client links and $0.00 unbilled values.
- Correction: Identified discrepancy by reviewing raw CSV headers and UI state. Prompted Kilo Code to update parsers.ts with lookup maps and explicit column fallbacks (r.price).