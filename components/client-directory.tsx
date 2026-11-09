"use client";

import { useMemo, useState } from "react";
import { Search, Clock, ShieldAlert } from "lucide-react";
import { formatCurrency } from "@/lib/parsers";
import type { ClientProfile } from "@/lib/types";

interface ClientDirectoryProps {
  clients: ClientProfile[];
}

export function ClientDirectory({ clients }: ClientDirectoryProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.variants.some((v) => v.toLowerCase().includes(q)) ||
        c.bookings.some((b) => b.id.toLowerCase().includes(q)) ||
        c.invoices.some((i) => i.id.toLowerCase().includes(q))
    );
  }, [query, clients]);

  const openInvoices = (c: ClientProfile) =>
    c.invoices.filter((i) => i.status.toLowerCase() !== "paid");
  const pendingTasks = (c: ClientProfile) =>
    c.productionTasks.filter(
      (t) => t.status.toLowerCase() !== "completed"
    );

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="px-6 py-5 border-b border-zinc-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -mt-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search clients, bookings, invoices…"
            className="pl-10 h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/50">
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Bookings</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Invoices</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Open $</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pending tasks</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Messages</th>
              <th className="px-6 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.map((client) => (
              <tr key={client.id} className="hover:bg-zinc-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 text-sm font-medium">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{client.name}</p>
                      {client.variants.length > 1 && (
                        <p className="text-xs text-zinc-400 italic">
                          Also known as: {client.variants.slice(1).join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-zinc-900">{client.bookings.length}</span>
                  <p className="text-xs text-zinc-500">
                    {client.bookings
                      .filter((b) => b.status.toLowerCase() === "completed")
                      .length} completed
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-zinc-900">{client.invoices.length}</span>
                  <p className="text-xs text-zinc-500">
                    {openInvoices(client).length} open
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-zinc-900">
                    {formatCurrency(
                      openInvoices(client).reduce((s, i) => s + i.amount, 0)
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-zinc-900">{pendingTasks(client).length}</span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-sm text-zinc-900">{client.messages.length}</span>
                </td>
                <td className="px-6 py-4">
                  {pendingTasks(client).length > 0 || openInvoices(client).length > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">
                      <Clock className="w-3 h-3" /> Needs attention
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <ShieldAlert className="w-3 h-3" /> All clear
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                  No clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 text-xs text-zinc-500 flex justify-between">
        <span>{filtered.length} of {clients.length} clients</span>
        <span>Client names unified across all uploaded files</span>
      </div>
    </section>
  );
}
