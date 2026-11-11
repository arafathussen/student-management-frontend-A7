import React from "react";

export default function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#070d1f] p-4 sm:p-8 space-y-6 animate-pulse">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-7 w-64 rounded-xl bg-slate-800" />
            <div className="h-4 w-48 rounded bg-slate-800/60" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-3"
            >
              <div className="h-4 w-28 rounded bg-slate-800" />
              <div className="h-8 w-16 rounded-lg bg-slate-800/90" />
              <div className="h-3 w-36 rounded bg-slate-800/50" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 rounded-2xl border border-slate-800 bg-slate-900/70 p-6" />
          <div className="h-80 rounded-2xl border border-slate-800 bg-slate-900/70 p-6" />
        </div>
      </div>
    </div>
  );
}

