"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Mail,
  ArrowDownLeft,
  ArrowUpRight,
  User,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";

interface MessagesViewProps {
  messages: Message[];
}

type DirectionFilter = "all" | "inbound" | "outbound";
type ClientFilter = "all" | "resolved" | "unknown";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function MessagesView({ messages }: MessagesViewProps) {
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<DirectionFilter>("all");
  const [clientFilter, setClientFilter] = useState<ClientFilter>("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return messages.filter((m) => {
      const resolved = m.client && m.client !== "Unknown client";
      if (clientFilter === "resolved" && !resolved) return false;
      if (clientFilter === "unknown" && resolved) return false;
      if (direction !== "all" && m.direction.toLowerCase() !== direction)
        return false;
      if (!q) return true;
      return (
        m.text.toLowerCase().includes(q) ||
        m.client.toLowerCase().includes(q) ||
        m.date.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        (m._email || "").toLowerCase().includes(q)
      );
    });
  }, [messages, query, direction, clientFilter]);

  const resolvedCount = messages.filter(
    (m) => m.client && m.client !== "Unknown client"
  ).length;

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
            Messages
          </h2>
          <p className="text-sm text-zinc-500">
            Parsed from <span className="font-medium">messages.txt</span> with
            client resolution
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 font-medium text-zinc-600">
            {messages.length} total
          </span>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700">
            {resolvedCount} resolved
          </span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-medium text-amber-700">
            {messages.length - resolvedCount} unknown
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-zinc-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sender, message, date, or email…"
              className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50/80 pl-10 pr-3 text-sm outline-none transition-all focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-900/5"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400">
              <Filter className="h-3.5 w-3.5" /> Filter
            </span>
            {(["all", "inbound", "outbound"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDirection(d)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize transition-colors",
                  direction === d
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                )}
              >
                {d}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-zinc-200" />
            {(["all", "resolved", "unknown"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setClientFilter(c)}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize transition-colors",
                  clientFilter === c
                    ? "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900">
                {messages.length === 0
                  ? "No messages loaded"
                  : "No matching messages"}
              </p>
              <p className="mt-0.5 text-sm text-zinc-500">
                {messages.length === 0
                  ? "Upload messages.txt to see parsed messages and client mappings."
                  : "Try adjusting your search or filters."}
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {filtered.map((m) => {
              const inbound = m.direction.toLowerCase() === "inbound";
              const resolved = m.client && m.client !== "Unknown client";
              return (
                <li
                  key={m.id}
                  className={cn(
                    "flex gap-3 px-4 py-4 transition-colors hover:bg-zinc-50/80 sm:px-6",
                    !resolved && "bg-amber-50/20"
                  )}
                >
                  <div
                    className={cn(
                      "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      inbound
                        ? "bg-blue-100 text-blue-600"
                        : "bg-emerald-100 text-emerald-600"
                    )}
                    title={inbound ? "Inbound" : "Outbound"}
                  >
                    {inbound ? (
                      <ArrowDownLeft className="h-4 w-4" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-sm font-semibold",
                          resolved ? "text-zinc-900" : "text-amber-800"
                        )}
                      >
                        <User className="h-3.5 w-3.5 opacity-60" />
                        {m.client}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                          inbound
                            ? "bg-blue-50 text-blue-700"
                            : "bg-emerald-50 text-emerald-700"
                        )}
                      >
                        {m.direction}
                      </span>
                      {!resolved && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                          unresolved
                        </span>
                      )}
                      <span className="ml-auto text-xs text-zinc-400">
                        {formatDate(m.date)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-zinc-700">
                      {m.text}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-400">
                      <span>{m.id}</span>
                      {m._email && <span>{m._email}</span>}
                      {m.sourceFile && <span>{m.sourceFile}</span>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-zinc-100 bg-zinc-50/50 px-4 py-3 text-xs text-zinc-500 sm:px-6">
          <span>
            Showing {filtered.length} of {messages.length} messages
          </span>
          <span>Client names resolved from uploaded files</span>
        </div>
      </div>
    </section>
  );
}
