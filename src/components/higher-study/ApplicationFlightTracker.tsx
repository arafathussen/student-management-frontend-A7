"use client";

import React from "react";
import { Application } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Flag,
  CircleDot,
} from "lucide-react";

interface ApplicationFlightTrackerProps {
  application: Application;
  onRefresh?: () => Promise<void> | void;
  onNavigateTab?: (tab: "CHECKLIST" | "TRACKING" | "PAYMENT") => void;
  isAdminOrCounselor?: boolean;
}

export interface TrackingMilestoneItem {
  id?: string;
  stageKey?: string;
  title: string;
  description?: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  completedAt?: string;
  note?: string;
}

const DEFAULT_FALLBACK_MILESTONES: TrackingMilestoneItem[] = [
  {
    id: "1",
    stageKey: "DOSSIER_OPENED",
    title: "Application Registered",
    description: "Admission file opened and assigned to an advisor.",
    status: "COMPLETED",
  },
  {
    id: "2",
    stageKey: "CHECKLIST_SUBMITTED",
    title: "Document Collection & Audit",
    description: "Academic transcripts, passport, and supporting files review.",
    status: "IN_PROGRESS",
  },
  {
    id: "3",
    stageKey: "UNIVERSITY_APPLICATION",
    title: "University Submission",
    description: "Formal application submitted to the admissions board.",
    status: "PENDING",
  },
  {
    id: "4",
    stageKey: "OFFER_LETTER",
    title: "Offer Letter & Confirmation",
    description: "Official admission offer letter issued.",
    status: "PENDING",
  },
  {
    id: "5",
    stageKey: "VISA_FILING",
    title: "Visa Filing & Departure",
    description: "Embassy visa processing and final enrollment readiness.",
    status: "PENDING",
  },
];

