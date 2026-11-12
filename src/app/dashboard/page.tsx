"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { higherStudyService } from "@/services/higherStudyService";
import { Application, ApplicationDocument } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { OfferLetterModal } from "@/components/higher-study/OfferLetterModal";
import { SupportChatRoom } from "@/components/chat/SupportChatRoom";
import { ApplicationDocumentChecklist } from "@/components/higher-study/ApplicationDocumentChecklist";
import { ApplicationFlightTracker } from "@/components/higher-study/ApplicationFlightTracker";
import { ApplicationPaymentPortal } from "@/components/higher-study/ApplicationPaymentPortal";
import { notificationService } from "@/services/notificationService";
import { 
  GraduationCap, 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Download, 
  MessageSquare, 
  ArrowUpRight, 
  Building2, 
  RefreshCw, 
  Lock, 
  AlertCircle,
  ChevronRight,
  HelpCircle,
  LayoutDashboard,
  Bell,
  Settings,
  Menu,
  X,
  Plus,
  Send,
  UserCheck,
  Award,
  Globe2,
  TrendingUp,
  ShieldCheck,
  Check,
  ArrowRight,
  Plane,
  Compass,
  CreditCard,
  Receipt
} from "lucide-react";
import AdminCommandCenterPage from "@/app/admin/page";
import CounselorPortalPage from "@/app/counselor/page";
import { AccountSettingsModule } from "@/app/dashboard/profile/page";
import { Footer } from "@/components/common/Footer";

type StudentDashboardTab = 
  | "OVERVIEW"
  | "NOTIFICATIONS"
  | "APPLICATIONS" 
  | "OFFER_LETTERS" 
  | "CHAT"
  | "SETTINGS";

interface StudentNotification {
  id: string;
  title: string;
  body: string;
  type: "SYSTEM" | "COUNSELING" | "DOCUMENTS";
  time: string;
  unread: boolean;
  actionUrl?: string | null;
}

