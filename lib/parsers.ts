import Papa, { ParseResult } from "papaparse";
import { EMPTY_STATE } from "./types";
import type {
  Booking,
  ClientProfile,
  DashboardState,
  Invoice,
  Lead,
  Message,
  Payment,
  ProductionTask,
  Cost,
  TeamMember,
} from "./types";

type ParsedRow =
  | Booking
  | Invoice
  | Lead
  | Payment
  | ProductionTask
  | Cost
  | TeamMember
  | Message
  | Record<string, string>;

const toNum = (v: string | undefined): number => {
  if (v == null) return 0;
  const cleaned = String(v).replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
};

const toStr = (v: string | undefined): string => (v == null ? "" : String(v));

const cleanId = (v: string | undefined, fallback: string): string => {
  const s = toStr(v).trim();
  return s.length > 0 ? s : fallback;
};

const parseDate = (v: string | undefined): string => {
  const s = toStr(v).trim();
  if (s.length === 0) return new Date().toISOString().slice(0, 10);
  return s;
};

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /\+?\d[\d\s().-]{6,}\d/;

const extractEmailFromClient = (name: string): string => {
  const m = String(name).match(EMAIL_RE);
  return m ? m[0].toLowerCase() : "";
};

const extractPhoneFromClient = (name: string): string => {
  const m = String(name).match(PHONE_RE);
  return m ? m[0].replace(/\s/g, "") : "";
};

const stripPhone = (phone: string): string =>
  String(phone).replace(/\s/g, "");

const matchParenName = (
  parenName: string,
  nameTokens: Map<string, string>
): string => {
  const target = normalizeName(parenName);
  if (!target) return "";
  if (nameTokens.has(target)) return nameTokens.get(target)!;

  const targetTokens = new Set(target.split(" ").filter(Boolean));
  if (targetTokens.size === 0) return "";

  let best = "";
  let bestScore = 0;
  nameTokens.forEach((canonical, norm) => {
    const cTokens = new Set(norm.split(" ").filter(Boolean));
    let shared = 0;
    targetTokens.forEach((t) => {
      if (cTokens.has(t)) shared++;
    });
    if (shared === 0) return;
    const score = shared / Math.max(targetTokens.size, cTokens.size);
    if (score > bestScore) {
      bestScore = score;
      best = canonical;
    }
  });

  return bestScore >= 0.5 ? best : "";
};

function parseBookings(rows: Record<string, string>[], fileName: string): Booking[] {
  return rows.map((r, i: number) => ({
    id: cleanId(r.booking_id || r.id || r.BookingID, `BK-${i + 1}`),
    client: toStr(r.client_name || r.client || r.Client),
    email: toStr(r.email || r.Email),
    date: parseDate(r.date || r.Date),
    status: toStr(r.status || r.Status || "pending"),
    shootType: toStr(r.service || r.shoot_type || r.type || r.ShootType || "Photoshoot"),
    amount: toNum(r.price || r.amount || r.total || r.Amount),
    location: toStr(r.location || r.Location || "Studio"),
    sourceFile: fileName,
  }));
}

function parseInvoices(rows: Record<string, string>[], fileName: string): Invoice[] {
  return rows.map((r, i: number) => ({
    id: cleanId(r.invoice_no || r.invoice_id || r.id || r.InvoiceID, `INV-${i + 1}`),
    client: toStr(r.client_name || r.client || r.Client || r.bill_to),
    billTo: toStr(r.bill_to || r.client_name || r.client || r.BillTo),
    email: toStr(r.email || r.Email),
    bookingId: cleanId(r.booking_id || r.booking || r.BookingID, `BK-${i + 1}`),
    amount: toNum(r.amount || r.total || r.Amount),
    status: toStr(r.status || r.Status || "draft"),
    dueDate: parseDate(r.due_date || r.due || r.DueDate),
    sentDate: parseDate(r.sent_date || r.sent || r.issued || r.IssuedDate),
    sourceFile: fileName,
  }));
}

function parseLeads(rows: Record<string, string>[], fileName: string): Lead[] {
  return rows.map((r, i: number) => ({
    id: cleanId(r.lead_id || r.id || r.LeadID, `LD-${i + 1}`),
    name: toStr(r.name || r.client_name || r.client || r.Name),
    business: toStr(r.business || r.company || r.Business || r.Company),
    email: toStr(r.email || r.Email),
    phone: toStr(r.phone || r.Phone),
    source: toStr(r.source || r.Source || "website"),
    status: toStr(r.status || r.Status || "new"),
    date: parseDate(r.date || r.created || r.Date),
    notes: toStr(r.notes || r.Notes || ""),
    sourceFile: fileName,
  }));
}

