"use client";

import React, { useState, useRef } from "react";
import { Application, ApplicationDocument } from "@/types";
import { higherStudyService } from "@/services/higherStudyService";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  RefreshCw, 
  Plus, 
  Download, 
  ShieldCheck, 
  Check, 
  X,
  FileCheck,
  FileX,
  HelpCircle
} from "lucide-react";

interface ApplicationDocumentChecklistProps {
  application: Application;
  onRefresh: () => Promise<void> | void;
  isAdminOrCounselor?: boolean;
}

export const ApplicationDocumentChecklist: React.FC<ApplicationDocumentChecklistProps> = ({
  application,
  onRefresh,
  isAdminOrCounselor = false,
}) => {
  const [filter, setFilter] = useState<"ALL" | "REQUIRED" | "UPLOADED" | "VERIFIED" | "REJECTED">("ALL");
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ApplicationDocument | null>(null);

  // Admin Modal States
  const [targetDocToVerify, setTargetDocToVerify] = useState<ApplicationDocument | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [verifyingAction, setVerifyingAction] = useState(false);

  // Add Custom Doc Modal
  const [customDocModalOpen, setCustomDocModalOpen] = useState(false);
  const [customDocTitle, setCustomDocTitle] = useState("");
  const [customDocInstruction, setCustomDocInstruction] = useState("");
  const [addingCustomDoc, setAddingCustomDoc] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Hidden File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetDocForUpload, setTargetDocForUpload] = useState<ApplicationDocument | null>(null);

  const docs = application.documents || [];
  const verifiedCount = docs.filter((d) => d.status === "VERIFIED").length;
  const pendingCount = docs.filter((d) => d.status === "UPLOADED").length;
  const rejectedCount = docs.filter((d) => d.status === "REJECTED").length;
  const requiredCount = docs.filter((d) => d.status === "REQUIRED").length;
  const actionNeededCount = requiredCount + rejectedCount;
  const progressPercent = docs.length > 0 ? Math.round((verifiedCount / docs.length) * 100) : 0;

  // Priority sorting: Rejected & Action Needed at top, then Under Review, then Verified at bottom
  const sortedDocs = [...docs].sort((a, b) => {
    const priorityOrder: Record<string, number> = {
      REJECTED: 1,
      REQUIRED: 2,
      UPLOADED: 3,
      VERIFIED: 4,
    };
    return (priorityOrder[a.status] || 99) - (priorityOrder[b.status] || 99);
  });

  const filteredDocs = sortedDocs.filter((d) => {
    if (filter === "ALL") return true;
    if (filter === "REQUIRED") return d.status === "REQUIRED" || d.status === "REJECTED";
    return d.status === filter;
  });

  const triggerUpload = (doc: ApplicationDocument) => {
    setTargetDocForUpload(doc);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetDocForUpload) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit. Please upload a smaller file.");
      return;
    }

    let progressInterval: NodeJS.Timeout | null = null;
    try {
      setUploadingDocId(targetDocForUpload.id);
      setUploadProgress(15);
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 92) return 92;
          const jump = Math.floor(Math.random() * 14) + 6;
          return Math.min(prev + jump, 92);
        });
      }, 160);

      const formData = new FormData();
      formData.append("file", file);
      await higherStudyService.uploadApplicationDocument(targetDocForUpload.id, formData);
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);
      await onRefresh();
    } catch (err) {
      console.error("Failed to upload document", err);
      alert("Failed to upload document. Please try again.");
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setUploadingDocId(null);
      setUploadProgress(0);
      setTargetDocForUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAdminVerify = async (docId: string) => {
    try {
      setVerifyingAction(true);
      await higherStudyService.verifyDocument(docId, {
        status: "VERIFIED",
        adminFeedback: "Document verified and approved by Admissions Desk.",
      });
      await onRefresh();
    } catch (err) {
      console.error("Failed to approve document", err);
      alert("Failed to approve document.");
    } finally {
      setVerifyingAction(false);
    }
  };

  const handleAdminReject = async () => {
    if (!targetDocToVerify) return;
    try {
      setVerifyingAction(true);
      await higherStudyService.verifyDocument(targetDocToVerify.id, {
        status: "REJECTED",
        adminFeedback: rejectFeedback || "Document image is blurry or expired. Please upload a clear original copy.",
      });
      setRejectModalOpen(false);
      setRejectFeedback("");
      setTargetDocToVerify(null);
      await onRefresh();
    } catch (err) {
      console.error("Failed to reject document", err);
      alert("Failed to reject document.");
    } finally {
      setVerifyingAction(false);
    }
  };

  const handleAddCustomRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDocTitle.trim()) return;

    try {
      setAddingCustomDoc(true);
      await higherStudyService.addCustomDocument(application.id, {
        title: customDocTitle.trim(),
        instruction: customDocInstruction.trim() || "Upload requested document (Mandatory).",
      });
      setCustomDocModalOpen(false);
      setCustomDocTitle("");
      setCustomDocInstruction("");
      await onRefresh();
    } catch (err) {
      console.error("Failed to add custom checklist item", err);
      alert("Failed to add custom requirement.");
    } finally {
      setAddingCustomDoc(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
      />

      {/* Filter Chips & Action Controls (Centered for Desktop & Mobile) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pb-2">
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {[
            { key: "ALL", label: `All (${docs.length})` },
            { key: "REQUIRED", label: `Action Needed (${actionNeededCount})` },
            { key: "UPLOADED", label: `Under Review (${pendingCount})` },
            { key: "VERIFIED", label: `Verified (${verifiedCount})` },
            { key: "REJECTED", label: `Needs Re-upload (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filter === tab.key
                  ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40 border border-blue-500/50"
                  : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isAdminOrCounselor && (
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setCustomDocModalOpen(true)}
            className="cursor-pointer shrink-0 text-xs rounded-xl py-1.5 px-3"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            <span>Add Custom Requirement</span>
          </Button>
        )}
      </div>

      {/* Document Items List */}
      <div className="space-y-3">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((doc) => {
            const isUploaded = !!doc.fileUrl;
            const isVerified = doc.status === "VERIFIED";
            const isRejected = doc.status === "REJECTED";
            const isPending = doc.status === "UPLOADED";
            const isCurrentlyUploading = uploadingDocId === doc.id;

            return (
              <div
                key={doc.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isVerified
                    ? "bg-slate-900/60 border-emerald-500/30"
                    : isRejected
                    ? "bg-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/20"
                    : isPending
                    ? "bg-blue-950/20 border-blue-500/30"
                    : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left Column: Icon & Document Details */}
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isVerified
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : isRejected
                          ? "bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse"
                          : isPending
                          ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isVerified ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isRejected ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : isPending ? (
                        <Clock className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-sm text-white">{doc.title}</h4>
                        {doc.isCustom && (
                          <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">
                            Custom Request
                          </Badge>
                        )}
                        <Badge
                          variant={
                            isVerified
                              ? "success"
                              : isRejected
                              ? "danger"
                              : isPending
                              ? "info"
                              : "outline"
                          }
                          className="text-[10px]"
                        >
                          {isVerified
                            ? "Verified ✔️"
                            : isRejected
                            ? "Action Required ⚠️"
                            : isPending
                            ? "In Review ⏳"
                            : "Required 📄"}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-400 mt-1">
                        {doc.instruction || "Official scanned document required for university verification."}
                      </p>

                      {/* File Details, Feedback & Status Subtitles (Slim & Elegant) */}
                      {isVerified ? (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] mt-2">
                          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>ফাইল ভেরিফাইড ও অ্যাপ্রুভড</span>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-emerald-300/80">Verified &amp; approved by Admissions Desk</span>
                        </div>
                      ) : isRejected ? (
                        <div className="space-y-1.5 mt-2">
                          {doc.adminFeedback && (
                            <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-500/30 px-2.5 py-1.5 rounded-lg">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span className="font-medium text-rose-200">Admissions Desk: {doc.adminFeedback}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-semibold">
                            <span>⚠️ সংশোধিত ফাইল রি-আপলোড করুন</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-rose-300/70">Re-upload corrected copy</span>
                          </div>
                        </div>
                      ) : isPending ? (
                        <div className="flex flex-wrap items-center gap-2 text-[11px] mt-2">
                          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>ফাইল আপলোড সম্পন্ন হয়েছে</span>
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-amber-200/80">File attached &amp; in review by Admissions Desk</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center">
                    {isUploaded && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewDoc(doc)}
                        className="text-xs border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1 text-blue-400" />
                        <span>Preview</span>
                      </Button>
                    )}

                    {/* Upload / Status Display */}
                    {isUploaded && !isRejected ? (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold select-none">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{isVerified ? "Verified ✔️" : "Uploaded ✔️"}</span>
                      </div>
                    ) : (
                      <>
                        {isCurrentlyUploading ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 text-xs font-semibold shadow-inner shadow-blue-500/10">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                            <span>Uploading</span>
                            <div className="flex items-center gap-0.5 mx-0.5">
                              <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
                              <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse delay-75" />
                              <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse delay-150" />
                            </div>
                            <span className="font-mono text-xs font-bold text-blue-300 ml-0.5">
                              {uploadProgress || 25}%
                            </span>
                          </div>
                        ) : (
                          <Button
                            variant={isRejected ? "danger" : "gradient"}
                            size="sm"
                            onClick={() => triggerUpload(doc)}
                            className="text-xs cursor-pointer shadow-sm"
                          >
                            <UploadCloud className="w-3.5 h-3.5 mr-1.5" />
                            <span>{isRejected ? "Re-upload Corrected Copy" : "Upload File"}</span>
                          </Button>
                        )}
                      </>
                    )}

                    {/* Admin / Counselor Verification Controls */}
                    {isAdminOrCounselor && (
                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                        {!isVerified && (
                          <Button
                            variant="success"
                            size="sm"
                            disabled={verifyingAction}
                            onClick={() => handleAdminVerify(doc.id)}
                            className="text-xs cursor-pointer"
                            title="Approve & Mark Verified"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" />
                            <span>Verify</span>
                          </Button>
                        )}
                        {!isRejected && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={verifyingAction}
                            onClick={() => {
                              setTargetDocToVerify(doc);
                              setRejectFeedback(doc.adminFeedback || "");
                              setRejectModalOpen(true);
                            }}
                            className="text-xs border-rose-500/40 text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                            title="Request Correction or Re-upload"
                          >
                            <X className="w-3.5 h-3.5 mr-1 text-rose-400" />
                            <span>Reject</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/30 rounded-2xl border border-slate-800/60">
            No documents found in this filter category.
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">{previewDoc.title}</h4>
                <p className="text-xs text-slate-400">Application Document Preview</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                  title="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 max-h-[75vh] overflow-y-auto flex items-center justify-center bg-slate-950">
              {previewDoc.fileUrl?.endsWith(".pdf") ? (
                <iframe
                  src={previewDoc.fileUrl}
                  className="w-full h-[600px] rounded-xl border border-slate-800"
                  title={previewDoc.title}
                />
              ) : (
                <img
                  src={previewDoc.fileUrl}
                  alt={previewDoc.title}
                  className="max-h-[550px] max-w-full rounded-xl object-contain shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin Reject Feedback Modal */}
      {rejectModalOpen && targetDocToVerify && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h4 className="font-bold text-sm text-white">Request Document Correction</h4>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-300">
                Provide specific guidance for <strong>{targetDocToVerify.title}</strong> so the student knows exactly how to re-upload:
              </p>

              <textarea
                rows={4}
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="e.g. The uploaded passport image is blurry and page 2 is missing. Please upload a clear color PDF scan of the entire info booklet."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  disabled={verifyingAction}
                  onClick={handleAdminReject}
                  className="cursor-pointer"
                >
                  {verifyingAction ? "Rejecting..." : "Send Feedback & Request Re-upload"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add Custom Requirement Modal */}
      {customDocModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-sm text-white">Add Custom Requirement</h4>
              </div>
              <button
                type="button"
                onClick={() => setCustomDocModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomRequirement} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Document Name / Title</label>
                <input
                  type="text"
                  required
                  value={customDocTitle}
                  onChange={(e) => setCustomDocTitle(e.target.value)}
                  placeholder="e.g. Bank Solvency Certificate (Last 6 Months)"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Instructions for Student</label>
                <textarea
                  rows={3}
                  value={customDocInstruction}
                  onChange={(e) => setCustomDocInstruction(e.target.value)}
                  placeholder="e.g. Provide bank statement issued within the last 15 days showing minimum closing balance of £15,000."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setCustomDocModalOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  type="submit"
                  disabled={addingCustomDoc}
                  className="cursor-pointer"
                >
                  {addingCustomDoc ? "Adding..." : "Add to Checklist"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
