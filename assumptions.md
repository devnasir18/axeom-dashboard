# Axeom Studio — Assumptions & Clarification Log

During the evaluation of Pack 153 data and operational context, direct client communication was prohibited per challenge rules. Below are the key questions that would have been asked, along with the explicit assumptions adopted to build the system.

## 1. System Baseline Date
- Question: What exact date should be treated as "today" for overdue invoice calculations and risk metrics?
- Assumption: As specified in the brief, October 6, 2026 is treated as the hard freeze date for all chronological logic.

## 2. Client Name Discrepancies & Aliases
- Question: When a payee name on payments (payments.csv) differs from the client name on bookings (bookings.csv), is it a separate client or a payer entity?
- Assumption: Names sharing exact email addresses or phone numbers are merged into a single unified client profile. Payers without matching booking emails/phones are categorized under payers_who_are_not_clients.

## 3. Unbilled Shoot Valuation
- Question: For bookings marked completed that lack an linked invoice, should revenue be calculated based on standard rate cards or the price field in bookings.csv?
- Assumption: The price column in bookings.csv represents the agreed contract value and is used directly to compute unbilled revenue ($103,300.00 across 149 shoots).

## 4. Priority Test & Human-in-the-Loop Actions
- Question: Should reminder emails or draft invoices automatically fire when triggered by the system?
- Assumption: Strict adherence to "Suggest, Never Act Alone." All system recommendations generate non-destructive confirmation toasts simulating owner authorization.