function StudentDashboardView() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StudentDashboardTab>("OVERVIEW");
  const [appSubTab, setAppSubTab] = useState<"CHECKLIST" | "TRACKING" | "PAYMENT">("CHECKLIST");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Offer Letter modal state
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [modalApp, setModalApp] = useState<Application | null>(null);

  // Doc upload state
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [targetDocForUpload, setTargetDocForUpload] = useState<ApplicationDocument | null>(null);

  // Student Notifications State (Dynamic from Database with 3-Day TTL)
  const [notificationFilter, setNotificationFilter] = useState<string>("ALL");
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const formatRelativeTime = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / (60 * 1000));
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      if (days === 1) return "Yesterday";
      return `${days}d ago`;
    } catch {
      return "Recently";
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const raw = await notificationService.getMyNotifications();
      const formatted: StudentNotification[] = raw.map((item) => {
        let type: "SYSTEM" | "COUNSELING" | "DOCUMENTS" = "SYSTEM";
        const titleLower = item.title?.toLowerCase() || "";
        if (titleLower.includes("doc") || titleLower.includes("upload") || titleLower.includes("passport") || titleLower.includes("sop") || titleLower.includes("verified") || titleLower.includes("rejected")) {
          type = "DOCUMENTS";
        } else if (titleLower.includes("counsel") || titleLower.includes("admissions") || titleLower.includes("visa") || titleLower.includes("interview")) {
          type = "COUNSELING";
        }
        return {
          id: item.id,
          title: item.title,
          body: item.body,
          type,
          time: formatRelativeTime(item.createdAt),
          unread: !item.isRead,
          actionUrl: item.actionUrl,
        };
      });
      setNotifications(formatted);
    } catch (err) {
      console.error("Failed to fetch student notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  const handleNotificationClick = async (notif: StudentNotification) => {
    if (notif.unread) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
      );
      try {
        await notificationService.markAsRead(notif.id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    document.title = "Dashboard | Rise Abroad Education";
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyApplications();
      fetchNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("unread_notifications_count", String(unreadNotifCount));
      window.dispatchEvent(new CustomEvent("notifications-count-change", { detail: unreadNotifCount }));
    }
  }, [unreadNotifCount]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as StudentDashboardTab | null;
      const subTabParam = params.get("subTab") as "CHECKLIST" | "TRACKING" | "PAYMENT" | null;
      const paidParam = params.get("paid");
      if (tabParam && ["OVERVIEW", "NOTIFICATIONS", "APPLICATIONS", "OFFER_LETTERS", "CHAT", "SETTINGS"].includes(tabParam)) {
        setActiveTab(tabParam);
      }
      if (subTabParam && ["CHECKLIST", "TRACKING", "PAYMENT"].includes(subTabParam)) {
        setAppSubTab(subTabParam);
      }
      if (paidParam === "true" || subTabParam === "PAYMENT") {
        fetchMyApplications();
      }
    }
  }, []);

  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<StudentDashboardTab>;
      if (customEvent.detail && ["OVERVIEW", "NOTIFICATIONS", "APPLICATIONS", "OFFER_LETTERS", "CHAT", "SETTINGS"].includes(customEvent.detail)) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener("dashboard:switch-tab", handleSwitchTab);
    return () => window.removeEventListener("dashboard:switch-tab", handleSwitchTab);
  }, []);

  const fetchMyApplications = async () => {
    try {
      setLoading(true);
      const res = await higherStudyService.getMyApplications();
      const apps: Application[] = res.data || [];
      setApplications(apps);
      if (apps.length > 0 && !selectedApp) {
        setSelectedApp(apps[0]);
      } else if (apps.length > 0 && selectedApp) {
        const refreshed = apps.find((a) => a.id === selectedApp.id) || apps[0];
        setSelectedApp(refreshed);
      }
    } catch (err) {
      console.error("Failed to load student applications", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationPaymentSuccess = (appId: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, isFeePaid: true, isOfferUnlocked: true } : a))
    );
    setSelectedApp((prev) =>
      prev && prev.id === appId ? { ...prev, isFeePaid: true, isOfferUnlocked: true } : prev
    );
  };

  const handleOpenOfferLetter = (app: Application) => {
    setModalApp(app);
    setOfferModalOpen(true);
  };

  const handleDocumentFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetDocForUpload) return;

    try {
      setUploadingDocId(targetDocForUpload.id);
      const formData = new FormData();
      formData.append("file", file);

      await higherStudyService.uploadApplicationDocument(targetDocForUpload.id, formData);
      await fetchMyApplications();
    } catch (err) {
      console.error("Failed to upload document", err);
      alert("Failed to upload document. Please try again.");
    } finally {
      setUploadingDocId(null);
      setTargetDocForUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerUpload = (doc: ApplicationDocument) => {
    setTargetDocForUpload(doc);
    fileInputRef.current?.click();
  };

  // Pipeline stages
  const STAGES = [
    { key: "SUBMITTED", label: "Submitted" },
    { key: "DOCUMENTS_UNDER_REVIEW", label: "Doc Review" },
    { key: "PROCESSING", label: "Uni Processing" },
    { key: "OFFER_LETTER_ISSUED", label: "Offer Issued" },
    { key: "ACCEPTED", label: "Accepted / Enrolled" },
  ];

  const getStageIndex = (status: string) => {
    return STAGES.findIndex((s) => s.key === status);
  };

  // Calculate metrics for overview and badges
  const pendingDocsCount = applications.reduce((acc, app) => {
    return acc + (app.documents?.filter((d) => d.status !== "VERIFIED").length || 0);
  }, 0);
  const verifiedDocsCount = applications.reduce((acc, app) => {
    return acc + (app.documents?.filter((d) => d.status === "VERIFIED").length || 0);
  }, 0);
  const totalDocsCount = applications.reduce((acc, app) => {
    return acc + (app.documents?.length || 0);
  }, 0);
  const offerLettersCount = applications.filter((a) => !!a.offerLetterUrl).length;

  // Hierarchy requested by user:
  // 1. Overview
  // 2. Notifications (directly under Overview)
  // 3. Applications (includes Document Checklist inside)
  // 4. Live Chat (directly under Applications)
  // 5. Offer Letters
  const sidebarItems = [
    { id: "OVERVIEW" as const, label: "Overview", icon: LayoutDashboard },
    { id: "NOTIFICATIONS" as const, label: "Notifications", icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : undefined },
    { id: "APPLICATIONS" as const, label: "Applications", icon: Building2, badge: applications.length > 0 ? applications.length : undefined },
    { id: "CHAT" as const, label: "Live Chat", icon: MessageSquare },
    { id: "OFFER_LETTERS" as const, label: "Offer Letters", icon: Award, badge: offerLettersCount > 0 ? offerLettersCount : undefined },
    { id: "SETTINGS" as const, label: "Settings", icon: Settings },
  ];

  const filteredNotifications = notifications.filter((n) => {
    if (notificationFilter === "ALL") return true;
    return n.type === notificationFilter;
  });

  return (
    <div className="dashboard-viewport h-[calc(100dvh-4rem-1px)] sm:h-[calc(100dvh-5rem-1px)] bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDocumentFileSelect}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
      />

      {/* =========================================================================
          LEFT COLLAPSIBLE SIDEBAR (Admin Panel Style Hierarchy)
      ========================================================================= */}
      <aside 
        className={`hidden md:flex bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-xl shrink-0 transition-all duration-300 ease-in-out flex-col h-full z-20 ${
          isSidebarCollapsed ? "w-20" : "w-56 lg:w-64"
        }`}
      >
        {/* Sidebar Header & Toggle */}
        <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between gap-2 h-14">
          {!isSidebarCollapsed ? (
            <>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-white truncate tracking-tight">
                  {user?.name || "Student Applicant"}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Verified Applicant</span>
                </div>
              </div>

              {/* Collapse/Close Button */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(true)}
                title="Collapse Sidebar"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 text-slate-300 hover:text-white" />
              </button>
            </>
          ) : (
            /* Expand Button (Hamburger Menu) */
            <div className="w-full flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(false)}
                title="Expand Sidebar"
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
              >
                <Menu className="w-5 h-5 text-blue-400 hover:text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 px-2.5 py-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-md shadow-blue-950/40"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
                } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                }`} />

                {!isSidebarCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`min-w-[18px] h-[18px] px-1 text-[10px] font-medium rounded-full flex items-center justify-center shrink-0 leading-none ${
                        isActive
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-slate-800/90 text-slate-300 border border-slate-700/60 group-hover:bg-slate-700/80"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Collapsed Badge Dot Indicator */}
                {isSidebarCollapsed && item.badge !== undefined && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Portal Status */}
        <div className="p-2.5 border-t border-slate-800/80">
          <div className={`flex items-center gap-2 text-[11px] text-slate-400 px-2 py-1 ${isSidebarCollapsed ? "justify-center" : ""}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {!isSidebarCollapsed && <span className="truncate">Portal Live • Synced</span>}
          </div>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT MAIN WORKSPACE AREA (Independently Scrollable)
      ========================================================================= */}
      <main
        className={`flex-1 min-w-0 h-full ${
          activeTab === "CHAT"
            ? "overflow-hidden p-2 sm:p-4 lg:p-5 pb-16 md:pb-5 flex flex-col"
            : "overflow-y-auto p-4 sm:p-5 lg:p-6 pb-20 md:pb-6 space-y-6 custom-scrollbar flex flex-col justify-between"
        }`}
      >
        <div className={activeTab === "CHAT" ? "h-full flex-1 flex flex-col min-h-0" : undefined}>
        {/* Loading Workspace Skeleton (Matches Admin Panel: Stable Sidebar + Pulsing Skeleton) */}
        {authLoading || loading ? (
          <div className="space-y-6 animate-pulse pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800/60 p-4 space-y-3">
                  <div className="h-3 w-20 bg-slate-800/70 rounded" />
                  <div className="h-7 w-28 bg-slate-800/80 rounded" />
                </div>
              ))}
            </div>
            <div className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800/60" />
          </div>
        ) : (
          <>
            {/* ===================================================================
                TAB 1: OVERVIEW (Student Overview & Progress Summary)
            =================================================================== */}
            {activeTab === "OVERVIEW" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Overview Greeting Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] bg-slate-900/60 border-slate-800 text-slate-300">
                        Student Applicant Hub
                      </Badge>
                      <Badge variant="success" className="text-[10px]">
                        Verified Account
                      </Badge>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Hello, {user?.name || "Applicant"} 👋
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                      Track your admission applications, monitor document checklists, download offers, and message your counselor.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href="/universities">
                      <Button variant="gradient" size="sm" className="shadow-lg shadow-blue-600/20 cursor-pointer">
                        <GraduationCap className="w-4 h-4 mr-1.5" />
                        <span>Apply to New University</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 4 Overview KPI Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* KPI 1: Active Applications */}
                  <Card className="bg-slate-900/60 border-slate-800/80 hover:border-blue-500/30 transition-all shadow-xl">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Applications</span>
                        <Building2 className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-2xl font-bold text-white mt-2 font-mono">
                        {applications.length}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                        <Globe2 className="w-3 h-3 text-blue-400" />
                        <span>Global partner universities</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* KPI 2: Application Progression Status */}
                  <Card className="bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/30 transition-all shadow-xl">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Progression Status</span>
                        <TrendingUp className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="text-sm font-bold text-indigo-300 mt-2 truncate">
                        {selectedApp ? selectedApp.status.replace(/_/g, " ") : "Ready to Apply"}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {selectedApp ? `Program: ${selectedApp.program?.title || "Under Review"}` : "Select program from catalog"}
                      </div>
                    </CardContent>
                  </Card>

                  {/* KPI 3: Document Readiness */}
                  <Card className="bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/30 transition-all shadow-xl">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Document Readiness</span>
                        <FileText className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                        {verifiedDocsCount} <span className="text-xs text-slate-400 font-normal">/ {totalDocsCount || 0} Verified</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {pendingDocsCount > 0 ? `${pendingDocsCount} pending verification` : "All documents in order"}
                      </div>
                    </CardContent>
                  </Card>

                  {/* KPI 4: Counselor & Live Desk */}
                  <Card className="bg-slate-900/60 border-slate-800/80 hover:border-purple-500/30 transition-all shadow-xl">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Counselor Desk</span>
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="text-sm font-bold text-white mt-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Admissions Desk Active</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Live 1-on-1 counselor guidance
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Primary Application Progression & Quick Analysis View */}
                {applications.length > 0 && selectedApp ? (
                  <div className="space-y-6">
                    <Card className="bg-slate-900/60 border-slate-800/80 shadow-xl overflow-hidden">
                      <CardHeader className="border-b border-slate-800/80 pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                              Primary Admission Track
                            </span>
                            <CardTitle className="text-lg text-white mt-0.5">
                              {selectedApp.program?.university?.name}
                            </CardTitle>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {selectedApp.program?.title} • {selectedApp.program?.university?.city}, {selectedApp.program?.university?.country?.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setActiveTab("APPLICATIONS");
                                setAppSubTab("TRACKING");
                              }}
                              className="text-xs border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white cursor-pointer"
                            >
                              <span>View Application Details</span>
                              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        {/* Interactive Stage Pipeline Progress */}
                        <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 py-3">
                          {STAGES.map((stg, idx) => {
                            const currentStageIdx = getStageIndex(selectedApp.status);
                            const isCompleted = idx <= currentStageIdx;
                            const isCurrent = idx === currentStageIdx;

                            return (
                              <div key={stg.key} className="flex-1 flex flex-row md:flex-col items-center gap-3 md:text-center relative z-10">
                                <div
                                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                    isCurrent
                                      ? "bg-blue-600 text-white ring-4 ring-blue-500/20 scale-110 shadow-lg shadow-blue-500/30"
                                      : isCompleted
                                      ? "bg-emerald-500 text-white"
                                      : "bg-slate-800 text-slate-500 border border-slate-700"
                                  }`}
                                >
                                  {isCompleted && !isCurrent ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                  ) : (
                                    idx + 1
                                  )}
                                </div>
                                <div>
                                  <div className={`text-xs font-semibold ${isCurrent ? "text-blue-300" : isCompleted ? "text-white" : "text-slate-500"}`}>
                                    {stg.label}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {isCurrent ? "In Progress" : isCompleted ? "Completed" : "Upcoming"}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Shortcuts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div 
                        onClick={() => {
                          setActiveTab("APPLICATIONS");
                          setAppSubTab("CHECKLIST");
                        }}
                        className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                              Upload Documents
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {pendingDocsCount > 0 ? `${pendingDocsCount} documents need action` : "Checklist up to date"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div 
                        onClick={() => setActiveTab("CHAT")}
                        className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-purple-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors">
                              Chat with Counselor
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Get direct application feedback
                            </div>
                          </div>
                        </div>
                      </div>

                      <div 
                        onClick={() => setActiveTab("OFFER_LETTERS")}
                        className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                              Offer Letters
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              {offerLettersCount > 0 ? `${offerLettersCount} formal offers available` : "Awaiting university decisions"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Zero State when no applications started yet */
                  <Card className="text-center py-16 bg-slate-900/50 border-slate-800/80 shadow-xl">
                    <CardContent className="space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-white">No Applications Started Yet</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Explore premier global universities in the UK, Canada, USA, and Europe. Submit your admission inquiry and our counselors will assist you completely free of charge!
                      </p>
                      <Link href="/universities">
                        <Button variant="gradient" size="sm" className="shadow-lg shadow-blue-600/20 cursor-pointer">
                          Browse University Catalog
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ===================================================================
                TAB 2: NOTIFICATIONS STREAM (Directly under Overview)
            =================================================================== */}
            {activeTab === "NOTIFICATIONS" && (
              <div className="space-y-6 animate-in fade-in duration-200 w-full">
                {/* Notifications Custom Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                        Activity Center
                      </Badge>
                      {unreadNotifCount > 0 && (
                        <Badge variant="primary" className="text-[10px] bg-blue-600 text-white">
                          {unreadNotifCount} New
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Notifications
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                      Stay updated on admission progress, required document reviews, and official notices.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="h-8 px-3 text-xs border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    <span>Mark All as Read</span>
                  </Button>
                </div>

                {/* Notification Category Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {["ALL", "SYSTEM", "COUNSELING", "DOCUMENTS"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setNotificationFilter(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        notificationFilter === tab
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {tab === "ALL" ? "All Updates" : tab.charAt(0) + tab.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                  {loadingNotifications ? (
                    <div className="text-center py-12 text-xs text-slate-500 flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                      <span>Checking for new notifications...</span>
                    </div>
                  ) : filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                          notif.unread
                            ? "bg-slate-900/90 border-blue-500/40 shadow-lg shadow-blue-500/5 hover:border-blue-400"
                            : "bg-slate-900/40 border-slate-800/80 opacity-85 hover:border-slate-700"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          notif.type === "SYSTEM"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : notif.type === "COUNSELING"
                            ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                            : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                        }`}>
                          {notif.type === "SYSTEM" && <ShieldCheck className="w-4 h-4" />}
                          {notif.type === "COUNSELING" && <MessageSquare className="w-4 h-4" />}
                          {notif.type === "DOCUMENTS" && <FileText className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-sm text-white">
                              {notif.title}
                            </h4>
                            <span className="text-[11px] text-slate-500 font-mono shrink-0">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {notif.body}
                          </p>
                        </div>

                        {notif.unread && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-xs text-slate-500">
                      No notifications found in this category.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================================================================
                TAB 3: APPLICATIONS (Includes internal Document Checklist)
            =================================================================== */}
            {activeTab === "APPLICATIONS" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Top Centered Sub-Tabs Navigation (Compact pills without heavy wrapper, with subtle divider) */}
                <div className="flex flex-col items-center justify-center border-b border-slate-800/80 pb-6 mb-3">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                    {/* Sub-Tab 1: Document Checklist */}
                    <button
                      type="button"
                      onClick={() => setAppSubTab("CHECKLIST")}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        appSubTab === "CHECKLIST"
                          ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40 border border-blue-500/50"
                          : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/80"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Document Checklist</span>
                      {selectedApp && (
                        <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                          appSubTab === "CHECKLIST"
                            ? "bg-blue-700 text-blue-100"
                            : "bg-slate-800 text-slate-300"
                        }`}>
                          {selectedApp.documents?.filter((d) => d.status === "VERIFIED").length || 0}/{selectedApp.documents?.length || 0}
                        </span>
                      )}
                    </button>

                    {/* Sub-Tab 2: Tracking Journey */}
                    <button
                      type="button"
                      onClick={() => setAppSubTab("TRACKING")}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        appSubTab === "TRACKING"
                          ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40 border border-blue-500/50"
                          : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/80"
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5 text-blue-400" />
                      <span>Tracking Journey</span>
                    </button>

                    {/* Sub-Tab 3: Payment & Invoices (Completely hidden unless admin creates an invoice) */}
                    {selectedApp?.payments && selectedApp.payments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setAppSubTab("PAYMENT")}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          appSubTab === "PAYMENT"
                            ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40 border border-blue-500/50"
                            : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/80"
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Payment &amp; Invoices</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                          selectedApp.payments.some((p: any) => p.status === "PENDING" || p.status === "UNPAID")
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            selectedApp.payments.some((p: any) => p.status === "PENDING" || p.status === "UNPAID")
                              ? "bg-amber-400 animate-pulse"
                              : "bg-emerald-400"
                          }`} />
                          {selectedApp.payments.some((p: any) => p.status === "PENDING" || p.status === "UNPAID")
                            ? "Deposit Due"
                            : "Paid"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {applications.length === 0 ? (
                  /* Preview Guidance Cards when no active applications started yet */
                  <div className="space-y-6">
                    {appSubTab === "CHECKLIST" && (
                      <Card className="bg-slate-900/50 border-slate-800 text-center py-12 px-4 shadow-xl">
                        <CardContent className="space-y-4 max-w-xl mx-auto">
                          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
                            <FileText className="w-8 h-8" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Application Document Checklist</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Once you submit an admission inquiry to any of our partner universities, your interactive document checklist will appear here. You will be able to upload your Passport, Academic Transcripts, IELTS scorecards, and custom requirements requested by the admissions desk.
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-left">
                            {["Valid Passport", "HSC / Degree Transcripts", "IELTS / MOI Score", "Statement of Purpose"].map((item) => (
                              <div key={item} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                                <div className="text-[10px] text-blue-400 font-bold uppercase">Standard File</div>
                                <div className="text-white font-semibold mt-0.5">{item}</div>
                              </div>
                            ))}
                          </div>
                          <div className="pt-2">
                            <Link href="/universities">
                              <Button variant="gradient" size="sm">
                                <GraduationCap className="w-4 h-4 mr-1.5" />
                                <span>Browse Universities to Apply</span>
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {appSubTab === "TRACKING" && (
                      <Card className="bg-slate-900/50 border-slate-800 text-center py-12 px-4 shadow-xl">
                        <CardContent className="space-y-4 max-w-xl mx-auto">
                          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto">
                            <Compass className="w-8 h-8" />
                          </div>
                          <h3 className="text-lg font-bold text-white">A-to-Z Tracking Journey</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Your full study abroad trajectory—from application submission, document review, university review, tuition deposit clearance, offer letter unlock, embassy visa filing, to final departure—is tracked live with flight-style milestone updates.
                          </p>
                          <div className="pt-2">
                            <Link href="/universities">
                              <Button variant="gradient" size="sm">
                                <GraduationCap className="w-4 h-4 mr-1.5" />
                                <span>Start Application to Begin Journey</span>
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {appSubTab === "PAYMENT" && (
                      <Card className="bg-slate-900/50 border-slate-800 text-center py-12 px-4 shadow-xl">
                        <CardContent className="space-y-4 max-w-xl mx-auto">
                          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                            <Receipt className="w-8 h-8" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Tuition &amp; Fee Payment Clearance</h3>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            Zero surprise costs! All partner university application fees and tuition deposits are invoiced with full transparent breakdowns. You can pay securely online or via direct bank transfer, and instantly download electronically verified official payment receipts.
                          </p>
                          <div className="pt-2">
                            <Link href="/universities">
                              <Button variant="gradient" size="sm">
                                <GraduationCap className="w-4 h-4 mr-1.5" />
                                <span>Explore Partner Universities</span>
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : appSubTab === "CHECKLIST" ? (
                  /* FULL WIDTH DOCUMENT CHECKLIST (Without left university selector column) */
                  <div className="w-full space-y-6 animate-in fade-in duration-150">
                    {selectedApp ? (
                      <ApplicationDocumentChecklist
                        application={selectedApp}
                        onRefresh={fetchMyApplications}
                      />
                    ) : (
                      <Card className="p-8 text-center bg-slate-900/40 border-slate-800 text-slate-400">
                        Please select an application to view its document checklist.
                      </Card>
                    )}
                  </div>
                ) : appSubTab === "PAYMENT" ? (
                  <div className="animate-in fade-in duration-150">
                    {selectedApp ? (
                      <ApplicationPaymentPortal
                        application={selectedApp}
                        onRefresh={fetchMyApplications}
                        onPaymentSuccess={handleApplicationPaymentSuccess}
                      />
                    ) : (
                      <Card className="p-8 text-center bg-slate-900/40 border-slate-800 text-slate-400">
                        Please select an application to view its payment invoices.
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Applications List (1 col) */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Applications ({applications.length})
                        </h3>
                        <span className="text-[11px] text-blue-400">Click to view</span>
                      </div>
                      {applications.map((app) => {
                        const isSelected = selectedApp?.id === app.id;
                        return (
                          <div
                            key={app.id}
                            onClick={() => setSelectedApp(app)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? "bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30"
                                : "bg-slate-900/40 border-slate-800 hover:bg-slate-900/80 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-white text-sm">
                                {app.program?.university?.name || "Partner University"}
                              </div>
                              <Badge
                                variant={
                                  app.status === "OFFER_LETTER_ISSUED" || app.status === "ACCEPTED" || app.status === "ENROLLED"
                                    ? "success"
                                    : app.status === "REJECTED"
                                    ? "danger"
                                    : "primary"
                                }
                                className="text-[10px]"
                              >
                                {app.status.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {app.program?.title || "Degree Program"}
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                              <span>App ID: #{app.id.slice(0, 8)}</span>
                              <span className="text-blue-400 font-medium flex items-center">
                                {isSelected ? "Active View" : "Select"} <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Column: Flight Tracker */}
                    {selectedApp && (
                      <div className="lg:col-span-2 space-y-6">
                        <div className="animate-in fade-in duration-150">
                          <ApplicationFlightTracker
                            application={selectedApp}
                            onRefresh={fetchMyApplications}
                            onNavigateTab={(tab) => setAppSubTab(tab)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ===================================================================
                TAB 4: OFFER LETTERS & DECISIONS
            =================================================================== */}
            {activeTab === "OFFER_LETTERS" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Offer Letters Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Official Decisions
                      </Badge>
                      {offerLettersCount > 0 && (
                        <Badge variant="success" className="text-[10px]">
                          {offerLettersCount} Formal Offer{offerLettersCount > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Offer Letters
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                      Review, unlock, and download official acceptance and conditional admission offer letters.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {applications.map((app) => {
                    const hasOffer = !!app.offerLetterUrl;
                    const isFree = app.program?.university?.offerLetterPaymentType === "FREE";
                    const isUnlocked = isFree || app.isOfferUnlocked;

                    return (
                      <Card
                        key={app.id}
                        className={`border transition-all ${
                          hasOffer
                            ? "border-emerald-500/30 bg-gradient-to-tr from-emerald-950/10 via-slate-900 to-slate-900"
                            : "border-slate-800 bg-slate-900/60"
                        }`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Badge
                                variant={hasOffer ? "success" : "outline"}
                                className="text-[10px] mb-1.5"
                              >
                                {hasOffer ? "Formal Offer Issued" : "Pending Admission Decision"}
                              </Badge>
                              <CardTitle className="text-base text-white">
                                {app.program?.university?.name}
                              </CardTitle>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-white font-bold">
                              {app.program?.university?.name?.slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="text-xs text-slate-300">
                            Program: <strong className="text-white">{app.program?.title}</strong>
                          </div>

                          {hasOffer ? (
                            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-400">Offer Access:</span>
                                <span
                                  className={`font-semibold ${
                                    isUnlocked ? "text-emerald-400" : "text-amber-400"
                                  }`}
                                >
                                  {isUnlocked ? "🔓 Ready for Download" : "🔒 Tuition Deposit Required"}
                                </span>
                              </div>

                              <Button
                                variant="gradient"
                                className="w-full shadow-lg shadow-blue-600/20 cursor-pointer"
                                onClick={() => handleOpenOfferLetter(app)}
                              >
                                <Download className="w-4 h-4 mr-1.5" />
                                Access Official Offer Letter
                              </Button>
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-500 text-center">
                              The admissions team is currently reviewing your uploaded transcripts. Offer letters typically take 3-5 business days.
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ===================================================================
                TAB 5: LIVE COUNSELOR CHAT
            =================================================================== */}
            {activeTab === "CHAT" && (
              <div className="w-full h-full flex-1 min-h-0 flex flex-col animate-in fade-in duration-200">
                <SupportChatRoom
                  applicationId={selectedApp?.id}
                  studentUserId={user?.id}
                  studentName={user?.name || "Student"}
                  applicationTitle={
                    selectedApp?.program?.university?.name
                      ? `${selectedApp.program.university.name}${selectedApp.program?.title ? ` • ${selectedApp.program.title}` : ""}`
                      : "Admissions & Counseling Support Desk"
                  }
                />
              </div>
            )}

            {/* ===================================================================
                TAB 6: ACCOUNT SETTINGS (Embedded)
            =================================================================== */}
            {activeTab === "SETTINGS" && (
              <AccountSettingsModule embedded />
            )}
            {/* End of active tab content */}
          </>
        )}
        </div>
      </main>

      {/* =========================================================================
          MOBILE STICKY BOTTOM ICON-ONLY BAR (Excludes Notifications which is in Top Navbar)
      ========================================================================= */}
      <nav
        aria-label="Mobile Student Dashboard Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 z-40 flex items-center justify-around px-2 shadow-2xl"
      >
        {sidebarItems
          .filter((item) => item.id !== "NOTIFICATIONS")
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`relative p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-md shadow-blue-950/50"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.badge !== undefined && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-950" />
                )}
              </button>
            );
          })}
      </nav>

      {/* Offer Letter Popup Modal */}
      {modalApp && (
        <OfferLetterModal
          isOpen={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          application={modalApp}
          onUnlocked={fetchMyApplications}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  // Resolve role from state or localStorage cache to immediately preserve layout and prevent sidebar shift
  const effectiveRole = user?.role || (typeof window !== "undefined" ? (() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved)?.role : null;
    } catch {
      return null;
    }
  })() : null);

  if (effectiveRole === "SUPER_ADMIN" || effectiveRole === "ADMIN") {
    return <AdminCommandCenterPage />;
  }

  if (effectiveRole === "COUNSELOR") {
    return <CounselorPortalPage />;
  }

  return <StudentDashboardView />;
}
