"use client";

import {
  CalendarClock,
  Database,
  HardDrive,
  Trash2,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardState } from "@/lib/types";

interface SettingsViewProps {
  state: DashboardState;
  onReset: () => void;
}

export const SYSTEM_BASELINE_DATE = "October 6, 2026";
export const STORAGE_MODE = "Client-side Browser Memory / Local State";

function StatRow({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "good" | "warn";
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3">
      <span className="text-sm text-zinc-600">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          tone === "good" && "text-emerald-700",
          tone === "warn" && "text-amber-700",
          tone === "default" && "text-zinc-900"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function SettingsView({ state, onReset }: SettingsViewProps) {
  const hasData = state.loaded && state.fileCount > 0;
  const totalRecords =
    state.bookings.length +
    state.invoices.length +
    state.leads.length +
    state.payments.length +
    state.productionTasks.length +
    state.costs.length +
    state.team.length +
    state.messages.length;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
          Settings
        </h2>
        <p className="text-sm text-zinc-500">
          Operational baseline and local session controls
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                System baseline
              </h3>
              <p className="text-xs text-zinc-500">Reference configuration</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 to-white p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Current system baseline date
                  </p>
                  <p className="mt-1 text-lg font-bold tracking-tight text-zinc-900">
                    {SYSTEM_BASELINE_DATE}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                    Priority calculations (e.g. overdue invoices) are evaluated
                    relative to this operational baseline when applicable.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4">
              <div className="flex items-start gap-3">
                <HardDrive className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Active storage mode
                  </p>
                  <p className="mt-1 text-base font-semibold text-zinc-900">
                    {STORAGE_MODE}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                    Parsed CSV/TXT data is held in React state for this session.
                    Files are not uploaded to a server.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Client-side parsing via PapaParse. No external persistence.
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Session cache
              </h3>
              <p className="text-xs text-zinc-500">In-memory data overview</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <StatRow label="Files parsed" value={state.fileCount} />
            <StatRow
              label="Total records"
              value={totalRecords}
              tone={totalRecords > 0 ? "good" : "default"}
            />
            <StatRow label="Clients (unified)" value={state.clients.length} />
            <StatRow label="Bookings" value={state.bookings.length} />
            <StatRow label="Invoices" value={state.invoices.length} />
            <StatRow label="Messages" value={state.messages.length} />
            <StatRow
              label="Dashboard status"
              value={hasData ? "Data loaded" : "Awaiting upload"}
              tone={hasData ? "good" : "warn"}
            />
          </div>

          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50/50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900">
                  Clear / reset uploaded cache
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-zinc-600">
                  Removes all parsed data from the current session and returns
                  the dashboard to its empty state. You can re-upload files
                  afterward.
                </p>
                <button
                  type="button"
                  onClick={onReset}
                  disabled={!hasData}
                  className={cn(
                    "mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                    hasData
                      ? "bg-red-600 text-white shadow-sm shadow-red-600/20 hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                      : "cursor-not-allowed bg-zinc-100 text-zinc-400"
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  Clear uploaded cache
                </button>
              </div>
            </div>
          </div>

          {hasData && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Session contains parsed operational data.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
