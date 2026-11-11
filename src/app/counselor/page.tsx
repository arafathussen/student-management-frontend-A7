"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { higherStudyService } from "@/services/higherStudyService";
import { commissionService } from "@/services/commissionService";
import { Application, ApplicationDocument, CommissionRecord } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SupportChatRoom } from "@/components/chat/SupportChatRoom";
import { 
  Users, 
  FileCheck, 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  MessageSquare, 
  Search, 
  Filter, 
  GraduationCap, 
  Clock, 
  Send, 
  Lock, 
  Unlock, 
  FileUp, 
  Sparkles,
  ChevronRight,
  AlertCircle,
  Eye,
  RefreshCw
} from "lucide-react";

export default function CounselorPortalPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PIPELINE" | "VERIFICATION" | "COMMISSIONS" | "CHAT">("PIPELINE");

  // Selection for detailed review
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Counselor Note state
  const [newNote, setNewNote] = useState("");
  const [isPrivateNote, setIsPrivateNote] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Document Verification State
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [docFeedback, setDocFeedback] = useState("");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [targetDocToReject, setTargetDocToReject] = useState<ApplicationDocument | null>(null);

  // Issue Offer Letter State
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [issuingOffer, setIssuingOffer] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/counselor") {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCounselorData();
    }
  }, [isAuthenticated]);

  const fetchCounselorData = async () => {
    try {
      setLoading(true);
      const [appRes, commRes] = await Promise.all([
        higherStudyService.getAllApplications(),
        commissionService.getMyCommissions().catch(() => ({ data: [] })),
      ]);
      const apps = appRes.data || [];
      setApplications(apps);
      setCommissions(commRes.data || []);
      if (apps.length > 0 && !selectedApp) {
        setSelectedApp(apps[0]);
      } else if (apps.length > 0 && selectedApp) {
        const refreshed = apps.find((a: Application) => a.id === selectedApp.id) || apps[0];
        setSelectedApp(refreshed);
      }
    } catch (err) {
      console.error("Failed to load counselor data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (appId: string, newStage: string) => {
    try {
      await higherStudyService.updateStage(appId, newStage);
      await fetchCounselorData();
    } catch (err) {
      console.error("Failed to update stage", err);
      alert("Failed to update application stage.");
    }
  };

  const handleDocApprove = async (docId: string) => {
    try {
      setVerifyingDocId(docId);
      await higherStudyService.verifyDocument(docId, {
        status: "VERIFIED",
        adminFeedback: "Document verified and approved by Admissions Desk.",
      });
      await fetchCounselorData();
    } catch (err) {
      console.error("Failed to verify document", err);
    } finally {
      setVerifyingDocId(null);
    }
  };

  const handleDocReject = async () => {
    if (!targetDocToReject) return;
    try {
      setVerifyingDocId(targetDocToReject.id);
      await higherStudyService.verifyDocument(targetDocToReject.id, {
        status: "REJECTED",
        adminFeedback: docFeedback || "Document image is blurry or expired. Please upload a clear original copy.",
      });
      setFeedbackModalOpen(false);
      setDocFeedback("");
      setTargetDocToReject(null);
      await fetchCounselorData();
    } catch (err) {
      console.error("Failed to reject document", err);
    } finally {
      setVerifyingDocId(null);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newNote.trim()) return;

    try {
      setSubmittingNote(true);
      await higherStudyService.addCounselorNote(selectedApp.id, {
        note: newNote,
        isPrivate: isPrivateNote,
      });
      setNewNote("");
      await fetchCounselorData();
    } catch (err) {
      console.error("Failed to add note", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleIssueOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    try {
      setIssuingOffer(true);
      const formData = new FormData();
      if (offerFile) {
        formData.append("file", offerFile);
      }
      await higherStudyService.issueOfferLetter(selectedApp.id, formData);
      setIssueModalOpen(false);
      setOfferFile(null);
      await fetchCounselorData();
    } catch (err) {
      console.error("Failed to issue offer letter", err);
      alert("Failed to issue offer letter.");
    } finally {
      setIssuingOffer(false);
    }
  };

  const handleToggleOfferLock = async (appId: string, currentUnlocked: boolean) => {
    try {
      await higherStudyService.toggleOfferLock(appId, !currentUnlocked);
      await fetchCounselorData();
    } catch (err) {
      console.error("Failed to toggle offer lock", err);
    }
  };

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.student?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.program?.university?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalEarnings = commissions.reduce((sum, c) => sum + (c.counselorShareBDT || 0), 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <RefreshCw className="w-10 h-10 animate-spin text-primary-400 mx-auto" />
          <p className="text-sm">Loading Counselor Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 max-w-7xl mx-auto space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info">Counselor Workspace & Admissions Desk</Badge>
              <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                Staff ID: #{user?.id?.slice(0, 8) || "CONS-01"}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Counselor Desk: {user?.name || "Senior Counselor"}
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Verify applicant documents, issue offer letters, advance pipeline stages, and manage student communications.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-right">
              <span className="text-[11px] text-slate-400 block uppercase font-semibold">
                Earned Commission
              </span>
              <span className="text-lg font-bold text-emerald-400">
                ৳{totalEarnings.toLocaleString()} BDT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-sm">
        <button
          onClick={() => setActiveTab("PIPELINE")}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "PIPELINE"
              ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Users className="w-4 h-4" />
          Student Pipeline ({applications.length})
        </button>

        <button
          onClick={() => setActiveTab("VERIFICATION")}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "VERIFICATION"
              ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Document Verification Hub
        </button>

        <button
          onClick={() => setActiveTab("COMMISSIONS")}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "COMMISSIONS"
              ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Referral Commissions
        </button>

        <button
          onClick={() => setActiveTab("CHAT")}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 shrink-0 ${
            activeTab === "CHAT"
              ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Admissions Chat Room
        </button>
      </div>

      {/* Search & Filter bar for Pipeline */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            type="text"
            placeholder="Search by student name, email, or university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-950/60 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL">All Stages</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="DOCUMENTS_UNDER_REVIEW">Doc Review</option>
            <option value="PROCESSING">University Processing</option>
            <option value="OFFER_LETTER_ISSUED">Offer Issued</option>
            <option value="ACCEPTED">Accepted / Enrolled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* TAB 1: PIPELINE & CASE MANAGEMENT */}
      {activeTab === "PIPELINE" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Applications list */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Student Cases ({filteredApps.length})
            </h3>

            {filteredApps.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-900 border-primary-500/50 shadow-lg shadow-primary-500/10"
                      : "bg-slate-900/40 border-slate-800 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-white text-sm">
                        {app.student?.name || "Student Applicant"}
                      </div>
                      <div className="text-xs text-slate-400">{app.student?.email}</div>
                    </div>
                    <Badge
                      variant={
                        app.status === "OFFER_LETTER_ISSUED" || app.status === "ACCEPTED"
                          ? "success"
                          : "primary"
                      }
                      className="text-[10px]"
                    >
                      {app.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <div className="mt-2 text-xs text-slate-300 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-primary-400" />
                    {app.program?.university?.name} ({app.program?.title})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Application Action Panel (2 cols) */}
          {selectedApp ? (
            <div className="lg:col-span-2 space-y-6">
              {/* Top Action Header */}
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <Badge variant="primary" className="mb-1">
                        Application #{selectedApp.id.slice(0, 8)}
                      </Badge>
                      <CardTitle className="text-lg">
                        {selectedApp.student?.name} &bull; {selectedApp.program?.university?.name}
                      </CardTitle>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Degree: {selectedApp.program?.title} &bull; Contact: {selectedApp.student?.contactNo || "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => setIssueModalOpen(true)}
                      >
                        <FileUp className="w-3.5 h-3.5 mr-1" />
                        Issue Offer Letter
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Stage Switcher Controls */}
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">
                        Advance Application Stage:
                      </span>
                      <span className="text-slate-500">Current: <strong className="text-white">{selectedApp.status}</strong></span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { key: "SUBMITTED", label: "1. Submitted" },
                        { key: "DOCUMENTS_UNDER_REVIEW", label: "2. Review" },
                        { key: "PROCESSING", label: "3. Processing" },
                        { key: "OFFER_LETTER_ISSUED", label: "4. Offer" },
                        { key: "ACCEPTED", label: "5. Enrolled" },
                      ].map((stg) => (
                        <button
                          key={stg.key}
                          type="button"
                          onClick={() => handleStageChange(selectedApp.id, stg.key)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                            selectedApp.status === stg.key
                              ? "bg-primary-500 text-white shadow-lg shadow-primary-500/30"
                              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {stg.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Offer letter status & Lock controls */}
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-500 block">Offer Letter File:</span>
                      <span className="font-bold text-white text-sm">
                        {selectedApp.offerLetterUrl ? "Issued & Available" : "Not yet uploaded"}
                      </span>
                      <span className="text-xs text-slate-400 block mt-0.5">
                        Access Mode:{" "}
                        <strong className={selectedApp.isOfferUnlocked ? "text-emerald-400" : "text-amber-400"}>
                          {selectedApp.isOfferUnlocked ? "Unlocked for Student" : "Locked (Tuition Deposit)"}
                        </strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedApp.offerLetterUrl && (
                        <>
                          <a
                            href={selectedApp.offerLetterUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg"
                          >
                            Preview PDF
                          </a>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleOfferLock(selectedApp.id, selectedApp.isOfferUnlocked)}
                          >
                            {selectedApp.isOfferUnlocked ? (
                              <>
                                <Lock className="w-3.5 h-3.5 mr-1 text-amber-400" />
                                Lock Offer
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                                Unlock Offer
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Notes & Recommendations */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Counselor Notes & Communication Log
                    </h4>

                    <form onSubmit={handleAddNote} className="space-y-3">
                      <textarea
                        rows={3}
                        placeholder="Add a case note or recommendation for the student..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="w-full p-3 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                      />

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isPrivateNote}
                            onChange={(e) => setIsPrivateNote(e.target.checked)}
                            className="rounded border-slate-700 text-primary-500 focus:ring-0"
                          />
                          Private note (Counselors & Admins only)
                        </label>

                        <Button size="sm" variant="gradient" type="submit" isLoading={submittingNote}>
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Add Note
                        </Button>
                      </div>
                    </form>

                    <div className="space-y-2 mt-4">
                      {selectedApp.counselorNotes?.map((note) => (
                        <div
                          key={note.id}
                          className={`p-3 rounded-xl border text-xs ${
                            note.isPrivate
                              ? "bg-purple-950/20 border-purple-500/30 text-purple-200"
                              : "bg-slate-900 border-slate-800 text-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">
                              {note.counselor?.name || "Counselor"} {note.isPrivate && "(Private Internal)"}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p>{note.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="lg:col-span-2 py-16 text-center text-slate-500">
              Select an applicant to review their file and advance their stage.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DOCUMENT VERIFICATION */}
      {activeTab === "VERIFICATION" && selectedApp && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>
                Document Verification: {selectedApp.student?.name} &bull; {selectedApp.program?.university?.name}
              </span>
              <Badge variant="primary">
                {selectedApp.documents?.filter((d) => d.status === "VERIFIED").length || 0} /{" "}
                {selectedApp.documents?.length || 0} Approved
              </Badge>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {selectedApp.documents && selectedApp.documents.length > 0 ? (
              <div className="space-y-3">
                {selectedApp.documents.map((doc) => {
                  const isUploaded = !!doc.fileUrl;
                  const isVerified = doc.status === "VERIFIED";
                  const isRejected = doc.status === "REJECTED";

                  return (
                    <div
                      key={doc.id}
                      className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            isVerified
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : isRejected
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : isUploaded
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-slate-800 text-slate-500"
                          }`}
                        >
                          {isVerified ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : isRejected ? (
                            <XCircle className="w-5 h-5" />
                          ) : (
                            <FileCheck className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {doc.documentName}
                            </span>
                            {doc.isRequired && (
                              <span className="text-[10px] text-red-400 font-semibold uppercase">
                                Required
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            Status:{" "}
                            <span
                              className={
                                isVerified
                                  ? "text-emerald-400 font-medium"
                                  : isRejected
                                  ? "text-red-400 font-medium"
                                  : isUploaded
                                  ? "text-amber-400 font-medium"
                                  : "text-slate-500"
                              }
                            >
                              {doc.status.replace(/_/g, " ")}
                            </span>
                          </div>

                          {doc.adminFeedback && (
                            <div className="mt-1 text-xs text-red-400">
                              Feedback: {doc.adminFeedback}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {isUploaded && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 rounded-lg flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Doc
                          </a>
                        )}

                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => handleDocApprove(doc.id)}
                          disabled={isVerified || !isUploaded || verifyingDocId === doc.id}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            setTargetDocToReject(doc);
                            setFeedbackModalOpen(true);
                          }}
                          disabled={!isUploaded || verifyingDocId === doc.id}
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No documents uploaded yet for this application.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: COMMISSIONS */}
      {activeTab === "COMMISSIONS" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Counselor Commission Ledger</span>
              <span className="text-xs text-emerald-400 font-bold">
                Total Earned: ৳{totalEarnings.toLocaleString()} BDT
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {commissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Application</th>
                      <th className="p-3">Student</th>
                      <th className="p-3">Gross USD</th>
                      <th className="p-3">Your Share (BDT)</th>
                      <th className="p-3">Payout Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {commissions.map((comm) => (
                      <tr key={comm.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-semibold text-white">
                          {comm.application?.program?.university?.name || "University"}
                        </td>
                        <td className="p-3">{comm.student?.name || "Student"}</td>
                        <td className="p-3 font-mono">${comm.grossAmountUSD?.toLocaleString()}</td>
                        <td className="p-3 font-bold text-emerald-400 font-mono">
                          ৳{comm.counselorShareBDT?.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={comm.withdrawalStatus === "WITHDRAWN" ? "success" : "warning"}
                          >
                            {comm.withdrawalStatus || "PENDING"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500">
                No commission entries recorded yet. Once student enrollments are completed, referral shares will appear here.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: CHAT */}
      {activeTab === "CHAT" && selectedApp && (
        <div className="max-w-4xl mx-auto">
          <SupportChatRoom
            applicationId={selectedApp.id}
            applicationTitle={`${selectedApp.student?.name} - ${selectedApp.program?.university?.name}`}
          />
        </div>
      )}

      {/* Reject Document Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Reject Document & Send Feedback"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p>
            Explain why <strong>{targetDocToReject?.documentName}</strong> is rejected so the student can re-upload the correct version.
          </p>

          <textarea
            rows={3}
            placeholder="e.g. Scanned copy is blurry or missing signatures. Please upload a clear color PDF scan."
            value={docFeedback}
            onChange={(e) => setDocFeedback(e.target.value)}
            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDocReject}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* Issue Offer Letter Modal */}
      <Modal
        isOpen={issueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title="Issue Official Offer Letter"
      >
        <form onSubmit={handleIssueOffer} className="space-y-4 text-xs text-slate-300">
          <p>
            Upload the signed Admission / Acceptance Offer Letter PDF for{" "}
            <strong className="text-white">{selectedApp?.student?.name}</strong> at{" "}
            <strong className="text-white">{selectedApp?.program?.university?.name}</strong>.
          </p>

          <div className="p-6 border-2 border-dashed border-slate-700 hover:border-primary-500 rounded-2xl text-center space-y-2 bg-slate-950/40 cursor-pointer">
            <UploadCloud className="w-8 h-8 text-primary-400 mx-auto" />
            <div className="font-semibold text-white">
              {offerFile ? offerFile.name : "Click to select or drag & drop offer PDF"}
            </div>
            <p className="text-[11px] text-slate-500">Supports PDF, DOCX up to 25MB</p>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={(e) => setOfferFile(e.target.files?.[0] || null)}
              className="hidden"
              id="offer-upload-input"
            />
            <label
              htmlFor="offer-upload-input"
              className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer"
            >
              Browse Local File
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="gradient" type="submit" isLoading={issuingOffer}>
              Dispatch Offer Letter
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