function parsePayments(rows: Record<string, string>[], fileName: string): Payment[] {
  return rows.map((r, i: number) => ({
    id: cleanId(r.payment_id || r.id || r.PaymentID, `PY-${i + 1}`),
    invoiceId: cleanId(r.invoice_id || r.invoice || r.InvoiceID, `INV-${i + 1}`),
    amount: toNum(r.amount || r.Amount),
    date: parseDate(r.date || r.Date),
    method: toStr(r.method || r.Method || "card"),
    sourceFile: fileName,
  }));
}

function parseProductionTasks(
  rows: Record<string, string>[],
  fileName: string
): ProductionTask[] {
  return rows.map((r, i: number) => ({
    id: cleanId(r.task_id || r.id || r.TaskID, `TSK-${i + 1}`),
    client: toStr(r.client_name || r.client || r.Client),
    bookingId: cleanId(r.booking_id || r.booking || r.BookingID, `BK-${i + 1}`),
    task: toStr(r.task || r.Task || r.description || "General task"),
    status: toStr(r.status || r.Status || "todo"),
    dueDate: parseDate(r.due_date || r.due || r.DueDate),
    assignee: toStr(r.assignee || r.Assignee || "Unassigned"),
    sourceFile: fileName,
  }));
}

function parseCosts(rows: Record<string, string>[], fileName: string): Cost[] {
  return rows.map((r, i: number) => ({
    id: cleanId(r.cost_id || r.id || r.CostID, `CST-${i + 1}`),
    description: toStr(r.description || r.desc || r.Description || "Expense"),
    amount: toNum(r.amount || r.cost || r.Amount),
    date: parseDate(r.date || r.Date),
    category: toStr(r.category || r.Category || "general"),
    client: toStr(r.client_name || r.client || r.Client || "Studio"),
    sourceFile: fileName,
  }));
}

function parseTeam(rows: Record<string, string>[], fileName: string): TeamMember[] {
  return rows.map((r, i: number) => ({
    id: cleanId(r.member_id || r.id || r.MemberID, `TM-${i + 1}`),
    name: toStr(r.name || r.member_name || r.member || r.Name),
    role: toStr(r.role || r.Role || "Staff"),
    availability: toStr(r.availability || r.Availability || "Available"),
    skills: toStr(r.skills || r.Skills || ""),
    sourceFile: fileName,
  }));
}

function parseTxtLines(text: string, fileName: string): Message[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  return lines.map((line, i: number) => {
    const trimmed = line.trim();
    let date = new Date().toISOString().slice(0, 10);
    let direction = "inbound";
    let parenName = "";
    let email = "";
    let phone = "";
    let body = trimmed;

    const dateMatch = trimmed.match(
      /^\[(\d{4}-\d{2}-\d{2})[ T]\d{2}:\d{2}(?::\d{2})?\]/
    );
    if (dateMatch) {
      date = dateMatch[1];
    }

    const channelMatch = trimmed.match(
      /^\[[^\]]*\]\s+(WHATSAPP|EMAIL|VOICE NOTE|INSTAGRAM DM|WEBSITE FORM)\b/i
    );
    if (channelMatch) {
      const ch = channelMatch[1].toUpperCase();
      if (ch === "INSTAGRAM DM" || ch === "WEBSITE FORM") {
        if (trimmed.toLowerCase().includes(" to ")) direction = "outbound";
        else direction = "inbound";
      } else if (ch === "EMAIL" && trimmed.toLowerCase().includes(" to ")) {
        direction = "outbound";
      } else {
        direction = "inbound";
      }
    }

    const emailMatch = trimmed.match(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
    );
    if (emailMatch) email = emailMatch[1].toLowerCase();

    const phoneMatch = trimmed.match(/(\+?\d[\d\s().-]{6,}\d)/);
    if (phoneMatch) phone = phoneMatch[1].replace(/\s/g, "");

    const parenMatch = trimmed.match(/\(([^()]{1,60})\)\s*(?::|$)/);
    if (parenMatch) parenName = parenMatch[1].trim();

    const colonIdx = trimmed.indexOf(":", 12);
    if (colonIdx > 0) {
      body = trimmed.slice(colonIdx + 1).trim();
    }

    return {
      id: `MSG-TXT-${i + 1}`,
      client: "Unknown client",
      text: body,
      date,
      direction,
      sourceFile: fileName,
      _email: email || undefined,
      _phone: phone || undefined,
      _parenName: parenName || undefined,
    };
  });
}

