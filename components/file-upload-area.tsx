"use client";

import { useState } from "react";
import { Upload, Plus, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseUploadedFile, buildDashboardState } from "@/lib/parsers";
import type { DashboardState } from "@/lib/types";

export interface FileUploadAreaProps {
  onFilesParsed: (state: DashboardState) => void;
}

export function FileUploadArea({ onFilesParsed }: FileUploadAreaProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [parsing, setParsing] = useState(false);

  const handleFiles = async (selected: File[]) => {
    const next = [...files, ...selected];
    setFiles(next);
    setParsing(true);
    try {
      const results = await Promise.all(next.map((f) => parseUploadedFile(f)));
      onFilesParsed(buildDashboardState(results));
    } finally {
      setParsing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === "text/csv" || f.name.endsWith(".csv") || f.name.endsWith(".txt")
    );
    if (dropped.length > 0) handleFiles(dropped);
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-3xl border-2 border-dashed transition-all duration-200",
        parsing || files.length > 0
          ? "border-amber-500/50 bg-amber-50/50"
          : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50"
      )}
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-200" aria-hidden="true">
        <div className="flex items-center justify-center h-full w-full">
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-zinc-200 flex items-center gap-2 text-zinc-700 text-sm font-medium uppercase tracking-wider">
            <Upload className="w-4 h-4" /> Drop files here
          </div>
        </div>
      </div>

      <input
        type="file"
        multiple
        accept=".csv,.txt"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) handleFiles(Array.from(e.target.files));
        }}
      />

      <div className="pt-10 px-6 text-center sm:pt-12">
        <div className="flex items-center justify-center">
          <Plus className="h-8 w-8 text-zinc-500" />
          <FileText
            className={cn(
              "h-8 w-8 ml-2",
              parsing || files.length > 0 ? "text-amber-600" : "text-zinc-500"
            )}
          />
        </div>
        <h3 className="mt-2 text-sm font-semibold text-zinc-900">
          Add new files
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Upload {files.length > 0 ? files.length : "multiple"} CSV or text file{files.length !== 1 ? "s" : ""}
          {parsing ? " — parsing…" : ""}
        </p>
        {parsing && (
          <p className="mt-1 text-xs text-amber-600 font-medium flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Parsing {files.length} file(s)…
          </p>
        )}
        <p className="mt-2 text-xs text-zinc-400">
          Supports: bookings.csv, invoices.csv, leads.csv, payments.csv,
          production_board.csv, costs.csv, team.csv, messages.txt
        </p>
      </div>

      {files.length > 0 && !parsing && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => {
              setFiles([]);
              onFilesParsed({
                bookings: [],
                invoices: [],
                leads: [],
                payments: [],
                productionTasks: [],
                costs: [],
                team: [],
                messages: [],
                clients: [],
                loaded: true,
                fileCount: 0,
              });
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors"
          >
            <AlertCircle className="w-3 h-3" /> Clear all
          </button>
        </div>
      )}
    </div>
  );
}
