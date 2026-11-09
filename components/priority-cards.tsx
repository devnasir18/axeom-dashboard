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
import { AnimatedNumber } from "@/components/animated-number";

interface PriorityCardProps {
  title: string;
  subtitle: string;
  value: ReactNode;
  icon: ReactNode;
  accent: "danger" | "warning" | "info" | "alert";
  children: ReactNode;
  animateKey?: string | number;
  populated?: boolean;
}

function PriorityCard({
  title,
  subtitle,
  value,
  icon,
  accent,
  children,
  animateKey,
  populated = false,
}: PriorityCardProps) {
  return (
    <div
      key={animateKey}
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-gradient-to-b from-white to-zinc-50/50 p-6 shadow-sm transition-shadow duration-200 hover:shadow-md",
        accent === "danger" && "border-red-100/60 to-red-50/30",
        accent === "warning" && "border-amber-100/60 to-amber-50/30",
        accent === "info" && "border-emerald-100/60 to-emerald-50/30",
        accent === "alert" && "border-blue-100/60 to-blue-50/30",
        populated && "animate-card-populate"
      )}
    >
      <div className="pointer-events-none absolute -right-2 -top-2 opacity-[0.07]">
        <div className="scale-[2.2]">{icon}</div>
      </div>
      <div className="relative z-10 flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl shadow-sm ring-1 ring-inset",
              accent === "danger" && "bg-red-100 text-red-600 ring-red-200/50",
              accent === "warning" &&
                "bg-amber-100 text-amber-600 ring-amber-200/50",
              accent === "info" &&
                "bg-emerald-100 text-emerald-600 ring-emerald-200/50",
              accent === "alert" && "bg-blue-100 text-blue-600 ring-blue-200/50"
            )}
          >
            {icon}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
            {title}
          </span>
        </div>
        <div>
          <div className="text-3xl font-bold tracking-tight text-zinc-900 tabular-nums">
            {value}
          </div>
          <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>
        </div>
        <div className="mt-2">{children}</div>
      </div>
    </div>
  );
}

interface InvoiceChipProps {
  invoice: Invoice;
}

function InvoiceChip({ invoice }: InvoiceChipProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm backdrop-blur-sm transition-colors hover:border-zinc-300">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium text-zinc-800">{invoice.id}</span>
        <span className="truncate text-xs text-zinc-500">{invoice.client}</span>
      </div>
      <div className="ml-3 flex shrink-0 flex-col items-end gap-0.5">
        <span className="font-semibold tabular-nums text-zinc-900">
          {formatCurrency(invoice.amount)}
        </span>
        <span className="text-xs font-medium text-red-600">
          {formatDate(invoice.dueDate)}
        </span>
      </div>
    </div>
  );
}

interface BookingChipProps {
  booking: Booking;
}

function BookingChip({ booking }: BookingChipProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm backdrop-blur-sm transition-colors hover:border-zinc-300">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="font-medium text-zinc-800">{booking.id}</span>
        <span className="truncate text-xs text-zinc-500">{booking.client}</span>
      </div>
      <div className="ml-3 flex shrink-0 flex-col items-end gap-0.5">
        <span className="font-semibold tabular-nums text-zinc-900">
          {formatCurrency(booking.amount)}
        </span>
        <span className="text-xs font-medium text-emerald-600">
          {booking.status}
        </span>
      </div>
    </div>
  );
}