type CsvParser = (
  rows: Record<string, string>[],
  fileName: string
) => ParsedRow[];

const FILE_PARSERS: Record<string, CsvParser> = {
  "bookings.csv": parseBookings,
  "invoices.csv": parseInvoices,
  "leads.csv": parseLeads,
  "payments.csv": parsePayments,
  "production_board.csv": parseProductionTasks,
  "costs.csv": parseCosts,
  "team.csv": parseTeam,
};

export function parseCsvContent(
  content: string,
  fileName: string
): Record<string, string>[] {
  const result: ParseResult<string> = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, "_"),
  });
  if (result.errors.length > 0) {
    console.warn(`PapaParse warnings for ${fileName}:`, result.errors);
  }
  return (result.data as unknown) as Record<string, string>[];
}

export function parseUploadedFile(
  file: File
): Promise<{ fileName: string; data: ParsedRow[]; kind: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const fileName = file.name.toLowerCase();
      let kind: string;
      let data: ParsedRow[];

      if (fileName.endsWith(".txt")) {
        kind = "messages";
        data = parseTxtLines(content, file.name);
      } else if (FILE_PARSERS[fileName]) {
        kind = fileName.replace(".csv", "");
        const rows = parseCsvContent(content, file.name);
        data = FILE_PARSERS[fileName](rows, file.name);
      } else {
        kind = "generic";
        const rows = parseCsvContent(content, file.name);
        data = rows as ParsedRow[];
      }

      resolve({ fileName: file.name, data, kind });
    };
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
}

export function resolveMessageClients(state: DashboardState): void {
  const nameSet = new Set<string>();
  state.bookings.forEach((b) => nameSet.add(b.client));
  state.invoices.forEach((i) => nameSet.add(i.client));
  state.productionTasks.forEach((t) => nameSet.add(t.client));
  state.costs.forEach((c) => {
    if (c.client && c.client !== "Studio") nameSet.add(c.client);
  });
  state.leads.forEach((l) => nameSet.add(l.name));

  const emailToName = new Map<string, string>();
  const phoneToName = new Map<string, string>();
  const nameTokens = new Map<string, string>();

  nameSet.forEach((name) => {
    const norm = normalizeName(name);
    if (!norm) return;
    nameTokens.set(norm, name);
    const email = extractEmailFromClient(name);
    if (email) emailToName.set(email.toLowerCase(), name);
    const phone = extractPhoneFromClient(name);
    if (phone) phoneToName.set(phone, name);
  });

  state.bookings.forEach((b) => {
    if (b.email) emailToName.set(b.email.toLowerCase(), b.client);
    const phone = extractPhoneFromClient(b.client);
    if (phone) phoneToName.set(phone, b.client);
  });
  state.invoices.forEach((i) => {
    if (i.email) emailToName.set(i.email.toLowerCase(), i.client);
  });
  state.leads.forEach((l) => {
    if (l.email) emailToName.set(l.email.toLowerCase(), l.name);
    if (l.phone) phoneToName.set(stripPhone(l.phone), l.name);
  });

  state.messages.forEach((m) => {
    let resolved = "";
    if (m._email && emailToName.has(m._email.toLowerCase())) {
      resolved = emailToName.get(m._email.toLowerCase())!;
    } else if (m._phone && phoneToName.has(m._phone)) {
      resolved = phoneToName.get(m._phone)!;
    } else if (m._parenName) {
      resolved = matchParenName(m._parenName, nameTokens);
    }
    m.client = resolved || "Unknown client";
  });
}

