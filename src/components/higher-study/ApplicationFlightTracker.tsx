"use client";

import React, { useState } from "react";
import { Application } from "@/types";
import { higherStudyService } from "@/services/higherStudyService";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { 
  Plane, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Building2, 
  CreditCard, 
  Award, 
  ShieldCheck, 
  GraduationCap,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Info
} from "lucide-react";

interface ApplicationFlightTrackerProps {
  application: Application;
  onRefresh?: () => Promise<void> | void;
  onNavigateTab?: (tab: "CHECKLIST" | "TRACKING" | "PAYMENT") => void;
  isAdminOrCounselor?: boolean;
}

export interface FlightStage {
  key: string;
  label: string;
  shortLabel: string;
  icon: any;
  description: string;
  studentActionNote: string;
  actionTab?: "CHECKLIST" | "PAYMENT";
  actionButtonText?: string;
}

export const FLIGHT_STAGES: FlightStage[] = [
  {
    key: "SUBMITTED",
    label: "Application Registered",
    shortLabel: "Submitted",
    icon: FileText,
    description: "Your admission application has been registered into the central Rise Abroad database.",
    studentActionNote: "A senior education advisor has been assigned to coordinate your university dossier.",
  },
  {
    key: "DOCS_PENDING",
    label: "Document Verification",
    shortLabel: "Checklist",
    icon: CheckCircle2,
    description: "Academic transcripts, passport, and English scorecards are being verified against university standards.",
    studentActionNote: "Please complete all items in the Document Checklist to avoid university review delays.",
    actionTab: "CHECKLIST",
    actionButtonText: "Open Document Checklist",
  },
  {
    key: "PROCESSING",
    label: "University Admissions Board Review",
    shortLabel: "Uni Review",
    icon: Building2,
    description: "Your dossier is currently submitted and under formal evaluation by the university admissions committee.",
    studentActionNote: "Typical decision turnaround is 5-10 business days depending on intake capacity.",
  },
  {
    key: "PAYMENT_PENDING",
    label: "Tuition Deposit / Processing Clearance",
    shortLabel: "Deposit Fee",
    icon: CreditCard,
    description: "The university has pre-approved your application. Tuition deposit or processing fee payment is required.",
    studentActionNote: "Pay your invoice online or upload a bank wire slip to officially unlock your formal offer letter.",
    actionTab: "PAYMENT",
    actionButtonText: "View & Pay Invoice",
  },
  {
    key: "OFFER_ISSUED",
    label: "Official Offer Letter Issued",
    shortLabel: "Offer Issued",
    icon: Award,
    description: "Congratulations! Your official admission offer letter has been issued by the university.",
    studentActionNote: "Download your official offer letter from the Offer Letters tab or payment center.",
    actionTab: "PAYMENT",
    actionButtonText: "View Offer Letter Details",
  },
  {
    key: "VISA_PROCESSING",
    label: "Visa File Preparation & Interview Prep",
    shortLabel: "Visa Filing",
    icon: ShieldCheck,
    description: "Our dedicated visa wing is preparing your CAS/I-20, sponsorship affidavit, and embassy appointment file.",
    studentActionNote: "Your counselor will conduct a 1-on-1 mock embassy visa interview with you.",
  },
  {
    key: "ENROLLED",
    label: "Visa Approved & Departure Ready",
    shortLabel: "Enrolled",
    icon: GraduationCap,
    description: "Visa granted! Pre-departure briefing, student accommodation guidance, and university enrollment confirmed.",
    studentActionNote: "Bon Voyage! Welcome to your international higher education journey.",
  },
];