export const ApplicationFlightTracker: React.FC<ApplicationFlightTrackerProps> = ({
  application,
}) => {
  const rawMilestones = (application as any)?.trackingMilestones;
  const milestones: TrackingMilestoneItem[] =
    Array.isArray(rawMilestones) && rawMilestones.length > 0
      ? rawMilestones
      : DEFAULT_FALLBACK_MILESTONES;

  const totalCount = milestones.length;
  const completedCount = milestones.filter((m) => m.status === "COMPLETED").length;
  const inProgressIndex = milestones.findIndex((m) => m.status === "IN_PROGRESS");

  // Furthest reached point on the map (for progress line fill)
  const lastCompletedIndex = milestones.reduce(
    (acc, m, idx) => (m.status === "COMPLETED" ? idx : acc),
    -1
  );
  const activeNodeIndex =
    inProgressIndex !== -1
      ? inProgressIndex
      : lastCompletedIndex >= 0
      ? lastCompletedIndex
      : 0;

  const progressPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const routeLinePercent =
    totalCount > 1
      ? Math.min(100, Math.round((activeNodeIndex / (totalCount - 1)) * 100))
      : completedCount === totalCount
      ? 100
      : 0;

  const currentActiveStep = milestones[activeNodeIndex];

  return (
    <div className="space-y-5">
      {/* Parcel-Style Route Map Card */}
      <Card className="border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl overflow-hidden relative">
        {/* Subtle Map Grid Background */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.8) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-5 sm:p-7 relative z-10 space-y-6">
          {/* Compact Top Status Header (No University Name / No Clutter) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-500/30 uppercase tracking-wider"
                  >
                    Live Route Tracker
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">
                    #{application.id.slice(0, 8)}
                  </span>
                </div>
                <h3 className="font-bold text-base sm:text-lg text-white mt-0.5">
                  {completedCount === totalCount
                    ? "All Milestones Completed"
                    : currentActiveStep
                    ? `Current Checkpoint: ${currentActiveStep.title}`
                    : "Journey Roadmap"}
                </h3>
              </div>
            </div>

            {/* Progress Counter Pill */}
            <div className="flex items-center gap-3 self-start sm:self-center bg-slate-950/80 px-3.5 py-2.5 rounded-2xl border border-slate-800">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Progress
                </div>
                <div className="text-sm font-extrabold text-white font-mono">
                  {completedCount} of {totalCount} Done
                </div>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs font-mono">
                {progressPercentage}%
              </div>
            </div>
          </div>

          {/* Visual Parcel Route Map (Horizontal Route Line on Desktop) */}
          <div className="hidden md:block pt-3 pb-2 overflow-x-auto">
            <div className="relative min-w-[640px] px-4">
              {/* Dashed Upcoming Base Road */}
              <div className="absolute top-6 left-10 right-10 h-1 border-t-2 border-dashed border-slate-700/90" />

              {/* Completed / Active Glowing Route Line */}
              <div
                className="absolute top-[23px] left-10 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 rounded-full shadow-lg shadow-emerald-500/30 transition-all duration-700"
                style={{
                  width: `calc(${routeLinePercent}% - ${routeLinePercent > 0 ? "5rem" : "0px"})`,
                  maxWidth: "calc(100% - 5rem)",
                }}
              />

              {/* Route Checkpoints */}
              <div className="relative flex items-start justify-between gap-2 z-10">
                {milestones.map((step, idx) => {
                  const isCompleted = step.status === "COMPLETED";
                  const isCurrent = step.status === "IN_PROGRESS";
                  const isLast = idx === milestones.length - 1;

                  return (
                    <div
                      key={step.id || idx}
                      className="flex flex-col items-center text-center flex-1 min-w-[90px] max-w-[140px]"
                    >
                      <div className="relative">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                            isCompleted
                              ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25"
                              : isCurrent
                              ? "bg-blue-600 text-white ring-4 ring-blue-500/30 scale-110 shadow-xl shadow-blue-600/40"
                              : "bg-slate-900 text-slate-500 border border-slate-700/80"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : isCurrent ? (
                            <MapPin className="w-5 h-5 animate-bounce" />
                          ) : isLast ? (
                            <Flag className="w-4 h-4 text-slate-500" />
                          ) : (
                            <CircleDot className="w-4 h-4 text-slate-500" />
                          )}
                        </div>
                        {isCurrent && (
                          <span className="absolute -inset-1.5 rounded-2xl bg-blue-400/20 animate-ping pointer-events-none" />
                        )}
                      </div>

                      <div className="mt-3 space-y-0.5 px-1">
                        <div
                          className={`text-[11px] font-bold leading-snug line-clamp-2 ${
                            isCompleted
                              ? "text-emerald-300"
                              : isCurrent
                              ? "text-blue-300"
                              : "text-slate-400"
                          }`}
                        >
                          {step.title}
                        </div>
                        <div className="text-[10px]">
                          {isCompleted ? (
                            <span className="text-emerald-400 font-semibold">Completed</span>
                          ) : isCurrent ? (
                            <span className="text-blue-400 font-semibold">In Progress</span>
                          ) : (
                            <span className="text-slate-500">Upcoming</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Parcel Checkpoint History Timeline (Visible on all screens, acts as mobile map + desktop log) */}
          <div className="pt-2 border-t border-slate-800/70">
            <div className="relative pl-6 sm:pl-8 space-y-4 mt-3">
              {/* Vertical Route Spine */}
              <div className="absolute left-[11px] sm:left-[15px] top-2 bottom-2 w-0.5 bg-slate-800" />

              {milestones.map((step, idx) => {
                const isCompleted = step.status === "COMPLETED";
                const isCurrent = step.status === "IN_PROGRESS";

                return (
                  <div key={step.id || idx} className="relative">
                    {/* Checkpoint Dot on Vertical Route Spine */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-3.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${
                        isCompleted
                          ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                          : isCurrent
                          ? "bg-blue-600 border-blue-400 text-white ring-4 ring-blue-500/20"
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : isCurrent ? (
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    {/* Checkpoint Card */}
                    <div
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                        isCompleted
                          ? "bg-emerald-950/15 border-emerald-500/25"
                          : isCurrent
                          ? "bg-blue-950/25 border-blue-500/40 shadow-lg shadow-blue-950/30"
                          : "bg-slate-900/40 border-slate-800/70 opacity-75"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs sm:text-sm font-bold ${
                              isCompleted
                                ? "text-white"
                                : isCurrent
                                ? "text-blue-200"
                                : "text-slate-300"
                            }`}
                          >
                            {step.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCompleted
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : isCurrent
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {isCompleted
                              ? "Completed"
                              : isCurrent
                              ? "In Progress"
                              : "Upcoming"}
                          </span>
                        </div>

                        {step.completedAt && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 shrink-0">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{step.completedAt}</span>
                          </span>
                        )}
                      </div>

                      {step.description && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      )}

                      {step.note && (
                        <div className="mt-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300">
                          {step.note}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
