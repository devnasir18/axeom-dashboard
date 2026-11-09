"use client";

import { Fragment, useMemo, useState } from "react";
import {
  FileText,
  Table2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/parsers";
import type { DashboardState } from "@/lib/types";

interface FilesViewProps {
  state: DashboardState;
}

type FileKind =
  | "bookings"
  | "invoices"
  | "leads"
  | "payments"
  | "production_board"
  | "costs"
  | "team"
  | "messages";

interface FileDescriptor {
  name: string;
  kind: FileKind;
  description: string;
}

const KNOWN_FILES: FileDescriptor[] = [
  { name: "bookings.csv", kind: "bookings", description: "Client bookings and shoot details" },
  { name: "invoices.csv", kind: "invoices", description: "Invoices, amounts, and due dates" },
  { name: "leads.csv", kind: "leads", description: "Incoming leads and pipeline status" },
  { name: "payments.csv", kind: "payments", description: "Payment records linked to invoices" },
  { name: "production_board.csv", kind: "production_board", description: "Production tasks and assignees" },
  { name: "costs.csv", kind: "costs", description: "Studio and project expenses" },
  { name: "team.csv", kind: "team", description: "Team members and availability" },
  { name: "messages.txt", kind: "messages", description: "Client messages (resolved to clients)" },
];

function getRows(state: DashboardState, kind: FileKind): unknown[] {
  switch (kind) {
    case "bookings":
      return state.bookings;
    case "invoices":
      return state.invoices;
    case "leads":
      return state.leads;
    case "payments":
      return state.payments;
    case "production_board":
      return state.productionTasks;
    case "costs":
      return state.costs;
    case "team":
      return state.team;
    case "messages":
      return state.messages;
  }
}

function toCell(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number") {
    if (Math.abs(value) >= 100 && Number.isFinite(value)) {
      // Heuristic: currency-like amounts in this dataset
      return String(value);
    }
    return String(value);
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatMaybeCurrency(key: string, value: unknown): string {
  const k = key.toLowerCase();
  if (typeof value === "number" && (k.includes("amount") || k.includes("price") || k.includes("total") || k.includes("cost"))) {
    return formatCurrency(value);
  }
  return toCell(value);
}

export function FilesView({ state }: FilesViewProps) {
  const [preview, setPreview] = useState<FileKind | null>(null);

  const items = useMemo(() => {
    return KNOWN_FILES.map((f) => {
      const rows = getRows(state, f.kind);
      return { ...f, rows, count: rows.length, loaded: rows.length > 0 };
    });
  }, [state]);

  const loadedCount = items.filter((i) => i.loaded).length;
  const totalRows = items.reduce((s, i) => s + i.count, 0);

  const previewItem = items.find((i) => i.kind === preview);
  const previewRows = (previewItem?.rows ?? []).slice(0, 12) as Record<
    string,
    unknown
  >[];
  const previewColumns = useMemo(() => {
    if (previewRows.length === 0) return [];
    const keys = Object.keys(previewRows[0]).filter((k) => !k.startsWith("_"));
    return keys.slice(0, 8);
  }, [previewRows]);

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Files
          </h2>
          <p className="text-sm text-zinc-500">
            Uploaded source files and parsed record counts
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-medium text-zinc-600">
            {loadedCount}/{KNOWN_FILES.length} loaded
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
            {totalRows} rows
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  File
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Rows
                </th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Preview
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {items.map((item) => {
                const isOpen = preview === item.kind;
                return (
                  <Fragment key={item.kind}>
                    <tr
                      className={cn(
                        "transition-colors",
                        item.loaded ? "hover:bg-zinc-50/80" : "bg-zinc-50/30"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-xl",
                              item.loaded
                                ? "bg-zinc-900 text-white"
                                : "bg-zinc-100 text-zinc-400"
                            )}
                          >
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900">
                              {item.name}
                            </p>
                            <p className="truncate text-xs text-zinc-500">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            item.loaded ? "text-zinc-900" : "text-zinc-400"
                          )}
                        >
                          {item.count}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {item.loaded ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Parsed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-500">
                            <Inbox className="h-3.5 w-3.5" />
                            Not uploaded
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={!item.loaded}
                          onClick={() =>
                            setPreview(isOpen ? null : item.kind)
                          }
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                            item.loaded
                              ? isOpen
                                ? "bg-zinc-900 text-white"
                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                              : "cursor-not-allowed bg-zinc-50 text-zinc-300"
                          )}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          {isOpen ? "Hide" : "View"}
                          {isOpen ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                    {isOpen && previewItem && (
                      <tr>
                        <td colSpan={4} className="bg-zinc-50/60 px-6 py-4">
                          <div className="rounded-2xl border border-zinc-200 bg-white">
                            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
                              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800">
                                <Table2 className="h-4 w-4 text-zinc-500" />
                                Data preview — {previewItem.name}
                              </div>
                              <span className="text-xs text-zinc-500">
                                Showing {Math.min(previewRows.length, 12)} of{" "}
                                {previewItem.count} rows
                              </span>
                            </div>
                            {previewRows.length === 0 ? (
                              <p className="px-4 py-6 text-sm text-zinc-500">
                                No rows to preview.
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                  <thead>
                                    <tr className="border-b border-zinc-100 bg-zinc-50/50">
                                      {previewColumns.map((c) => (
                                        <th
                                          key={c}
                                          className="whitespace-nowrap px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500"
                                        >
                                          {c.replace(/_/g, " ")}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-100">
                                    {previewRows.map((row, idx) => (
                                      <tr key={idx} className="hover:bg-zinc-50/50">
                                        {previewColumns.map((c) => (
                                          <td
                                            key={c}
                                            className="max-w-[220px] truncate whitespace-nowrap px-4 py-2 text-xs text-zinc-700"
                                            title={toCell(row[c])}
                                          >
                                            {formatMaybeCurrency(c, row[c])}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-6 py-3 text-xs text-zinc-500">
          <span>Client-side parsing only — no files leave your browser.</span>
          <span>Use “Add files” in the header to upload.</span>
        </div>
      </div>
    </section>
  );
}
