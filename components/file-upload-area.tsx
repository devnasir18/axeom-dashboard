"use client";

import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseUploadedFile, buildDashboardState } from "@/lib/parsers";
import { EMPTY_STATE, type DashboardState } from "@/lib/types";

export interface FileUploadAreaProps {
  onFilesParsed: (state: DashboardState) => void;
}

export function FileUploadArea({ onFilesParsed }: FileUploadAreaProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [parsing, setParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (selected: File[]) => {
    const accepted = selected.filter(
      (f) =>
        f.type === "text/csv" ||
        f.name.endsWith(".csv") ||
        f.name.endsWith(".txt")
    );
    if (accepted.length === 0) return;
    const next = [...files, ...accepted];
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
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) void handleFiles(dropped);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles([]);
    onFilesParsed({ ...EMPTY_STATE });
    if (inputRef.current) inputRef.current.value = "";
  };

  const hasFiles = files.length > 0;
  const statusLabel = parsing
    ? "Parsing…"
    : hasFiles
      ? `${files.length} file${files.length !== 1 ? "s" : ""} loaded`
      : "CSV or TXT";

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload CSV or text files"
      onClick={() => !parsing && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!parsing) inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={handleDrop}
      className={cn(
        "group relative flex min-w-[220px] max-w-[320px] cursor-pointer select-none items-center gap-3 rounded-2xl border px-3.5 py-2.5 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40",
        isDragging
          ? "scale-[1.02] border-amber-400 bg-amber-50 shadow-md shadow-amber-100/60"
          : hasFiles || parsing
            ? "border-amber-200/80 bg-gradient-to-r from-amber-50/80 to-white shadow-sm hover:border-amber-300 hover:shadow-md"
            : "border-zinc-200/80 bg-white/90 shadow-sm hover:border-zinc-300 hover:bg-white hover:shadow-md"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".csv,.txt"
        className="sr-only"
        onChange={(e) => {
          if (e.target.files) void handleFiles(Array.from(e.target.files));
        }}
      />

      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
          isDragging
            ? "bg-amber-500 text-white"
            : hasFiles || parsing
              ? "bg-amber-100 text-amber-700"
              : "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white"
        )}
      >
        {parsing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : hasFiles ? (
          <FileText className="h-4 w-4" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-zinc-900">
            {isDragging ? "Drop to upload" : "Add files"}
          </span>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              parsing
                ? "bg-amber-100 text-amber-700"
                : hasFiles
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-zinc-100 text-zinc-500"
            )}
          >
            {parsing ? (
              <>
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                parsing
              </>
            ) : hasFiles ? (
              <>
                <CheckCircle2 className="h-2.5 w-2.5" />
                ready
              </>
            ) : (
              "click or drop"
            )}
          </span>
        </div>
        <p className="truncate text-xs text-zinc-500">{statusLabel}</p>
      </div>

      {hasFiles && !parsing && (
        <button
          type="button"
          onClick={handleClear}
          className="shrink-0 rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600"
          aria-label="Clear uploaded files"
          title="Clear all"
        >
          <AlertCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
