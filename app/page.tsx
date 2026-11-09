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
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="flex flex-col gap-3 border-b border-zinc-100 px-6 py-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 shadow-md">
                <span className="text-white font-bold">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Axeom Studio</h1>
                <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                  Operational dashboard
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-200 bg-white text-xs font-medium text-zinc-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                All systems operational
              </span>
              <FileUploadArea onFilesParsed={handleFilesParsed} />
            </div>
          </div>

          <nav className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
            {NAV.map((item) => (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name.toLowerCase().replace(" ", "-"))}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  activeTab === item.name.toLowerCase().replace(" ", "-")
                    ? "bg-amber-50 text-amber-700 border border-amber-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                )}
              >
                <item.icon className="w-4 h-4" />
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Priority actions</h2>
              <p className="text-sm text-zinc-500">Review within 10 seconds</p>
            </div>
            <PriorityCards state={state} />
          </section>
        ) : activeTab === "clients" ? (
          <section id="clients">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold tracking-tight">Client directory</h2>
              <p className="text-sm text-zinc-500">Unified client profiles</p>
            </div>
            <ClientDirectory clients={state.clients} />
          </section>
        ) : (
          <section className="text-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Mail className="w-10 h-10 text-zinc-400" />
              <h3 className="text-lg font-semibold text-zinc-900">{activeTab}</h3>
              <p className="text-zinc-500">Coming soon</p>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 bg-white/50 backdrop-blur px-6 py-4 md:px-8 lg:px-12">
        <p className="text-xs text-zinc-400">
          Axeom Studio • Pack 153 Challenge • Client-side CSV parsing with PapaParse
        </p>
      </footer>
    </div>
  );
}