export function buildDashboardState(parsed: {
  fileName: string;
  data: ParsedRow[];
  kind: string;
}[]): DashboardState {
  const state: DashboardState = { ...EMPTY_STATE, loaded: true };
  const byKind: Record<string, ParsedRow[]> = {};

  parsed.forEach((p) => {
    byKind[p.kind] = (byKind[p.kind] || []).concat(p.data);
  });

  state.bookings = byKind.bookings as Booking[];
  state.invoices = byKind.invoices as Invoice[];
  state.leads = byKind.leads as Lead[];
  state.payments = byKind.payments as Payment[];
  state.productionTasks = byKind.production_board as ProductionTask[];
  state.costs = byKind.costs as Cost[];
  state.team = byKind.team as TeamMember[];
  state.messages = byKind.messages as Message[];

  resolveMessageClients(state);

  state.fileCount = parsed.length;
  state.clients = buildClientProfiles(state);

  return state;
}

export function normalizeName(name: string): string {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildClientProfiles(state: DashboardState): ClientProfile[] {
  const groups: Map<string, ClientProfile> = new Map();

  const ensureGroup = (canonical: string, variant: string): ClientProfile => {
    const key = normalizeName(canonical);
    if (groups.has(key)) {
      const g = groups.get(key)!;
      if (!g.variants.includes(variant)) g.variants.push(variant);
      return g;
    }
    const g: ClientProfile = {
      id: `CLT-${groups.size + 1}`,
      name: canonical,
      variants: [variant],
      bookings: [],
      invoices: [],
      messages: [],
      productionTasks: [],
      costs: [],
    };
    groups.set(key, g);
    return g;
  };

  const addTo = (
    profile: ClientProfile,
    item: ParsedRow,
    list: keyof ClientProfile
  ) => {
    (profile[list] as ParsedRow[]).push(item);
  };

  state.bookings.forEach((b) => {
    const g = ensureGroup(b.client, b.client);
    addTo(g, b, "bookings");
  });
  state.invoices.forEach((i) => {
    const g = ensureGroup(i.client, i.client);
    addTo(g, i, "invoices");
  });
  state.messages.forEach((m) => {
    const g = ensureGroup(m.client, m.client);
    addTo(g, m, "messages");
  });
  state.productionTasks.forEach((t) => {
    const g = ensureGroup(t.client, t.client);
    addTo(g, t, "productionTasks");
  });
  state.costs.forEach((c) => {
    const g = ensureGroup(c.client, c.client);
    addTo(g, c, "costs");
  });

  return Array.from(groups.values()).sort((a, b) => {
    const aScore =
      a.invoices.filter((i) => i.status !== "paid").length +
      a.productionTasks.filter((t) => t.status === "delayed").length +
      a.messages.length;
    const bScore =
      b.invoices.filter((i) => i.status !== "paid").length +
      b.productionTasks.filter((t) => t.status === "delayed").length +
      b.messages.length;
    return bScore - aScore;
  });
}

export function isOverdue(invoice: Invoice): boolean {
  if (invoice.status.toLowerCase() === "paid") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(invoice.dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function isUnbilledCompleted(
  booking: Booking,
  invoices: Invoice[]
): boolean {
  if (booking.status.toLowerCase() !== "completed") return false;
  return !invoices.some((i) => i.bookingId === booking.id);
}

const COMPLAINT_KEYS = [
  "unhappy",
  "complaint",
  "problem",
  "issue",
  "refund",
  "cancel",
  "terrible",
  "bad",
  "disappointed",
];
const DELAY_KEYS = ["delay", "delayed", "late", "reschedule", "postpone"];

export function clientRiskScore(profile: ClientProfile): number {
  let score = 0;
  profile.productionTasks.forEach((t) => {
    if (DELAY_KEYS.some((k) => t.status.toLowerCase().includes(k))) score += 3;
    if (t.status.toLowerCase() === "delayed") score += 5;
  });
  profile.messages.forEach((m) => {
    const lower = m.text.toLowerCase();
    if (COMPLAINT_KEYS.some((k) => lower.includes(k))) score += 4;
  });
  profile.invoices.forEach((i) => {
    if (isOverdue(i)) score += 2;
  });
  return score;
}

export function atRiskClient(clients: ClientProfile[]): ClientProfile | null {
  if (clients.length === 0) return null;
  const scored = clients.map((c) => ({ client: c, score: clientRiskScore(c) }));
  scored.sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0].client : null;
}

export function lostLeadsCount(state: DashboardState): number {
  return state.leads.filter(
    (l) =>
      l.status.toLowerCase() === "lost" ||
      l.status.toLowerCase() === "uncontacted"
  ).length;
}

export function unansweredMessagesCount(state: DashboardState): number {
  return state.messages.filter(
    (m) => m.direction.toLowerCase() === "inbound"
  ).length;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
