"use client";

import { useState, useCallback } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Mail,
  Settings,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FileUploadArea } from "@/components/file-upload-area";
import { PriorityCards } from "@/components/priority-cards";
import { SuggestionModal } from "@/components/suggestion-modal";
import { ClientDirectory } from "@/components/client-directory";
import { MessagesView } from "@/components/views/messages-view";
import { FilesView } from "@/components/views/files-view";
import { SettingsView } from "@/components/views/settings-view";
import type { DashboardState } from "@/lib/types";
import { EMPTY_STATE } from "@/lib/types";

const NAV = [
  { name: "Dashboard", icon: LayoutDashboard, href: "#" },
  { name: "Clients", icon: Users, href: "#clients" },
  { name: "Messages", icon: Mail, href: "#messages" },
  { name: "Files", icon: FileText, href: "#files" },
  { name: "Settings", icon: Settings, href: "#settings" },
] as const;

export default function Page() {
  const [state, setState] = useState<DashboardState>(EMPTY_STATE);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleFilesParsed = useCallback((next: DashboardState) => {
    setState(next);
    setToast({
      message: `${next.fileCount} file(s) parsed and dashboard updated`,
      type: "success",
    });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleSuggestion = useCallback(() => {
    setModalOpen(false);
    setToast({ message: "Suggestion queued — awaiting your approval", type: "info" });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleReset = useCallback(() => {
    setState({ ...EMPTY_STATE });
    setActiveTab("dashboard");
    setToast({
      message: "Uploaded cache cleared — dashboard reset to empty state",
      type: "info",
    });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const overdueInvoices = state.invoices.filter((i) => i.status.toLowerCase() !== "paid");
  const completedBookings = state.bookings.filter((b) => b.status.toLowerCase() === "completed");

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <SuggestionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAction={handleSuggestion}
        invoices={overdueInvoices}
        bookings={completedBookings}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-3.5 md:px-8 lg:px-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 shadow-md shadow-amber-500/20 ring-1 ring-white/40">
                <span className="text-sm font-bold tracking-tight text-white">
                  A
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-lg font-bold tracking-tight text-zinc-900 sm:text-xl">
                    Axeom Studio
                  </h1>
                  <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    live
                  </span>
                </div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                  Operational dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:shrink-0">
              <FileUploadArea onFilesParsed={handleFilesParsed} />
            </div>
          </div>

          <nav className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5">
            {NAV.map((item) => (
              <button
                key={item.name}
                onClick={() =>
                  setActiveTab(item.name.toLowerCase().replace(" ", "-"))
                }
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                  activeTab === item.name.toLowerCase().replace(" ", "-")
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="px-6 py-6 md:px-8 lg:px-12 max-w-7xl mx-auto">
        {toast && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800 shadow-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        {activeTab === "dashboard" ? (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Priority actions</h2>
              <p className="text-sm text-zinc-500">Review within 10 seconds</p>
            </div>
            <PriorityCards state={state} />
          </section>
        ) : activeTab === "clients" ? (
          <section id="clients">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Client directory</h2>
              <p className="text-sm text-zinc-500">Unified client profiles</p>
            </div>
            <ClientDirectory clients={state.clients} />
          </section>
        ) : activeTab === "messages" ? (
          <MessagesView messages={state.messages} />
        ) : activeTab === "files" ? (
          <FilesView state={state} />
        ) : activeTab === "settings" ? (
          <SettingsView state={state} onReset={handleReset} />
        ) : null}
      </main>

      <footer className="border-t border-zinc-200 bg-white/50 backdrop-blur px-6 py-4 md:px-8 lg:px-12">
        <p className="text-xs text-zinc-400">
          Axeom Studio • Pack 153 Challenge • Client-side CSV parsing with PapaParse
        </p>
      </footer>
    </div>
  );
}