export const ApplicationFlightTracker: React.FC<ApplicationFlightTrackerProps> = ({
  application,
  onRefresh,
  onNavigateTab,
  isAdminOrCounselor = false,
}) => {
  const [updatingStage, setUpdatingStage] = useState(false);

  // Normalize status key
  const normalizedStatus = (status: string) => {
    if (status === "ACCEPTED") return "ENROLLED";
    if (status === "DOCUMENTS_UNDER_REVIEW") return "DOCS_PENDING";
    if (status === "OFFER_LETTER_ISSUED") return "OFFER_ISSUED";
    return status;
  };

  const currentStatusKey = normalizedStatus(application.status);
  const currentStageIndex = Math.max(
    0,
    FLIGHT_STAGES.findIndex((s) => s.key === currentStatusKey)
  );

  const activeStage = FLIGHT_STAGES[currentStageIndex] || FLIGHT_STAGES[0];
  const totalStages = FLIGHT_STAGES.length;
  const progressPercentage = Math.round(((currentStageIndex + 1) / totalStages) * 100);

  const handleAdvanceStage = async (newStatus: string) => {
    try {
      setUpdatingStage(true);
      await higherStudyService.updateStage(application.id, newStatus);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Failed to update application stage", err);
      alert("Failed to advance stage.");
    } finally {
      setUpdatingStage(false);
    }
  };

  const uniName = application.program?.university?.name || "Global University";
  const uniCountry = application.program?.university?.country?.name || "Destination";
  const studentOrigin = "Bangladesh";

  return (
    <div className="space-y-6">
      {/* Flight Banner Header */}
      <Card className="border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="p-5 sm:p-7 relative z-10 space-y-6">
          {/* Top Flight Route Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
                <Plane className="w-6 h-6 rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                    Flight Journey Tracker
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    App #{application.id.slice(0, 8)}
                  </span>
                </div>
                <h3 className="font-extrabold text-base sm:text-xl text-white tracking-tight mt-0.5">
                  {studentOrigin} <span className="text-blue-400">✈️</span> {uniCountry}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {uniName} • {application.program?.title || "Undergraduate / Postgraduate Program"}
                </p>
              </div>
            </div>

            {/* Flight Status Metric */}
            <div className="flex items-center gap-3 self-start sm:self-center bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Flight Stage
                </div>
                <div className="text-base font-extrabold text-white font-mono">
                  {currentStageIndex + 1} of {totalStages}
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
                {progressPercentage}%
              </div>
            </div>
          </div>

          {/* Animated Flight Path Progress Line (Desktop & Tablet) */}
          <div className="relative pt-4 pb-2 hidden md:block">
            {/* Background Contrail / Runway Track */}
            <div className="absolute top-8 left-6 right-6 h-1.5 bg-slate-800 rounded-full" />

            {/* Completed Glowing Flight Path */}
            <div
              className="absolute top-8 left-6 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full shadow-lg shadow-blue-500/50 transition-all duration-700"
              style={{
                width: `${(currentStageIndex / (totalStages - 1)) * 92}%`,
              }}
            />

            {/* Stage Waypoints along the flight path */}
            <div className="relative flex items-start justify-between z-10">
              {FLIGHT_STAGES.map((stg, idx) => {
                const isCompleted = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const isFuture = idx > currentStageIndex;
                const IconComponent = stg.icon;

                return (
                  <div key={stg.key} className="flex flex-col items-center text-center max-w-[120px]">
                    {/* Milestone Node */}
                    <div className="relative">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                          isCurrent
                            ? "bg-blue-600 text-white ring-4 ring-blue-500/30 scale-125 shadow-xl shadow-blue-600/40 z-20"
                            : isCompleted
                            ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                            : "bg-slate-900 text-slate-500 border border-slate-800"
                        }`}
                      >
                        {isCurrent ? (
                          <Plane className="w-5 h-5 rotate-45 animate-pulse" />
                        ) : isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <IconComponent className="w-4 h-4 text-slate-500" />
                        )}
                      </div>

                      {/* Active Radar Pulse for current stage */}
                      {isCurrent && (
                        <span className="absolute -inset-1 rounded-2xl bg-blue-400/20 animate-ping pointer-events-none" />
                      )}
                    </div>

                    {/* Step Name */}
                    <div className="mt-3">
                      <div
                        className={`text-xs font-bold leading-tight ${
                          isCurrent
                            ? "text-blue-300"
                            : isCompleted
                            ? "text-white"
                            : "text-slate-500"
                        }`}
                      >
                        {stg.shortLabel}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {isCurrent ? (
                          <span className="text-blue-400 font-semibold">Active Flight</span>
                        ) : isCompleted ? (
                          <span className="text-emerald-400 font-medium">Cleared</span>
                        ) : (
                          "Upcoming"
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile Vertical Stepper (When Screen is small) */}
          <div className="space-y-4 md:hidden">
            {FLIGHT_STAGES.map((stg, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const IconComponent = stg.icon;

              return (
                <div key={stg.key} className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      isCurrent
                        ? "bg-blue-600 text-white ring-2 ring-blue-500/30"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-900 text-slate-500 border border-slate-800"
                    }`}
                  >
                    {isCurrent ? <Plane className="w-4 h-4 rotate-45" /> : isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isCurrent ? "text-blue-300" : isCompleted ? "text-white" : "text-slate-500"}`}>
                      {stg.label}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {isCurrent ? "In Progress right now" : isCompleted ? "Completed" : "Awaiting previous steps"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Active Stage Detail & Action Card */}
      <Card className="bg-slate-900/70 border-slate-800 shadow-xl overflow-hidden">
        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                {currentStageIndex + 1}
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Current Milestone In Progress
                </span>
                <h4 className="font-extrabold text-base text-white">
                  {activeStage.label}
                </h4>
              </div>
            </div>

            <Badge variant="primary" className="text-xs self-start sm:self-auto">
              Stage Status: In Progress
            </Badge>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {activeStage.description}
          </p>

          {/* Student Guidance Callout */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-xs text-white">Admissions Desk Guidance</div>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeStage.studentActionNote}
              </p>
            </div>
            {activeStage.actionTab && onNavigateTab && (
              <Button
                variant="gradient"
                size="sm"
                onClick={() => onNavigateTab(activeStage.actionTab!)}
                className="text-xs shrink-0 cursor-pointer shadow-md shadow-blue-600/20"
              >
                <span>{activeStage.actionButtonText || "Take Action"}</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>

          {/* Admin Stage Progression Controls */}
          {isAdminOrCounselor && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-400">
                Staff Control: Advance Application Runway
              </span>

              <div className="flex items-center gap-2">
                {currentStageIndex < totalStages - 1 && (
                  <Button
                    variant="success"
                    size="sm"
                    disabled={updatingStage}
                    onClick={() => handleAdvanceStage(FLIGHT_STAGES[currentStageIndex + 1].key)}
                    className="text-xs cursor-pointer"
                  >
                    <Plane className="w-3.5 h-3.5 mr-1.5 rotate-45" />
                    <span>Advance to Next Stage ({FLIGHT_STAGES[currentStageIndex + 1].shortLabel})</span>
                  </Button>
                )}

                {currentStageIndex > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updatingStage}
                    onClick={() => handleAdvanceStage(FLIGHT_STAGES[currentStageIndex - 1].key)}
                    className="text-xs border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <span>Revert to {FLIGHT_STAGES[currentStageIndex - 1].shortLabel}</span>
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
