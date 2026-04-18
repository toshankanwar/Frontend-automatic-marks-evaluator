"use client";

import { FileUp, BarChart3, Trash2 } from "lucide-react";

export default function EvalCard({ ev, onOpenUpload, onOpenResults, onDelete }) {
  return (
    <div className="group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-100/60 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-green-100/60 blur-2xl" />

      <div className="relative flex h-full flex-col">
        {/* Subject */}
        <div className="mb-3 inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          {ev.subject || "General"}
        </div>

        {/* Title */}
        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-800">
          {ev.title}
        </h3>

        {/* Meta */}
        <p className="mt-2 text-sm text-slate-500">
          Evaluation ID: <span className="font-medium">{ev.id?.slice?.(-6) || "—"}</span>
        </p>

        {/* Actions pinned to bottom */}
        <div className="mt-auto pt-5">
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 active:scale-[0.98]"
            >
              <FileUp size={16} />
              Upload
            </button>

            <button
              onClick={onOpenResults}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 active:scale-[0.98]"
            >
              <BarChart3 size={16} />
              Results
            </button>

            <button
              onClick={onDelete}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 active:scale-[0.98]"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}