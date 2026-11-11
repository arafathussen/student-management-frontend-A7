import React from "react";

export default function UniversitiesLoadingSkeleton() {
  return (
    <div className="min-h-screen py-10 px-4 max-w-7xl mx-auto animate-pulse">
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="h-6 w-48 rounded-full bg-slate-800 mx-auto" />
        <div className="h-10 w-80 sm:w-96 rounded-xl bg-slate-800/90 mx-auto" />
        <div className="h-4 w-full max-w-lg rounded bg-slate-800/60 mx-auto" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5 h-10 rounded-lg bg-slate-800" />
          <div className="md:col-span-4 h-10 rounded-lg bg-slate-800" />
          <div className="md:col-span-3 h-10 rounded-lg bg-slate-800" />
        </div>
      </div>

      {/* University Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-3/4 rounded bg-slate-800" />
                <div className="h-3.5 w-1/2 rounded bg-slate-800/70" />
              </div>
            </div>
            <div className="h-16 w-full rounded-xl bg-slate-800/50" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-6 w-24 rounded-full bg-slate-800" />
              <div className="h-9 w-28 rounded-xl bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

