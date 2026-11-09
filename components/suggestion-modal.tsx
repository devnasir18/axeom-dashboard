"use client";

import {
  X,
  Mail,
  Send,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Invoice, Booking } from "@/lib/types";

interface SuggestionModalProps {
  open: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
  invoices: Invoice[];
  bookings: Booking[];
}

export function SuggestionModal({
  open,
  onClose,
  onAction,
  invoices,
  bookings,
}: SuggestionModalProps) {
  if (!open) return null;

  const overdue = invoices.filter((i) => i.status.toLowerCase() !== "paid");
  const unbilled = bookings.filter((b) => b.status.toLowerCase() === "completed");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">
            Suggested action
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm text-zinc-900 leading-relaxed">
                The system can only <strong>suggest</strong> actions. No email,
                draft, or change is sent until you approve it below.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {overdue.map((inv) => (
              <button
                key={inv.id}
                onClick={() => onAction(`reminder_email_${inv.id}`)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 bg-white text-left hover:bg-amber-50 hover:border-amber-200 transition-colors group"
                )}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-amber-500 group-hover:text-amber-600 transition-colors" />
                    <span className="text-sm font-medium text-zinc-900 group-hover:text-amber-900 transition-colors">
                      Suggest reminder email for {inv.id}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {inv.client} • {inv.amount != null ? `$${inv.amount.toFixed(2)}` : "—"} • overdue
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
              </button>
            ))}
            {unbilled.map((b) => (
              <button
                key={b.id}
                onClick={() => onAction(`draft_invoice_${b.id}`)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-200 bg-white text-left hover:bg-emerald-50 hover:border-emerald-200 transition-colors group"
                )}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Send className="w-4 h-4 text-emerald-500 group-hover:text-emerald-600 transition-colors" />
                    <span className="text-sm font-medium text-zinc-900 group-hover:text-emerald-900 transition-colors">
                      Draft invoice for {b.id}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {b.client} • completed shoot • unbilled
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <p className="text-xs text-zinc-500 mb-3">Recent suggestions</p>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-50 text-sm">
                  <span className="text-zinc-600">Follow-up with client</span>
                  <span className="text-xs font-medium text-zinc-400">Pending</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
