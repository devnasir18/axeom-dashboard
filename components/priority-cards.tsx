"use client";

import { type ReactNode } from "react";
import {
  AlertTriangle,
  Clock,
  Users,
  Mail,
  TrendingDown,
  Camera,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDate,
  isOverdue,
  isUnbilledCompleted,
  atRiskClient,
  lostLeadsCount,
  unansweredMessagesCount,
} from "@/lib/parsers";
import type { Invoice, Booking, DashboardState } from "@/lib/types";

interface PriorityCardProps {
  title: string;
  subtitle: string;
  value: ReactNode;
  icon: ReactNode;
  accent: string;
  children: ReactNode;
}

function PriorityCard({
  title,
  subtitle,
  value,
  icon,
  accent,
  children,
}: PriorityCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-3xl p-6 border border-zinc-100 bg-gradient-to-b from-white to-zinc-50/50 shadow-sm",
      accent === "danger" && "border-red-100/60 from-white to-red-50/40",
      accent === "warning" && "border-amber-100/60 from-white to-amber-50/40",
      accent === "info" && "border-emerald-100/60 from-white to-emerald-50/40",
      accent === "alert" && "border-blue-100/60 from-white to-blue-50/40"
    )}>
      <div className="absolute top-6 right-6 opacity-20">
        {icon}
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl shadow-sm",
            accent === "danger" ? "bg-red-100 text-red-600" : "",
            accent === "warning" ? "bg-amber-100 text-amber-600" : "",
            accent === "info" ? "bg-emerald-100 text-emerald-600" : "",
            accent === "alert" ? "bg-blue-100 text-blue-600" : "",
            "bg-zinc-100 text-zinc-600"
          )}>
        {icon}
      </div>
          <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">{title}</span>
        </div>
        <div>
          <div className="text-3xl font-bold tracking-tight text-zinc-900">{value}</div>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

interface InvoiceChipProps {
  invoice: Invoice;
}

function InvoiceChip({ invoice }: InvoiceChipProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-zinc-800">{invoice.id}</span>
        <span className="text-xs text-zinc-500">{invoice.client}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-semibold text-zinc-900">{formatCurrency(invoice.amount)}</span>
        <span className="text-xs text-red-600 font-medium">{formatDate(invoice.dueDate)}</span>
      </div>
    </div>
  );
}

interface BookingChipProps {
  booking: Booking;
}

function BookingChip({ booking }: BookingChipProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm">
      <div className="flex flex-col gap-0.5">
        <span className="font-medium text-zinc-800">{booking.id}</span>
        <span className="text-xs text-zinc-500">{booking.client}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-semibold text-zinc-900">{formatCurrency(booking.amount)}</span>
        <span className="text-xs text-emerald-600 font-medium">{booking.status}</span>
      </div>
    </div>
  );
}

export function PriorityCards({ state }: { state: DashboardState }) {
  const overdue = state.invoices.filter(isOverdue);
  const overdueTotal = overdue.reduce((sum, i) => sum + i.amount, 0);
  const unbilled = state.bookings.filter((b) => isUnbilledCompleted(b, state.invoices));
  const unbilledTotal = unbilled.reduce((sum, b) => sum + b.amount, 0);
  const atRisk = atRiskClient(state.clients);
  const lost = lostLeadsCount(state);
  const unanswered = unansweredMessagesCount(state);

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
      <PriorityCard
        title="Overdue invoices"
        subtitle={`${overdue.length} late invoice${overdue.length !== 1 ? "s" : ""} to collect`}
        value={formatCurrency(overdueTotal)}
        icon={<AlertTriangle className="w-5 h-5" />}
        accent="danger"
      >
        <div className="space-y-2">
          {overdue.slice(0, 4).map((inv) => (
            <InvoiceChip key={inv.id} invoice={inv} />
          ))}
          {overdue.length > 4 && (
            <p className="text-xs text-zinc-400 text-center py-1">
              +{overdue.length - 4} more
            </p>
          )}
          {overdue.length === 0 && (
            <p className="text-xs text-zinc-400 text-center py-1 bg-zinc-50 rounded-md">
              All caught up
            </p>
          )}
        </div>
      </PriorityCard>

      <PriorityCard
        title="Unbilled completed shoots"
        subtitle={`${unbilled.length} completed shoot${unbilled.length !== 1 ? "s" : ""} never invoiced`}
        value={formatCurrency(unbilledTotal)}
        icon={<Camera className="w-5 h-5" />}
        accent="warning"
      >
        <div className="space-y-2">
          {unbilled.slice(0, 4).map((b) => (
            <BookingChip key={b.id} booking={b} />
          ))}
          {unbilled.length > 4 && (
            <p className="text-xs text-zinc-400 text-center py-1">
              +{unbilled.length - 4} more
            </p>
          )}
          {unbilled.length === 0 && (
            <p className="text-xs text-zinc-400 text-center py-1 bg-zinc-50 rounded-md">
              Everything billed
            </p>
          )}
        </div>
      </PriorityCard>

      <PriorityCard
        title="At-risk client"
        subtitle={atRisk ? `Most likely to leave` : "No risk detected"}
        value={
          atRisk ? (
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold tracking-tight text-zinc-900">{atRisk.name}</span>
              <span className="text-xs font-medium text-red-600">risk</span>
            </div>
          ) : (
            <span className="text-3xl font-bold tracking-tight text-zinc-900">—</span>
          )
        }
        icon={<TrendingDown className="w-5 h-5" />}
        accent="danger"
      >
        <div className="space-y-2">
          {atRisk ? (
            <>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-zinc-400" />
                <span className="text-zinc-600">
                  {atRisk.productionTasks.filter((t) =>
                    t.status.toLowerCase().includes("delay")
                  ).length} delayed task(s)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="w-3 h-3 text-zinc-400" />
                <span className="text-zinc-600">
                  {atRisk.messages.length} message(s)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Users className="w-3 h-3 text-zinc-400" />
                <span className="text-zinc-600">
                  {atRisk.invoices.filter((i) => !isOverdue(i) && i.status !== "paid").length} open invoice(s)
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-500 italic">&quot;Suggest check-in call&quot;</p>
            </>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-1 bg-zinc-50 rounded-md">
              All clients healthy
            </p>
          )}
        </div>
      </PriorityCard>

      <PriorityCard
        title="Lost leads / messages"
        subtitle={`${lost + unanswered} missed inquiry${lost + unanswered !== 1 ? "ies" : ""} this month`}
        value={lost + unanswered}
        icon={<Flag className="w-5 h-5" />}
        accent="alert"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm">
            <span className="font-medium text-zinc-800">Lost leads</span>
            <span className="font-semibold text-zinc-900">{lost}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-200 bg-white text-sm">
            <span className="font-medium text-zinc-800">Unanswered messages</span>
            <span className="font-semibold text-zinc-900">{unanswered}</span>
          </div>
          {lost + unanswered > 0 ? (
            <p className="mt-2 text-xs text-zinc-500 italic">&quot;Suggest follow-up&quot;</p>
          ) : (
            <p className="text-xs text-zinc-400 text-center py-1 bg-zinc-50 rounded-md">
              Inbox clear
            </p>
          )}
        </div>
      </PriorityCard>
    </div>
  );
}