export function PriorityCards({ state }: { state: DashboardState }) {
  const overdue = state.invoices.filter(isOverdue);
  const overdueTotal = overdue.reduce((sum, i) => sum + i.amount, 0);
  const unbilled = state.bookings.filter((b) =>
    isUnbilledCompleted(b, state.invoices)
  );
  const unbilledTotal = unbilled.reduce((sum, b) => sum + b.amount, 0);
  const atRisk = atRiskClient(state.clients);
  const lost = lostLeadsCount(state);
  const unanswered = unansweredMessagesCount(state);
  const populated = state.loaded && state.fileCount > 0;
  const animateKey = state.fileCount;

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
      <PriorityCard
        title="Overdue invoices"
        subtitle={`${overdue.length} late invoice${overdue.length !== 1 ? "s" : ""} to collect`}
        value={<AnimatedNumber value={overdueTotal} format={formatCurrency} />}
        icon={<AlertTriangle className="h-5 w-5" />}
        accent="danger"
        animateKey={`danger-${animateKey}`}
        populated={populated}
      >
        <div className="space-y-2">
          {overdue.slice(0, 4).map((inv) => (
            <InvoiceChip key={inv.id} invoice={inv} />
          ))}
          {overdue.length > 4 && (
            <p className="py-1 text-center text-xs text-zinc-400">
              +{overdue.length - 4} more
            </p>
          )}
          {overdue.length === 0 && (
            <p className="rounded-lg bg-zinc-50 py-2 text-center text-xs text-zinc-400">
              All caught up
            </p>
          )}
        </div>
      </PriorityCard>

      <PriorityCard
        title="Unbilled completed shoots"
        subtitle={`${unbilled.length} completed shoot${unbilled.length !== 1 ? "s" : ""} never invoiced`}
        value={<AnimatedNumber value={unbilledTotal} format={formatCurrency} />}
        icon={<Camera className="h-5 w-5" />}
        accent="warning"
        animateKey={`warning-${animateKey}`}
        populated={populated}
      >
        <div className="space-y-2">
          {unbilled.slice(0, 4).map((b) => (
            <BookingChip key={b.id} booking={b} />
          ))}
          {unbilled.length > 4 && (
            <p className="py-1 text-center text-xs text-zinc-400">
              +{unbilled.length - 4} more
            </p>
          )}
          {unbilled.length === 0 && (
            <p className="rounded-lg bg-zinc-50 py-2 text-center text-xs text-zinc-400">
              Everything billed
            </p>
          )}
        </div>
      </PriorityCard>

      <PriorityCard
        title="At-risk client"
        subtitle={atRisk ? "Most likely to leave" : "No risk detected"}
        value={
          atRisk ? (
            <span className="block animate-card-populate text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {atRisk.name}
              <span className="ml-2 align-middle text-xs font-semibold uppercase tracking-wide text-red-600">
                risk
              </span>
            </span>
          ) : (
            <span className="text-3xl font-bold tracking-tight text-zinc-900">
              —
            </span>
          )
        }
        icon={<TrendingDown className="h-5 w-5" />}
        accent="danger"
        animateKey={`risk-${animateKey}-${atRisk?.id ?? "none"}`}
        populated={populated}
      >
        <div className="space-y-2">
          {atRisk ? (
            <>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-600">
                  <AnimatedNumber
                    value={
                      atRisk.productionTasks.filter((t) =>
                        t.status.toLowerCase().includes("delay")
                      ).length
                    }
                  />{" "}
                  delayed task(s)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-600">
                  <AnimatedNumber value={atRisk.messages.length} /> message(s)
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Users className="h-3.5 w-3.5 text-zinc-400" />
                <span className="text-zinc-600">
                  <AnimatedNumber
                    value={
                      atRisk.invoices.filter(
                        (i) => !isOverdue(i) && i.status !== "paid"
                      ).length
                    }
                  />{" "}
                  open invoice(s)
                </span>
              </div>
              <p className="mt-2 text-xs italic text-zinc-500">
                &quot;Suggest check-in call&quot;
              </p>
            </>
          ) : (
            <p className="rounded-lg bg-zinc-50 py-2 text-center text-xs text-zinc-400">
              All clients healthy
            </p>
          )}
        </div>
      </PriorityCard>

      <PriorityCard
        title="Lost leads / messages"
        subtitle={`${lost + unanswered} missed inquir${lost + unanswered !== 1 ? "ies" : "y"}`}
        value={<AnimatedNumber value={lost + unanswered} />}
        icon={<Flag className="h-5 w-5" />}
        accent="alert"
        animateKey={`alert-${animateKey}`}
        populated={populated}
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm">
            <span className="font-medium text-zinc-800">Lost leads</span>
            <span className="font-semibold tabular-nums text-zinc-900">
              <AnimatedNumber value={lost} />
            </span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white/80 px-3 py-2 text-sm">
            <span className="font-medium text-zinc-800">
              Unanswered messages
            </span>
            <span className="font-semibold tabular-nums text-zinc-900">
              <AnimatedNumber value={unanswered} />
            </span>
          </div>
          {lost + unanswered > 0 ? (
            <p className="mt-2 text-xs italic text-zinc-500">
              &quot;Suggest follow-up&quot;
            </p>
          ) : (
            <p className="rounded-lg bg-zinc-50 py-2 text-center text-xs text-zinc-400">
              Inbox clear
            </p>
          )}
        </div>
      </PriorityCard>
    </div>
  );
}
