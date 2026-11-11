import React from "react";

export default function GlobalLoadingSkeleton() {
  return (
    <div className="min-h-[80vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-40 rounded-full bg-slate-800/80" />
        <div className="h-9 w-72 sm:w-96 rounded-xl bg-slate-800/90" />
        <div className="h-4 w-full max-w-xl rounded-lg bg-slate-800/60" />
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-800" />
              <div className="h-9 w-9 rounded-xl bg-slate-800" />
            </div>
            <div className="h-7 w-20 rounded-lg bg-slate-800/90" />
            <div className="h-3 w-32 rounded bg-slate-800/60" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((card) => (
          <div
            key={card}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/60 overflow-hidden space-y-4 p-5"
          >
            <div className="h-36 w-full rounded-xl bg-slate-800/80" />
            <div className="h-5 w-3/4 rounded bg-slate-800" />
            <div className="h-3.5 w-1/2 rounded bg-slate-800/70" />
            <div className="pt-2 flex items-center justify-between">
              <div className="h-6 w-20 rounded-full bg-slate-800" />
              <div className="h-8 w-24 rounded-xl bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

