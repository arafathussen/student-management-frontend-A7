"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { commissionService } from "@/services/commissionService";
import { higherStudyService } from "@/services/higherStudyService";
import { userService } from "@/services/userService";
import { paymentService } from "@/services/paymentService";
import { notificationService } from "@/services/notificationService";
import { CommissionRecord, Application, User, University, Country, Role } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { slugify } from "@/lib/utils";
import { ApplicationChecklistPresetTab } from "@/components/admin/ApplicationChecklistPresetTab";
import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";
import { 
  LayoutDashboard,
  Bell,
  FileText,
  Users,
  Mail,
  Home,
  Building2,
  BookOpen,
  Award,
  DollarSign,
  PieChart,
  PlusCircle,
  CreditCard,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Send,
  Eye,
  EyeOff,
  Lock,
  Settings,
  RefreshCw,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Calendar,
  ArrowUpRight,
  BarChart3,
  Globe2,
  Download,
  Check,
  Copy,
  Trash2,
  Inbox,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  X,
  UserCheck,
  UserX,
  FileCheck2,
  Layers,
  Sliders,
  ExternalLink,
  Crown,
  Shield,
  ShieldOff,
  Unlock,
  GraduationCap,
  Save,
  Edit3,
  RotateCcw,
  Tag,
  ImageIcon,
  MapPin,
  Plus,
  UploadCloud,
  PhoneCall,
  MessageSquare,
  ArrowRight,
  ArrowLeft,
  Play,
  Quote,
  KeyRound,
  Trophy,
  ArrowUp,
  ArrowDown,
  RotateCw,
  FileDown,
  Folder,
  Info,
  Compass
} from "lucide-react";
import ContactCmsTab from "@/components/admin/ContactCmsTab";
import { AccountSettingsModule } from "@/app/dashboard/profile/page";
import { contactService, ContactInquiry } from "@/services/contactService";
import { successStoryService, SuccessPageSettings, SuccessStoryItem } from "@/services/successStoryService";

export type AdminTab = 
  | "OVERVIEW"
  | "NOTIFICATIONS"
  | "APPLICATIONS"
  | "USERS"
  | "SETTINGS"
  | "INBOX"
  | "HOME_CMS"
  | "UNIVERSITIES"
  | "GUIDES_CMS"
  | "SUCCESS_CMS"
  | "CONTACT_CMS"
  | "FINANCIALS";

export default function AdminCommandCenterPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Active navigation tab & sidebar collapse state
  const [activeTab, setActiveTab] = useState<AdminTab>("OVERVIEW");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notificationPage, setNotificationPage] = useState(1);
  const [contactSubTab, setContactSubTab] = useState<"OFFICE_INFO" | "TEAM_DESK">("OFFICE_INFO");

  // Core Data States
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  // Visitor & Traffic Analytics State
  const [visitorStats, setVisitorStats] = useState<{ liveVisitors: number; totalGuestVisits: number; uniqueVisitors: number }>({
    liveVisitors: 0,
    totalGuestVisits: 0,
    uniqueVisitors: 0,
  });

  // Search & Filter States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string>("ALL");
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState<string>("ALL");
  const [notificationFilter, setNotificationFilter] = useState<string>("ALL");

  // Dynamic Notifications State from DB (Auto-cleaned with 3-Day TTL)
  const [notifications, setNotifications] = useState<any[]>([]);

  // Contact Inquiries (Inbox) & Sub-Tabs
  const [mailsSubTab, setMailsSubTab] = useState<"INBOX" | "AUTO_RESPONDER" | "RESET_PASSWORD" | "REGISTRATION_OTP" | "WELCOME_EMAIL">("INBOX");
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesUnreadCount, setInquiriesUnreadCount] = useState<number>(0);
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState<{ id: string; name: string; subject: string } | null>(null);
  const [isDeletingInquiry, setIsDeletingInquiry] = useState(false);

  // Auto-Responder & Email Templates Live Config State
  const [autoResponderSettings, setAutoResponderSettings] = useState({
    subject: "We Have Received Your Inquiry — Rise Abroad Education",
    senderName: "Rise Abroad Admissions Desk",
    senderEmail: "admissions@riseabroad.com",
    whatsappText: "জরুরি কোনো তথ্যের প্রয়োজন হলে অথবা ২৪ ঘণ্টার মধ্যে যোগাযোগ পেতে বিলম্ব হলে, আপনি সরাসরি আমাদের অফিসিয়াল হোয়াটসঅ্যাপে নক দিতে পারেন:",
    whatsappNumber: "+880 1712-345678",
    officeAddress: "Rise Abroad Education • Level 6, Navana Tower, Gulshan-1, Dhaka",
    hotline: "+880 1712-345678",
    email: "admissions@riseabroad.com",
    hours: "Counseling Desk: Sat – Thu (10AM – 7PM)",
    logoUrl: "",
    otpSubject: "Your Password Reset Code — Rise Abroad Education",
    otpHeading: "Password Reset Request",
    otpBodyMessage: "We received a request to reset your Rise Abroad Education account password. Use the verification code below to set a new password:",
    otpExpiryNote: "This code is valid for 10 minutes. If you did not request a password reset, please ignore this email or contact support immediately.",
    regOtpSubject: "Account Verification Code — Rise Abroad Education",
    regOtpHeading: "Verify Your Student Account",
    regOtpBodyMessage: "Thank you for registering with Rise Abroad Education. Please use the following 6-digit verification code to activate and verify your student account:",
    regOtpExpiryNote: "This code is valid for 10 minutes. For your security, do not share this code with anyone.",
    welcomeSubject: "Welcome to Rise Abroad Education — Account Registered",
    welcomeHeading: "Welcome to Rise Abroad Education!",
    welcomeMessage: "Thank you for creating an account with Rise Abroad Education. Your student profile has been verified successfully. You can now explore university programs, apply for scholarships, track your admission progress, and connect directly with senior counselors.",
    welcomeBtnText: "Access Student Portal",
    welcomeBtnUrl: "http://localhost:3000/dashboard",
  });
  const [isEditingAutoResponder, setIsEditingAutoResponder] = useState(false);
  const [isEditingResetPassword, setIsEditingResetPassword] = useState(false);
  const [isEditingRegOtp, setIsEditingRegOtp] = useState(false);
  const [isEditingWelcomeEmail, setIsEditingWelcomeEmail] = useState(false);
  const [savingAutoResponder, setSavingAutoResponder] = useState(false);
  const [autoResponderSaved, setAutoResponderSaved] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Success Stories CMS State
  const [successSubTab, setSuccessSubTab] = useState<"SETTINGS" | "CARDS">("SETTINGS");
  const [successSettings, setSuccessSettings] = useState<SuccessPageSettings>({
    badgeText: "Real Students • Real Visas • Proven Results",
    titlePart1: "Student",
    titlePart2: "Success Stories",
    description: "Celebrating Bangladeshi students accepted into premier global universities. Watch their interviews, read their visa journeys, and discover scholarship awards achieved with Rise Abroad Education.",
    stat1Value: "98.4%",
    stat1Label: "Visa Success Rate",
    stat2Value: "1,250+",
    stat2Label: "Visas Approved",
    stat3Value: "50%+",
    stat3Label: "Average Scholarship",
    stat4Value: "15+",
    stat4Label: "Study Destinations",
  });
  const [savingSuccessSettings, setSavingSuccessSettings] = useState(false);
  const [successSettingsSaved, setSuccessSettingsSaved] = useState(false);

  // Story Cards CMS State
  const [adminStoryCards, setAdminStoryCards] = useState<SuccessStoryItem[]>([]);
  const [loadingStoryCards, setLoadingStoryCards] = useState(false);
  const [storyCardView, setStoryCardView] = useState<"LIST" | "FULL_EDITOR">("LIST");
  const [storyForm, setStoryForm] = useState<Partial<SuccessStoryItem>>({
    slug: "",
    studentName: "",
    country: "Canada",
    homeInstitution: "",
    hometown: "",
    universityName: "",
    degreeName: "",
    intake: "Fall 2026 Intake",
    visaDate: "July 2026",
    thumbnailUrl: "",
    photoUrl: "",
    youtubeUrl: "",
    scholarshipNote: "",
    testimonial: "",
    storyContent: "",
    isPublished: true,
  });
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isCustomCountryMode, setIsCustomCountryMode] = useState(false);
  const [customCountryInput, setCustomCountryInput] = useState("");
  const [savingStoryCard, setSavingStoryCard] = useState(false);
  const [storyCardSearch, setStoryCardSearch] = useState("");
  const [storyCardCountryFilter, setStoryCardCountryFilter] = useState("ALL");

  // Guides & Blogs CMS State
  const [adminGuides, setAdminGuides] = useState<any[]>([]);
  const [guideStatusFilter, setGuideStatusFilter] = useState<"ALL" | "DRAFT" | "TRASH">("ALL");
  const [guideViewMode, setGuideViewMode] = useState<"LIST" | "EDITOR">("LIST");
  const [guideSearch, setGuideSearch] = useState("");
  const [guideCategoryFilter, setGuideCategoryFilter] = useState("ALL");
  const [guidePage, setGuidePage] = useState(1);
  const [savingGuide, setSavingGuide] = useState(false);
  const [guideBannerUploading, setGuideBannerUploading] = useState(false);
  const guideBannerInputRef = useRef<HTMLInputElement>(null);
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [guideDeleteTarget, setGuideDeleteTarget] = useState<{ guide: any; hard: boolean } | null>(null);
  const [isDeletingGuide, setIsDeletingGuide] = useState(false);
  const [guideForm, setGuideForm] = useState({
    title: "",
    category: "United Kingdom",
    readTime: "5 min read",
    excerpt: "",
    bannerUrl: "",
    tags: "UK Visa, CAS, Financial Proof",
    content: "",
  });

  const toUrlSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const validateSlugUniqueness = (slugToTest: string, currentStoryId?: string) => {
    const cleanSlug = toUrlSlug(slugToTest);
    if (!cleanSlug) {
      setSlugError(null);
      return true;
    }
    const conflict = adminStoryCards.find(
      (s) => s.id !== currentStoryId && s.slug && toUrlSlug(s.slug) === cleanSlug
    );
    if (conflict) {
      setSlugError(`⚠️ Already in use by student "${conflict.studentName}". Please choose a different serial (e.g. 03, 04) or customize the name.`);
      return false;
    }
    setSlugError(null);
    return true;
  };

  const handleAutoSuggestSlug = (customName?: string) => {
    const name = customName || storyForm.studentName || "student";
    const base = toUrlSlug(name) || "student";
    let nextNum = adminStoryCards.length + 1;
    let candidate = `${base}-${String(nextNum).padStart(2, "0")}`;
    while (adminStoryCards.some((s) => s.id !== storyForm.id && s.slug && toUrlSlug(s.slug) === candidate)) {
      nextNum++;
      candidate = `${base}-${String(nextNum).padStart(2, "0")}`;
    }
    setStoryForm((prev) => ({ ...prev, slug: candidate }));
    validateSlugUniqueness(candidate, storyForm.id);
  };

  // Home CMS Editor State
  const [homeCms, setHomeCms] = useState({
    heroTitle: "Your Global Pathway to World-Class Higher Education",
    heroSubtitle: "Direct university admissions, guaranteed scholarship guidance, and end-to-end visa file management for students worldwide.",
    partnerCount: "500+",
    visaSuccessRate: "98.5%",
    studentsHelped: "15,000+",
    ctaText: "Explore Universities"
  });
  const [homeCmsSaved, setHomeCmsSaved] = useState(false);

  // Sub-Admin Permission Delegation Modal
  const [permissionModalOpen, setPermissionModalOpen] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState<User | null>(null);
  const [adminPermissions, setAdminPermissions] = useState({
    canAddUniversity: true,
    canManageCommission: true,
    canDeleteRecords: false,
    limitedViewOnly: false
  });

  // User Management State (Super Admin Controls)
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [targetNewRole, setTargetNewRole] = useState<Role>("STUDENT");
  const [updatingRole, setUpdatingRole] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState(false);

  const [actionLoadingUserId, setActionLoadingUserId] = useState<string | null>(null);

  // 3-Way Commission Calculator State
  const [calcData, setCalcData] = useState({
    applicationId: "",
    counselorId: "",
    grossAmountUSD: 2500,
    taxPercent: 15,
    companySharePercent: 60,
    usdToBdtRate: 121.5,
  });
  const [creatingComm, setCreatingComm] = useState(false);
  const [commSuccess, setCommSuccess] = useState(false);

  // University creation & edit modal state
  const [uniModalOpen, setUniModalOpen] = useState(false);
  const [editingUniId, setEditingUniId] = useState<string | null>(null);
  const [uniStatusFilter, setUniStatusFilter] = useState<"ALL" | "DRAFT" | "TRASH">("ALL");

  // University Delete Confirmation Modal State
  const [uniDeleteModalOpen, setUniDeleteModalOpen] = useState(false);
  const [selectedUniForDelete, setSelectedUniForDelete] = useState<{ uni: University; hard: boolean } | null>(null);
  const [isDeletingUni, setIsDeletingUni] = useState(false);
  const [uniToast, setUniToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Applications Sub-Tabs, Trash & Delete States
  const [adminAppSubTab, setAdminAppSubTab] = useState<"APPLICATIONS" | "CHECKLIST_MASTER">("APPLICATIONS");
  const [appViewTab, setAppViewTab] = useState<"ALL" | "TRASH">("ALL");
  const [trashApplications, setTrashApplications] = useState<any[]>([]);
  const [loadingTrash, setLoadingTrash] = useState(false);
  const [appDeleteModalOpen, setAppDeleteModalOpen] = useState(false);
  const [selectedAppForDelete, setSelectedAppForDelete] = useState<{ app: any; hard: boolean } | null>(null);
  const [isDeletingApp, setIsDeletingApp] = useState(false);
  const [isRestoringApp, setIsRestoringApp] = useState<string | null>(null);
  const [isEmptyingTrash, setIsEmptyingTrash] = useState(false);
  const [appToast, setAppToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [availablePresets, setAvailablePresets] = useState<any[]>([]);
  const [selectedPresetToApply, setSelectedPresetToApply] = useState<string>("");
  const [isApplyingMasterPreset, setIsApplyingMasterPreset] = useState(false);

  // Auto-hide floating Toast notification after 4 seconds (Zero layout shift)
  useEffect(() => {
    if (!appToast) return;
    const timer = setTimeout(() => {
      setAppToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [appToast]);

  // Manage Application File Modal State
  const [manageAppModalOpen, setManageAppModalOpen] = useState(false);
  const [selectedAppForManage, setSelectedAppForManage] = useState<Application | null>(null);
  const [isAssigningPreset, setIsAssigningPreset] = useState(false);
  const [availableChecklistItems, setAvailableChecklistItems] = useState<any[]>([]);
  const [selectedSingleItemToApply, setSelectedSingleItemToApply] = useState<string>("");
  const [isAddingSingleItem, setIsAddingSingleItem] = useState(false);
  const [customDocTitle, setCustomDocTitle] = useState("");
  const [customDocInstruction, setCustomDocInstruction] = useState("");
  const [isAddingCustomDoc, setIsAddingCustomDoc] = useState(false);
  const [adminVerifyingDocId, setAdminVerifyingDocId] = useState<string | null>(null);
  const [adminRejectModalOpen, setAdminRejectModalOpen] = useState(false);
  const [adminRejectDoc, setAdminRejectDoc] = useState<any>(null);
  const [adminRejectFeedback, setAdminRejectFeedback] = useState("");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState("1500");
  const [invoiceCurrency, setInvoiceCurrency] = useState("USD");
  const [invoiceDescription, setInvoiceDescription] = useState("Tuition Deposit & Admission Clearance");
  const [invoicePaymentType, setInvoicePaymentType] = useState("OFFER_DEPOSIT");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isDeletingInvoiceId, setIsDeletingInvoiceId] = useState<string | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [editInvoiceDescription, setEditInvoiceDescription] = useState("");
  const [editInvoiceAmount, setEditInvoiceAmount] = useState("");
  const [editInvoiceCurrency, setEditInvoiceCurrency] = useState("USD");
  const [isUpdatingInvoice, setIsUpdatingInvoice] = useState(false);
  const [previewAdminDoc, setPreviewAdminDoc] = useState<any>(null);
  const [docRotation, setDocRotation] = useState<number>(0);
  const [isDownloadingDossier, setIsDownloadingDossier] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileDots, setCompileDots] = useState(".");

  // Delete Document Confirmation Modal with Typed "delete"
  const [docToDelete, setDocToDelete] = useState<any | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingDocModal, setIsDeletingDocModal] = useState(false);

  // Dossier 5 Sub-Tabs State
  const [dossierActiveTab, setDossierActiveTab] = useState<"FILE" | "INFO" | "TRACKING" | "PAYMENT" | "NOTES">("FILE");

  // Tab 2: Information State & Sub-Tabs ("CONTACT" | "UNIVERSITY")
  const [dossierInfoSubTab, setDossierInfoSubTab] = useState<"CONTACT" | "UNIVERSITY">("CONTACT");
  const [dossierWhatsApp, setDossierWhatsApp] = useState("");
  const [dossierAddress, setDossierAddress] = useState("");
  const [customInfoFields, setCustomInfoFields] = useState<Array<{ id: string; label: string; value: string }>>([]);
  const [newCustomLabel, setNewCustomLabel] = useState("");
  const [newCustomVal, setNewCustomVal] = useState("");
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [appliedUnisList, setAppliedUnisList] = useState<Array<{ id: string; universityName: string; programName: string; country: string; intake: string; status: string; notes?: string }>>([]);
  const [showAddUniModal, setShowAddUniModal] = useState(false);
  const [newUniName, setNewUniName] = useState("");
  const [newUniProgram, setNewUniProgram] = useState("");
  const [newUniCountry, setNewUniCountry] = useState("United Kingdom");
  const [newUniIntake, setNewUniIntake] = useState("September 2026");
  const [newUniStatus, setNewUniStatus] = useState("Application Submitted");
  const [newUniNotes, setNewUniNotes] = useState("");

  // Tab 3: Tracking State
  const [trackingStages, setTrackingStages] = useState<any[]>([]);
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [notifyStudentOnTracking, setNotifyStudentOnTracking] = useState(true);

  // Tab 5: Internal Notes State (Messenger Feed)
  const [internalNoteContent, setInternalNoteContent] = useState("");
  const [isPostingInternalNote, setIsPostingInternalNote] = useState(false);
  const [isDeletingNoteId, setIsDeletingNoteId] = useState<string | null>(null);

  const refreshApplicationDetails = async (appId: string) => {
    try {
      const singleRes = await higherStudyService.getApplicationById(appId);
      if (singleRes && singleRes.data) {
        setSelectedAppForManage(singleRes.data);
      }
      const allRes = await higherStudyService.getAllApplications({ limit: 100 });
      const safeApps = Array.isArray(allRes.data) ? allRes.data : allRes.data?.data || [];
      setApplications(safeApps);
    } catch (err) {
      console.error("Failed to refresh application", err);
    }
  };

  const handleOpenManageModal = (app: Application) => {
    setSelectedAppForManage(app);
    setManageAppModalOpen(true);
    setDossierActiveTab("FILE");
    refreshApplicationDetails(app.id);
    fetchAvailablePresets();
  };

  useEffect(() => {
    if (!selectedAppForManage) return;

    // 1. WhatsApp / Contact
    const rawContact = selectedAppForManage.student?.user?.contactNumber || selectedAppForManage.student?.contactNumber || "";
    setDossierWhatsApp(rawContact);
    setDossierAddress(selectedAppForManage.student?.address || "");

    // 2. Custom Information
    if (Array.isArray((selectedAppForManage as any).customInformation) && (selectedAppForManage as any).customInformation.length > 0) {
      setCustomInfoFields((selectedAppForManage as any).customInformation);
    } else {
      setCustomInfoFields([
        { id: "1", label: "Passport Number", value: "" },
        { id: "2", label: "Date of Birth", value: selectedAppForManage.student?.dateOfBirth ? new Date(selectedAppForManage.student.dateOfBirth).toLocaleDateString() : "" },
        { id: "3", label: "Academic CGPA / Score", value: "" },
        { id: "4", label: "English Proficiency (IELTS / PTE / MOI)", value: "" },
        { id: "5", label: "Emergency Guardian Contact", value: "" },
      ]);
    }

    // 3. Applied Universities
    if (Array.isArray((selectedAppForManage as any).appliedUniversities) && (selectedAppForManage as any).appliedUniversities.length > 0) {
      setAppliedUnisList((selectedAppForManage as any).appliedUniversities);
    } else {
      const primaryUni = (selectedAppForManage as any).university?.name || selectedAppForManage.program?.university?.name || "Partner University";
      const primaryProg = (selectedAppForManage as any).programName || selectedAppForManage.program?.name || "Degree Program";
      const primaryCountry = selectedAppForManage.program?.university?.country?.name || "United Kingdom";
      const primaryIntake = (selectedAppForManage as any).intake || "September 2026";
      setAppliedUnisList([
        {
          id: "primary-1",
          universityName: primaryUni,
          programName: primaryProg,
          country: primaryCountry,
          intake: primaryIntake,
          status: selectedAppForManage.status || "Application Submitted",
          notes: "Primary Portal Application Record",
        },
      ]);
    }

    // 4. Tracking Milestones
    if (Array.isArray((selectedAppForManage as any).trackingMilestones) && (selectedAppForManage as any).trackingMilestones.length > 0) {
      setTrackingStages((selectedAppForManage as any).trackingMilestones);
    } else {
      setTrackingStages([
        {
          id: "1",
          stageKey: "DOSSIER_OPENED",
          title: "Dossier Opened & Academic Profile Verified",
          description: "Student admission file opened, student profile and preliminary academic qualifications verified.",
          status: "COMPLETED",
          completedAt: new Date(selectedAppForManage.createdAt || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
          note: "File officially assigned to Admissions Desk.",
        },
        {
          id: "2",
          stageKey: "CHECKLIST_SUBMITTED",
          title: "Document Checklist Submission & Audit",
          description: "All mandatory academic certificates, passport, statement of purpose, and reference letters collected.",
          status: (selectedAppForManage.documents?.length || 0) > 0 ? "IN_PROGRESS" : "PENDING",
          completedAt: "",
          note: "Document verification in progress.",
        },
        {
          id: "3",
          stageKey: "UNIVERSITY_APPLICATION",
          title: "Application Lodged to Partner University",
          description: "Formal application dossier submitted directly to University Admissions Board.",
          status: "PENDING",
          completedAt: "",
          note: "Awaiting university admissions confirmation.",
        },
        {
          id: "4",
          stageKey: "CREDIBILITY_INTERVIEW",
          title: "Credibility Interview & University Assessment",
          description: "Internal compliance assessment and university admissions credibility interview.",
          status: "PENDING",
          completedAt: "",
          note: "Interview preparation guidance provided.",
        },
        {
          id: "5",
          stageKey: "OFFER_LETTER",
          title: "Conditional / Unconditional Offer Letter",
          description: "Official offer letter received from university. Tuition conditions detailed.",
          status: selectedAppForManage.isOfferUnlocked ? "COMPLETED" : "PENDING",
          completedAt: "",
          note: "Offer letter review by counselor.",
        },
        {
          id: "6",
          stageKey: "TUITION_DEPOSIT",
          title: "Tuition Deposit & Bank Solvency Verification",
          description: "Initial tuition fee deposit transferred to university bank account; 28-day funds verified.",
          status: selectedAppForManage.isFeePaid ? "COMPLETED" : "PENDING",
          completedAt: "",
          note: "Financial audit verified.",
        },
        {
          id: "7",
          stageKey: "CAS_ISSUED",
          title: "CAS / I-20 / Visa Letter Issued",
          description: "University issues official CAS (Confirmation of Acceptance for Studies) / I-20 document.",
          status: "PENDING",
          completedAt: "",
          note: "Immigration sponsorship confirmed.",
        },
        {
          id: "8",
          stageKey: "VISA_LODGED",
          title: "Student Visa Lodged with Embassy / VFS",
          description: "Online visa application submitted, health surcharge paid, and biometric appointment completed.",
          status: "PENDING",
          completedAt: "",
          note: "Visa file submitted to Embassy.",
        },
        {
          id: "9",
          stageKey: "VISA_APPROVED",
          title: "Visa Approved & Pre-Departure Briefing",
          description: "Student visa approved and stamped! Pre-departure guidance, accommodation, and airport pickup arranged.",
          status: "PENDING",
          completedAt: "",
          note: "Congratulations! Ready to fly.",
        },
      ]);
    }
  }, [selectedAppForManage?.id]);

  // Handle Save Info (WhatsApp, custom fields, multi-unis)
  const handleSaveDossierInfo = async () => {
    if (!selectedAppForManage) return;
    try {
      setIsSavingInfo(true);
      await higherStudyService.updateApplicationInformation(selectedAppForManage.id, {
        contactNumber: dossierWhatsApp,
        address: dossierAddress,
        customInformation: customInfoFields,
        appliedUniversities: appliedUnisList,
      });
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: "Student information & applied universities saved successfully!" });
    } catch (err: any) {
      console.error("Failed to save dossier information", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to save information." });
    } finally {
      setIsSavingInfo(false);
    }
  };

  // Handle Save Tracking
  const handleSaveTracking = async () => {
    if (!selectedAppForManage) return;
    try {
      setIsSavingTracking(true);
      await higherStudyService.updateApplicationTracking(selectedAppForManage.id, {
        trackingMilestones: trackingStages,
        notifyStudent: notifyStudentOnTracking,
        updateMessage: "Admissions advisor updated your admission tracking milestones.",
      });
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: "Tracking milestones updated & student notified!" });
    } catch (err: any) {
      console.error("Failed to save tracking", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to save tracking." });
    } finally {
      setIsSavingTracking(false);
    }
  };

  // Handle Post Internal Note
  const handlePostInternalNote = async () => {
    if (!selectedAppForManage || !internalNoteContent.trim()) return;
    try {
      setIsPostingInternalNote(true);
      await higherStudyService.addApplicationInternalNote(selectedAppForManage.id, {
        note: internalNoteContent.trim(),
      });
      setInternalNoteContent("");
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: "Internal case note posted successfully." });
    } catch (err: any) {
      console.error("Failed to post note", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to post note." });
    } finally {
      setIsPostingInternalNote(false);
    }
  };

  // Handle Delete Internal Note
  const handleDeleteInternalNote = async (noteId: string) => {
    if (!selectedAppForManage) return;
    try {
      setIsDeletingNoteId(noteId);
      await higherStudyService.deleteApplicationInternalNote(selectedAppForManage.id, noteId);
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: "Internal note deleted successfully." });
    } catch (err: any) {
      console.error("Failed to delete internal note", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to delete note." });
    } finally {
      setIsDeletingNoteId(null);
    }
  };

  const handleAdminAssignPreset = async (presetType: "5_DOCS" | "7_DOCS" | "9_DOCS") => {
    if (!selectedAppForManage) return;
    try {
      setIsAssigningPreset(true);
      await higherStudyService.assignPresetDocuments(selectedAppForManage.id, { presetType });
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: `Assigned ${presetType.replace("_", " ")} checklist successfully!` });
    } catch (err) {
      console.error("Failed to assign preset checklist", err);
      alert("Failed to assign preset checklist.");
    } finally {
      setIsAssigningPreset(false);
    }
  };

  const handleApplySingleItem = async () => {
    if (!selectedAppForManage) return;
    const found = availableChecklistItems.find((i: any) => i.id === selectedSingleItemToApply);
    if (!found) {
      setAppToast({ type: "error", message: "Please select an item from the library dropdown." });
      return;
    }

    try {
      setIsAddingSingleItem(true);
      await higherStudyService.addCustomDocument(selectedAppForManage.id, {
        title: found.title,
        instruction: found.instruction || "Upload requested document (Mandatory).",
      });
      setSelectedSingleItemToApply("");
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: `Added "${found.title}" to checklist!` });
    } catch (err: any) {
      console.error("Failed to add checklist item", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to add checklist item." });
    } finally {
      setIsAddingSingleItem(false);
    }
  };

  const handleAdminAddCustomDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForManage || !customDocTitle.trim()) return;
    try {
      setIsAddingCustomDoc(true);
      await higherStudyService.addCustomDocument(selectedAppForManage.id, {
        title: customDocTitle.trim(),
        instruction: customDocInstruction.trim() || "Upload requested document (Mandatory).",
      });
      setCustomDocTitle("");
      setCustomDocInstruction("");
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: "Custom document requirement added successfully!" });
    } catch (err) {
      console.error("Failed to add custom doc", err);
      alert("Failed to add custom document.");
    } finally {
      setIsAddingCustomDoc(false);
    }
  };

  const handleAdminDeleteDoc = async (docId: string) => {
    if (!selectedAppForManage) return;
    try {
      await higherStudyService.deleteDocument(docId);
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: "Document requirement removed from checklist." });
    } catch (err: any) {
      console.error("Failed to delete document requirement", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to delete document requirement." });
    }
  };

  const handleMoveDoc = (index: number, direction: "up" | "down") => {
    if (!selectedAppForManage || !selectedAppForManage.documents) return;
    const docs = [...selectedAppForManage.documents];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= docs.length) return;
    const temp = docs[index];
    docs[index] = docs[targetIndex];
    docs[targetIndex] = temp;
    setSelectedAppForManage({
      ...selectedAppForManage,
      documents: docs,
    });
  };

  const handleDownloadSingleDoc = async (doc: any) => {
    if (!doc.fileUrl) return;
    try {
      const res = await fetch(doc.fileUrl);
      const blob = await res.blob();
      let ext = "pdf";
      if (doc.fileUrl.match(/\.png(\?|$)/i)) ext = "png";
      else if (doc.fileUrl.match(/\.(jpg|jpeg)(\?|$)/i)) ext = "jpg";
      else if (doc.fileUrl.match(/\.webp(\?|$)/i)) ext = "webp";

      const cleanTitle = (doc.title || "Document")
        .trim()
        .replace(/[^a-zA-Z0-9_\-\s]/g, "")
        .replace(/\s+/g, "_");
      const filename = `${cleanTitle}.${ext}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Single download error", err);
      window.open(doc.fileUrl, "_blank");
    }
  };

  const handleConfirmDeleteDoc = async () => {
    if (!docToDelete || !selectedAppForManage) return;
    if (deleteConfirmText.trim().toLowerCase() !== "delete") return;

    try {
      setIsDeletingDocModal(true);
      await higherStudyService.deleteDocument(docToDelete.id);
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: `"${docToDelete.title}" removed from checklist.` });
      setDocToDelete(null);
      setDeleteConfirmText("");
    } catch (err: any) {
      console.error("Failed to delete document requirement", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to delete document requirement." });
    } finally {
      setIsDeletingDocModal(false);
    }
  };

  const handleDownloadCombinedDossier = async () => {
    if (!selectedAppForManage) return;
    let progressTimer: any = null;
    let dotsTimer: any = null;
    try {
      setIsDownloadingDossier(true);
      setCompileProgress(10);
      setCompileDots(".");

      dotsTimer = setInterval(() => {
        setCompileDots((prev) => (prev.length >= 3 ? "." : prev + "."));
      }, 400);

      progressTimer = setInterval(() => {
        setCompileProgress((prev) => {
          if (prev >= 90) return prev;
          const inc = Math.floor(Math.random() * 12) + 6;
          return Math.min(92, prev + inc);
        });
      }, 450);

      const orderedIds = (selectedAppForManage.documents || []).map((d: any) => d.id);
      const studentName = (selectedAppForManage.student?.user?.name || selectedAppForManage.student?.name || "Student").replace(/[^a-zA-Z0-9_-]/g, "_");

      const res = await higherStudyService.downloadDossierPDF(selectedAppForManage.id, {
        documentIds: orderedIds,
        customTitle: `${studentName}_All_Documents`,
      });

      setCompileProgress(100);

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${studentName}_All_Documents.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setAppToast({ type: "success", message: "All documents compiled & downloaded as single PDF!" });
    } catch (err: any) {
      console.error("Combined dossier download error", err);
      setAppToast({ type: "error", message: "Failed to generate or download combined documents PDF." });
    } finally {
      if (progressTimer) clearInterval(progressTimer);
      if (dotsTimer) clearInterval(dotsTimer);
      setTimeout(() => {
        setIsDownloadingDossier(false);
        setCompileProgress(0);
      }, 600);
    }
  };

  const handleAdminVerifyDoc = async (docId: string, status: "VERIFIED" | "REJECTED", feedback?: string) => {
    if (!selectedAppForManage) return;
    try {
      setAdminVerifyingDocId(docId);
      await higherStudyService.verifyDocument(docId, {
        status,
        adminFeedback: feedback || (status === "VERIFIED" ? "Verified and approved by Admissions Desk." : "Please upload a clearer copy."),
      });
      setAdminRejectModalOpen(false);
      setAdminRejectDoc(null);
      setAdminRejectFeedback("");
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: status === "VERIFIED" ? "Document approved and marked verified." : "Document rejected and re-upload notification sent to student." });
    } catch (err) {
      console.error("Failed to update doc status", err);
      alert("Failed to update document status.");
    } finally {
      setAdminVerifyingDocId(null);
    }
  };

  const handleAdminCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForManage) return;
    try {
      setIsCreatingInvoice(true);
      await paymentService.createApplicationInvoice({
        higherStudyApplicationId: selectedAppForManage.id,
        amount: Number(invoiceAmount),
        currency: invoiceCurrency,
        description: invoiceDescription,
        paymentType: invoicePaymentType,
      });
      setInvoiceModalOpen(false);
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: "Invoice created and notification sent to student!" });
    } catch (err) {
      console.error("Failed to create invoice", err);
      alert("Failed to create invoice.");
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!selectedAppForManage) return;
    try {
      setIsDeletingInvoiceId(invoiceId);
      await paymentService.deletePendingInvoice(invoiceId);
      await refreshApplicationDetails(selectedAppForManage.id);
      setAppToast({ type: "success", message: "Pending invoice cancelled and removed successfully." });
    } catch (err: any) {
      console.error("Failed to delete invoice", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to cancel invoice." });
    } finally {
      setIsDeletingInvoiceId(null);
    }
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    setIsUpdatingInvoice(true);
    try {
      await paymentService.updatePendingInvoice(editingInvoice.id, {
        amount: Number(editInvoiceAmount),
        currency: editInvoiceCurrency,
        description: editInvoiceDescription,
      });
      if (selectedAppForManage) {
        await refreshApplicationDetails(selectedAppForManage.id);
      }
      setAppToast({ type: "success", message: "Invoice updated successfully." });
      setEditingInvoice(null);
    } catch (err: any) {
      console.error("Failed to update invoice", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to update invoice." });
    } finally {
      setIsUpdatingInvoice(false);
    }
  };

  const handleAdminDownloadReceipt = async (paymentId: string) => {
    try {
      const blob = await paymentService.downloadReceipt(paymentId);
      if (blob) {
        const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `official_receipt_${paymentId.slice(0, 8)}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 2000);
        setAppToast({ type: "success", message: "Official receipt downloaded successfully!" });
      }
    } catch (err: any) {
      console.warn("Receipt download handler notice:", err);
      if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError" || err?.message === "Network Error") {
        setAppToast({ type: "success", message: "Receipt download initiated." });
      } else {
        setAppToast({ type: "error", message: err?.response?.data?.message || "Could not download receipt. Please try again." });
      }
    }
  };


  const fetchTrashApplications = async () => {
    try {
      setLoadingTrash(true);
      const res = await higherStudyService.getTrashApplications();
      const safe = Array.isArray(res.data) ? res.data : [];
      setTrashApplications(safe);
    } catch (err) {
      console.error("Failed to load trash applications", err);
    } finally {
      setLoadingTrash(false);
    }
  };

  const fetchAvailablePresets = async () => {
    try {
      const [res, itemsRes] = await Promise.all([
        higherStudyService.getChecklistPresets().catch(() => ({ data: [] })),
        higherStudyService.getChecklistItems().catch(() => ({ data: [] })),
      ]);
      if (res && res.data) {
        setAvailablePresets(Array.isArray(res.data) ? res.data : []);
      }
      if (itemsRes && itemsRes.data) {
        setAvailableChecklistItems(Array.isArray(itemsRes.data) ? itemsRes.data : []);
      }
    } catch (err) {
      console.error("Failed to load checklist presets or items", err);
    }
  };

  const handleOpenAppTrash = async () => {
    setAppViewTab("TRASH");
    await fetchTrashApplications();
  };

  const handleOpenAppDeleteModal = (app: any, hard = false) => {
    setSelectedAppForDelete({ app, hard });
    setAppDeleteModalOpen(true);
  };

  const handleConfirmDeleteApp = async () => {
    if (!selectedAppForDelete) return;
    const { app, hard } = selectedAppForDelete;
    try {
      setIsDeletingApp(true);
      if (hard) {
        await higherStudyService.permanentDeleteApplication(app.id);
        setAppToast({ type: "success", message: `Application #${app.applicationNumber || app.id.slice(0, 8)} permanently purged.` });
        await fetchTrashApplications();
      } else {
        await higherStudyService.deleteApplication(app.id);
        setAppToast({ type: "success", message: `Application for ${app.student?.user?.name || app.student?.name || "Student"} moved to Trash.` });
        const allRes = await higherStudyService.getAllApplications({ limit: 100 });
        const safeApps = Array.isArray(allRes.data) ? allRes.data : allRes.data?.data || [];
        setApplications(safeApps);
        await fetchTrashApplications();
      }
      setAppDeleteModalOpen(false);
      setSelectedAppForDelete(null);
    } catch (err: any) {
      console.error("Failed to delete application", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to delete application" });
    } finally {
      setIsDeletingApp(false);
    }
  };

  const handleRestoreApp = async (appId: string) => {
    try {
      setIsRestoringApp(appId);
      await higherStudyService.restoreApplication(appId);
      setAppToast({ type: "success", message: "Application restored from trash successfully!" });
      const allRes = await higherStudyService.getAllApplications({ limit: 100 });
      const safeApps = Array.isArray(allRes.data) ? allRes.data : allRes.data?.data || [];
      setApplications(safeApps);
      await fetchTrashApplications();
    } catch (err: any) {
      console.error("Failed to restore application", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to restore application" });
    } finally {
      setIsRestoringApp(null);
    }
  };

  const handleEmptyAllTrash = async () => {
    if (!confirm("Are you sure you want to permanently purge ALL applications in the trash? This action cannot be undone.")) return;
    try {
      setIsEmptyingTrash(true);
      await higherStudyService.emptyTrashApplications();
      setAppToast({ type: "success", message: "All trash applications permanently purged." });
      await fetchTrashApplications();
    } catch (err: any) {
      console.error("Failed to empty trash", err);
      setAppToast({ type: "error", message: err?.response?.data?.message || "Failed to empty trash" });
    } finally {
      setIsEmptyingTrash(false);
    }
  };

  const handleApplySelectedMasterPreset = async () => {
    if (!selectedAppForManage || !selectedPresetToApply) return;
    try {
      setIsApplyingMasterPreset(true);
      await higherStudyService.applyPresetToApplication(selectedAppForManage.id, {
        presetId: selectedPresetToApply,
      });
      await refreshApplicationDetails(selectedAppForManage.id);
      setSelectedPresetToApply("");
      setAppToast({ type: "success", message: "Checklist bundle applied to student application successfully!" });
    } catch (err: any) {
      console.error("Failed to apply master preset", err);
      alert(err?.response?.data?.message || "Failed to apply checklist preset bundle");
    } finally {
      setIsApplyingMasterPreset(false);
    }
  };

  const [newUni, setNewUni] = useState({
    name: "",
    countryId: "",
    city: "",
    minTuitionFee: 12000,
    maxTuitionFee: 25000,
    offerLetterPaymentType: "FREE",
    website: "",
    coverImageUrl: "",
    description: "",
    tags: "",
    status: "PUBLISHED" as "PUBLISHED" | "DRAFT",
    programs: [
      { name: "Computer Science & AI", degreeLevel: "BACHELOR", tuitionFee: 15500, durationYears: 4, intakeSeason: "Sep / Jan" },
      { name: "Global MBA & Management", degreeLevel: "MASTER", tuitionFee: 18500, durationYears: 2, intakeSeason: "Sep / Feb" },
    ],
  });
  const [creatingUni, setCreatingUni] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverDeleting, setCoverDeleting] = useState(false);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab") as AdminTab | null;
      if (tabParam) {
        setActiveTab(tabParam);
      }
      if (window.location.pathname === "/admin") {
        router.replace(tabParam ? `/dashboard?tab=${tabParam}` : "/dashboard");
      }
    }
  }, [router]);

  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const customEvent = e as CustomEvent<AdminTab>;
      if (customEvent.detail) {
        setActiveTab(customEvent.detail);
      }
    };
    window.addEventListener("admin:switch-tab", handleSwitchTab);
    return () => window.removeEventListener("admin:switch-tab", handleSwitchTab);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const tabMap: Record<AdminTab, string> = {
      OVERVIEW: "Overview - Dashboard",
      NOTIFICATIONS: "Notifications - Dashboard",
      APPLICATIONS: "Applications - Dashboard",
      USERS: "Users - Dashboard",
      SETTINGS: "Settings - Dashboard",
      INBOX: "Mails - Dashboard",
      HOME_CMS: "Home Page - Dashboard",
      UNIVERSITIES: "Universities - Dashboard",
      GUIDES_CMS: "Guides & Blogs - Dashboard",
      SUCCESS_CMS: "Success Stories - Dashboard",
      CONTACT_CMS: "Contact Page - Dashboard",
      FINANCIALS: "Commissions - Dashboard",
    };
    const pageName = tabMap[activeTab] || "Dashboard";
    document.title = `${pageName} | Rise Abroad Education`;
  }, [activeTab]);

  useEffect(() => {
    const unread = notifications.filter((n) => n.unread).length;
    if (typeof window !== "undefined") {
      localStorage.setItem("unread_notifications_count", String(unread));
      window.dispatchEvent(new CustomEvent("notifications-count-change", { detail: unread }));
    }
  }, [notifications]);

  const fetchAdminData = async (isBackground = false) => {
    try {
      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const [commRes, appRes, usrRes, uniRes, cntRes, visRes, inqRes, contactSettingsRes, trashAppRes, presetRes] = await Promise.all([
        commissionService.getAllCommissions().catch(() => ({ data: [] })),
        higherStudyService.getAllApplications().catch(() => ({ data: [] })),
        userService.getUsers({ limit: 100 }).catch(() => ({ data: [] })),
        higherStudyService.getUniversities({ includeDeleted: "true", limit: 100 }).catch(() => ({ data: [] })),
        higherStudyService.getCountries().catch(() => ({ data: [] })),
        userService.getVisitorStats().catch(() => ({ liveVisitors: 0, totalGuestVisits: 0, uniqueVisitors: 0 })),
        contactService.getInquiries().catch(() => ({ inquiries: [], unreadCount: 0 })),
        contactService.getSettings().catch(() => null),
        higherStudyService.getTrashApplications().catch(() => ({ data: [] })),
        higherStudyService.getChecklistPresets().catch(() => ({ data: [] })),
      ]);

      const rawCommissions = commRes.data?.commissions || commRes.data;
      const safeComms = Array.isArray(rawCommissions) ? rawCommissions : [];
      setCommissions(safeComms);

      const rawApps = appRes.data?.data || appRes.data;
      const safeApps = Array.isArray(rawApps) ? rawApps : [];
      setApplications(safeApps);

      const rawUsers = usrRes.data?.data || usrRes.data;
      const safeUsers = Array.isArray(rawUsers) ? rawUsers : [];
      setUsers(safeUsers);

      const rawUnis = uniRes.data?.data || uniRes.data;
      const safeUnis = Array.isArray(rawUnis) ? rawUnis : [];
      setUniversities(safeUnis);

      const rawCountries = cntRes.data?.data || cntRes.data;
      const safeCountries = Array.isArray(rawCountries) ? rawCountries : [];
      setCountries(safeCountries);

      if (visRes) {
        setVisitorStats({
          liveVisitors: visRes.liveVisitors ?? 0,
          totalGuestVisits: visRes.totalGuestVisits ?? 0,
          uniqueVisitors: visRes.uniqueVisitors ?? 0,
        });
      }

      // Handle Live Inquiries
      const liveInquiriesList = Array.isArray(inqRes?.inquiries) ? inqRes.inquiries : [];
      setInquiries(liveInquiriesList);
      setInquiriesUnreadCount(inqRes?.unreadCount ?? liveInquiriesList.filter((i: any) => !i.isRead).length);
      if (liveInquiriesList.length > 0) {
        setSelectedInquiry((prev: any) => {
          if (!prev) return liveInquiriesList[0];
          const found = liveInquiriesList.find((i: any) => i.id === prev.id);
          return found || liveInquiriesList[0];
        });
      } else {
        setSelectedInquiry(null);
      }

      // Populate Auto-Responder & Email Template Settings if returned from DB
      if (contactSettingsRes) {
        setAutoResponderSettings({
          subject: contactSettingsRes.autoResponderSubject || "We Have Received Your Inquiry — Rise Abroad Education",
          senderName: contactSettingsRes.autoResponderSenderName || "Rise Abroad Admissions Desk",
          senderEmail: contactSettingsRes.autoResponderSenderEmail || "admissions@riseabroad.com",
          whatsappText: contactSettingsRes.autoResponderWhatsAppText || "জরুরি কোনো তথ্যের প্রয়োজন হলে অথবা ২৪ ঘণ্টার মধ্যে যোগাযোগ পেতে বিলম্ব হলে, আপনি সরাসরি আমাদের অফিসিয়াল হোয়াটসঅ্যাপে নক দিতে পারেন:",
          whatsappNumber: contactSettingsRes.autoResponderWhatsAppNumber || "+880 1712-345678",
          officeAddress: contactSettingsRes.autoResponderOfficeAddress || "Rise Abroad Education • Level 6, Navana Tower, Gulshan-1, Dhaka",
          hotline: contactSettingsRes.autoResponderHotline || "+880 1712-345678",
          email: contactSettingsRes.autoResponderEmail || contactSettingsRes.autoResponderSenderEmail || "admissions@riseabroad.com",
          hours: contactSettingsRes.autoResponderHours || "Counseling Desk: Sat – Thu (10AM – 7PM)",
          logoUrl: contactSettingsRes.autoResponderLogoUrl || "",
          otpSubject: contactSettingsRes.otpEmailSubject || "Your Password Reset Code — Rise Abroad Education",
          otpHeading: contactSettingsRes.otpEmailHeading || "Password Reset Request",
          otpBodyMessage: contactSettingsRes.otpEmailBodyMessage || "We received a request to reset your Rise Abroad Education account password. Use the verification code below to set a new password:",
          otpExpiryNote: contactSettingsRes.otpEmailExpiryNote || "This code is valid for 10 minutes. If you did not request a password reset, please ignore this email or contact support immediately.",
          regOtpSubject: contactSettingsRes.regOtpEmailSubject || "Account Verification Code — Rise Abroad Education",
          regOtpHeading: contactSettingsRes.regOtpEmailHeading || "Verify Your Student Account",
          regOtpBodyMessage: contactSettingsRes.regOtpEmailBodyMessage || "Thank you for registering with Rise Abroad Education. Please use the following 6-digit verification code to activate and verify your student account:",
          regOtpExpiryNote: contactSettingsRes.regOtpEmailExpiryNote || "This code is valid for 10 minutes. For your security, do not share this code with anyone.",
          welcomeSubject: contactSettingsRes.welcomeEmailSubject || "Welcome to Rise Abroad Education — Account Registered",
          welcomeHeading: contactSettingsRes.welcomeEmailHeading || "Welcome to Rise Abroad Education!",
          welcomeMessage: contactSettingsRes.welcomeEmailMessage || "Thank you for creating an account with Rise Abroad Education. Your student profile has been verified successfully. You can now explore university programs, apply for scholarships, track your admission progress, and connect directly with senior counselors.",
          welcomeBtnText: contactSettingsRes.welcomeEmailBtnText || "Access Student Portal",
          welcomeBtnUrl: contactSettingsRes.welcomeEmailBtnUrl || "http://localhost:3000/dashboard",
        });
      }

      if (safeApps.length > 0 && !calcData.applicationId) {
        setCalcData((prev) => ({
          ...prev,
          applicationId: safeApps[0].id,
          counselorId: safeApps[0].counselorId || "",
        }));
      }

      // Fetch Real In-App Notifications from DB (Filtered by 3-Day TTL)
      try {
        const notifList = await notificationService.getMyNotifications();
        if (Array.isArray(notifList)) {
          const formattedNotifs = notifList.map((item: any) => {
            let type: "REGISTRATION" | "SECURITY" | "APPLICATION" = "APPLICATION";
            const titleLower = (item.title || "").toLowerCase();
            if (titleLower.includes("registered") || titleLower.includes("signup") || titleLower.includes("otp") || titleLower.includes("welcome")) {
              type = "REGISTRATION";
            } else if (titleLower.includes("security") || titleLower.includes("login") || titleLower.includes("auth")) {
              type = "SECURITY";
            }
            return {
              id: item.id,
              type,
              title: item.title,
              description: item.body,
              time: formatLastActive(item.createdAt),
              timestamp: item.createdAt,
              unread: !item.isRead,
              role: "STUDENT",
              actionUrl: item.actionUrl,
            };
          });
          setNotifications(formattedNotifs);
        }
      } catch (notifFetchErr) {
        console.error("Failed to fetch admin notifications:", notifFetchErr);
      }

      if (trashAppRes && trashAppRes.data) {
        setTrashApplications(Array.isArray(trashAppRes.data) ? trashAppRes.data : []);
      }
      if (presetRes && presetRes.data) {
        setAvailablePresets(Array.isArray(presetRes.data) ? presetRes.data : []);
      }

      // Fetch Success Stories Page Header & Stats settings
      try {
        const sSettings = await successStoryService.getSettings();
        if (sSettings) {
          setSuccessSettings(sSettings);
        }
      } catch (e) {
        console.warn("Could not load success page settings in admin:", e);
      }

      // Fetch Success Stories Cards
      try {
        const sCardsRes = await successStoryService.getStories({ limit: 100 });
        const items = sCardsRes?.data || (Array.isArray(sCardsRes) ? sCardsRes : []);
        setAdminStoryCards(items);
      } catch (e) {
        console.warn("Could not load success story cards in admin:", e);
      }

      // Fetch Study Guides & Blogs
      try {
        const blogsRes = await higherStudyService.getBlogs({ limit: 100 });
        setAdminGuides(Array.isArray(blogsRes?.data) ? blogsRes.data : []);
      } catch (e) {
        console.warn("Could not load guides in admin:", e);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Poll live visitor traffic every 20s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const stats = await userService.getVisitorStats();
        if (stats) {
          setVisitorStats({
            liveVisitors: stats.liveVisitors ?? 0,
            totalGuestVisits: stats.totalGuestVisits ?? 0,
            uniqueVisitors: stats.uniqueVisitors ?? 0,
          });
        }
      } catch (err) {}
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // Safe Arrays
  const safeCommissions = Array.isArray(commissions) ? commissions : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeUsers = Array.isArray(users) ? users : [];
  const safeUniversities = Array.isArray(universities) ? universities : [];
  const activeUnisList = safeUniversities.filter((u) => !u.isDeleted && u.status !== "DRAFT" && !u.isDraft);
  const draftUnisList = safeUniversities.filter((u) => !u.isDeleted && (u.status === "DRAFT" || u.isDraft));
  const trashUnisList = safeUniversities.filter((u) => u.isDeleted);

  const displayedUniversities = safeUniversities.filter((u) => {
    if (uniStatusFilter === "DRAFT") {
      return !u.isDeleted && (u.status === "DRAFT" || u.isDraft);
    }
    if (uniStatusFilter === "TRASH") {
      return u.isDeleted;
    }
    return !u.isDeleted;
  });
  const safeCountries = Array.isArray(countries) ? countries : [];

  // Financial calculations
  const grossUSD = Number(calcData.grossAmountUSD) || 0;
  const taxPct = Number(calcData.taxPercent) || 0;
  const taxAmountUSD = (grossUSD * taxPct) / 100;
  const netUSD = grossUSD - taxAmountUSD;
  const companyPct = Number(calcData.companySharePercent) || 60;
  const counselorPct = 100 - companyPct;
  const companyShareUSD = (netUSD * companyPct) / 100;
  const counselorShareUSD = (netUSD * counselorPct) / 100;
  const fxRate = Number(calcData.usdToBdtRate) || 120;
  const counselorShareBDT = counselorShareUSD * fxRate;
  const companyShareBDT = companyShareUSD * fxRate;
  const grossBDT = grossUSD * fxRate;

  const totalGrossUSD = safeCommissions.reduce((sum, c) => sum + (c.grossAmountUSD || 0), 0);
  const totalCompanyBDT = safeCommissions.reduce((sum, c) => {
    const net = (c.grossAmountUSD || 0) * (1 - (c.taxPercent || 0) / 100);
    const coUSD = (net * (c.companySharePercent || 60)) / 100;
    return sum + coUSD * (c.usdToBdtRate || 120);
  }, 0);
  const totalCounselorBDT = safeCommissions.reduce((sum, c) => sum + (c.counselorShareBDT || 0), 0);
  const totalWithdrawnBDT = safeCommissions
    .filter((c) => c.withdrawalStatus === "WITHDRAWN")
    .reduce((sum, c) => sum + (c.counselorShareBDT || 0), 0);

  // Helper to determine if a registered user is currently live online
  const isUserOnline = (u: any) => {
    if (u.id === user?.id) return true; // Logged-in admin is online
    const time = new Date(u.updatedAt || u.createdAt || 0).getTime();
    const diffMs = Date.now() - time;
    return diffMs <= 5 * 60 * 1000; // Active within last 5 minutes
  };

  // Helper to format last active timestamp
  const formatLastActive = (dateInput?: string | Date) => {
    if (!dateInput) return "Recently";
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 5) return "Active Now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const onlineUsersCount = safeUsers.filter((u) => isUserOnline(u)).length;
  const bannedUsersCount = safeUsers.filter((u) => u.status === "BLOCKED").length;

  // Filtered and Sorted users (handles ALL, ONLINE, BANNED, roles)
  const filteredUsers = safeUsers
    .filter((u) => {
      // Regular Admin cannot see Super Admin, but CAN see peer Admins
      if (user?.role === "ADMIN" && u.role === "SUPER_ADMIN") {
        return false;
      }
      const matchesSearch = 
        (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()));

      let matchesFilter = true;
      if (userRoleFilter === "ALL") {
        matchesFilter = true;
      } else if (userRoleFilter === "ONLINE") {
        matchesFilter = isUserOnline(u);
      } else if (userRoleFilter === "BANNED") {
        matchesFilter = u.status === "BLOCKED";
      } else {
        matchesFilter = u.role === userRoleFilter;
      }

      return matchesSearch && matchesFilter;
    })
    .sort((a: any, b: any) => {
      // Online users first, then by recent activity
      const aOnline = isUserOnline(a) ? 1 : 0;
      const bOnline = isUserOnline(b) ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;

      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

  const filteredApplications = safeApplications.filter((a: any) => {
    const studentName = a.student?.user?.name || a.student?.name || "";
    const uniName = a.university?.name || a.program?.university?.name || "";
    const matchesSearch = 
      studentName.toLowerCase().includes(appSearch.toLowerCase()) ||
      uniName.toLowerCase().includes(appSearch.toLowerCase());
    const matchesStatus = appStatusFilter === "ALL" || a.status === appStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTrashApplications = trashApplications.filter((a: any) => {
    const studentName = a.student?.user?.name || a.student?.name || "";
    const uniName = a.university?.name || a.program?.university?.name || "";
    const matchesSearch =
      studentName.toLowerCase().includes(appSearch.toLowerCase()) ||
      uniName.toLowerCase().includes(appSearch.toLowerCase());
    return matchesSearch;
  });

  const filteredNotifications = notifications.filter((n) => {
    return notificationFilter === "ALL" || n.type === notificationFilter;
  });

  const NOTIFICATIONS_PER_PAGE = 5;
  const totalNotifPages = Math.ceil(filteredNotifications.length / NOTIFICATIONS_PER_PAGE) || 1;
  const currentNotifPage = Math.min(Math.max(1, notificationPage), totalNotifPages);
  const notifStartIndex = (currentNotifPage - 1) * NOTIFICATIONS_PER_PAGE;
  const paginatedNotifications = filteredNotifications.slice(
    notifStartIndex,
    notifStartIndex + NOTIFICATIONS_PER_PAGE
  );

  // Handlers
  const handleCreateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcData.applicationId) return;

    try {
      setCreatingComm(true);
      setCommSuccess(false);
      await commissionService.createCommission({
        applicationId: calcData.applicationId,
        counselorId: calcData.counselorId || undefined,
        grossAmountUSD: grossUSD,
        taxPercent: taxPct,
        companySharePercent: companyPct,
        counselorSharePercent: counselorPct,
        usdToBdtRate: fxRate,
        counselorShareBDT,
      });

      setCommSuccess(true);
      await fetchAdminData();
      setTimeout(() => setCommSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to create commission record", err);
      alert("Failed to record commission. Please verify fields.");
    } finally {
      setCreatingComm(false);
    }
  };

  const handleOpenCreateUniModal = () => {
    setEditingUniId(null);
    setNewUni({
      name: "",
      countryId: safeCountries[0]?.id || "",
      city: "",
      minTuitionFee: 12000,
      maxTuitionFee: 25000,
      offerLetterPaymentType: "FREE",
      website: "",
      coverImageUrl: "",
      description: "",
      tags: "UK, Top Ranked, Scholarship",
      status: "PUBLISHED",
      programs: [
        { name: "Computer Science & AI", degreeLevel: "BACHELOR", tuitionFee: 15500, durationYears: 4, intakeSeason: "Sep / Jan" },
        { name: "Global MBA & Management", degreeLevel: "MASTER", tuitionFee: 18500, durationYears: 2, intakeSeason: "Sep / Feb" },
      ],
    });
    setUniModalOpen(true);
  };

  const handleOpenEditUniModal = (uni: University) => {
    setEditingUniId(uni.id);
    setNewUni({
      name: uni.name || "",
      countryId: uni.countryId || "",
      city: uni.city || "",
      minTuitionFee: uni.minTuitionFee || 12000,
      maxTuitionFee: uni.maxTuitionFee || 25000,
      offerLetterPaymentType: uni.offerLetterPaymentType || "FREE",
      website: uni.website || "",
      coverImageUrl: uni.coverImageUrl || uni.bannerUrl || "",
      description: uni.description || "",
      tags: Array.isArray(uni.tags) ? uni.tags.join(", ") : "",
      status: (uni.status === "DRAFT" || uni.isDraft) ? "DRAFT" : "PUBLISHED",
      programs: uni.programs && uni.programs.length > 0 
        ? uni.programs.map((p) => ({
            name: p.name || p.title || "",
            degreeLevel: p.degreeLevel || p.level || "BACHELOR",
            tuitionFee: Number(p.tuitionFee) || 15000,
            durationYears: Number(p.durationYears) || 3,
            intakeSeason: p.intakeSeason || p.intake || "Sep / Jan"
          }))
        : [
            { name: "Computer Science & AI", degreeLevel: "BACHELOR", tuitionFee: 15500, durationYears: 4, intakeSeason: "Sep / Jan" }
          ],
    });
    setUniModalOpen(true);
  };

  const handleCoverFileUpload = async (file: File) => {
    if (!file) return;
    try {
      setCoverUploading(true);
      const oldImage = newUni.coverImageUrl;

      const formData = new FormData();
      formData.append("image", file);
      const res = await higherStudyService.uploadUniversityCover(formData);

      if (res.data?.url) {
        setNewUni((prev) => ({ ...prev, coverImageUrl: res.data.url }));
        // If there was an old image hosted on Cloudinary, delete it
        if (oldImage && oldImage.includes("cloudinary.com")) {
          higherStudyService.deleteUniversityImage({ imageUrl: oldImage }).catch(() => {});
        }
      }
    } catch (err: any) {
      console.error("Failed to upload image", err);
      alert(err.response?.data?.message || "Failed to upload image to Cloudinary.");
    } finally {
      setCoverUploading(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  };

  const handleRemoveCoverImage = async () => {
    const imgUrl = newUni.coverImageUrl;
    if (!imgUrl) return;

    try {
      setCoverDeleting(true);
      if (imgUrl.includes("cloudinary.com")) {
        await higherStudyService.deleteUniversityImage({ imageUrl: imgUrl });
      }
      setNewUni((prev) => ({ ...prev, coverImageUrl: "" }));
    } catch (err: any) {
      console.error("Failed to delete image from Cloudinary", err);
      setNewUni((prev) => ({ ...prev, coverImageUrl: "" }));
    } finally {
      setCoverDeleting(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  };

  const handleSaveUniversity = async (e: React.FormEvent, publishStatus: "PUBLISHED" | "DRAFT") => {
    e.preventDefault();
    try {
      if (!newUni.name?.trim()) {
        alert("Please enter the university name.");
        return;
      }
      if (!newUni.countryId) {
        alert("Please select a country.");
        return;
      }
      setCreatingUni(true);
      const tagsArray = newUni.tags 
        ? newUni.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        name: newUni.name,
        countryId: newUni.countryId,
        city: newUni.city,
        minTuitionFee: Number(newUni.minTuitionFee) || 0,
        maxTuitionFee: Number(newUni.maxTuitionFee) || 0,
        offerLetterPaymentType: newUni.offerLetterPaymentType,
        website: newUni.website,
        coverImageUrl: newUni.coverImageUrl || undefined,
        description: newUni.description,
        status: publishStatus,
        isDraft: publishStatus === "DRAFT",
        tags: tagsArray,
      };

      if (editingUniId) {
        await higherStudyService.updateUniversity(editingUniId, payload);
      } else {
        const created = await higherStudyService.createUniversity(payload);
        const uniId = created.data?.id || created.id;
        
        if (uniId && newUni.programs && newUni.programs.length > 0) {
          for (const prog of newUni.programs) {
            if (prog.name?.trim()) {
              await higherStudyService.createProgram({
                name: prog.name,
                universityId: uniId,
                degreeLevel: prog.degreeLevel || "BACHELOR",
                tuitionFee: Number(prog.tuitionFee) || Number(newUni.minTuitionFee) || 12000,
                durationYears: Number(prog.durationYears) || 3,
                initialDeposit: Number(newUni.offerLetterPaymentType === "FREE" ? 0 : 500),
                intakeSeason: prog.intakeSeason || "Sep / Jan"
              }).catch(() => null);
            }
          }
        }
      }

      setUniModalOpen(false);
      setEditingUniId(null);
      await fetchAdminData();
    } catch (err: any) {
      console.error("Failed to save university", err);
      alert(err.response?.data?.message || "Failed to save university.");
    } finally {
      setCreatingUni(false);
    }
  };

  const handleOpenUniDeleteModal = (uni: University, hard = false) => {
    setSelectedUniForDelete({ uni, hard });
    setUniDeleteModalOpen(true);
  };

  const handleConfirmDeleteUni = async () => {
    if (!selectedUniForDelete) return;
    const { uni, hard } = selectedUniForDelete;
    try {
      setIsDeletingUni(true);
      // Optimistic state update: immediate visual feedback
      if (hard) {
        setUniversities((prev) => prev.filter((u) => u.id !== uni.id));
      } else {
        setUniversities((prev) =>
          prev.map((u) =>
            u.id === uni.id ? { ...u, isDeleted: true, deletedAt: new Date().toISOString() } : u
          )
        );
      }

      await higherStudyService.deleteUniversity(uni.id, hard);
      setUniDeleteModalOpen(false);
      setSelectedUniForDelete(null);
      setUniToast({
        type: "success",
        message: hard ? `${uni.name} permanently removed!` : `${uni.name} moved to Trash!`,
      });
      setTimeout(() => setUniToast(null), 3500);
      await fetchAdminData(true);
    } catch (err: any) {
      console.error("Failed to delete university", err);
      setUniToast({
        type: "error",
        message: err.response?.data?.message || "Failed to delete university",
      });
      setTimeout(() => setUniToast(null), 3500);
      await fetchAdminData(true);
    } finally {
      setIsDeletingUni(false);
    }
  };

  const handleRestoreUniversity = async (uniId: string) => {
    try {
      const uni = universities.find((u) => u.id === uniId);
      setUniversities((prev) =>
        prev.map((u) =>
          u.id === uniId ? { ...u, isDeleted: false, deletedAt: undefined } : u
        )
      );
      await higherStudyService.restoreUniversity(uniId);
      setUniToast({
        type: "success",
        message: uni ? `${uni.name} restored from Trash!` : "University restored!",
      });
      setTimeout(() => setUniToast(null), 3500);
      await fetchAdminData(true);
    } catch (err: any) {
      console.error("Failed to restore university", err);
      alert(err.response?.data?.message || "Failed to restore university");
      await fetchAdminData(true);
    }
  };

  const handleUpdateVisibility = async (counselorId: string, mode: "FULL_BREAKDOWN" | "NET_ONLY" | "HIDDEN") => {
    try {
      await commissionService.updateCounselorVisibility(counselorId, mode);
      await fetchAdminData();
    } catch (err) {
      console.error("Failed to update visibility", err);
    }
  };

  const handleUpdateWithdrawal = async (commissionId: string, withdrawalStatus: string) => {
    try {
      await commissionService.updateWithdrawalStatus(commissionId, withdrawalStatus);
      await fetchAdminData();
    } catch (err) {
      console.error("Failed to update withdrawal status", err);
    }
  };

  const handleSelectInquiry = async (inq: any) => {
    setSelectedInquiry(inq);
    setReplySuccess(false);
    if (!inq.isRead && inq.id) {
      try {
        await contactService.markInquiryRead(inq.id);
        setInquiries((prev) =>
          prev.map((item) =>
            item.id === inq.id
              ? { ...item, isRead: true, status: item.status === "UNREAD" ? "READ" : item.status }
              : item
          )
        );
        setInquiriesUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark inquiry as read", err);
      }
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry?.id || !replyMessage.trim()) return;
    setReplySending(true);
    try {
      await contactService.replyToInquiry(selectedInquiry.id, replyMessage.trim());
      setReplySuccess(true);
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === selectedInquiry.id
            ? {
                ...inq,
                status: "REPLIED",
                reply: replyMessage.trim(),
                repliedAt: new Date().toISOString(),
                isRead: true,
              }
            : inq
        )
      );
      setSelectedInquiry((prev: any) =>
        prev
          ? {
              ...prev,
              status: "REPLIED",
              reply: replyMessage.trim(),
              repliedAt: new Date().toISOString(),
              isRead: true,
            }
          : prev
      );
      setReplyMessage("");
      setTimeout(() => setReplySuccess(false), 4000);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to send email reply");
    } finally {
      setReplySending(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleDeleteInquiry = (id: string, name?: string, subject?: string) => {
    setInquiryToDelete({ id, name: name || "Sender", subject: subject || "" });
  };

  const confirmDeleteInquiry = async () => {
    if (!inquiryToDelete) return;
    try {
      setIsDeletingInquiry(true);
      await contactService.deleteInquiry(inquiryToDelete.id);
      const deletedId = inquiryToDelete.id;
      setInquiries((prev) => prev.filter((inq) => inq.id !== deletedId));
      setInquiriesUnreadCount((prev) => {
        const item = inquiries.find((i) => i.id === deletedId);
        if (item && !item.isRead) {
          return Math.max(0, prev - 1);
        }
        return prev;
      });
      if (selectedInquiry?.id === deletedId) {
        const remaining = inquiries.filter((inq) => inq.id !== deletedId);
        setSelectedInquiry(remaining.length > 0 ? remaining[0] : null);
      }
      setInquiryToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete inquiry:", err);
      alert(err?.response?.data?.message || "Failed to delete inquiry");
    } finally {
      setIsDeletingInquiry(false);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("png") && !file.type.includes("image")) {
      alert("Please select a high-quality PNG image file.");
      return;
    }

    try {
      setLogoUploading(true);
      const formData = new FormData();
      formData.append("image", file);
      const result = await contactService.uploadLogo(formData);
      if (result?.url) {
        setAutoResponderSettings((prev) => ({ ...prev, logoUrl: result.url }));
        setAutoResponderSaved(true);
        setTimeout(() => setAutoResponderSaved(false), 3500);
      }
    } catch (err: any) {
      console.error("Logo upload error:", err);
      alert(err?.response?.data?.message || "Failed to upload logo. Please try again.");
    } finally {
      setLogoUploading(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    }
  };

  const handleSaveAutoResponderSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingAutoResponder(true);
      await contactService.updateSettings({
        autoResponderSubject: autoResponderSettings.subject,
        autoResponderSenderName: autoResponderSettings.senderName,
        autoResponderSenderEmail: autoResponderSettings.senderEmail,
        autoResponderWhatsAppText: autoResponderSettings.whatsappText,
        autoResponderWhatsAppNumber: autoResponderSettings.whatsappNumber,
        autoResponderOfficeAddress: autoResponderSettings.officeAddress,
        autoResponderHotline: autoResponderSettings.hotline,
        autoResponderEmail: autoResponderSettings.email || autoResponderSettings.senderEmail,
        autoResponderHours: autoResponderSettings.hours,
        autoResponderLogoUrl: autoResponderSettings.logoUrl,
        otpEmailSubject: autoResponderSettings.otpSubject,
        otpEmailHeading: autoResponderSettings.otpHeading,
        otpEmailBodyMessage: autoResponderSettings.otpBodyMessage,
        otpEmailExpiryNote: autoResponderSettings.otpExpiryNote,
        regOtpEmailSubject: autoResponderSettings.regOtpSubject,
        regOtpEmailHeading: autoResponderSettings.regOtpHeading,
        regOtpEmailBodyMessage: autoResponderSettings.regOtpBodyMessage,
        regOtpEmailExpiryNote: autoResponderSettings.regOtpExpiryNote,
        welcomeEmailSubject: autoResponderSettings.welcomeSubject,
        welcomeEmailHeading: autoResponderSettings.welcomeHeading,
        welcomeEmailMessage: autoResponderSettings.welcomeMessage,
        welcomeEmailBtnText: autoResponderSettings.welcomeBtnText,
        welcomeEmailBtnUrl: autoResponderSettings.welcomeBtnUrl,
      });
      setAutoResponderSaved(true);
      setTimeout(() => setAutoResponderSaved(false), 3500);
      setIsEditingAutoResponder(false);
      setIsEditingResetPassword(false);
      setIsEditingRegOtp(false);
      setIsEditingWelcomeEmail(false);
    } catch (err: any) {
      console.error("Failed to update email settings:", err);
      alert(err?.response?.data?.message || "Failed to update email settings");
    } finally {
      setSavingAutoResponder(false);
    }
  };

  const handleSaveSuccessSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSavingSuccessSettings(true);
      await successStoryService.updateSettings(successSettings);
      setSuccessSettingsSaved(true);
      setTimeout(() => setSuccessSettingsSaved(false), 3500);
    } catch (err: any) {
      console.error("Failed to update success page settings:", err);
      alert(err?.response?.data?.message || "Failed to update success page settings");
    } finally {
      setSavingSuccessSettings(false);
    }
  };

  const handleOpenAddStory = () => {
    setStoryForm({
      slug: "",
      studentName: "",
      country: "Canada",
      homeInstitution: "",
      hometown: "",
      universityName: "",
      degreeName: "",
      intake: "Fall 2026 Intake",
      visaDate: "July 2026",
      thumbnailUrl: "",
      photoUrl: "",
      youtubeUrl: "",
      scholarshipNote: "",
      testimonial: "",
      storyContent: "",
      isPublished: true,
    });
    setSlugError(null);
    setIsCustomCountryMode(false);
    setCustomCountryInput("");
    setStoryCardView("FULL_EDITOR");
  };

  const handleOpenEditStory = (story: SuccessStoryItem) => {
    setStoryForm({ ...story, slug: story.slug || "" });
    setSlugError(null);
    setIsCustomCountryMode(false);
    setCustomCountryInput("");
    setStoryCardView("FULL_EDITOR");
  };

  const handleSaveStoryCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slugError) {
      alert(slugError);
      return;
    }
    if (storyForm.slug) {
      const cleanSlug = toUrlSlug(storyForm.slug);
      const conflict = adminStoryCards.find(
        (s) => s.id !== storyForm.id && s.slug && toUrlSlug(s.slug) === cleanSlug
      );
      if (conflict) {
        alert(`Cannot save: Slug "${cleanSlug}" is already taken by student "${conflict.studentName}". Please choose a different serial or name.`);
        return;
      }
    }
    try {
      setSavingStoryCard(true);
      const countryToUse = isCustomCountryMode && customCountryInput.trim()
        ? customCountryInput.trim()
        : storyForm.country?.trim() || "Canada";

      const payload = {
        ...storyForm,
        slug: storyForm.slug ? toUrlSlug(storyForm.slug) : undefined,
        country: countryToUse,
      };

      if (storyForm.id) {
        await successStoryService.updateStory(storyForm.id, payload);
      } else {
        await successStoryService.createStory(payload);
      }

      setStoryCardView("LIST");
      const res = await successStoryService.getStories({ limit: 100 });
      const items = res?.data || (Array.isArray(res) ? res : []);
      setAdminStoryCards(items);
    } catch (err: any) {
      console.error("Failed to save story card:", err);
      alert(err?.response?.data?.message || "Failed to save story card");
    } finally {
      setSavingStoryCard(false);
    }
  };

  const handleDeleteStoryCard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this success story card?")) return;
    try {
      await successStoryService.trashStory(id);
      setAdminStoryCards((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error("Failed to delete story card:", err);
      alert(err?.response?.data?.message || "Failed to delete story card");
    }
  };

  // =========================================================================
  // GUIDES & BLOGS CMS HANDLERS
  // =========================================================================
  const refreshAdminGuides = async () => {
    try {
      const blogsRes = await higherStudyService.getBlogs({ limit: 100 });
      setAdminGuides(Array.isArray(blogsRes?.data) ? blogsRes.data : []);
    } catch (err) {
      console.warn("Could not refresh guides:", err);
    }
  };

  const handleOpenCreateGuide = () => {
    setEditingGuideId(null);
    setGuideForm({
      title: "",
      category: "United Kingdom",
      readTime: "5 min read",
      excerpt: "",
      bannerUrl: "",
      tags: "UK Visa, CAS, Financial Proof",
      content: "",
    });
    setGuideViewMode("EDITOR");
  };

  const handleOpenEditGuide = (guide: any) => {
    setEditingGuideId(guide.id);
    setGuideForm({
      title: guide.title || "",
      category: guide.category || "United Kingdom",
      readTime: guide.readTime || "5 min read",
      excerpt: guide.excerpt || "",
      bannerUrl: guide.bannerUrl || guide.coverImage || "",
      tags: Array.isArray(guide.tags) ? guide.tags.join(", ") : "",
      content: guide.content || "",
    });
    setGuideViewMode("EDITOR");
  };

  const handleUploadGuideBanner = async (file: File) => {
    setGuideBannerUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await higherStudyService.uploadUniversityCover(fd);
      const uploadedUrl = res?.data?.url || res?.url || "";
      if (!uploadedUrl) throw new Error("No image URL returned");
      setGuideForm((prev) => ({ ...prev, bannerUrl: uploadedUrl }));
    } catch (err: any) {
      console.error("Banner upload error:", err);
      alert(err?.response?.data?.message || "Failed to upload cover banner. Please paste an image URL.");
    } finally {
      setGuideBannerUploading(false);
    }
  };

  const handleSaveGuide = async (targetStatus: "PUBLISHED" | "DRAFT") => {
    if (!guideForm.title.trim()) {
      alert("Please enter a Guide Article Title.");
      return;
    }
    if (!guideForm.content.trim()) {
      alert("Please write the Guide Article Content.");
      return;
    }
    setSavingGuide(true);
    try {
      const parsedTags = guideForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title: guideForm.title.trim(),
        category: guideForm.category.trim() || "Study Abroad Guide",
        readTime: guideForm.readTime.trim() || "5 min read",
        excerpt: guideForm.excerpt.trim(),
        bannerUrl: guideForm.bannerUrl.trim(),
        tags: parsedTags,
        content: guideForm.content,
        status: targetStatus,
      };

      if (editingGuideId) {
        await higherStudyService.updateBlog(editingGuideId, payload);
      } else {
        await higherStudyService.createBlog(payload);
      }

      await refreshAdminGuides();
      setGuideViewMode("LIST");
      setEditingGuideId(null);
      setGuideStatusFilter(targetStatus === "DRAFT" ? "DRAFT" : "ALL");
    } catch (err: any) {
      console.error("Failed to save guide:", err);
      alert(err?.response?.data?.message || "Failed to save guide article");
    } finally {
      setSavingGuide(false);
    }
  };

  const handleQuickGuideStatusChange = async (
    guide: any,
    nextStatus: "PUBLISHED" | "DRAFT" | "TRASH"
  ) => {
    try {
      const updated = await higherStudyService.updateBlog(guide.id, {
        title: guide.title,
        content: guide.content,
        excerpt: guide.excerpt,
        bannerUrl: guide.bannerUrl || guide.coverImage || "",
        category: guide.category || "Study Abroad Guide",
        readTime: guide.readTime || "5 min read",
        tags: Array.isArray(guide.tags) ? guide.tags : [],
        status: nextStatus,
      });
      await refreshAdminGuides();
      return updated;
    } catch (err: any) {
      console.error("Failed to change guide status:", err);
      alert(err?.response?.data?.message || "Failed to update guide status");
    }
  };

  const handleConfirmDeleteGuide = async () => {
    if (!guideDeleteTarget) return;
    setIsDeletingGuide(true);
    try {
      if (guideDeleteTarget.hard) {
        await higherStudyService.deleteBlog(guideDeleteTarget.guide.id);
      } else {
        await handleQuickGuideStatusChange(guideDeleteTarget.guide, "TRASH");
      }
      await refreshAdminGuides();
      setGuideDeleteTarget(null);
    } catch (err: any) {
      console.error("Failed to delete guide:", err);
      alert(err?.response?.data?.message || "Failed to delete guide");
    } finally {
      setIsDeletingGuide(false);
    }
  };

  const handleTogglePublishStory = async (story: SuccessStoryItem) => {
    try {
      await successStoryService.updateStory(story.id, {
        isPublished: !story.isPublished,
      });
      setAdminStoryCards((prev) =>
        prev.map((s) => (s.id === story.id ? { ...s, isPublished: !story.isPublished } : s))
      );
    } catch (err: any) {
      alert("Failed to toggle publish status");
    }
  };

  const handleSaveHomeCms = (e: React.FormEvent) => {
    e.preventDefault();
    setHomeCmsSaved(true);
    setTimeout(() => setHomeCmsSaved(false), 3500);
  };

  // User Management Handlers (Super Admin Full Control)
  const handleToggleUserStatus = async (targetUser: User) => {
    if (targetUser.id === user?.id) {
      alert("You cannot ban or suspend your own Super Admin account!");
      return;
    }
    if (targetUser.role === "SUPER_ADMIN") {
      alert("Cannot ban another Super Admin account!");
      return;
    }

    const nextStatus = targetUser.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    try {
      setActionLoadingUserId(targetUser.id);
      await userService.updateStatus(targetUser.id, nextStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, status: nextStatus } : u))
      );
    } catch (err: any) {
      console.error("Failed to update user status", err);
      alert(err.response?.data?.message || "Failed to update account status");
    } finally {
      setActionLoadingUserId(null);
    }
  };

  const handleOpenRoleModal = (targetUser: User) => {
    if (targetUser.id === user?.id) {
      alert("You cannot change your own Super Admin role!");
      return;
    }
    setSelectedUserForRole(targetUser);
    setTargetNewRole(targetUser.role as Role);
    setRoleModalOpen(true);
  };

  const handleConfirmChangeRole = async () => {
    if (!selectedUserForRole) return;
    try {
      setUpdatingRole(true);
      await userService.updateRole(selectedUserForRole.id, targetNewRole);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUserForRole.id ? { ...u, role: targetNewRole } : u
        )
      );
      setRoleModalOpen(false);
      setSelectedUserForRole(null);
    } catch (err: any) {
      console.error("Failed to update user role", err);
      alert(err.response?.data?.message || "Failed to change user role");
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleOpenDeleteModal = (targetUser: User) => {
    if (targetUser.id === user?.id) {
      alert("You cannot delete your own Super Admin account!");
      return;
    }
    if (targetUser.role === "SUPER_ADMIN") {
      alert("Cannot delete a Super Admin account!");
      return;
    }
    setSelectedUserForDelete(targetUser);
    setDeleteModalOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    try {
      setDeletingUser(true);
      await userService.deleteUser(selectedUserForDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUserForDelete.id));
      setDeleteModalOpen(false);
      setSelectedUserForDelete(null);
    } catch (err: any) {
      console.error("Failed to delete user", err);
      alert(err.response?.data?.message || "Failed to delete user account");
    } finally {
      setDeletingUser(false);
    }
  };

  // Count unread notifications dynamically
  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  // Sidebar Menu Items Configuration
  const sidebarItems: { id: AdminTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: "OVERVIEW", label: "Overview", icon: LayoutDashboard },
    { 
      id: "NOTIFICATIONS", 
      label: "Notifications", 
      icon: Bell, 
      badge: unreadNotifCount > 0 ? `${unreadNotifCount} New` : undefined 
    },
    { id: "APPLICATIONS", label: "Applications", icon: FileText, badge: safeApplications.length || 8 },
    { id: "USERS", label: "Users", icon: Users, badge: safeUsers.length || 10 },
    { id: "SETTINGS", label: "Settings", icon: Settings },
    { 
      id: "INBOX", 
      label: "Mails", 
      icon: Mail, 
      badge: inquiriesUnreadCount > 0 ? `${inquiriesUnreadCount} Unread` : undefined 
    },
    { id: "HOME_CMS", label: "Home Page", icon: Home },
    { id: "UNIVERSITIES", label: "Universities", icon: Building2, badge: safeUniversities.length || 4 },
    {
      id: "GUIDES_CMS",
      label: "Guides & Blogs",
      icon: BookOpen,
      badge: adminGuides.filter((g) => g.status !== "DRAFT" && g.status !== "TRASH").length || undefined,
    },
    { id: "SUCCESS_CMS", label: "Success Stories", icon: Award },
    { id: "CONTACT_CMS", label: "Contact Page", icon: PhoneCall },
    { id: "FINANCIALS", label: "Commissions", icon: DollarSign, badge: safeCommissions.length || 2 },
  ];


  return (
    <div className="dashboard-viewport h-[calc(100dvh-4rem-1px)] sm:h-[calc(100dvh-5rem-1px)] bg-slate-950 text-slate-100 flex overflow-hidden">
      {/* =========================================================================
          LEFT COLLAPSIBLE SIDEBAR (Desktop Only)
      ========================================================================= */}
      <aside 
        className={`bg-slate-900/90 border-r border-slate-800/80 backdrop-blur-xl shrink-0 transition-all duration-300 ease-in-out hidden md:flex flex-col h-full z-20 ${
          isSidebarCollapsed ? "w-20" : "w-52 lg:w-56"
        }`}
      >
        {/* Sidebar Header & Toggle */}
        <div className="px-3.5 py-2 border-b border-slate-800/80 flex items-center justify-between gap-2 h-14">
          {!isSidebarCollapsed ? (
            <>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-sm text-white truncate tracking-tight">
                  {user?.name || "Super Admin"}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Full Control</span>
                </div>
              </div>

              {/* Collapse/Close Button (Cross Icon) */}
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
            /* Expand Button (Hamburger 3 Lines Menu) */
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
        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all group relative cursor-pointer ${
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
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive 
                          ? "bg-blue-500/25 text-blue-300 border border-blue-400/30" 
                          : "bg-slate-800 text-slate-400 border border-slate-700/60"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Collapsed Notification Counter Badge */}
                {isSidebarCollapsed && item.id === "NOTIFICATIONS" && unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-slate-900 shadow-md shadow-rose-950/60 animate-pulse pointer-events-none">
                    {unreadNotifCount}
                  </span>
                )}

                {/* Collapsed Tooltip Indicator */}
                {isSidebarCollapsed && isActive && (
                  <span className="absolute right-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          {!isSidebarCollapsed ? (
            <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-500">
              <span className="text-[11px] font-medium text-slate-400">Rise Abroad Admin</span>
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Active" />
            </div>
          )}
        </div>
      </aside>

      {/* =========================================================================
          RIGHT MAIN WORKSPACE (DYNAMIC CONTENT MODULES)
      ========================================================================= */}
      <main className="flex-1 min-w-0 h-full overflow-y-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-20 md:pb-8 space-y-5 custom-scrollbar flex flex-col">
        <div className="max-w-7xl mx-auto w-full space-y-5">
        {/* Workspace Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-0.5">
              <Link href="/" className="hover:text-blue-400 transition-colors">Portal</Link>
              <span>/</span>
              <span className="text-slate-300 font-medium">Dashboard</span>
              <span>/</span>
              <span className="text-blue-400 font-semibold uppercase">{activeTab}</span>
              {activeTab === "APPLICATIONS" && selectedAppForManage && (
                <>
                  <span>/</span>
                  <span className="text-slate-300 font-mono">#{selectedAppForManage.applicationNumber || selectedAppForManage.id.slice(0, 8)}</span>
                </>
              )}
            </div>
            {activeTab === "APPLICATIONS" && selectedAppForManage ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedAppForManage(null);
                    setManageAppModalOpen(false);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-200 hover:text-white border-slate-700 bg-slate-900/90 hover:bg-slate-800 cursor-pointer flex items-center gap-1 transition-all shadow-sm"
                  title="Return to Applications list"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
                  <span>Back</span>
                </Button>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                    {selectedAppForManage.student?.user?.name || selectedAppForManage.student?.name || "Student Applicant"}
                  </h1>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {(selectedAppForManage as any).university?.name || selectedAppForManage.program?.university?.name || "Partner University"} •{" "}
                    {(selectedAppForManage as any).programName || selectedAppForManage.program?.name || selectedAppForManage.program?.title || "Degree Program"}
                    {(selectedAppForManage as any).intake ? ` • ${(selectedAppForManage as any).intake}` : ""}
                  </p>
                </div>
              </div>
            ) : (
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                {sidebarItems.find((s) => s.id === activeTab)?.label}
              </h1>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {activeTab === "APPLICATIONS" && selectedAppForManage && (
              <>
                {/* 5 Toggle Tabs for Application Dossier */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setDossierActiveTab("FILE")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      dossierActiveTab === "FILE"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5" />
                    <span>File</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      dossierActiveTab === "FILE" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                    }`}>
                      {selectedAppForManage.documents?.length || 0}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDossierActiveTab("INFO")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      dossierActiveTab === "INFO"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Information</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDossierActiveTab("TRACKING")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      dossierActiveTab === "TRACKING"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Tracking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDossierActiveTab("PAYMENT")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      dossierActiveTab === "PAYMENT"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment</span>
                    {selectedAppForManage.payments && selectedAppForManage.payments.length > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        dossierActiveTab === "PAYMENT" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        {selectedAppForManage.payments.length}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDossierActiveTab("NOTES")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      dossierActiveTab === "NOTES"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                        : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Notes</span>
                    {selectedAppForManage.internalNotes && selectedAppForManage.internalNotes.length > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        dossierActiveTab === "NOTES" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                      }`}>
                        {selectedAppForManage.internalNotes.length}
                      </span>
                    )}
                  </button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refreshApplicationDetails(selectedAppForManage.id)}
                  className="text-xs border-slate-700 hover:border-slate-600 bg-slate-900/90 hover:bg-slate-800 cursor-pointer flex items-center gap-1.5 text-slate-200"
                  title="Refresh"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Refresh</span>
                </Button>
              </>
            )}
            {activeTab === "NOTIFICATIONS" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Auto-deleted after 30 days</span>
              </div>
            )}

            {activeTab === "USERS" && (
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Total Users Pill */}
                <button
                  type="button"
                  onClick={() => setUserRoleFilter("ALL")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                    userRoleFilter === "ALL"
                      ? "bg-blue-600/25 border-blue-500/60 text-blue-300 ring-1 ring-blue-500/40"
                      : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                  title="Click to view all registered users"
                >
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-slate-400 font-medium">Total:</span>
                  <span className="font-bold text-white">{safeUsers.length}</span>
                </button>

                {/* Online Users Pill (Clickable filter) */}
                <button
                  type="button"
                  onClick={() => setUserRoleFilter(userRoleFilter === "ONLINE" ? "ALL" : "ONLINE")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                    userRoleFilter === "ONLINE"
                      ? "bg-emerald-600/25 border-emerald-500/60 text-emerald-200 ring-1 ring-emerald-500/50 shadow-md shadow-emerald-950/50"
                      : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-emerald-500/40"
                  }`}
                  title="Click to filter users currently live online"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-slate-300 font-medium">Online:</span>
                  <span className="font-bold text-emerald-400">{onlineUsersCount}</span>
                </button>

                {/* Students Pill */}
                <button
                  type="button"
                  onClick={() => setUserRoleFilter(userRoleFilter === "STUDENT" ? "ALL" : "STUDENT")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                    userRoleFilter === "STUDENT"
                      ? "bg-blue-600/25 border-blue-500/60 text-blue-300 ring-1 ring-blue-500/40"
                      : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                  title="Filter Students"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400 font-medium">Students:</span>
                  <span className="font-bold text-white">
                    {safeUsers.filter((u) => u.role === "STUDENT").length}
                  </span>
                </button>

                {/* Admins Pill */}
                <button
                  type="button"
                  onClick={() => setUserRoleFilter(userRoleFilter === "ADMIN" ? "ALL" : "ADMIN")}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                    userRoleFilter === "ADMIN"
                      ? "bg-purple-600/25 border-purple-500/60 text-purple-300 ring-1 ring-purple-500/40"
                      : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                  title="Filter Admins"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-400 font-medium">Admins:</span>
                  <span className="font-bold text-white">
                    {safeUsers.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length}
                  </span>
                </button>

                {/* Live Guest Visitors Badge */}
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300"
                  title="Unregistered visitors currently browsing the public site"
                >
                  <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-400 font-medium">Live Guests:</span>
                  <span className="font-bold text-cyan-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                    {visitorStats.liveVisitors}
                  </span>
                </div>

                {/* Total Visits Badge */}
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300"
                  title="Total website visits and page reloads"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-400 font-medium">Total Visits:</span>
                  <span className="font-bold text-indigo-300 font-mono">
                    {visitorStats.totalGuestVisits.toLocaleString()}
                  </span>
                </div>

                {/* Unique Visitors Badge (Tracked by IP) */}
                <div 
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300"
                  title="Unique visitors tracked strictly by IP address"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400 font-medium">Unique:</span>
                  <span className="font-bold text-emerald-300 font-mono">
                    {visitorStats.uniqueVisitors.toLocaleString()}
                  </span>
                </div>

                {/* Banned Users Pill (Clickable filter) */}
                {bannedUsersCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setUserRoleFilter(userRoleFilter === "BANNED" ? "ALL" : "BANNED")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                      userRoleFilter === "BANNED"
                        ? "bg-rose-600/25 border-rose-500/60 text-rose-200 ring-1 ring-rose-500/50 shadow-md shadow-rose-950/50"
                        : "bg-rose-950/40 border-rose-800/50 text-rose-300 hover:border-rose-600/60"
                    }`}
                    title="Click to view all banned users"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Banned:</span>
                    <span className="font-bold">{bannedUsersCount}</span>
                  </button>
                )}
              </div>
            )}

            {/* APPLICATIONS SUB-TABS (Placed directly in top header beside Refresh button) */}
            {activeTab === "APPLICATIONS" && !selectedAppForManage && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => setAdminAppSubTab("APPLICATIONS")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    adminAppSubTab === "APPLICATIONS"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Applications</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    adminAppSubTab === "APPLICATIONS" ? "bg-blue-700/80 text-blue-100" : "bg-slate-800 text-slate-400"
                  }`}>
                    {applications.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminAppSubTab("CHECKLIST_MASTER")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    adminAppSubTab === "CHECKLIST_MASTER"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title="Document Checklist & Presets Master"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Document Checklist</span>
                  {availablePresets.length > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      adminAppSubTab === "CHECKLIST_MASTER" ? "bg-blue-700/80 text-blue-100" : "bg-slate-800 text-slate-400"
                    }`}>
                      {availablePresets.length}
                    </span>
                  )}
                </button>
              </div>
            )}

            {activeTab === "UNIVERSITIES" && (
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                {/* 1. All */}
                <button
                  type="button"
                  onClick={() => setUniStatusFilter("ALL")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    uniStatusFilter === "ALL"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title="View all active universities"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>All</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    uniStatusFilter === "ALL" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {activeUnisList.length}
                  </span>
                </button>

                {/* 2. Draft */}
                <button
                  type="button"
                  onClick={() => setUniStatusFilter("DRAFT")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    uniStatusFilter === "DRAFT"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title="View draft universities"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span>Draft</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    uniStatusFilter === "DRAFT" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {draftUnisList.length}
                  </span>
                </button>

                {/* 3. Deleted / Trash */}
                <button
                  type="button"
                  onClick={() => setUniStatusFilter("TRASH")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    uniStatusFilter === "TRASH"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title="View deleted universities in trash"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  <span>Deleted</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    uniStatusFilter === "TRASH" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {trashUnisList.length}
                  </span>
                </button>
              </div>
            )}

            {/* GUIDES & BLOGS CMS STATUS FILTER PILLS */}
            {activeTab === "GUIDES_CMS" && (
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => {
                    setGuideStatusFilter("ALL");
                    setGuideViewMode("LIST");
                    setGuidePage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    guideStatusFilter === "ALL" && guideViewMode === "LIST"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Published</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    guideStatusFilter === "ALL" && guideViewMode === "LIST" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {adminGuides.filter((g) => g.status !== "DRAFT" && g.status !== "TRASH").length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGuideStatusFilter("DRAFT");
                    setGuideViewMode("LIST");
                    setGuidePage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    guideStatusFilter === "DRAFT" && guideViewMode === "LIST"
                      ? "bg-amber-600 text-white shadow-md shadow-amber-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-300" />
                  <span>Drafts</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    guideStatusFilter === "DRAFT" && guideViewMode === "LIST" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {adminGuides.filter((g) => g.status === "DRAFT").length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGuideStatusFilter("TRASH");
                    setGuideViewMode("LIST");
                    setGuidePage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    guideStatusFilter === "TRASH" && guideViewMode === "LIST"
                      ? "bg-rose-600 text-white shadow-md shadow-rose-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  <span>Trash</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    guideStatusFilter === "TRASH" && guideViewMode === "LIST" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                  }`}>
                    {adminGuides.filter((g) => g.status === "TRASH").length}
                  </span>
                </button>
              </div>
            )}

            {/* CONTACT CMS SUB-TABS (Placed directly in top header beside title) */}
            {activeTab === "CONTACT_CMS" && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                {/* 1. Office Address & Hours */}
                <button
                  type="button"
                  onClick={() => setContactSubTab("OFFICE_INFO")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    contactSubTab === "OFFICE_INFO"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>1. Office Address & Hours</span>
                </button>

                {/* 2. Leadership & Team Desk */}
                <button
                  type="button"
                  onClick={() => setContactSubTab("TEAM_DESK")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    contactSubTab === "TEAM_DESK"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>2. Leadership & Team Desk</span>
                </button>
              </div>
            )}

            {/* MAILS / INBOX SUB-TABS (Placed directly in top header beside title - Screenshot 2) */}
            {activeTab === "INBOX" && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner overflow-x-auto max-w-full">
                {/* 1. Inbox */}
                <button
                  type="button"
                  onClick={() => setMailsSubTab("INBOX")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    mailsSubTab === "INBOX"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title="Received Contact Messages"
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Inbox</span>
                  {inquiriesUnreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-sm shadow-rose-900/60 animate-pulse">
                      {inquiriesUnreadCount}
                    </span>
                  )}
                </button>

                {/* 2. Auto-Responder */}
                <button
                  type="button"
                  onClick={() => setMailsSubTab("AUTO_RESPONDER")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    mailsSubTab === "AUTO_RESPONDER"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title="24-Hour Confirmation Email Auto-Responder"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Auto-Responder</span>
                </button>

                {/* 3. Password Reset (OTP) */}
                <button
                  type="button"
                  onClick={() => setMailsSubTab("RESET_PASSWORD")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    mailsSubTab === "RESET_PASSWORD"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title="Forgot Password OTP Verification Email Template"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Password Reset (OTP)</span>
                </button>

                {/* 4. Registration (OTP) */}
                <button
                  type="button"
                  onClick={() => setMailsSubTab("REGISTRATION_OTP")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    mailsSubTab === "REGISTRATION_OTP"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title="New Account Registration & Verification OTP Email Template"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Registration (OTP)</span>
                </button>

                {/* 5. Welcome Email */}
                <button
                  type="button"
                  onClick={() => setMailsSubTab("WELCOME_EMAIL")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    mailsSubTab === "WELCOME_EMAIL"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title="Post-Verification Welcome Registration Email Template"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Welcome Email</span>
                </button>
              </div>
            )}

            {/* SUCCESS STORIES CMS SUB-TABS (Placed directly in top header beside Refresh button) */}
            {activeTab === "SUCCESS_CMS" && (
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
                <button
                  type="button"
                  onClick={() => setSuccessSubTab("SETTINGS")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    successSubTab === "SETTINGS"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Header &amp; 4 Metric Boxes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSuccessSubTab("CARDS")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    successSubTab === "CARDS"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Story Cards</span>
                </button>
              </div>
            )}

            {!selectedAppForManage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchAdminData(true);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("refresh-contact-cms"));
                  }
                }}
                disabled={isRefreshing}
                className="h-8 px-3 gap-1.5 border-slate-800 hover:border-blue-500/40 text-slate-200 text-xs cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-500 ease-in-out ${isRefreshing ? "rotate-180" : ""}`} />
                <span>Refresh</span>
              </Button>
            )}
          </div>
        </div>

        {/* Loading Workspace Skeleton (Keeps Sidebar & Action Bar Completely Stable) */}
        {authLoading || (loading && !commissions.length && !applications.length && !users.length) ? (
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
        {/* =====================================================================
            1. TAB: OVERVIEW & ANALYTICS
        ===================================================================== */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-900/60 border-slate-800/80 hover:border-blue-500/30 transition-all shadow-xl">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Students</span>
                    <Users className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-white mt-2 font-mono">
                    {safeUsers.filter((u) => u.role === "STUDENT").length || 8}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+24% growth this intake</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800/80 hover:border-blue-500/30 transition-all shadow-xl">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Applications</span>
                    <FileText className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-indigo-300 mt-2 font-mono">
                    {safeApplications.length || 14}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Across {safeUniversities.length || 4} partner universities
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800/80 hover:border-blue-500/30 transition-all shadow-xl">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Gross Inflow (USD)</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-300 mt-2 font-mono">
                    ${totalGrossUSD.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Processed admissions volume</div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/60 border-slate-800/80 hover:border-blue-500/30 transition-all shadow-xl">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Agency Net Profit</span>
                    <PieChart className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-cyan-300 mt-2 font-mono">
                    BDT {Math.round(totalCompanyBDT).toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">After counselor & tax splits</div>
                </CardContent>
              </Card>
            </div>

            {/* Recharts Live Data Visualization Suite */}
            <AdminAnalyticsCharts
              applications={safeApplications}
              commissions={safeCommissions}
              universities={safeUniversities}
            />

            {/* Interactive Graph / Visual Analytics Chart */}
            <Card className="bg-slate-900/60 border-slate-800/80 shadow-2xl">
              <CardHeader className="border-b border-slate-800/60 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                      <span>Student Registrations & Admission Trajectory</span>
                    </CardTitle>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Monthly intake volume, verification conversions, and admission issuance trends.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                      <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" />
                      <span>Registrations</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium ml-3">
                      <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" />
                      <span>Applications</span>
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {/* SVG Responsive Bar & Trend Chart */}
                <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 px-2 border-b border-slate-800">
                  {[
                    { month: "Nov", reg: 42, app: 28, heightReg: "55%", heightApp: "38%" },
                    { month: "Dec", reg: 65, app: 48, heightReg: "78%", heightApp: "58%" },
                    { month: "Jan", reg: 85, app: 70, heightReg: "92%", heightApp: "76%" },
                    { month: "Feb", reg: 58, app: 45, heightReg: "68%", heightApp: "52%" },
                    { month: "Mar", reg: 76, app: 62, heightReg: "84%", heightApp: "68%" },
                    { month: "Apr (Now)", reg: 95, app: 82, heightReg: "100%", heightApp: "88%" },
                  ].map((col, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                        {/* Student Bar */}
                        <div 
                          style={{ height: col.heightReg }}
                          className="w-4 sm:w-8 rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:brightness-125 transition-all relative flex justify-center"
                        >
                          <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/40 pointer-events-none whitespace-nowrap">
                            {col.reg} Students
                          </span>
                        </div>
                        {/* Application Bar */}
                        <div 
                          style={{ height: col.heightApp }}
                          className="w-4 sm:w-8 rounded-t-lg bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:brightness-125 transition-all relative flex justify-center"
                        >
                          <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/40 pointer-events-none whitespace-nowrap">
                            {col.app} Apps
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-white transition-colors">
                        {col.month}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Chart Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-2">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Admission Conversion</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono mt-1">86.3%</div>
                    <div className="text-[10px] text-slate-500">Applications approved to visa file</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Active Inquiries Desk</div>
                    <div className="text-xl font-bold text-blue-400 font-mono mt-1">{inquiries.length} Pending</div>
                    <div className="text-[10px] text-slate-500">Contact form submissions</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Top Study Destination</div>
                    <div className="text-xl font-bold text-purple-400 font-mono mt-1">United Kingdom (42%)</div>
                    <div className="text-[10px] text-slate-500">Followed by Canada (28%)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =====================================================================
            2. TAB: NOTIFICATIONS
        ===================================================================== */}
        {activeTab === "NOTIFICATIONS" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Notification Filter Chips & Action */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {["ALL", "REGISTRATION", "SECURITY", "APPLICATION"].map((tab) => {
                  const count = tab === "ALL" 
                    ? notifications.length 
                    : notifications.filter((n) => n.type === tab).length;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => {
                        setNotificationFilter(tab);
                        setNotificationPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        notificationFilter === tab
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm shadow-blue-950/40"
                          : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      <span>{tab}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        notificationFilter === tab ? "bg-blue-500/30 text-blue-300" : "bg-slate-800 text-slate-400"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                    await notificationService.markAllAsRead();
                    if (typeof window !== "undefined") {
                      localStorage.setItem("unread_notifications_count", "0");
                      window.dispatchEvent(new CustomEvent("notifications-count-change", { detail: 0 }));
                    }
                  } catch (err) {
                    console.error("Failed to mark all as read:", err);
                  }
                }}
                className="h-8 px-3 text-xs border-slate-800 hover:border-slate-700 text-slate-200 cursor-pointer"
              >
                Mark All as Read
              </Button>
            </div>

            {/* Notification Stream Card with Internal Scroll & Inline Refresh */}
            <Card className="bg-slate-900/60 border-slate-800/80 shadow-xl overflow-hidden relative">
              {/* Inline Refresh Loader Overlay */}
              {isRefreshing && (
                <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] z-20 flex items-center justify-center transition-all animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-2xl text-blue-400 text-xs font-semibold">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                    <span>Refreshing notifications...</span>
                  </div>
                </div>
              )}

              {/* Scrollable Notification List (Scrollable without visible scrollbar) */}
              <div className="divide-y divide-slate-800/60 max-h-[500px] overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {paginatedNotifications.length > 0 ? (
                  paginatedNotifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      onClick={() => {
                        if (notif.unread) {
                          notificationService.markAsRead(notif.id).catch(() => {});
                          setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n)));
                        }
                      }}
                      className="p-4 sm:p-4.5 flex items-start gap-3.5 hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.type === "REGISTRATION" 
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                          : notif.type === "SECURITY"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      }`}>
                        {notif.type === "REGISTRATION" && <UserCheck className="w-4 h-4" />}
                        {notif.type === "SECURITY" && <ShieldAlert className="w-4 h-4" />}
                        {notif.type === "APPLICATION" && <FileCheck2 className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-white truncate">{notif.title}</h4>
                          <span className="text-[11px] text-slate-400 shrink-0">{notif.time}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                            {notif.type}
                          </span>
                          <span className="text-[10px] text-slate-500">Target Role: {notif.role}</span>
                          {notif.unread && (
                            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse ml-auto" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-500">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="text-sm font-medium text-slate-400">No notifications found</p>
                    <p className="text-xs text-slate-500 mt-1">There are no notifications matching the "{notificationFilter}" filter.</p>
                  </div>
                )}
              </div>

              {/* Notification Card Pagination Footer */}
              <div className="px-4 py-2.5 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                <div className="text-slate-400 text-[11px]">
                  Showing <span className="font-semibold text-slate-200">{filteredNotifications.length > 0 ? notifStartIndex + 1 : 0}</span> to{" "}
                  <span className="font-semibold text-slate-200">{Math.min(notifStartIndex + NOTIFICATIONS_PER_PAGE, filteredNotifications.length)}</span> of{" "}
                  <span className="font-semibold text-slate-200">{filteredNotifications.length}</span> notifications
                </div>

                {totalNotifPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNotificationPage((p) => Math.max(1, p - 1))}
                      disabled={currentNotifPage === 1}
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalNotifPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setNotificationPage(pageNum)}
                          className={`w-6 h-6 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            currentNotifPage === pageNum
                              ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                              : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setNotificationPage((p) => Math.min(totalNotifPages, p + 1))}
                      disabled={currentNotifPage === totalNotifPages}
                      className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* =====================================================================
            3. TAB: STUDENT APPLICATIONS & FILE MANAGEMENT
        ===================================================================== */}
        {activeTab === "APPLICATIONS" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {!selectedAppForManage ? (
              <>
                {/* SubTab 2: DOCUMENT CHECKLIST (RENAMED FROM CHECKLIST MASTER) */}
                {adminAppSubTab === "CHECKLIST_MASTER" ? (
                  <ApplicationChecklistPresetTab />
                ) : (
                  <>
                    {/* Search and Filters (Screenshot 2) */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          placeholder={appViewTab === "ALL" ? "Search applicant or university..." : "Search deleted applications..."}
                          value={appSearch}
                          onChange={(e) => setAppSearch(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                        {/* ALL vs TRASH / DELETED PILLS (Screenshot 2) */}
                        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
                          <button
                            type="button"
                            onClick={() => setAppViewTab("ALL")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              appViewTab === "ALL"
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/60"
                                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>All</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              appViewTab === "ALL" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                            }`}>
                              {applications.length}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAppViewTab("TRASH");
                              fetchTrashApplications();
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              appViewTab === "TRASH"
                                ? "bg-rose-600 text-white shadow-md shadow-rose-950/60"
                                : "text-slate-400 hover:text-rose-400 hover:bg-slate-800/60"
                            }`}
                            title="View deleted applications in trash"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                            <span>Trash / Deleted</span>
                            {trashApplications.length > 0 && (
                              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                appViewTab === "TRASH" ? "bg-white/20 text-white" : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}>
                                {trashApplications.length}
                              </span>
                            )}
                          </button>
                        </div>

                        {/* Status dropdown if ALL tab */}
                        {appViewTab === "ALL" && (
                          <select
                            value={appStatusFilter}
                            onChange={(e) => setAppStatusFilter(e.target.value)}
                            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="ALL">All Application Statuses</option>
                            <option value="SUBMITTED">Submitted</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="OFFER_LETTER_READY">Offer Letter Ready</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        )}
                      </div>
                    </div>

                    {/* Applications Table (Screenshot 1 / Trash List View) */}
                    <Card className="bg-slate-900/60 border-slate-800/80 shadow-xl overflow-hidden">
                      {/* Notice Header if TRASH view */}
                      {appViewTab === "TRASH" && (
                        <div className="p-3.5 bg-slate-950/80 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              {user?.role === "SUPER_ADMIN"
                                ? "👑 Super Admin: Restore applications or purge records permanently. Items auto-delete after 30 days."
                                : "🛡️ Regular Admin: Restore applications back to active state. Permanent purge is reserved for Super Admin, and items auto-delete after 30 days."}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            Total Deleted: <strong className="text-white">{trashApplications.length}</strong>
                          </span>
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300">
                          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                            <tr>
                              <th className="p-4">Applicant Student</th>
                              <th className="p-4">Target University</th>
                              <th className="p-4">Program / Intake</th>
                              <th className="p-4">{appViewTab === "ALL" ? "Documents" : "Auto Purge In"}</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {appViewTab === "ALL" ? (
                              filteredApplications.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No student applications found matching criteria.
                                  </td>
                                </tr>
                              ) : (
                                filteredApplications.map((app: any) => (
                                  <tr key={app.id} className="hover:bg-slate-855/50 transition-colors">
                                    <td className="p-4">
                                      <div className="font-bold text-white">{app.student?.user?.name || app.student?.name || "Student Applicant"}</div>
                                      <div className="text-[11px] text-slate-400 font-mono">{app.student?.user?.email || app.student?.email || "student@example.com"}</div>
                                    </td>
                                    <td className="p-4">
                                      <div className="font-semibold text-slate-200">{app.university?.name || app.program?.university?.name || "Partner University"}</div>
                                      <div className="text-[11px] text-slate-500">{app.university?.city || app.program?.university?.city || "Campus"}</div>
                                    </td>
                                    <td className="p-4">
                                      <span className="font-medium text-slate-300">{app.programName || app.program?.name || "Higher Studies Degree"}</span>
                                      <div className="text-[10px] text-blue-400 font-semibold">{app.intake || app.program?.intake || "Fall 2026"}</div>
                                    </td>
                                    <td className="p-4">
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                                        <span>{app.documents?.length || 0} Files</span>
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        app.status === "OFFER_LETTER_READY"
                                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                                          : app.status === "REJECTED"
                                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                                          : "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                                      }`}>
                                        {app.status || "SUBMITTED"}
                                      </span>
                                    </td>
                                    <td className="p-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="text-xs border-slate-700 hover:border-blue-500 hover:text-blue-400 cursor-pointer"
                                          onClick={() => handleOpenManageModal(app)}
                                        >
                                          Manage File
                                        </Button>

                                        <button
                                          type="button"
                                          onClick={() => handleOpenAppDeleteModal(app, false)}
                                          title="Move Application to Trash"
                                          className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )
                            ) : (
                              /* TRASH / DELETED APPLICATIONS TABLE LIST */
                              filteredTrashApplications.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-500">
                                    Trash is currently empty. No deleted applications found.
                                  </td>
                                </tr>
                              ) : (
                                filteredTrashApplications.map((app: any) => (
                                  <tr key={app.id} className="hover:bg-slate-855/50 transition-colors">
                                    <td className="p-4">
                                      <div className="font-bold text-white">{app.student?.user?.name || app.student?.name || "Student Applicant"}</div>
                                      <div className="text-[11px] text-slate-400 font-mono">{app.student?.user?.email || app.student?.email || "student@example.com"}</div>
                                    </td>
                                    <td className="p-4">
                                      <div className="font-semibold text-slate-200">{app.university?.name || app.program?.university?.name || "Partner University"}</div>
                                      <div className="text-[11px] text-slate-500">{app.university?.city || app.program?.university?.city || "Campus"}</div>
                                    </td>
                                    <td className="p-4">
                                      <span className="font-medium text-slate-300">{app.programName || app.program?.name || "Higher Studies Degree"}</span>
                                      <div className="text-[10px] text-blue-400 font-semibold">{app.intake || app.program?.intake || "Fall 2026"}</div>
                                    </td>
                                    <td className="p-4">
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{app.daysRemaining !== undefined ? `${app.daysRemaining} days left` : "30 days"}</span>
                                      </span>
                                    </td>
                                    <td className="p-4">
                                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                        Deleted / Trash
                                      </span>
                                    </td>
                                    <td className="p-4 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {/* Restore Button */}
                                        <button
                                          type="button"
                                          onClick={() => handleRestoreApp(app.id)}
                                          disabled={isRestoringApp === app.id}
                                          title="Restore Application to Active List"
                                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                          {isRestoringApp === app.id ? (
                                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                          ) : (
                                            <RotateCcw className="w-3.5 h-3.5" />
                                          )}
                                          <span>Restore</span>
                                        </button>

                                        {/* Hard Delete Button (Strictly Super Admin only) */}
                                        {user?.role === "SUPER_ADMIN" && (
                                          <button
                                            type="button"
                                            onClick={() => handleOpenAppDeleteModal(app, true)}
                                            title="Permanently Delete Application"
                                            className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition-all cursor-pointer"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </>
                )}
              </>
            ) : (
              /* ===================================================================
                  FULL-PAGE APPLICATION DOSSIER & DOCUMENT MANAGEMENT
              =================================================================== */
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="space-y-6">
                  {/* =========================================================================
                      SUB-TAB 1: FILE (Document Checklist, Reordering, PDF Dossier)
                  ========================================================================= */}
                  {dossierActiveTab === "FILE" && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                      {/* Group Preset & Library Item Assignment Strip (Clean & minimal) */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Option A: Apply Pre-configured Group Preset */}
                          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                              <Tag className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Apply Checklist Group Preset</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedPresetToApply}
                                onChange={(e) => setSelectedPresetToApply(e.target.value)}
                                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                              >
                                <option value="">-- Select Created Group Preset --</option>
                                {availablePresets.map((pr: any) => (
                                  <option key={pr.id} value={pr.id}>
                                    {pr.title} ({pr.items?.length || 0} Docs)
                                  </option>
                                ))}
                              </select>
                              <Button
                                variant="gradient"
                                size="sm"
                                disabled={!selectedPresetToApply || isApplyingMasterPreset}
                                onClick={handleApplySelectedMasterPreset}
                                className="text-xs shrink-0 cursor-pointer shadow-md shadow-blue-600/20"
                              >
                                {isApplyingMasterPreset ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                                    <span>Applying...</span>
                                  </>
                                ) : (
                                  <>
                                    <Layers className="w-3.5 h-3.5 mr-1" />
                                    <span>Apply Group</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Option B: Add Single Checklist Item from Library */}
                          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                              <span className="flex items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Add Single Item from Library</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedSingleItemToApply}
                                onChange={(e) => setSelectedSingleItemToApply(e.target.value)}
                                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                              >
                                <option value="">-- Select Item from Library --</option>
                                {availableChecklistItems.map((item: any) => (
                                  <option key={item.id} value={item.id}>
                                    {item.title}
                                  </option>
                                ))}
                              </select>

                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={isAddingSingleItem || !selectedSingleItemToApply}
                                onClick={handleApplySingleItem}
                                className="text-xs shrink-0 cursor-pointer border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                              >
                                {isAddingSingleItem ? "Adding..." : "+ Add to Checklist"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Required Checklist Table with Reordering & Single Download */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-white flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span>Required Checklist ({selectedAppForManage.documents?.length || 0} Files)</span>
                          </h4>
                          <span className="text-xs text-slate-400 font-mono">
                            {selectedAppForManage.documents?.filter((d: any) => d.status === "VERIFIED").length || 0} Approved
                          </span>
                        </div>

                        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                              <tr>
                                <th className="p-3 font-semibold uppercase text-[10px] w-20 text-center">Order</th>
                                <th className="p-3 font-semibold uppercase text-[10px]">Document Title</th>
                                <th className="p-3 font-semibold uppercase text-[10px]">Student Upload</th>
                                <th className="p-3 font-semibold uppercase text-[10px]">Status</th>
                                <th className="p-3 font-semibold uppercase text-[10px] text-right">Verification Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {(!selectedAppForManage.documents || selectedAppForManage.documents.length === 0) ? (
                                <tr>
                                  <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                                    No documents assigned yet. Select a Group Preset or pick an item above to add to the checklist.
                                  </td>
                                </tr>
                              ) : (
                                selectedAppForManage.documents.map((doc: any, idx: number) => (
                                  <tr key={doc.id} className="hover:bg-slate-850/30 transition-colors">
                                    <td className="p-3 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button
                                          type="button"
                                          disabled={idx === 0}
                                          onClick={() => handleMoveDoc(idx, "up")}
                                          title="Move Up"
                                          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                                        >
                                          <ArrowUp className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="font-mono text-[11px] text-slate-400 w-4 text-center">{idx + 1}</span>
                                        <button
                                          type="button"
                                          disabled={idx === (selectedAppForManage.documents?.length || 1) - 1}
                                          onClick={() => handleMoveDoc(idx, "down")}
                                          title="Move Down"
                                          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                                        >
                                          <ArrowDown className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="font-bold text-white">{doc.title}</div>
                                      <div className="text-[11px] text-slate-400 mt-0.5">{doc.instruction || "Official scanned original."}</div>
                                      {doc.adminFeedback && (
                                        <div className="text-[10px] text-rose-400 mt-1 font-sans">
                                          Feedback: {doc.adminFeedback}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      {doc.fileUrl ? (
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <Badge variant="info" className="text-[10px]">
                                            Attached
                                          </Badge>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                              setDocRotation(0);
                                              setPreviewAdminDoc(doc);
                                            }}
                                            className="text-[10px] py-0.5 px-2 cursor-pointer border-slate-700 bg-slate-900 hover:bg-slate-800"
                                            title="Preview document in viewer"
                                          >
                                            <Eye className="w-3 h-3 mr-1 text-blue-400" />
                                            <span>Preview</span>
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDownloadSingleDoc(doc)}
                                            className="text-[10px] py-0.5 px-2 cursor-pointer border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white"
                                            title={`Download ${doc.title}`}
                                          >
                                            <Download className="w-3 h-3 mr-1 text-emerald-400" />
                                            <span>Download</span>
                                          </Button>
                                        </div>
                                      ) : (
                                        <span className="text-[11px] text-slate-500 italic">Not Uploaded</span>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      <Badge
                                        variant={
                                          doc.status === "VERIFIED"
                                            ? "success"
                                            : doc.status === "REJECTED"
                                            ? "danger"
                                            : doc.status === "UPLOADED"
                                            ? "info"
                                            : "outline"
                                        }
                                        className="text-[10px]"
                                      >
                                        {doc.status === "VERIFIED"
                                          ? "Verified ✔️"
                                          : doc.status === "REJECTED"
                                          ? "Rejected ⚠️"
                                          : doc.status === "UPLOADED"
                                          ? "In Review ⏳"
                                          : "Required 📄"}
                                      </Badge>
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex items-center justify-end gap-1.5">
                                        {/* Only show Verify and Reject when the student has actually uploaded a document! */}
                                        {doc.fileUrl ? (
                                          <>
                                            {doc.status !== "VERIFIED" && (
                                              <Button
                                                variant="success"
                                                size="sm"
                                                disabled={adminVerifyingDocId === doc.id}
                                                onClick={() => handleAdminVerifyDoc(doc.id, "VERIFIED")}
                                                className="text-[11px] py-1 px-2.5 cursor-pointer"
                                                title="Approve & Mark Verified"
                                              >
                                                <Check className="w-3 h-3 mr-1" />
                                                <span>Verify</span>
                                              </Button>
                                            )}

                                            {doc.status !== "REJECTED" && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={adminVerifyingDocId === doc.id}
                                                onClick={() => {
                                                  setAdminRejectDoc(doc);
                                                  setAdminRejectFeedback(doc.adminFeedback || "");
                                                  setAdminRejectModalOpen(true);
                                                }}
                                                className="text-[11px] py-1 px-2.5 border-rose-500/40 text-rose-300 hover:bg-rose-500/10 cursor-pointer"
                                                title="Reject / Request Re-upload"
                                              >
                                                <X className="w-3 h-3 mr-1 text-rose-400" />
                                                <span>Reject</span>
                                              </Button>
                                            )}
                                          </>
                                        ) : (
                                          <span className="text-[11px] text-slate-500 italic mr-2">Awaiting Upload</span>
                                        )}

                                        {/* Admin can delete requirement with confirmation modal */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setDocToDelete(doc);
                                            setDeleteConfirmText("");
                                          }}
                                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer transition-colors"
                                          title="Delete requirement from student checklist"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Download Combined Multi-page Dossier PDF Section */}
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                          <div>
                            <div className="flex items-center gap-2">
                              <FileDown className="w-5 h-5 text-blue-400" />
                              <span className="font-bold text-sm text-white">Download Complete Application Dossier (Single PDF)</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Generates an official cover page and combines all uploaded documents into a single multi-page PDF following the custom order above.
                            </p>
                          </div>

                          {isDownloadingDossier ? (
                            <div className="flex flex-col items-center sm:items-end gap-1.5 min-w-[220px]">
                              <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                                <span>Compiling PDF{compileDots} {compileProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-blue-500/20">
                                <div
                                  className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                                  style={{ width: `${compileProgress}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="gradient"
                              size="md"
                              disabled={!selectedAppForManage.documents?.some((d: any) => d.fileUrl)}
                              onClick={handleDownloadCombinedDossier}
                              className="shrink-0 cursor-pointer text-xs font-bold py-2.5 px-4 shadow-lg shadow-blue-600/30 flex items-center gap-2"
                            >
                              <FileDown className="w-4 h-4" />
                              <span>
                                Download All as Single PDF (
                                {selectedAppForManage.documents?.filter((d: any) => d.fileUrl).length || 0} Files)
                              </span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      SUB-TAB 2: INFORMATION (Student Profile, Custom Fields, Multi-Unis)
                  ========================================================================= */}
                  {dossierActiveTab === "INFO" && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                      {/* Top Action Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Info className="w-4 h-4 text-blue-400" />
                            <span>Student Dossier Information & University Applications</span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Manage student contact details, passport data, academic credentials, and track multiple university submissions.
                          </p>
                        </div>
                        <Button
                          variant="gradient"
                          size="sm"
                          disabled={isSavingInfo}
                          onClick={handleSaveDossierInfo}
                          className="shrink-0 cursor-pointer shadow-md shadow-blue-600/20 text-xs font-semibold"
                        >
                          {isSavingInfo ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              <span>Saving Changes...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5 mr-1.5" />
                              <span>Save Information</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Section 1: Core Contact & Personal Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                            <span>Contact & Communication</span>
                          </h4>
                          <div>
                            <label className="text-[11px] text-slate-400 font-semibold block mb-1">WhatsApp / Phone Number</label>
                            <input
                              type="text"
                              value={dossierWhatsApp}
                              onChange={(e) => setDossierWhatsApp(e.target.value)}
                              placeholder="+880 1700-000000"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                            />
                            <p className="text-[10px] text-slate-500 mt-1">Used for emergency SMS, WhatsApp updates, and admission alerts.</p>
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Registered Email Address</label>
                            <input
                              type="email"
                              value={selectedAppForManage.student?.user?.email || selectedAppForManage.student?.email || "student@portal.edu"}
                              readOnly
                              disabled
                              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-800/60 rounded-xl text-xs text-slate-400 cursor-not-allowed font-mono"
                            />
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Residential Address & Citizenship</span>
                          </h4>
                          <div>
                            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Full Postal Address</label>
                            <input
                              type="text"
                              value={dossierAddress}
                              onChange={(e) => setDossierAddress(e.target.value)}
                              placeholder="House 12, Road 4, Dhanmondi, Dhaka - 1205"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Country of Residence</label>
                              <div className="px-3 py-2 bg-slate-900/50 border border-slate-800/60 rounded-xl text-xs text-slate-300 font-medium">
                                {selectedAppForManage.student?.country || "Bangladesh"}
                              </div>
                            </div>
                            <div>
                              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Application Reference</label>
                              <div className="px-3 py-2 bg-slate-900/50 border border-slate-800/60 rounded-xl text-xs font-mono text-blue-400 font-bold">
                                #{selectedAppForManage.applicationNumber || selectedAppForManage.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Custom Information Key-Value Fields */}
                      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <Tag className="w-4 h-4 text-emerald-400" />
                              <span>Custom Dossier Information Fields</span>
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Record passport details, academic scores, English language proficiency, and counselor notes.
                            </p>
                          </div>
                        </div>

                        {/* Existing Custom Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {customInfoFields.map((field, idx) => (
                            <div key={field.id || idx} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-1.5 relative group">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-400 truncate pr-4">{field.label}</span>
                                <button
                                  type="button"
                                  onClick={() => setCustomInfoFields(customInfoFields.filter((_, i) => i !== idx))}
                                  className="text-slate-500 hover:text-rose-400 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Remove field"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) => {
                                  const updated = [...customInfoFields];
                                  updated[idx] = { ...updated[idx], value: e.target.value };
                                  setCustomInfoFields(updated);
                                }}
                                placeholder={`Enter ${field.label}...`}
                                className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Add New Custom Field Row */}
                        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                          <input
                            type="text"
                            value={newCustomLabel}
                            onChange={(e) => setNewCustomLabel(e.target.value)}
                            placeholder="New Field Label (e.g. GRE Score, Visa Reference)"
                            className="w-full sm:w-1/3 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                          <input
                            type="text"
                            value={newCustomVal}
                            onChange={(e) => setNewCustomVal(e.target.value)}
                            placeholder="Field Value (e.g. 315 / 340, VAF#9921)"
                            className="w-full sm:flex-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!newCustomLabel.trim()}
                            onClick={() => {
                              if (!newCustomLabel.trim()) return;
                              setCustomInfoFields([
                                ...customInfoFields,
                                { id: Date.now().toString(), label: newCustomLabel.trim(), value: newCustomVal.trim() },
                              ]);
                              setNewCustomLabel("");
                              setNewCustomVal("");
                            }}
                            className="w-full sm:w-auto text-xs shrink-0 cursor-pointer border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            <span>Add Field</span>
                          </Button>
                        </div>
                      </div>

                      {/* Section 3: Multiple Applied Universities */}
                      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                              <GraduationCap className="w-4 h-4 text-purple-400" />
                              <span>Applied Universities & Course Choices ({appliedUnisList.length})</span>
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Track multiple higher study applications lodged for this student across different universities.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAddUniModal(true)}
                            className="text-xs cursor-pointer border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            <span>Add University Application</span>
                          </Button>
                        </div>

                        {/* Applied Universities Table */}
                        <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-semibold">
                              <tr>
                                <th className="p-3">University</th>
                                <th className="p-3">Degree / Program</th>
                                <th className="p-3">Country</th>
                                <th className="p-3">Intake</th>
                                <th className="p-3">Admission Status</th>
                                <th className="p-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {appliedUnisList.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="p-6 text-center text-slate-500">
                                    No university applications logged. Click &quot;Add University Application&quot; to log applied institutions.
                                  </td>
                                </tr>
                              ) : (
                                appliedUnisList.map((uni, uIdx) => (
                                  <tr key={uni.id || uIdx} className="hover:bg-slate-850/40 transition-colors">
                                    <td className="p-3 font-bold text-white flex items-center gap-2">
                                      <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                      <span>{uni.universityName}</span>
                                    </td>
                                    <td className="p-3 text-slate-200">{uni.programName}</td>
                                    <td className="p-3 text-slate-400">{uni.country}</td>
                                    <td className="p-3 font-mono text-slate-300">{uni.intake}</td>
                                    <td className="p-3">
                                      <Badge
                                        variant={
                                          uni.status?.includes("Offer") || uni.status?.includes("Accepted")
                                            ? "success"
                                            : uni.status?.includes("Submitted") || uni.status?.includes("Review")
                                            ? "info"
                                            : "outline"
                                        }
                                        className="text-[10px]"
                                      >
                                        {uni.status}
                                      </Badge>
                                    </td>
                                    <td className="p-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() => setAppliedUnisList(appliedUnisList.filter((_, i) => i !== uIdx))}
                                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                        title="Remove university record"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      SUB-TAB 3: TRACKING (Admission Lifecycle Stages & Student Notification)
                  ========================================================================= */}
                  {dossierActiveTab === "TRACKING" && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                      {/* Top Action Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                        <div>
                          <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            <Compass className="w-4 h-4 text-blue-400" />
                            <span>Admission Lifecycle Milestones & Tracking</span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Update the official admission tracking stages. Students see real-time status updates on their applicant dashboard.
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={notifyStudentOnTracking}
                              onChange={(e) => setNotifyStudentOnTracking(e.target.checked)}
                              className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0"
                            />
                            <span>Notify Student</span>
                          </label>
                          <Button
                            variant="gradient"
                            size="sm"
                            disabled={isSavingTracking}
                            onClick={handleSaveTracking}
                            className="shrink-0 cursor-pointer shadow-md shadow-blue-600/20 text-xs font-semibold"
                          >
                            {isSavingTracking ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                <span>Saving Tracking...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                <span>Save Tracking & Notify</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* 9 Stages Vertical Timeline */}
                      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                        <div className="space-y-4">
                          {trackingStages.map((stage, idx) => (
                            <div
                              key={stage.id || idx}
                              className={`p-4 rounded-xl border transition-all ${
                                stage.status === "COMPLETED"
                                  ? "bg-emerald-950/20 border-emerald-500/30 shadow-sm"
                                  : stage.status === "IN_PROGRESS"
                                  ? "bg-blue-950/30 border-blue-500/40 shadow-md shadow-blue-950/40"
                                  : "bg-slate-900/40 border-slate-800/80 opacity-70"
                              }`}
                            >
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                                      stage.status === "COMPLETED"
                                        ? "bg-emerald-500 text-slate-950"
                                        : stage.status === "IN_PROGRESS"
                                        ? "bg-blue-500 text-white animate-pulse"
                                        : "bg-slate-800 text-slate-400"
                                    }`}
                                  >
                                    {stage.status === "COMPLETED" ? "✓" : idx + 1}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h5 className="font-bold text-sm text-white">{stage.title}</h5>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                          stage.status === "COMPLETED"
                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                            : stage.status === "IN_PROGRESS"
                                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                            : "bg-slate-800 text-slate-400"
                                        }`}
                                      >
                                        {stage.status.replace("_", " ")}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">{stage.description}</p>
                                  </div>
                                </div>

                                {/* Controls: Status, Date, Note */}
                                <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
                                  <select
                                    value={stage.status}
                                    onChange={(e) => {
                                      const updated = [...trackingStages];
                                      updated[idx] = {
                                        ...updated[idx],
                                        status: e.target.value as any,
                                        completedAt: e.target.value === "COMPLETED" && !updated[idx].completedAt
                                          ? new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                          : updated[idx].completedAt,
                                      };
                                      setTrackingStages(updated);
                                    }}
                                    className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                                  >
                                    <option value="PENDING">Pending</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                  </select>

                                  <input
                                    type="text"
                                    value={stage.completedAt || ""}
                                    onChange={(e) => {
                                      const updated = [...trackingStages];
                                      updated[idx] = { ...updated[idx], completedAt: e.target.value };
                                      setTrackingStages(updated);
                                    }}
                                    placeholder="Date (e.g. Oct 24, 2026)"
                                    className="w-36 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                                  />

                                  <input
                                    type="text"
                                    value={stage.note || ""}
                                    onChange={(e) => {
                                      const updated = [...trackingStages];
                                      updated[idx] = { ...updated[idx], note: e.target.value };
                                      setTrackingStages(updated);
                                    }}
                                    placeholder="Counselor remark visible to student..."
                                    className="w-56 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      SUB-TAB 4: PAYMENT (On-Demand Invoices, Receipts, Cancel/Delete)
                  ========================================================================= */}
                  {dossierActiveTab === "PAYMENT" && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-emerald-400" />
                              <span className="font-bold text-white text-sm">On-Demand Payment Invoices</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Issue custom tuition deposit or processing invoices only when formally required.
                            </p>
                          </div>

                          <Button
                            variant={invoiceModalOpen ? "secondary" : "gradient"}
                            size="sm"
                            onClick={() => setInvoiceModalOpen(!invoiceModalOpen)}
                            className="text-xs cursor-pointer shrink-0"
                          >
                            <PlusCircle className="w-3.5 h-3.5 mr-1" />
                            <span>{invoiceModalOpen ? "Cancel Invoice" : "Issue New Invoice"}</span>
                          </Button>
                        </div>

                        {/* Inline Invoice Creation Form */}
                        {invoiceModalOpen && (
                          <form onSubmit={handleAdminCreateInvoice} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-in fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Invoice Description</label>
                                <input
                                  type="text"
                                  value={invoiceDescription}
                                  onChange={(e) => setInvoiceDescription(e.target.value)}
                                  placeholder="Tuition Deposit & Seat Acceptance"
                                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Amount</label>
                                <input
                                  type="number"
                                  value={invoiceAmount}
                                  onChange={(e) => setInvoiceAmount(e.target.value)}
                                  placeholder="1500"
                                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white font-mono"
                                  required
                                />
                              </div>

                              <div>
                                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Currency</label>
                                <select
                                  value={invoiceCurrency}
                                  onChange={(e) => setInvoiceCurrency(e.target.value)}
                                  className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-1.5 text-xs text-white"
                                >
                                  <option value="USD">USD ($)</option>
                                  <option value="GBP">GBP (£)</option>
                                  <option value="EUR">EUR (€)</option>
                                  <option value="BDT">BDT (৳)</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex justify-end pt-2">
                              <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                disabled={isCreatingInvoice}
                                className="text-xs cursor-pointer"
                              >
                                <span>{isCreatingInvoice ? "Issuing..." : "Confirm & Send Invoice to Student"}</span>
                              </Button>
                            </div>
                          </form>
                        )}

                        {/* Existing Invoices List */}
                        {selectedAppForManage.payments && selectedAppForManage.payments.length > 0 ? (
                          <div className="border border-slate-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                                <tr>
                                  <th className="p-2.5 font-semibold text-[10px] uppercase">Invoice Ref</th>
                                  <th className="p-2.5 font-semibold text-[10px] uppercase">Description</th>
                                  <th className="p-2.5 font-semibold text-[10px] uppercase">Amount</th>
                                  <th className="p-2.5 font-semibold text-[10px] uppercase">Status</th>
                                  <th className="p-2.5 font-semibold text-[10px] uppercase text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {selectedAppForManage.payments.map((p: any) => (
                                  <tr key={p.id}>
                                    <td className="p-2.5 font-mono text-slate-300">INV-{p.id.slice(0, 8).toUpperCase()}</td>
                                    <td className="p-2.5 text-white">{p.description}</td>
                                    <td className="p-2.5 font-mono font-bold text-white">{p.currency} {Number(p.amount).toLocaleString()}</td>
                                    <td className="p-2.5">
                                      <Badge variant={p.status === "PAID" ? "success" : "warning"} className="text-[10px]">
                                        {p.status}
                                      </Badge>
                                    </td>
                                    <td className="p-2.5 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        {p.status === "PAID" ? (
                                          <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => handleAdminDownloadReceipt(p.id)}
                                                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                                title="Download official PDF receipt"
                                              >
                                                <FileText className="w-3 h-3" />
                                                <span>PDF Receipt</span>
                                              </button>
                                              {p.stripeReceiptUrl && (
                                                <a
                                                  href={p.stripeReceiptUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="px-2 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 text-[11px] font-semibold flex items-center gap-1 transition-all"
                                                  title="Open Stripe payment receipt"
                                                >
                                                  <ExternalLink className="w-3 h-3" />
                                                  <span>Stripe</span>
                                                </a>
                                              )}
                                              <span className="text-[10px] text-slate-500 font-mono" title="Audited financial transaction cannot be deleted">
                                              [Audited]
                                            </span>
                                          </div>
                                        ) : (
                                          <button
                                            type="button"
                                            disabled={isDeletingInvoiceId === p.id}
                                            onClick={() => handleDeleteInvoice(p.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-all cursor-pointer disabled:opacity-40"
                                            title="Cancel and remove unpaid invoice"
                                          >
                                            {isDeletingInvoiceId === p.id ? (
                                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                            ) : (
                                              <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-xs text-slate-500 italic">
                            No invoices currently active. Student portal displays &apos;No payments currently due&apos;.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* =========================================================================
                      SUB-TAB 5: NOTES (Internal Counselor & Admin Messenger Feed)
                  ========================================================================= */}
                  {dossierActiveTab === "NOTES" && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                      {/* Notice Header */}
                      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center gap-3">
                        <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                        <div className="text-xs text-amber-200/90">
                          <strong>Strictly Confidential Internal Case Notes:</strong> These notes are internal to counselors and administrators.
                          They are never shown to the student on their applicant portal.
                        </div>
                      </div>

                      {/* Chat / Feed Container */}
                      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-400" />
                            <span>Case Discussion Feed ({selectedAppForManage.internalNotes?.length || 0})</span>
                          </h4>
                          <span className="text-xs text-slate-400">Admissions Staff Team</span>
                        </div>

                        {/* Notes Feed Stream */}
                        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-2">
                          {(!selectedAppForManage.internalNotes || selectedAppForManage.internalNotes.length === 0) ? (
                            <div className="p-8 text-center text-slate-500 text-xs italic">
                              No internal case notes recorded yet. Write the first note below to log phone consultations, academic review, or visa remarks.
                            </div>
                          ) : (
                            selectedAppForManage.internalNotes.map((nt: any) => (
                              <div
                                key={nt.id}
                                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all space-y-2 group"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-[10px]">
                                      {(nt.authorName || "A").slice(0, 1).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-white">{nt.authorName || "Admissions Officer"}</span>
                                    {nt.authorRole && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                        {nt.authorRole}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {new Date(nt.createdAt).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={isDeletingNoteId === nt.id}
                                      onClick={() => handleDeleteInternalNote(nt.id)}
                                      className="text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded cursor-pointer disabled:opacity-40"
                                      title="Delete note"
                                    >
                                      {isDeletingNoteId === nt.id ? (
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Trash2 className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{nt.note}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Sticky Bottom Note Composer */}
                        <div className="pt-3 border-t border-slate-800/80 space-y-2">
                          <textarea
                            rows={3}
                            value={internalNoteContent}
                            onChange={(e) => setInternalNoteContent(e.target.value)}
                            placeholder="Type internal case note, phone log, or student requirement guidance..."
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">Only visible to administrators and counselors.</span>
                            <Button
                              type="button"
                              variant="gradient"
                              size="sm"
                              disabled={isPostingInternalNote || !internalNoteContent.trim()}
                              onClick={handlePostInternalNote}
                              className="text-xs cursor-pointer shadow-md shadow-blue-600/20"
                            >
                              {isPostingInternalNote ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" />
                                  <span>Posting...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-3.5 h-3.5 mr-1" />
                                  <span>Post Case Note</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal for Adding New University Application */}
                {showAddUniModal && (
                  <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-400" />
                          <span>Add Applied University Choice</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowAddUniModal(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] text-slate-400 font-semibold block mb-1">University Name</label>
                          <input
                            type="text"
                            value={newUniName}
                            onChange={(e) => setNewUniName(e.target.value)}
                            placeholder="e.g. University of Greenwich"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 font-semibold block mb-1">Program / Degree Course</label>
                          <input
                            type="text"
                            value={newUniProgram}
                            onChange={(e) => setNewUniProgram(e.target.value)}
                            placeholder="e.g. MSc Advanced Computer Science"
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Country</label>
                            <input
                              type="text"
                              value={newUniCountry}
                              onChange={(e) => setNewUniCountry(e.target.value)}
                              placeholder="United Kingdom"
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Intake Season</label>
                            <input
                              type="text"
                              value={newUniIntake}
                              onChange={(e) => setNewUniIntake(e.target.value)}
                              placeholder="September 2026"
                              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 font-semibold block mb-1">Application Status</label>
                          <select
                            value={newUniStatus}
                            onChange={(e) => setNewUniStatus(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                          >
                            <option value="Application Submitted">Application Submitted</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Conditional Offer Letter Received">Conditional Offer Letter Received</option>
                            <option value="Unconditional Offer Letter Received">Unconditional Offer Letter Received</option>
                            <option value="CAS / Visa Letter Issued">CAS / Visa Letter Issued</option>
                            <option value="Visa Lodged">Visa Lodged</option>
                            <option value="Enrolled">Enrolled</option>
                            <option value="Application Rejected">Application Rejected</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddUniModal(false)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          variant="gradient"
                          size="sm"
                          disabled={!newUniName.trim() || !newUniProgram.trim()}
                          onClick={() => {
                            if (!newUniName.trim() || !newUniProgram.trim()) return;
                            setAppliedUnisList([
                              ...appliedUnisList,
                              {
                                id: Date.now().toString(),
                                universityName: newUniName.trim(),
                                programName: newUniProgram.trim(),
                                country: newUniCountry.trim(),
                                intake: newUniIntake.trim(),
                                status: newUniStatus,
                                notes: newUniNotes.trim(),
                              },
                            ]);
                            setNewUniName("");
                            setNewUniProgram("");
                            setShowAddUniModal(false);
                          }}
                          className="text-xs"
                        >
                          Add Application
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              )}

            {/* Reject Feedback Reason Dialog */}
            {adminRejectModalOpen && adminRejectDoc && (
              <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-rose-500/40 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <AlertCircle className="w-5 h-5" />
                    <span>Request Document Re-upload</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Enter the instructions or reason for rejecting <strong>{adminRejectDoc.title}</strong>:
                  </p>
                  <textarea
                    rows={3}
                    value={adminRejectFeedback}
                    onChange={(e) => setAdminRejectFeedback(e.target.value)}
                    placeholder="e.g. Scanned copy is blurry or cropped. Please upload official certificate with seal."
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAdminRejectModalOpen(false);
                        setAdminRejectDoc(null);
                      }}
                      className="text-xs border-slate-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={adminVerifyingDocId === adminRejectDoc.id}
                      onClick={() => handleAdminVerifyDoc(adminRejectDoc.id, "REJECTED", adminRejectFeedback)}
                      className="text-xs cursor-pointer"
                    >
                      <span>Reject &amp; Send Feedback</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Document Preview Lightbox Modal with Rotation Tool */}
            {previewAdminDoc && (
              <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{previewAdminDoc.title}</span>
                        <Badge
                          variant={
                            previewAdminDoc.status === "VERIFIED"
                              ? "success"
                              : previewAdminDoc.status === "REJECTED"
                              ? "danger"
                              : "info"
                          }
                          className="text-[10px]"
                        >
                          {previewAdminDoc.status}
                        </Badge>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {previewAdminDoc.instruction || "Official scanned original."}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Image Rotation Controls (only for images) */}
                      {!previewAdminDoc.fileUrl?.includes(".pdf") && (
                        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
                          <button
                            type="button"
                            onClick={() => setDocRotation((r) => (r - 90 + 360) % 360)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Rotate Left (-90°)"
                          >
                            <RotateCcw className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocRotation((r) => (r + 90) % 360)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                            title="Rotate Right (+90°)"
                          >
                            <RotateCw className="w-4 h-4 text-blue-400" />
                          </button>
                          {docRotation !== 0 && (
                            <button
                              type="button"
                              onClick={() => setDocRotation(0)}
                              className="px-2 py-1 text-[10px] font-mono font-semibold rounded-lg text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 cursor-pointer transition-colors"
                              title="Reset Rotation to 0°"
                            >
                              Reset ({docRotation}°)
                            </button>
                          )}
                        </div>
                      )}

                      {/* Download Single File */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSingleDoc(previewAdminDoc)}
                        className="text-xs border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white cursor-pointer"
                        title="Download document with title filename"
                      >
                        <Download className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        <span>Download</span>
                      </Button>

                      {/* Close */}
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewAdminDoc(null);
                          setDocRotation(0);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                        title="Close preview"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body / Viewer */}
                  <div className="p-6 flex items-center justify-center bg-slate-950 overflow-auto flex-1 min-h-[450px]">
                    {previewAdminDoc.fileUrl?.includes(".pdf") ? (
                      <iframe
                        src={previewAdminDoc.fileUrl}
                        className="w-full h-[600px] rounded-xl border border-slate-800"
                        title={previewAdminDoc.title}
                      />
                    ) : (
                      <div className="relative flex items-center justify-center overflow-hidden w-full h-full">
                        <img
                          src={previewAdminDoc.fileUrl}
                          alt={previewAdminDoc.title}
                          style={{
                            transform: `rotate(${docRotation}deg)`,
                            transition: "transform 0.25s ease-in-out",
                          }}
                          className="max-h-[580px] max-w-full object-contain rounded-xl shadow-2xl"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Document Requirement Delete Confirmation Modal */}
            {docToDelete && (
              <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">Delete Document Requirement?</h4>
                      <p className="text-xs text-slate-400">This action cannot be undone.</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                    You are removing <span className="font-bold text-rose-300">"{docToDelete.title}"</span> from this applicant&apos;s checklist. If already uploaded, the student will need to be re-assigned if needed later.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Type <span className="text-rose-400 font-mono font-bold">delete</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="delete"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isDeletingDocModal}
                      onClick={() => {
                        setDocToDelete(null);
                        setDeleteConfirmText("");
                      }}
                      className="text-xs border-slate-700 bg-slate-900 hover:bg-slate-800 cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={deleteConfirmText.trim().toLowerCase() !== "delete" || isDeletingDocModal}
                      onClick={handleConfirmDeleteDoc}
                      className="text-xs cursor-pointer shadow-md shadow-rose-950/50"
                    >
                      {isDeletingDocModal ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          <span>Confirm Delete</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            4. TAB: USER & RBAC PERMISSION MANAGEMENT
        ===================================================================== */}
        {activeTab === "USERS" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Search and Role Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(user?.role === "SUPER_ADMIN"
                  ? ["ALL", "STUDENT", "COUNSELOR", "ADMIN", "SUPER_ADMIN", "BANNED"]
                  : ["ALL", "STUDENT", "COUNSELOR", "ADMIN", "BANNED"]
                ).map((filterKey) => {
                  let count = 0;
                  if (filterKey === "COUNSELOR") count = safeUsers.filter((u) => u.role === "COUNSELOR").length;
                  else if (filterKey === "SUPER_ADMIN") count = safeUsers.filter((u) => u.role === "SUPER_ADMIN").length;
                  else if (filterKey === "BANNED") count = bannedUsersCount;

                  const isBannedTab = filterKey === "BANNED";
                  const showCountBadge = ["COUNSELOR", "SUPER_ADMIN", "BANNED"].includes(filterKey);

                  return (
                    <button
                      key={filterKey}
                      type="button"
                      onClick={() => setUserRoleFilter(filterKey)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        userRoleFilter === filterKey
                          ? isBannedTab
                            ? "bg-rose-600/25 text-rose-300 border border-rose-500/50 shadow-md shadow-rose-950/40"
                            : "bg-blue-600/20 text-blue-400 border border-blue-500/40"
                          : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {isBannedTab && <ShieldAlert className="w-3 h-3 text-rose-400" />}
                      <span>{filterKey === "BANNED" ? "Banned" : filterKey}</span>
                      {showCountBadge && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          userRoleFilter === filterKey
                            ? isBannedTab
                              ? "bg-rose-500/30 text-rose-200"
                              : "bg-blue-500/30 text-blue-300"
                            : "bg-slate-800 text-slate-400"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Users Registry Table */}
            <Card className="bg-slate-900/60 border-slate-800/80 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-3.5">User Identity</th>
                      <th className="p-3.5">Assigned Role</th>
                      <th className="p-3.5">Account Status</th>
                      <th className="p-3.5">Contact Phone</th>
                      <th className="p-3.5 text-right">
                        {user?.role === "SUPER_ADMIN" ? "Super Admin Control Actions" : "Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((u) => {
                        const isSelf = u.id === user?.id;
                        const isSuperAdmin = u.role === "SUPER_ADMIN";
                        const isBlocked = u.status === "BLOCKED";
                        const isTargetAdmin = u.role === "ADMIN";
                        const isLoggedAdmin = user?.role === "ADMIN";
                        const isOnline = isUserOnline(u);

                        return (
                          <tr key={u.id} className="hover:bg-slate-850/50 transition-colors">
                            {/* User Identity */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div className="relative shrink-0">
                                  {u.imageUrl ? (
                                    <img
                                      src={u.imageUrl}
                                      alt={u.name || "User"}
                                      className="w-8 h-8 rounded-full object-cover border border-slate-700/80 bg-slate-800 shrink-0"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                        const sibling = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement;
                                        if (sibling) sibling.style.display = "flex";
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0 ${
                                      u.imageUrl ? "hidden" : "flex"
                                    }`}
                                  >
                                    {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                                  </div>
                                  {isOnline && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" title="Online Now" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-white flex items-center gap-1.5 truncate">
                                    <span className="truncate">{u.name || "System User"}</span>
                                    {isSuperAdmin && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1 shrink-0">
                                        <Crown className="w-2.5 h-2.5 text-purple-300" />
                                        Master
                                      </span>
                                    )}
                                    {isSelf && (
                                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 shrink-0">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400 font-mono truncate">{u.email}</div>
                                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                                    {isOnline ? (
                                      <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span>Online Now</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                                        <span>Last Active: {formatLastActive(u.updatedAt || u.createdAt)}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Assigned Role */}
                            <td className="p-3.5">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.role === "SUPER_ADMIN"
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : u.role === "ADMIN"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : u.role === "COUNSELOR"
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              }`}>
                                {u.role === "SUPER_ADMIN" && <Crown className="w-3 h-3 text-purple-300" />}
                                {u.role === "ADMIN" && <Shield className="w-3 h-3 text-blue-300" />}
                                {u.role === "STUDENT" && <GraduationCap className="w-3 h-3 text-emerald-300" />}
                                <span>{u.role}</span>
                              </span>
                            </td>

                            {/* Account Status */}
                            <td className="p-3.5">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isBlocked 
                                  ? "bg-rose-500/15 text-rose-300 border border-rose-500/30" 
                                  : u.status === "ACTIVE"
                                  ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  isBlocked ? "bg-rose-400" : u.status === "ACTIVE" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                                }`} />
                                <span>{isBlocked ? "BANNED" : u.status || "ACTIVE"}</span>
                              </span>
                            </td>

                            {/* Contact Phone */}
                            <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                              {(u as any).contactNumber || u.student?.contactNumber || u.counselor?.contactNumber || "+880 1712345678"}
                            </td>

                            {/* Actions Column */}
                            <td className="p-3.5 text-right">
                              {isSelf ? (
                                <span className="text-[11px] text-slate-500 italic px-2 py-1 rounded bg-slate-950/60 border border-slate-800">
                                  Protected (Self)
                                </span>
                              ) : isLoggedAdmin && isTargetAdmin ? (
                                <span className="text-[11px] text-purple-400/80 italic px-2 py-1 rounded bg-slate-950/60 border border-slate-800 inline-flex items-center gap-1">
                                  <Shield className="w-3 h-3 text-purple-400" />
                                  <span>Protected (Admin)</span>
                                </span>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Change Role Button (Only Super Admin can change roles) */}
                                  {user?.role === "SUPER_ADMIN" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenRoleModal(u)}
                                      title="Change User Role (Promote or Demote)"
                                      className="h-7 px-2 text-[11px] gap-1 border-slate-800 hover:border-blue-500/50 text-blue-400 hover:text-white cursor-pointer"
                                    >
                                      <UserCheck className="w-3 h-3 text-blue-400" />
                                      <span>Role</span>
                                    </Button>
                                  )}

                                  {/* Ban / Unban Button (Super Admin can ban anyone; Admin can only ban Students) */}
                                  {(user?.role === "SUPER_ADMIN" || (isLoggedAdmin && u.role === "STUDENT")) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleToggleUserStatus(u)}
                                      disabled={actionLoadingUserId === u.id}
                                      title={isBlocked ? "Unban user account" : "Ban user account"}
                                      className={`h-7 px-2 text-[11px] gap-1 transition-all cursor-pointer ${
                                        isBlocked
                                          ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                                          : "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                                      }`}
                                    >
                                      {isBlocked ? (
                                        <>
                                          <Unlock className="w-3 h-3 text-emerald-400" />
                                          <span>Unban</span>
                                        </>
                                      ) : (
                                        <>
                                          <ShieldOff className="w-3 h-3 text-amber-400" />
                                          <span>Ban</span>
                                        </>
                                      )}
                                    </Button>
                                  )}

                                  {/* Delete User Button (Super Admin can delete non-self; Admin can only delete Students) */}
                                  {(user?.role === "SUPER_ADMIN" || (isLoggedAdmin && u.role === "STUDENT")) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleOpenDeleteModal(u)}
                                      title="Delete user account"
                                      className="h-7 px-2 text-[11px] gap-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3 text-rose-400" />
                                      <span>Delete</span>
                                    </Button>
                                  )}

                                  {/* Permissions Button for Admins (Super Admin only) */}
                                  {user?.role === "SUPER_ADMIN" && u.role === "ADMIN" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedAdminUser(u);
                                        setPermissionModalOpen(true);
                                      }}
                                      title="Configure Admin Delegated Permissions"
                                      className="h-7 px-2 text-[11px] gap-1 border-slate-800 hover:border-purple-500/40 text-purple-300 cursor-pointer"
                                    >
                                      <Sliders className="w-3 h-3 text-purple-400" />
                                      <span>Permissions</span>
                                    </Button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-500">
                          {userRoleFilter === "BANNED" ? (
                            <>
                              <ShieldCheck className="w-8 h-8 mx-auto mb-2 opacity-50 text-emerald-400" />
                              <p className="text-sm font-medium text-emerald-400">No Banned Users</p>
                              <p className="text-xs text-slate-500 mt-1">All registered students and administrative accounts are currently in good standing.</p>
                            </>
                          ) : userRoleFilter === "ONLINE" ? (
                            <>
                              <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-emerald-400" />
                              <p className="text-sm font-medium text-slate-400">No Other Users Online</p>
                              <p className="text-xs text-slate-500 mt-1">There are no other registered accounts active in the last 5 minutes.</p>
                            </>
                          ) : (
                            <>
                              <Users className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                              <p className="text-sm font-medium text-slate-400">No users found</p>
                              <p className="text-xs text-slate-500 mt-1">No accounts match the current search or role filter.</p>
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* 1. Modal: Super Admin Change User Role (Promote / Demote) */}
            {selectedUserForRole && (
              <Modal
                isOpen={roleModalOpen}
                onClose={() => setRoleModalOpen(false)}
                title={`Change User Role: ${selectedUserForRole.name}`}
              >
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <div className="font-bold text-white text-sm">{selectedUserForRole.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{selectedUserForRole.email}</div>
                    <div className="text-[11px] text-blue-400 pt-1">Current Role: <span className="font-bold">{selectedUserForRole.role}</span></div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-200">Select New Role:</label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        {
                          role: "STUDENT",
                          label: "Student",
                          desc: "Standard student role. Can explore universities and submit study applications.",
                          badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                        },
                        {
                          role: "ADMIN",
                          label: "Admin",
                          desc: "Platform Administrator with management access to command center operations.",
                          badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                        },
                        {
                          role: "COUNSELOR",
                          label: "Counselor",
                          desc: "Admissions counselor portal. Handles student applications and chat.",
                          badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
                        },
                      ].map((item) => (
                        <label
                          key={item.role}
                          onClick={() => setTargetNewRole(item.role as Role)}
                          className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                            targetNewRole === item.role
                              ? "bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-950/40"
                              : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name="newRoleSelect"
                            checked={targetNewRole === item.role}
                            onChange={() => setTargetNewRole(item.role as Role)}
                            className="mt-1 text-blue-600"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{item.label}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${item.badgeColor}`}>
                                {item.role}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-[11px] text-blue-300">
                    <strong>Note:</strong> Role changes take effect immediately. The user's active session will be revoked, logging them out on the spot so they must log in again to access their updated portal.
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setRoleModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleConfirmChangeRole}
                      disabled={updatingRole || targetNewRole === selectedUserForRole.role}
                      className="gap-1.5"
                    >
                      {updatingRole ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Save & Apply Role</span>
                      )}
                    </Button>
                  </div>
                </div>
              </Modal>
            )}

            {/* 2. Modal: Delete User Account Confirmation */}
            {selectedUserForDelete && (
              <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title={`Confirm Account Deletion`}
              >
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-1.5 text-rose-300">
                    <div className="flex items-center gap-2 font-bold text-rose-200">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Warning: This action is permanent!</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      You are about to delete the account for <strong className="text-white">{selectedUserForDelete.name}</strong> ({selectedUserForDelete.email}).
                    </p>
                    <p className="text-[11px] text-rose-300/80">
                      If this user attempts to log in in the future, they will receive: <br />
                      <em>"No account found with this email address. Please sign up first."</em>
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setDeleteModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleConfirmDeleteUser}
                      disabled={deletingUser}
                      className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
                    >
                      {deletingUser ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Confirm Delete</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Modal>
            )}

            {/* 3. Sub-Admin Permissions Control Modal */}
            {selectedAdminUser && (
              <Modal
                isOpen={permissionModalOpen}
                onClose={() => setPermissionModalOpen(false)}
                title={`Configure Delegated Permissions: ${selectedAdminUser.name}`}
              >
                <div className="space-y-4 text-xs text-slate-300">
                  <p className="text-slate-400">
                    As Super Admin, you can restrict or grant specific operations to this Sub-Admin account.
                  </p>

                  <div className="space-y-3 pt-2">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <div>
                        <div className="font-bold text-white">Manage Universities Catalog</div>
                        <div className="text-[11px] text-slate-400">Allows adding, editing, and archiving partner institutions</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={adminPermissions.canAddUniversity} 
                        onChange={(e) => setAdminPermissions({ ...adminPermissions, canAddUniversity: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <div>
                        <div className="font-bold text-white">Access Financial & Commission Splits</div>
                        <div className="text-[11px] text-slate-400">Allows running 3-way split calculator & reviewing payouts</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={adminPermissions.canManageCommission} 
                        onChange={(e) => setAdminPermissions({ ...adminPermissions, canManageCommission: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                      <div>
                        <div className="font-bold text-white">Full User Deletion Privileges</div>
                        <div className="text-[11px] text-slate-400">Allows permanently removing accounts (Super Admin only recommended)</div>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={adminPermissions.canDeleteRecords} 
                        onChange={(e) => setAdminPermissions({ ...adminPermissions, canDeleteRecords: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-500"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" size="sm" onClick={() => setPermissionModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setPermissionModalOpen(false);
                        alert(`Permissions updated for ${selectedAdminUser.name}`);
                      }}
                    >
                      Save Permissions
                    </Button>
                  </div>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* =====================================================================
            5. TAB: INBOX & INQUIRIES (WITH AUTO-CONFIRMATION MAILER)
        ===================================================================== */}
        {activeTab === "INBOX" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out">
            {/* SUB-TAB 1: LIVE INBOX MESSAGES */}
            {mailsSubTab === "INBOX" && (
              <div className="space-y-4">
                {/* Header Sub-bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                      <Inbox className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Received Contact Messages</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300">
                          {inquiries.length}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Inquiries submitted by students and parents from the public Contact form
                      </p>
                    </div>
                  </div>

                  {inquiriesUnreadCount > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold self-start sm:self-auto">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>{inquiriesUnreadCount} New Unread</span>
                    </div>
                  )}
                </div>

                {inquiries.length === 0 ? (
                  /* Empty State */
                  <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto text-slate-400">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-white">No inquiries received yet</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      When visitors submit the form on the public Contact page, their queries will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  /* Inquiries Workspace: List & Detail Reader */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Messages List */}
                    <div className="lg:col-span-5 space-y-2.5">
                      {inquiries.map((inq) => {
                        const isSelected = selectedInquiry?.id === inq.id;
                        const isUnread = !inq.isRead || inq.status === "UNREAD";
                        const dateText = inq.createdAt
                          ? new Date(inq.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : inq.receivedAt || "Recently";

                        return (
                          <div
                            key={inq.id}
                            onClick={() => handleSelectInquiry(inq)}
                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                              isSelected
                                ? "bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-950/50 ring-1 ring-blue-500/30"
                                : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80"
                            }`}
                          >
                            {isUnread && (
                              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                            )}

                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-bold text-sm text-white truncate flex items-center gap-2">
                                {isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                                )}
                                <span className="truncate">{inq.name}</span>
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-slate-500 font-mono">
                                  {dateText}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteInquiry(inq.id, inq.name, inq.subject);
                                  }}
                                  className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Delete inquiry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="text-xs font-semibold text-blue-300 truncate mb-1">
                              {inq.subject}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {inq.message}
                            </p>

                            <div className="mt-3 flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-300">
                                {inq.country || "Bangladesh"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  inq.status === "REPLIED"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : isUnread
                                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                }`}
                              >
                                {inq.status === "REPLIED"
                                  ? "REPLIED"
                                  : isUnread
                                  ? "UNREAD"
                                  : "READ"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Column: Message Detail & Reply Composer */}
                    <div className="lg:col-span-7">
                      {selectedInquiry ? (
                        <Card className="bg-slate-900/70 border-slate-800/90 shadow-2xl p-6 space-y-5 rounded-3xl">
                          <div className="border-b border-slate-800/80 pb-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <h3 className="text-base sm:text-lg font-bold text-white">
                                {selectedInquiry.subject}
                              </h3>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-xs text-slate-500 font-mono">
                                  {selectedInquiry.createdAt
                                    ? new Date(selectedInquiry.createdAt).toLocaleString("en-US", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                      })
                                    : selectedInquiry.receivedAt || "Recently"}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                              <div>
                                Sender: <strong className="text-white">{selectedInquiry.name}</strong>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span>Email:</span>
                                <a
                                  href={`mailto:${selectedInquiry.email}`}
                                  className="text-blue-400 hover:underline font-mono"
                                >
                                  {selectedInquiry.email}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(selectedInquiry.email, "email")}
                                  className="flex items-center gap-1 p-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px]"
                                  title="Copy Email"
                                >
                                  {copiedField === "email" ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-400" />
                                      <span className="text-[10px] text-slate-400">Copy</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              {selectedInquiry.phone && (
                                <div className="flex items-center gap-1.5">
                                  <span>Phone:</span>
                                  <span className="font-mono text-slate-300">
                                    {selectedInquiry.phone}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(selectedInquiry.phone, "phone")}
                                    className="flex items-center gap-1 p-1 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-[10px]"
                                    title="Copy Phone Number"
                                  >
                                    {copiedField === "phone" ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-400" />
                                        <span className="text-[10px] text-emerald-400 font-semibold">Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3 text-slate-400" />
                                        <span className="text-[10px] text-slate-400">Copy</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Inquiry Body */}
                          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {selectedInquiry.message}
                          </div>

                          {/* Previous Reply if already replied */}
                          {selectedInquiry.reply && (
                            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-1.5 text-xs text-emerald-300">
                              <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Dispatched Reply</span>
                                {selectedInquiry.repliedAt && (
                                  <span className="text-[10px] text-emerald-500 font-mono">
                                    ({new Date(selectedInquiry.repliedAt).toLocaleString()})
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                                {selectedInquiry.reply}
                              </p>
                            </div>
                          )}

                          {/* Reply Form */}
                          <form onSubmit={handleSendReply} className="space-y-3 pt-1">
                            <label className="text-xs font-bold text-slate-300 uppercase block">
                              Direct Email Reply
                            </label>
                            <textarea
                              rows={4}
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              placeholder={`Type personalized response to ${selectedInquiry.name} (${selectedInquiry.email})...`}
                              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                              required
                            />

                            {replySuccess && (
                              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                                <CheckCircle2 className="w-4 h-4 shrink-0" />
                                <span>Email successfully dispatched to {selectedInquiry.email}!</span>
                              </div>
                            )}

                            <div className="flex justify-end gap-2 pt-1">
                              <Button
                                variant="gradient"
                                type="submit"
                                disabled={replySending || !replyMessage.trim()}
                                className="gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{replySending ? "Dispatching..." : "Send Reply Email"}</span>
                              </Button>
                            </div>
                          </form>
                        </Card>
                      ) : (
                        <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
                          Select an inquiry from the left to read and reply.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: AUTO-RESPONDER CONFIGURATION & PREVIEW */}
            {mailsSubTab === "AUTO_RESPONDER" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out max-w-4xl mx-auto">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          Auto-Responder Confirmation Mailer
                        </h4>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold py-0.5 px-2">
                          SMTP 24/7 Active
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Dispatched automatically to student&apos;s email address within 2 seconds of Contact form submission
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {autoResponderSaved && (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saved Successfully
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingAutoResponder(!isEditingAutoResponder)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                        isEditingAutoResponder
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-950/40"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingAutoResponder ? "Close Editor" : "Edit Template & Contacts"}</span>
                    </button>
                  </div>
                </div>

                {/* DYNAMIC EDITING PANEL */}
                {isEditingAutoResponder && (
                  <Card className="bg-slate-900/95 border-slate-800 shadow-2xl p-5 sm:p-6 rounded-2xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-blue-400" />
                          <span>Customize Auto-Responder Content &amp; Contacts</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Changes reflect live in the preview below and in real automated confirmation emails sent to students.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingAutoResponder(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveAutoResponderSettings} className="space-y-4 text-xs text-slate-300">
                      {/* High-Quality Brand Logo Upload Section */}
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <label className="font-semibold text-slate-200 block text-xs">
                              Email Header Brand Logo (High-Quality PNG)
                            </label>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Upload a transparent high-resolution PNG. Stored directly on Cloudinary so email clients (like Gmail) render it cleanly without adding an attachment chip ([logo.png]).
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Logo Thumbnail */}
                            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shrink-0">
                              <img
                                src={autoResponderSettings.logoUrl || "/logo.png"}
                                alt="Logo Preview"
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <input
                              type="file"
                              ref={logoFileInputRef}
                              accept="image/png,image/jpeg,image/webp"
                              className="hidden"
                              onChange={handleUploadLogo}
                            />
                            <button
                              type="button"
                              disabled={logoUploading}
                              onClick={() => logoFileInputRef.current?.click()}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-blue-950/40 cursor-pointer disabled:opacity-50 transition-all"
                            >
                              <UploadCloud className="w-4 h-4" />
                              <span>{logoUploading ? "Uploading PNG..." : "Upload High-Res PNG"}</span>
                            </button>
                          </div>
                        </div>

                        {/* Direct URL Input */}
                        <div className="pt-2 border-t border-slate-900">
                          <input
                            type="url"
                            value={autoResponderSettings.logoUrl}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, logoUrl: e.target.value })}
                            placeholder="Cloudinary Hosted Logo URL (e.g., https://res.cloudinary.com/...)"
                            className="w-full p-2 bg-slate-900/80 border border-slate-800 rounded-lg text-white font-mono text-[11px] focus:outline-none focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email Subject Line */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Email Subject Line
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.subject}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, subject: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>

                        {/* Sender Brand / Display Name */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Sender Brand / Display Name
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.senderName}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, senderName: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>

                        {/* Sender / Reply-To Email */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Sender Email Address
                          </label>
                          <input
                            type="email"
                            value={autoResponderSettings.senderEmail}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, senderEmail: e.target.value, email: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>

                        {/* WhatsApp Direct Phone Number */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Official WhatsApp Number
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.whatsappNumber}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, whatsappNumber: e.target.value })}
                            placeholder="+880 1712-345678"
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>

                        {/* Direct Hotline Number */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Direct Hotline Number
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.hotline}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, hotline: e.target.value })}
                            placeholder="+880 1712-345678"
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>

                        {/* Counseling Desk Hours */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Counseling Desk Hours
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.hours}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, hours: e.target.value })}
                            placeholder="Counseling Desk: Sat – Thu (10AM – 7PM)"
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      {/* Office Physical Address */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-200 block">
                          Office Physical Address
                        </label>
                        <input
                          type="text"
                          value={autoResponderSettings.officeAddress}
                          onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, officeAddress: e.target.value })}
                          placeholder="Rise Abroad Education • Level 6, Navana Tower, Gulshan-1, Dhaka"
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>

                      {/* WhatsApp Notice Bengali Text */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-200 block">
                          WhatsApp Fallback Notice (Bengali or English)
                        </label>
                        <textarea
                          rows={2}
                          value={autoResponderSettings.whatsappText}
                          onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, whatsappText: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed transition-colors"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingAutoResponder(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingAutoResponder}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/40 transition-all cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingAutoResponder ? "Saving Changes..." : "Save Settings"}</span>
                        </button>
                      </div>
                    </form>
                  </Card>
                )}

                {/* REALISTIC & MINIMALIST EMAIL CLIENT MOCKUP */}
                <div className="rounded-2xl border border-slate-800/90 bg-slate-950 shadow-2xl overflow-hidden">
                  {/* Mail Window Header Bar */}
                  <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <Inbox className="w-3 h-3 text-blue-400" />
                        <span>Live Email Client Preview (What Student Receives in Inbox)</span>
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> TLS Verified Delivery
                    </span>
                  </div>

                  {/* Mail Subject & Sender Bar */}
                  <div className="px-5 py-3.5 bg-slate-900/40 border-b border-slate-800/70 space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {autoResponderSettings.subject}
                    </h3>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{autoResponderSettings.senderName}</span>
                        <span className="text-slate-500">&lt;{autoResponderSettings.senderEmail}&gt;</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        to: <strong className="text-slate-300">student@gmail.com</strong> • <span>Delivered within 2 seconds</span>
                      </div>
                    </div>
                  </div>

                  {/* EMAIL BODY: MINIMALIST & STYLISH LETTERHEAD */}
                  <div className="p-5 sm:p-8 bg-slate-100 dark:bg-slate-900/60 flex justify-center">
                    <div className="w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
                      {/* Official Website Logo & Header */}
                      <div className="flex items-center gap-0.5 sm:gap-1 pb-4 border-b border-slate-800/80">
                        {/* Real Website Logo */}
                        <img
                          src={autoResponderSettings.logoUrl || "/logo.svg"}
                          alt="Rise Abroad Education"
                          className="h-10 w-10 object-contain shrink-0"
                        />
                        <div>
                          <div className="font-bold text-base text-white tracking-tight leading-tight">
                            Rise Abroad Education
                          </div>
                          <p className="text-[10px] text-blue-400 tracking-wider uppercase font-semibold mt-0.5">
                            HIGHER STUDY &amp; ADMISSIONS
                          </p>
                        </div>
                      </div>

                      {/* Salutation & Acknowledgment (Single Merged Continuous Paragraph) */}
                      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        <p className="font-semibold text-white">
                          Dear {"{{student_name}}"},
                        </p>
                        <p>
                          Thank you for reaching out to <strong>Rise Abroad Education</strong>. We have successfully received your inquiry. Our admissions counseling desk is currently reviewing your details, and one of our senior counselors will contact you directly via phone, WhatsApp, or email <strong>within the next 24 hours</strong>.
                        </p>
                      </div>

                      {/* 24-Hour Urgent / WhatsApp Fallback Box */}
                      <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2.5">
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {autoResponderSettings.whatsappText}
                        </p>
                        <a
                          href={`https://wa.me/${autoResponderSettings.whatsappNumber.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/40 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat Directly on WhatsApp ({autoResponderSettings.whatsappNumber})</span>
                        </a>
                      </div>

                      {/* Minimalist Signature & Footer */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-200">
                            {autoResponderSettings.senderName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {autoResponderSettings.officeAddress}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Direct Hotline: <strong className="text-slate-300 font-mono">{autoResponderSettings.hotline}</strong>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Email:{" "}
                            <a
                              href={`mailto:${autoResponderSettings.email || autoResponderSettings.senderEmail}`}
                              className="text-blue-400 hover:underline"
                            >
                              {autoResponderSettings.email || autoResponderSettings.senderEmail}
                            </a>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 sm:text-right">
                          <div>{autoResponderSettings.hours}</div>
                        </div>
                      </div>

                      {/* Automated Notification Note */}
                      <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/50 italic text-center sm:text-left">
                        * Note: This is an automated confirmation email. Please do not reply directly to this message.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 3: PASSWORD RESET (OTP) TEMPLATE & PREVIEW */}
            {mailsSubTab === "RESET_PASSWORD" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out max-w-4xl mx-auto">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          Password Reset (OTP) Verification Template
                        </h4>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold py-0.5 px-2">
                          SMTP 24/7 Active
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Dispatched automatically when a user clicks &apos;Forgot Password&apos; and requests an OTP code
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {autoResponderSaved && (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saved Successfully
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingResetPassword(!isEditingResetPassword)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                        isEditingResetPassword
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-950/40"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingResetPassword ? "Close Editor" : "Edit Template"}</span>
                    </button>
                  </div>
                </div>

                {/* DYNAMIC EDITING PANEL */}
                {isEditingResetPassword && (
                  <Card className="bg-slate-900/95 border-slate-800 shadow-2xl p-5 sm:p-6 rounded-2xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-amber-400" />
                          <span>Customize Password Reset Email Content</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Changes reflect live in the preview below and in real password reset emails sent to users.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingResetPassword(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveAutoResponderSettings} className="space-y-4 text-xs text-slate-300">
                      {/* Shared Brand Logo Notification */}
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={autoResponderSettings.logoUrl || "/logo.png"}
                              alt="Logo Preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-xs">Shared Official Brand Logo</div>
                            <p className="text-[11px] text-slate-400">
                              This logo is automatically synced across Auto-Responder, Password Reset, and Welcome emails.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={logoUploading}
                          onClick={() => logoFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer disabled:opacity-50 transition-all shrink-0"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                          <span>{logoUploading ? "Uploading..." : "Change Logo"}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email Subject Line */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Email Subject Line
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.otpSubject}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, otpSubject: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                            required
                          />
                        </div>

                        {/* Email Heading */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Letterhead Main Heading
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.otpHeading}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, otpHeading: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      {/* Body Instructions Message */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-200 block">
                          Instructions Message (Placed above the 6-digit OTP code)
                        </label>
                        <textarea
                          rows={2}
                          value={autoResponderSettings.otpBodyMessage}
                          onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, otpBodyMessage: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 resize-none leading-relaxed transition-colors"
                          required
                        />
                      </div>

                      {/* Expiry & Security Warning Note */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-200 block">
                          Security &amp; Expiry Warning Note
                        </label>
                        <textarea
                          rows={2}
                          value={autoResponderSettings.otpExpiryNote}
                          onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, otpExpiryNote: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 resize-none leading-relaxed transition-colors"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingResetPassword(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingAutoResponder}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/40 transition-all cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingAutoResponder ? "Saving Changes..." : "Save Template"}</span>
                        </button>
                      </div>
                    </form>
                  </Card>
                )}

                {/* REALISTIC & MINIMALIST EMAIL CLIENT MOCKUP */}
                <div className="rounded-2xl border border-slate-800/90 bg-slate-950 shadow-2xl overflow-hidden">
                  {/* Mail Window Header Bar */}
                  <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <KeyRound className="w-3 h-3 text-amber-400" />
                        <span>Live Email Client Preview (What User Receives For Password Reset)</span>
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> TLS Verified Delivery
                    </span>
                  </div>

                  {/* Mail Subject & Sender Bar */}
                  <div className="px-5 py-3.5 bg-slate-900/40 border-b border-slate-800/70 space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {autoResponderSettings.otpSubject}
                    </h3>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{autoResponderSettings.senderName}</span>
                        <span className="text-slate-500">&lt;{autoResponderSettings.senderEmail}&gt;</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        to: <strong className="text-slate-300">user@example.com</strong> • <span>Instant Security Dispatch</span>
                      </div>
                    </div>
                  </div>

                  {/* EMAIL BODY: MINIMALIST & STYLISH LETTERHEAD */}
                  <div className="p-5 sm:p-8 bg-slate-100 dark:bg-slate-900/60 flex justify-center">
                    <div className="w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
                      {/* Official Website Logo & Header */}
                      <div className="flex items-center gap-0.5 sm:gap-1 pb-4 border-b border-slate-800/80">
                        <img
                          src={autoResponderSettings.logoUrl || "/logo.svg"}
                          alt="Rise Abroad Education"
                          className="h-10 w-10 object-contain shrink-0"
                        />
                        <div>
                          <div className="font-bold text-base text-white tracking-tight leading-tight">
                            Rise Abroad Education
                          </div>
                          <p className="text-[10px] text-blue-400 tracking-wider uppercase font-semibold mt-0.5">
                            HIGHER STUDY &amp; ADMISSIONS
                          </p>
                        </div>
                      </div>

                      {/* Header Title */}
                      <div className="text-center pt-1 pb-1">
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {autoResponderSettings.otpHeading}
                        </h2>
                      </div>

                      {/* Salutation & Message */}
                      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        <p className="font-semibold text-white">
                          Dear {"{{user_name}}"},
                        </p>
                        <p>
                          {autoResponderSettings.otpBodyMessage}
                        </p>
                      </div>

                      {/* Prominent OTP Code Highlight Box */}
                      <div className="p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 text-center space-y-2 shadow-inner">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                          Your One-Time Password (OTP)
                        </p>
                        <div>
                          <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-amber-400 bg-amber-400/10 px-6 py-2 rounded-xl border border-amber-400/25 inline-block">
                            849201
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-300/90 font-medium">
                          ⏱ Valid for 10 minutes only
                        </p>
                      </div>

                      {/* Security Warning Box */}
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                        <span className="text-amber-400 font-semibold block mb-0.5">Security Notice:</span>
                        {autoResponderSettings.otpExpiryNote}
                      </div>

                      {/* Minimalist Signature & Footer */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-200">
                            {autoResponderSettings.senderName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {autoResponderSettings.officeAddress}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Direct Hotline: <strong className="text-slate-300 font-mono">{autoResponderSettings.hotline}</strong>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Email:{" "}
                            <a
                              href={`mailto:${autoResponderSettings.email || autoResponderSettings.senderEmail}`}
                              className="text-blue-400 hover:underline"
                            >
                              {autoResponderSettings.email || autoResponderSettings.senderEmail}
                            </a>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 sm:text-right">
                          <div>{autoResponderSettings.hours}</div>
                        </div>
                      </div>

                      {/* Automated Notification Note */}
                      <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/50 italic text-center sm:text-left">
                        * Note: This is an automated security verification email. Please do not reply directly to this message.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB 4: REGISTRATION (OTP) VERIFICATION TEMPLATE & PREVIEW */}
            {mailsSubTab === "REGISTRATION_OTP" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out max-w-4xl mx-auto">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          Registration (OTP) Verification Template
                        </h4>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold py-0.5 px-2">
                          SMTP 24/7 Active
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Dispatched automatically when a student signs up with an OTP code to verify their account
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {autoResponderSaved && (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saved Successfully
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingRegOtp(!isEditingRegOtp)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                        isEditingRegOtp
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-950/40"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingRegOtp ? "Close Editor" : "Edit Template"}</span>
                    </button>
                  </div>
                </div>

                {/* DYNAMIC EDITING PANEL */}
                {isEditingRegOtp && (
                  <Card className="bg-slate-900/95 border-slate-800 shadow-2xl p-5 sm:p-6 rounded-2xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-blue-400" />
                          <span>Customize Registration OTP Email Content</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Changes reflect live in the preview below and in real verification emails sent to new students.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingRegOtp(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveAutoResponderSettings} className="space-y-4 text-xs text-slate-300">
                      {/* Shared Brand Logo Notification */}
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={autoResponderSettings.logoUrl || "/logo.png"}
                              alt="Logo Preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-xs">Shared Official Brand Logo</div>
                            <p className="text-[11px] text-slate-400">
                              This logo is automatically synced across Auto-Responder, Password Reset, and Registration emails.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={logoUploading}
                          onClick={() => logoFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer disabled:opacity-50 transition-all shrink-0"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                          <span>{logoUploading ? "Uploading..." : "Change Logo"}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email Subject Line */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Email Subject Line
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.regOtpSubject}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, regOtpSubject: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>

                        {/* Email Heading */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Letterhead Main Heading
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.regOtpHeading}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, regOtpHeading: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      {/* Instructions Message Body */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-200 block">
                          Instructions Message (Placed above the 6-digit OTP code)
                        </label>
                        <textarea
                          rows={2}
                          value={autoResponderSettings.regOtpBodyMessage}
                          onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, regOtpBodyMessage: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed transition-colors"
                          required
                        />
                      </div>

                      {/* Expiry & Security Warning Note */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-200 block">
                          Security &amp; Expiry Warning Note
                        </label>
                        <textarea
                          rows={2}
                          value={autoResponderSettings.regOtpExpiryNote}
                          onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, regOtpExpiryNote: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed transition-colors"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingRegOtp(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={savingAutoResponder}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-blue-950/40 transition-all cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingAutoResponder ? "Saving Changes..." : "Save Template"}</span>
                        </button>
                      </div>
                    </form>
                  </Card>
                )}

                {/* REALISTIC & MINIMALIST EMAIL CLIENT MOCKUP */}
                <div className="rounded-2xl border border-slate-800/90 bg-slate-950 shadow-2xl overflow-hidden">
                  {/* Mail Window Header Bar */}
                  <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-800">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                        <UserCheck className="w-3 h-3 text-blue-400" />
                        <span>Live Email Client Preview (What Student Receives for Registration OTP)</span>
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> TLS Verified Delivery
                    </span>
                  </div>

                  {/* Mail Subject & Sender Bar */}
                  <div className="px-5 py-3.5 bg-slate-900/40 border-b border-slate-800/70 space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {autoResponderSettings.regOtpSubject}
                    </h3>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{autoResponderSettings.senderName}</span>
                        <span className="text-slate-500">&lt;{autoResponderSettings.senderEmail}&gt;</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        to: <strong className="text-slate-300">newstudent@example.com</strong> • <span>Registration Security Dispatch</span>
                      </div>
                    </div>
                  </div>

                  {/* EMAIL BODY: MINIMALIST & STYLISH LETTERHEAD */}
                  <div className="p-5 sm:p-8 bg-slate-100 dark:bg-slate-900/60 flex justify-center">
                    <div className="w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
                      {/* Official Website Logo & Header */}
                      <div className="flex items-center gap-0.5 sm:gap-1 pb-4 border-b border-slate-800/80">
                        <img
                          src={autoResponderSettings.logoUrl || "/logo.svg"}
                          alt="Rise Abroad Education"
                          className="h-10 w-10 object-contain shrink-0"
                        />
                        <div>
                          <div className="font-bold text-base text-white tracking-tight leading-tight">
                            Rise Abroad Education
                          </div>
                          <p className="text-[10px] text-blue-400 tracking-wider uppercase font-semibold mt-0.5">
                            HIGHER STUDY &amp; ADMISSIONS
                          </p>
                        </div>
                      </div>

                      {/* Header Title */}
                      <div className="text-center pt-1 pb-1">
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {autoResponderSettings.regOtpHeading}
                        </h2>
                      </div>

                      {/* Salutation & Welcome Message */}
                      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        <p className="font-semibold text-white">
                          Dear {"{{student_name}}"},
                        </p>
                        <p>
                          {autoResponderSettings.regOtpBodyMessage}
                        </p>
                      </div>

                      {/* Prominent OTP Code Highlight Box */}
                      <div className="p-5 rounded-2xl bg-slate-950/90 border border-blue-500/30 text-center space-y-2 shadow-inner">
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                          Your Account Verification Code
                        </p>
                        <div>
                          <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-sky-400 bg-sky-400/10 px-6 py-2 rounded-xl border border-sky-400/25 inline-block my-2">
                            849201
                          </span>
                        </div>
                        <p className="text-[11px] text-sky-300/90 font-medium">
                          ⏱ Valid for 10 minutes only
                        </p>
                      </div>

                      {/* Security Warning Box */}
                      <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                        <span className="text-blue-400 font-semibold block mb-0.5">Security Notice:</span>
                        {autoResponderSettings.regOtpExpiryNote}
                      </div>

                      {/* Minimalist Signature & Footer */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-200">
                            {autoResponderSettings.senderName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {autoResponderSettings.officeAddress}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Direct Hotline: <strong className="text-slate-300 font-mono">{autoResponderSettings.hotline}</strong>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Email:{" "}
                            <a
                              href={`mailto:${autoResponderSettings.email || autoResponderSettings.senderEmail}`}
                              className="text-blue-400 hover:underline"
                            >
                              {autoResponderSettings.email || autoResponderSettings.senderEmail}
                            </a>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 sm:text-right">
                          <div>{autoResponderSettings.hours}</div>
                        </div>
                      </div>

                      {/* Automated Notification Note */}
                      <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/50 italic text-center sm:text-left">
                        * Note: This is an automated account verification email. Please do not reply directly to this message.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. WELCOME REGISTRATION EMAIL TEMPLATE & LIVE PREVIEW */}
            {mailsSubTab === "WELCOME_EMAIL" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 ease-out max-w-4xl mx-auto">
                {/* Header Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">
                          Welcome Registration Email Template
                        </h4>
                        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-[10px] font-semibold py-0.5 px-2">
                          SMTP 24/7 Active
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Dispatched automatically to students immediately after successful OTP account verification
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {autoResponderSaved && (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saved Successfully
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsEditingWelcomeEmail(!isEditingWelcomeEmail)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                        isEditingWelcomeEmail
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-950/40"
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingWelcomeEmail ? "Close Editor" : "Edit Template"}</span>
                    </button>
                  </div>
                </div>

                {/* DYNAMIC EDITING PANEL */}
                {isEditingWelcomeEmail && (
                  <Card className="bg-slate-900/95 border-slate-800 shadow-2xl p-5 sm:p-6 rounded-2xl animate-in fade-in duration-200">
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-blue-400" />
                          <span>Customize Welcome Registration Email &amp; Portal Link</span>
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Configure the congratulatory message, CTA button label, and destination student portal link.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingWelcomeEmail(false)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveAutoResponderSettings} className="space-y-4 text-xs text-slate-300">
                      {/* Shared Brand Logo Notification */}
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={autoResponderSettings.logoUrl || "/logo.png"}
                              alt="Logo Preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-white text-xs">Shared Official Brand Logo</div>
                            <p className="text-[11px] text-slate-400">
                              This logo is automatically synced across Auto-Responder, Password Reset, and Welcome emails.
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={logoUploading}
                          onClick={() => logoFileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 cursor-pointer disabled:opacity-50 transition-all shrink-0"
                        >
                          <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                          <span>{logoUploading ? "Uploading..." : "Change Logo"}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email Subject Line */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Email Subject Line
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.welcomeSubject}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, welcomeSubject: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>

                        {/* Email Heading */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Letterhead Main Heading
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.welcomeHeading}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, welcomeHeading: e.target.value })}
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>
                      </div>

                      {/* Welcome Message Body */}
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-200 block">
                          Welcome Body Message
                        </label>
                        <textarea
                          rows={4}
                          value={autoResponderSettings.welcomeMessage}
                          onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, welcomeMessage: e.target.value })}
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Action Button Label */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block">
                            Portal Button Label / Text
                          </label>
                          <input
                            type="text"
                            value={autoResponderSettings.welcomeBtnText}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, welcomeBtnText: e.target.value })}
                            placeholder="e.g. Access Student Portal"
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                        </div>

                        {/* Portal Link / Destination URL */}
                        <div className="space-y-1.5">
                          <label className="font-semibold text-slate-200 block flex items-center justify-between">
                            <span>Access Student Portal Link / URL</span>
                            <span className="text-[10px] text-blue-400 font-normal">Fully Customizable</span>
                          </label>
                          <input
                            type="url"
                            value={autoResponderSettings.welcomeBtnUrl}
                            onChange={(e) => setAutoResponderSettings({ ...autoResponderSettings, welcomeBtnUrl: e.target.value })}
                            placeholder="http://localhost:3000/dashboard or https://yourdomain.com/dashboard"
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-xs"
                            required
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsEditingWelcomeEmail(false)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <Button
                          type="submit"
                          variant="gradient"
                          size="sm"
                          disabled={savingAutoResponder}
                          className="gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>{savingAutoResponder ? "Saving Live Changes..." : "Save Welcome Email Template"}</span>
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                {/* LIVE VISUAL PREVIEW CARD */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
                  {/* SIMULATED EMAIL CLIENT HEADER BAR */}
                  <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                        <span className="text-[11px] font-semibold text-slate-400 ml-2">
                          Live Client Email Preview
                        </span>
                      </div>
                      <Badge variant="outline" className="text-blue-400 border-blue-500/30 bg-blue-500/10 text-[10px] font-medium">
                        Trigger: Post-Verification
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs pt-2 border-t border-slate-800/60">
                      <div className="text-slate-300 flex items-center gap-1.5 flex-wrap">
                        <span className="text-slate-500 font-semibold">Subject:</span>
                        <span className="font-semibold text-white">{autoResponderSettings.welcomeSubject}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        from: <strong className="text-slate-300">{autoResponderSettings.senderName}</strong> &lt;{autoResponderSettings.senderEmail}&gt;
                      </div>
                      <div className="text-slate-400 text-[11px]">
                        to: <strong className="text-slate-300">newstudent@example.com</strong> • <span>Student Onboarding Dispatch</span>
                      </div>
                    </div>
                  </div>

                  {/* EMAIL BODY: MINIMALIST & STYLISH LETTERHEAD */}
                  <div className="p-5 sm:p-8 bg-slate-100 dark:bg-slate-900/60 flex justify-center">
                    <div className="w-full max-w-xl bg-[#0f172a] border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
                      {/* Official Website Logo & Header */}
                      <div className="flex items-center gap-0.5 sm:gap-1 pb-4 border-b border-slate-800/80">
                        <img
                          src={autoResponderSettings.logoUrl || "/logo.png"}
                          alt="Rise Abroad Education"
                          className="h-10 w-10 object-contain shrink-0"
                        />
                        <div>
                          <div className="font-bold text-base text-white tracking-tight leading-tight">
                            Rise Abroad Education
                          </div>
                          <p className="text-[10px] text-blue-400 tracking-wider uppercase font-semibold mt-0.5">
                            HIGHER STUDY &amp; ADMISSIONS
                          </p>
                        </div>
                      </div>

                      {/* Header Title */}
                      <div className="text-center pt-1 pb-1">
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                          {autoResponderSettings.welcomeHeading}
                        </h2>
                      </div>

                      {/* Salutation & Welcome Message */}
                      <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        <p className="font-semibold text-white">
                          Dear {"{{student_name}}"},
                        </p>
                        <p>
                          {autoResponderSettings.welcomeMessage}
                        </p>
                      </div>

                      {/* Feature Highlights Card */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs text-slate-300">
                        <div className="font-semibold text-white text-[11px] uppercase tracking-wider text-blue-400">
                          What you can do now:
                        </div>
                        <ul className="space-y-1.5 text-[11px] text-slate-300">
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>Explore 500+ top universities across UK, USA, Canada, and Europe</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>Directly track your application status &amp; visa documentation</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>Connect with senior academic counselors for one-on-one guidance</span>
                          </li>
                        </ul>
                      </div>

                      {/* CTA Button Box */}
                      <div className="text-center py-3">
                        <a
                          href={autoResponderSettings.welcomeBtnUrl || "http://localhost:3000/dashboard"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all pointer-events-none"
                        >
                          <span>{autoResponderSettings.welcomeBtnText || "Access Student Portal"}</span>
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <div className="text-[10px] text-slate-500 mt-2 font-mono break-all">
                          Link: <span className="text-blue-400">{autoResponderSettings.welcomeBtnUrl || "http://localhost:3000/dashboard"}</span>
                        </div>
                      </div>

                      {/* Minimalist Signature & Footer */}
                      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-200">
                            {autoResponderSettings.senderName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {autoResponderSettings.officeAddress}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Direct Hotline: <strong className="text-slate-300 font-mono">{autoResponderSettings.hotline}</strong>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Email:{" "}
                            <a
                              href={`mailto:${autoResponderSettings.email || autoResponderSettings.senderEmail}`}
                              className="text-blue-400 hover:underline"
                            >
                              {autoResponderSettings.email || autoResponderSettings.senderEmail}
                            </a>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 sm:text-right">
                          <div>{autoResponderSettings.hours}</div>
                        </div>
                      </div>

                      {/* Automated Notification Note */}
                      <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/50 italic text-center sm:text-left">
                        * Note: This is an automated notification. Please do not reply directly to this message.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* =====================================================================
            6. TAB: HOME PAGE CMS
        ===================================================================== */}
        {activeTab === "HOME_CMS" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <Card className="bg-slate-900/60 border-slate-800/80 shadow-2xl p-6 sm:p-8">
              <div className="border-b border-slate-800 pb-4 mb-6">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-400" />
                  <span>Home Page Content & Sections Editor</span>
                </CardTitle>
                <p className="text-xs text-slate-400 mt-1">
                  Directly customize the landing page headlines, metric badges, and call-to-actions.
                </p>
              </div>

              <form onSubmit={handleSaveHomeCms} className="space-y-6 text-xs text-slate-300">
                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">Main Hero Headline</label>
                  <input
                    type="text"
                    value={homeCms.heroTitle}
                    onChange={(e) => setHomeCms({ ...homeCms, heroTitle: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-bold text-slate-200 block">Hero Subtitle</label>
                  <textarea
                    rows={3}
                    value={homeCms.heroSubtitle}
                    onChange={(e) => setHomeCms({ ...homeCms, heroSubtitle: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="font-bold text-slate-200 block">Partner Count Counter</label>
                    <input
                      type="text"
                      value={homeCms.partnerCount}
                      onChange={(e) => setHomeCms({ ...homeCms, partnerCount: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-slate-200 block">Visa Success Rate Metric</label>
                    <input
                      type="text"
                      value={homeCms.visaSuccessRate}
                      onChange={(e) => setHomeCms({ ...homeCms, visaSuccessRate: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-slate-200 block">Global Students Counter</label>
                    <input
                      type="text"
                      value={homeCms.studentsHelped}
                      onChange={(e) => setHomeCms({ ...homeCms, studentsHelped: e.target.value })}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                {homeCmsSaved && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Home Page CMS changes successfully updated to live database!</span>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button variant="gradient" type="submit" className="gap-2 shadow-lg shadow-blue-600/20">
                    <Save className="w-4 h-4" />
                    <span>Publish Home Page Changes</span>
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* =====================================================================
            7. TAB: UNIVERSITIES CATALOG
        ===================================================================== */}
        {activeTab === "UNIVERSITIES" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header & Primary CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Partner Institutions Catalog</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    uniStatusFilter === "ALL" 
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : uniStatusFilter === "DRAFT"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}>
                    {uniStatusFilter === "ALL" ? `All (${displayedUniversities.length})` : uniStatusFilter === "DRAFT" ? `Drafts (${displayedUniversities.length})` : `Trash (${displayedUniversities.length})`}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {uniStatusFilter === "ALL" 
                    ? "Manage global universities, official programs, tuition fee ranges, and admission policies." 
                    : uniStatusFilter === "DRAFT"
                    ? "Unpublished university posts saved as draft. Review and publish anytime."
                    : "Archived/Deleted institutions in trash. Restore them back or purge permanently."}
                </p>
              </div>

              <Button
                variant="gradient"
                size="sm"
                onClick={handleOpenCreateUniModal}
                className="gap-2 shadow-lg shadow-blue-600/20 self-start sm:self-auto cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Partner University</span>
              </Button>
            </div>

            {/* Action Feedback Banner / Toast */}
            {uniToast && (
              <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300 ${
                uniToast.type === "success"
                  ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/40 border-rose-500/40 text-rose-300"
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">{uniToast.message}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUniToast(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Empty State */}
            {displayedUniversities.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">
                  {uniStatusFilter === "DRAFT" ? "No Draft Universities" : uniStatusFilter === "TRASH" ? "Trash is Empty" : "No Universities Found"}
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {uniStatusFilter === "DRAFT" 
                    ? "You have not saved any draft posts yet. Add a new university and click 'Save as Draft'."
                    : uniStatusFilter === "TRASH"
                    ? "No deleted universities found in the trash."
                    : "Get started by publishing your first accredited partner university."}
                </p>
                {uniStatusFilter === "ALL" && (
                  <Button variant="primary" size="sm" onClick={handleOpenCreateUniModal} className="mt-2">
                    Create First University
                  </Button>
                )}
              </div>
            ) : (
              /* Universities Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedUniversities.map((uni) => {
                  const coverImg = uni.coverImageUrl || uni.bannerUrl;
                  const isDraft = !uni.isDeleted && (uni.status === "DRAFT" || uni.isDraft);
                  const isDeleted = uni.isDeleted;

                  return (
                    <Card key={uni.id} className="bg-slate-900/60 border-slate-800/80 hover:border-slate-700 transition-all p-0 overflow-hidden flex flex-col justify-between group shadow-xl">
                      <div>
                        {/* 16:9 Thumbnail Cover */}
                        <div className="relative w-full aspect-[16/9] bg-slate-950 border-b border-slate-800 overflow-hidden">
                          {coverImg ? (
                            <img
                              src={coverImg}
                              alt={uni.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/70 flex items-center justify-center">
                              <Building2 className="w-10 h-10 text-blue-400/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                          {/* Status Badge overlay */}
                          <div className="absolute top-2.5 left-2.5">
                            {isDeleted ? (
                              <span className="px-2 py-0.5 rounded-md bg-rose-500/90 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                                Deleted / Trash
                              </span>
                            ) : isDraft ? (
                              <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                                Draft
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-white text-[10px] font-bold uppercase tracking-wider shadow">
                                Published
                              </span>
                            )}
                          </div>

                          {/* Country pill overlay */}
                          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-[10px] font-semibold text-slate-200 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-rose-400" />
                            <span>{uni.city}{uni.country?.name ? `, ${uni.country.name}` : ""}</span>
                          </div>

                          <div className="absolute bottom-2.5 left-3 right-3">
                            <h4 className="font-bold text-white text-sm sm:text-base truncate drop-shadow">
                              {uni.name}
                            </h4>
                          </div>
                        </div>

                        {/* Card Content Body */}
                        <div className="p-4 space-y-3">
                          {/* Tags */}
                          {uni.tags && uni.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {uni.tags.slice(0, 3).map((tag, tIdx) => (
                                <span key={tIdx} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-medium border border-blue-500/20">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                            {uni.description || "Leading global university with world-class faculty and comprehensive degree programs."}
                          </p>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase">Tuition Fee</span>
                              <span className="font-mono text-emerald-400 font-bold">
                                ${(uni.minTuitionFee || 12000).toLocaleString()} - ${(uni.maxTuitionFee || 25000).toLocaleString()}
                                <span className="text-[10px] text-slate-500 font-normal"> /yr</span>
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 block uppercase">Mode</span>
                              <span className="text-[10px] text-slate-300 font-bold uppercase">
                                {uni.offerLetterPaymentType || "FREE"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
                        <Link
                          href={`/universities/${slugify(uni.name) || uni.id}`}
                          target="_blank"
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-blue-400 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Page</span>
                        </Link>

                        <div className="flex items-center gap-1.5">
                          {isDeleted ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleRestoreUniversity(uni.id)}
                                title="Restore from Trash"
                                className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenUniDeleteModal(uni, true)}
                                title="Delete Permanently"
                                className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditUniModal(uni)}
                                title="Edit University"
                                className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white transition-all cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenUniDeleteModal(uni, false)}
                                title="Move to Trash"
                                className="p-1.5 rounded-lg bg-slate-850 hover:bg-rose-950/40 border border-slate-700/80 hover:border-rose-800/60 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            8. TAB: HIGHER STUDY GUIDES & BLOGS CMS (FULL DYNAMIC CMS)
        ===================================================================== */}
        {activeTab === "GUIDES_CMS" && (() => {
          const GUIDE_PAGE_SIZE = 6;
          const statusFiltered = adminGuides.filter((g) => {
            if (guideStatusFilter === "DRAFT") return g.status === "DRAFT";
            if (guideStatusFilter === "TRASH") return g.status === "TRASH";
            return g.status !== "DRAFT" && g.status !== "TRASH";
          });

          const filteredGuides = statusFiltered.filter((g) => {
            const q = guideSearch.trim().toLowerCase();
            const matchSearch =
              !q ||
              (g.title || "").toLowerCase().includes(q) ||
              (g.excerpt || "").toLowerCase().includes(q) ||
              (g.category || "").toLowerCase().includes(q) ||
              (g.tags || []).some((t: string) => t.toLowerCase().includes(q));
            const matchCat =
              guideCategoryFilter === "ALL" ||
              (g.category || "").toLowerCase() === guideCategoryFilter.toLowerCase();
            return matchSearch && matchCat;
          });

          const totalGuidePages = Math.max(1, Math.ceil(filteredGuides.length / GUIDE_PAGE_SIZE));
          const safePage = Math.min(guidePage, totalGuidePages);
          const paginatedAdminGuides = filteredGuides.slice(
            (safePage - 1) * GUIDE_PAGE_SIZE,
            safePage * GUIDE_PAGE_SIZE
          );

          const guideCategories = Array.from(
            new Set([
              "United Kingdom",
              "Canada",
              "USA",
              "Germany",
              "Australia",
              "Scholarship",
              "Visa Guide",
              ...adminGuides.map((g) => g.category).filter(Boolean),
            ])
          );

          return (
            <div className="space-y-5 animate-in fade-in duration-200">
              {guideViewMode === "LIST" ? (
                <>
                  {/* Top Control Bar: Search, Category Filter, Create Button */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                    <div className="flex flex-wrap items-center gap-2.5 flex-1">
                      <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Search guides, topics, tags..."
                          value={guideSearch}
                          onChange={(e) => {
                            setGuideSearch(e.target.value);
                            setGuidePage(1);
                          }}
                          className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <select
                        value={guideCategoryFilter}
                        onChange={(e) => {
                          setGuideCategoryFilter(e.target.value);
                          setGuidePage(1);
                        }}
                        className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="ALL">All Categories</option>
                        {guideCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href="/blogs"
                        target="_blank"
                        className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                        <span>View Public Page</span>
                      </Link>
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={handleOpenCreateGuide}
                        className="gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Create New Guide</span>
                      </Button>
                    </div>
                  </div>

                  {/* Empty State */}
                  {paginatedAdminGuides.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                      <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                      <div className="text-sm font-bold text-slate-200">
                        {guideStatusFilter === "DRAFT"
                          ? "No Draft Guides Found"
                          : guideStatusFilter === "TRASH"
                          ? "Trash is Empty"
                          : "No Published Study Guides Found"}
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        {guideStatusFilter === "ALL"
                          ? "Click 'Create New Guide' to publish visa preparation handbooks, scholarship tips, and country guides."
                          : "Switch tabs above or create a new guide article."}
                      </p>
                      {guideStatusFilter !== "TRASH" && (
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={handleOpenCreateGuide}
                          className="gap-1.5 text-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create New Guide</span>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Guides Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedAdminGuides.map((guide) => {
                          const banner =
                            guide.bannerUrl ||
                            guide.coverImage ||
                            "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80";

                          return (
                            <div
                              key={guide.id}
                              className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
                            >
                              <div>
                                {/* 16:9 Banner Preview */}
                                <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                                  <img
                                    src={banner}
                                    alt={guide.title}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                                  {/* Status Badge */}
                                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md border ${
                                        guide.status === "DRAFT"
                                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                          : guide.status === "TRASH"
                                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                      }`}
                                    >
                                      {guide.status === "DRAFT"
                                        ? "DRAFT"
                                        : guide.status === "TRASH"
                                        ? "TRASH"
                                        : "PUBLISHED"}
                                    </span>
                                  </div>

                                  {/* Category Pill */}
                                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-blue-400 border border-slate-800">
                                    {guide.category || "Study Guide"}
                                  </div>

                                  {/* Read Time */}
                                  <div className="absolute bottom-2 right-2.5 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-300 font-mono">
                                    {guide.readTime || "5 min read"}
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-2.5">
                                  {guide.tags && guide.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {guide.tags.slice(0, 3).map((t: string, idx: number) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px] font-medium"
                                        >
                                          {t}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                                    {guide.title}
                                  </h4>

                                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                    {guide.excerpt}
                                  </p>
                                </div>
                              </div>

                              {/* Action Footer */}
                              <div className="px-4 py-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
                                <span className="text-[11px] text-slate-500">
                                  {guide.createdAt
                                    ? new Date(guide.createdAt).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })
                                    : "2026"}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {guide.status === "TRASH" ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickGuideStatusChange(guide, "PUBLISHED")}
                                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold cursor-pointer transition-colors"
                                        title="Restore & Publish"
                                      >
                                        Restore
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleQuickGuideStatusChange(guide, "DRAFT")}
                                        className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-[11px] font-semibold cursor-pointer transition-colors"
                                        title="Move to Drafts"
                                      >
                                        To Draft
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setGuideDeleteTarget({ guide, hard: true })}
                                        className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800/70 text-rose-300 cursor-pointer transition-colors"
                                        title="Delete Permanently"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {guide.status === "DRAFT" ? (
                                        <button
                                          type="button"
                                          onClick={() => handleQuickGuideStatusChange(guide, "PUBLISHED")}
                                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold cursor-pointer transition-colors"
                                          title="Publish Live"
                                        >
                                          Publish
                                        </button>
                                      ) : (
                                        <>
                                          <Link
                                            href={`/blogs/${guide.slug}`}
                                            target="_blank"
                                            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-colors"
                                            title="View Live Guide"
                                          >
                                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                                          </Link>
                                          <button
                                            type="button"
                                            onClick={() => handleQuickGuideStatusChange(guide, "DRAFT")}
                                            className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-semibold cursor-pointer transition-colors"
                                            title="Unpublish and move to Drafts"
                                          >
                                            Draft
                                          </button>
                                        </>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditGuide(guide)}
                                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white cursor-pointer transition-colors"
                                        title="Edit Guide"
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => setGuideDeleteTarget({ guide, hard: false })}
                                        className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/50 border border-slate-700/80 hover:border-rose-800/60 text-slate-400 hover:text-rose-400 cursor-pointer transition-colors"
                                        title="Move to Trash"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Admin Guides Pagination */}
                      {totalGuidePages > 1 && (
                        <div className="pt-3 flex items-center justify-between border-t border-slate-800/80 text-xs text-slate-400">
                          <span>
                            Page <strong className="text-white">{safePage}</strong> of{" "}
                            <strong className="text-white">{totalGuidePages}</strong> ({filteredGuides.length} guides)
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={safePage === 1}
                              onClick={() => setGuidePage((p) => Math.max(1, p - 1))}
                              className="text-xs cursor-pointer"
                            >
                              Prev
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={safePage === totalGuidePages}
                              onClick={() => setGuidePage((p) => Math.min(totalGuidePages, p + 1))}
                              className="text-xs cursor-pointer"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                /* VIEW B: FULL AUTHORING & EDITING STUDIO */
                <Card className="bg-slate-900/90 border-slate-800 shadow-2xl p-5 sm:p-7 rounded-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span>{editingGuideId ? "Edit Study Guide Article" : "Publish New Study Guide"}</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Upload a 16:9 cover banner, configure category tags, and write structured markdown sections.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGuideViewMode("LIST");
                        setEditingGuideId(null);
                      }}
                      className="text-xs border-slate-700 cursor-pointer self-start sm:self-auto"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                      <span>Back to Guides</span>
                    </Button>
                  </div>

                  <div className="space-y-5 text-xs text-slate-300">
                    {/* 1. Cover Banner Upload & Preview */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-slate-200 flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-blue-400" />
                          <span>1. Article Cover Banner (16:9)</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Direct Cloudinary Upload or Image URL</span>
                      </div>

                      <input
                        ref={guideBannerInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadGuideBanner(file);
                        }}
                        className="hidden"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-7 space-y-2.5">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={guideForm.bannerUrl}
                              onChange={(e) => setGuideForm({ ...guideForm, bannerUrl: e.target.value })}
                              placeholder="https://images.unsplash.com/... or click Upload Photo"
                              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={guideBannerUploading}
                              onClick={() => guideBannerInputRef.current?.click()}
                              className="shrink-0 gap-1.5 cursor-pointer border-blue-500/40 text-blue-300"
                            >
                              {guideBannerUploading ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <UploadCloud className="w-3.5 h-3.5" />
                              )}
                              <span>{guideBannerUploading ? "Uploading..." : "Upload Photo"}</span>
                            </Button>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Recommended: 1200×675px landscape image for crisp card and header display.
                          </p>
                        </div>

                        <div className="md:col-span-5">
                          <div className="aspect-video w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
                            {guideForm.bannerUrl ? (
                              <img
                                src={guideForm.bannerUrl}
                                alt="Guide banner preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-[11px] text-slate-500">Banner Preview (16:9)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. Title, Category & Reading Time */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
                      <div className="font-bold text-slate-200 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span>2. Headline &amp; Classification</span>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1.5">
                          Guide Article Title <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={guideForm.title}
                          onChange={(e) => setGuideForm({ ...guideForm, title: e.target.value })}
                          placeholder="e.g. Complete Guide to UK Student Visa (CAS & 28-Day Bank Statement Rule)"
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-semibold text-slate-300 mb-1.5">
                            Primary Category / Country
                          </label>
                          <input
                            type="text"
                            list="guide-category-presets"
                            value={guideForm.category}
                            onChange={(e) => setGuideForm({ ...guideForm, category: e.target.value })}
                            placeholder="e.g. United Kingdom, Scholarship"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                          <datalist id="guide-category-presets">
                            <option value="United Kingdom" />
                            <option value="Canada" />
                            <option value="USA" />
                            <option value="Germany" />
                            <option value="Australia" />
                            <option value="Scholarship" />
                            <option value="Visa Guide" />
                            <option value="SOP & IELTS" />
                          </datalist>
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-300 mb-1.5">
                            Estimated Read Time
                          </label>
                          <input
                            type="text"
                            value={guideForm.readTime}
                            onChange={(e) => setGuideForm({ ...guideForm, readTime: e.target.value })}
                            placeholder="e.g. 6 min read"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-300 mb-1.5">
                            Tags (Comma-separated)
                          </label>
                          <input
                            type="text"
                            value={guideForm.tags}
                            onChange={(e) => setGuideForm({ ...guideForm, tags: e.target.value })}
                            placeholder="UK Visa, CAS, Scholarship"
                            className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      {/* Quick Tag Suggestions */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-slate-500 mr-1">Quick Tags:</span>
                        {["UK Visa", "CAS", "Canada", "USA F-1", "Germany", "Scholarship", "SOP", "IELTS", "Financial Proof"].map(
                          (sug) => {
                            const current = guideForm.tags
                              ? guideForm.tags.split(",").map((t) => t.trim()).filter(Boolean)
                              : [];
                            const active = current.includes(sug);
                            return (
                              <button
                                key={sug}
                                type="button"
                                onClick={() => {
                                  const next = active
                                    ? current.filter((t) => t !== sug)
                                    : [...current, sug];
                                  setGuideForm({ ...guideForm, tags: next.join(", ") });
                                }}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-colors cursor-pointer ${
                                  active
                                    ? "bg-blue-600/25 border-blue-500 text-blue-300"
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                                }`}
                              >
                                {active ? `✓ ${sug}` : `+ ${sug}`}
                              </button>
                            );
                          }
                        )}
                      </div>

                      {/* Excerpt */}
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1.5">
                          Short Card Summary / Excerpt (2–3 sentences)
                        </label>
                        <textarea
                          rows={2}
                          value={guideForm.excerpt}
                          onChange={(e) => setGuideForm({ ...guideForm, excerpt: e.target.value })}
                          placeholder="Brief summary displayed on the public Guides card grid..."
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* 3. Rich Article Content Editor */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="font-bold text-slate-200 flex items-center gap-1.5">
                          <Edit3 className="w-4 h-4 text-blue-400" />
                          <span>3. Full Guide Article Content <span className="text-rose-400">*</span></span>
                        </label>

                        {/* 1-Click Formatting Helpers */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setGuideForm((prev) => ({
                                ...prev,
                                content: `${prev.content}\n\n### Section Heading\nWrite details here...`,
                              }))
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-200 cursor-pointer"
                          >
                            + Heading (###)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setGuideForm((prev) => ({
                                ...prev,
                                content: `${prev.content}\n\n> **Important Tip:** Write key visa or scholarship advice here.`,
                              }))
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-blue-300 cursor-pointer"
                          >
                            + Callout Quote (&gt;)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setGuideForm((prev) => ({
                                ...prev,
                                content: `${prev.content}\n- First requirement item\n- Second requirement item`,
                              }))
                            }
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] font-semibold text-emerald-300 cursor-pointer"
                          >
                            + Bullet List (-)
                          </button>
                        </div>
                      </div>

                      <textarea
                        rows={12}
                        value={guideForm.content}
                        onChange={(e) => setGuideForm({ ...guideForm, content: e.target.value })}
                        placeholder="Write the full study guide... Use ### for section headings, > for callout boxes, - for bullet points, and **bold** for emphasis."
                        className="w-full p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed font-sans"
                      />
                    </div>

                    {/* Action Bar: Cancel, Save as Draft, Publish */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setGuideViewMode("LIST");
                          setEditingGuideId(null);
                        }}
                        className="text-xs cursor-pointer"
                      >
                        Cancel
                      </Button>

                      <div className="flex items-center gap-2.5">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={savingGuide}
                          onClick={() => handleSaveGuide("DRAFT")}
                          className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 text-xs cursor-pointer gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>{savingGuide ? "Saving..." : "Save to Drafts"}</span>
                        </Button>

                        <Button
                          type="button"
                          variant="gradient"
                          disabled={savingGuide}
                          onClick={() => handleSaveGuide("PUBLISHED")}
                          className="shadow-lg shadow-blue-600/30 text-xs cursor-pointer gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>
                            {savingGuide
                              ? "Publishing..."
                              : editingGuideId
                              ? "Update & Publish"
                              : "Publish Guide Live"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Modal: Trash or Permanently Delete Guide */}
              {guideDeleteTarget && (
                <Modal
                  isOpen={Boolean(guideDeleteTarget)}
                  onClose={() => !isDeletingGuide && setGuideDeleteTarget(null)}
                  title={
                    guideDeleteTarget.hard
                      ? "Permanently Delete Study Guide"
                      : "Move Study Guide to Trash"
                  }
                >
                  <div className="space-y-4 text-xs text-slate-300">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="font-bold text-white text-sm">
                        {guideDeleteTarget.guide.title}
                      </div>
                      <p className="text-slate-400 leading-relaxed">
                        {guideDeleteTarget.hard
                          ? "Are you sure you want to permanently delete this guide? This action will remove the article completely and cannot be undone."
                          : "This guide will be unpublished from the public website and moved to Trash. You can restore it or move it to Drafts anytime."}
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        disabled={isDeletingGuide}
                        onClick={() => setGuideDeleteTarget(null)}
                      >
                        Cancel
                      </Button>
                      <button
                        type="button"
                        disabled={isDeletingGuide}
                        onClick={handleConfirmDeleteGuide}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>
                          {isDeletingGuide
                            ? "Processing..."
                            : guideDeleteTarget.hard
                            ? "Delete Permanently"
                            : "Move to Trash"}
                        </span>
                      </button>
                    </div>
                  </div>
                </Modal>
              )}
            </div>
          );
        })()}

        {/* =====================================================================
            9. TAB: VISA SUCCESS STORIES CMS
        ===================================================================== */}
        {activeTab === "SUCCESS_CMS" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* SUB-TAB 1: HEADER & 4 METRIC BOXES SETTINGS */}
            {successSubTab === "SETTINGS" && (
              <div className="space-y-6">
                {/* Form Card */}
                <Card className="bg-slate-900/90 border-slate-800 shadow-2xl p-5 sm:p-7 rounded-2xl">
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-400" />
                        <span>Customize /success Hero Header &amp; Metric Numbers</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Updates here immediately affect the public Success Stories page hero banner and the 4 animated boxes.
                      </p>
                    </div>
                    {successSettingsSaved && (
                      <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl animate-in fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saved to Database
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleSaveSuccessSettings} className="space-y-5 text-xs text-slate-300">
                    {/* Badge Text */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-200 block">
                        Hero Pill Badge Text
                      </label>
                      <input
                        type="text"
                        value={successSettings.badgeText}
                        onChange={(e) => setSuccessSettings({ ...successSettings, badgeText: e.target.value })}
                        placeholder="Real Students • Real Visas • Proven Results"
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>

                    {/* Title Part 1 & Title Part 2 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-200 block">
                          Main Title (White Text)
                        </label>
                        <input
                          type="text"
                          value={successSettings.titlePart1}
                          onChange={(e) => setSuccessSettings({ ...successSettings, titlePart1: e.target.value })}
                          placeholder="e.g. Student"
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-semibold text-slate-200 block">
                          Title Highlight (Gradient Color Text)
                        </label>
                        <input
                          type="text"
                          value={successSettings.titlePart2}
                          onChange={(e) => setSuccessSettings({ ...successSettings, titlePart2: e.target.value })}
                          placeholder="e.g. Success Stories"
                          className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="font-semibold text-slate-200 block">
                        Page Subtitle / Description
                      </label>
                      <textarea
                        rows={3}
                        value={successSettings.description}
                        onChange={(e) => setSuccessSettings({ ...successSettings, description: e.target.value })}
                        className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors leading-relaxed"
                        required
                      />
                    </div>

                    {/* 4 Metric Boxes Controls */}
                    <div className="pt-3 border-t border-slate-800">
                      <div className="font-bold text-white text-xs mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>The 4 Curved Glass Metric Boxes</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Box 1 */}
                        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <Trophy className="w-3 h-3" /> Box 1 (Amber)
                          </span>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Value / Number</label>
                            <input
                              type="text"
                              value={successSettings.stat1Value}
                              onChange={(e) => setSuccessSettings({ ...successSettings, stat1Value: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Label</label>
                            <input
                              type="text"
                              value={successSettings.stat1Label}
                              onChange={(e) => setSuccessSettings({ ...successSettings, stat1Label: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                              required
                            />
                          </div>
                        </div>

                        {/* Box 2 */}
                        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-blue-500/30 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Box 2 (Blue)
                          </span>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Value / Number</label>
                            <input
                              type="text"
                              value={successSettings.stat2Value}
                              onChange={(e) => setSuccessSettings({ ...successSettings, stat2Value: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Label</label>
                            <input
                              type="text"
                              value={successSettings.stat2Label}
                              onChange={(e) => setSuccessSettings({ ...successSettings, stat2Label: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                              required
                            />
                          </div>
                        </div>

                        {/* Box 3 */}
                        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                            <Award className="w-3 h-3" /> Box 3 (Indigo)
                          </span>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Value / Number</label>
                            <input
                              type="text"
                              value={successSettings.stat3Value}
                              onChange={(e) => setSuccessSettings({ ...successSettings, stat3Value: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Label</label>
                            <input
                              type="text"
                              value={successSettings.stat3Label}
                              onChange={(e) => setSuccessSettings({ ...successSettings, stat3Label: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                              required
                            />
                          </div>
                        </div>

                        {/* Box 4 */}
                        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                            <Globe2 className="w-3 h-3" /> Box 4 (Emerald)
                          </span>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Value / Number</label>
                            <input
                              type="text"
                              value={successSettings.stat4Value}
                              onChange={(e) => setSuccessSettings({ ...successSettings, stat4Value: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-bold"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-400 block mb-1">Label</label>
                            <input
                              type="text"
                              value={successSettings.stat4Label}
                              onChange={(e) => setSuccessSettings({ ...successSettings, stat4Label: e.target.value })}
                              className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-white"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Bar */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                      <Button
                        type="submit"
                        variant="gradient"
                        size="sm"
                        disabled={savingSuccessSettings}
                        className="gap-2 shadow-lg shadow-blue-600/25 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>{savingSuccessSettings ? "Saving Settings..." : "Save Page Settings"}</span>
                      </Button>
                    </div>
                  </form>
                </Card>
              </div>
            )}

            {/* SUB-TAB 2: STORY CARDS (FULL CMS MANAGEMENT) */}
            {successSubTab === "CARDS" && (
              <div className="space-y-4">
                {/* VIEW A: LIST VIEW */}
                {storyCardView === "LIST" && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    {/* Control Action Bar */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        {/* Search in Story Cards */}
                        <div className="relative w-full sm:w-64">
                          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Search student, country, uni..."
                            value={storyCardSearch}
                            onChange={(e) => setStoryCardSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Country Filter Pill */}
                        <select
                          value={storyCardCountryFilter}
                          onChange={(e) => setStoryCardCountryFilter(e.target.value)}
                          className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="ALL">All Countries</option>
                          {Array.from(new Set(adminStoryCards.map((s) => s.country).filter(Boolean))).map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={handleOpenAddStory}
                          className="gap-2 shadow-lg shadow-blue-600/20 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Add Success Story</span>
                        </Button>
                      </div>
                    </div>

                    {/* Cards Grid */}
                    {adminStoryCards.filter((s) => {
                      const term = storyCardSearch.toLowerCase();
                      const matchTerm =
                        !term ||
                        s.studentName.toLowerCase().includes(term) ||
                        s.country.toLowerCase().includes(term) ||
                        s.universityName.toLowerCase().includes(term) ||
                        (s.hometown && s.hometown.toLowerCase().includes(term));
                      const matchCountry =
                        storyCardCountryFilter === "ALL" ||
                        s.country.toLowerCase() === storyCardCountryFilter.toLowerCase();
                      return matchTerm && matchCountry;
                    }).length === 0 ? (
                      <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                        <Trophy className="w-10 h-10 text-slate-600 mx-auto" />
                        <div className="text-sm font-bold text-slate-300">No Success Story Records Found</div>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto">
                          Click "Add Success Story" to publish your first student visa success card on the live website.
                        </p>
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={handleOpenAddStory}
                          className="gap-1.5 text-xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Create First Story
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {adminStoryCards
                          .filter((s) => {
                            const term = storyCardSearch.toLowerCase();
                            const matchTerm =
                              !term ||
                              s.studentName.toLowerCase().includes(term) ||
                              s.country.toLowerCase().includes(term) ||
                              s.universityName.toLowerCase().includes(term) ||
                              (s.hometown && s.hometown.toLowerCase().includes(term));
                            const matchCountry =
                              storyCardCountryFilter === "ALL" ||
                              s.country.toLowerCase() === storyCardCountryFilter.toLowerCase();
                            return matchTerm && matchCountry;
                          })
                          .map((story) => (
                            <div
                              key={story.id}
                              className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between"
                            >
                              {/* 16:9 Thumbnail Preview (Flush Edge-to-Edge) */}
                              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                                <img
                                  src={story.thumbnailUrl || story.photoUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80"}
                                  alt={story.studentName}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 flex items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                      story.isPublished
                                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md"
                                        : "bg-slate-800/90 text-slate-400 border border-slate-700 backdrop-blur-md"
                                    }`}
                                  >
                                    {story.isPublished ? "Published" : "Draft"}
                                  </span>
                                </div>

                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white border border-slate-800 flex items-center gap-1">
                                  <Globe2 className="w-3 h-3 text-blue-400" />
                                  {story.country}
                                </div>
                              </div>

                              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="font-bold text-white text-sm hover:text-blue-400 transition-colors">
                                        {story.studentName}
                                      </div>
                                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                        <span className="truncate">
                                          {story.homeInstitution}
                                        </span>
                                      </div>
                                    </div>

                                    {story.scholarshipNote && (
                                      <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[9px] shrink-0">
                                        {story.scholarshipNote}
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60 space-y-1">
                                    <div className="font-medium text-slate-200 truncate">{story.universityName}</div>
                                    <div className="text-[11px] text-slate-400 truncate">{story.degreeName}</div>
                                    <div className="text-[10px] text-slate-500 flex items-center justify-between">
                                      <span>{story.intake}</span>
                                      <span>Visa: {story.visaDate || "Verified"}</span>
                                    </div>
                                    {story.slug && (
                                      <div className="text-[9px] text-blue-400/90 font-mono pt-1 border-t border-slate-800/50 truncate">
                                        URL: /success/{story.slug}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Card Actions */}
                                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditStory(story)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                      title="Edit Story"
                                    >
                                      <Edit3 className="w-4 h-4 text-blue-400" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleTogglePublishStory(story)}
                                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                                        story.isPublished
                                          ? "text-emerald-400 hover:bg-emerald-500/10"
                                          : "text-slate-400 hover:bg-slate-800"
                                      }`}
                                      title="Toggle Publish Status"
                                    >
                                      {story.isPublished ? "Hide" : "Publish"}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteStoryCard(story.id)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                      title="Delete Story Card"
                                    >
                                      <Trash2 className="w-4 h-4 text-rose-400" />
                                    </button>
                                  </div>

                                  <Link
                                    href={`/success/${story.slug || story.id}`}
                                    target="_blank"
                                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
                                  >
                                    View Live <ExternalLink className="w-3 h-3" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* VIEW B: DEDICATED FULL-PAGE IN-PAGE EDITOR (Matches ContactCmsTab style!) */}
                {storyCardView === "FULL_EDITOR" && (
                  <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
                    {/* Top Action / Navigation Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setStoryCardView("LIST")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Back to Story Cards</span>
                        </button>
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            <span>{storyForm.id ? `Editing Story: ${storyForm.studentName || "Student"}` : "Create New Success Story Card"}</span>
                          </h3>
                          <p className="text-xs text-slate-400">
                            Dedicated in-page full editor with real-time 16:9 thumbnail preview and live card simulation.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStoryCardView("LIST")}
                          className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          disabled={savingStoryCard}
                          onClick={handleSaveStoryCard}
                          variant="gradient"
                          className="text-xs gap-1.5 shadow-md shadow-blue-600/30 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{savingStoryCard ? "Saving Changes..." : storyForm.id ? "Update Story Card" : "Publish Story Card"}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Dedicated 2-Column Grid: Left (Live Card Preview) + Right (Structured Form) */}
                    <form onSubmit={handleSaveStoryCard} className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT COLUMN: Live 16:9 Card Preview & Profile Snapshot */}
                        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
                          <div className="flex items-center justify-between text-xs font-bold text-blue-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-4 h-4" />
                              <span>Live Card Preview</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal normal-case">
                              (Real-time Student View)
                            </span>
                          </div>

                          {/* Live 16:9 Card Representation */}
                          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col justify-between">
                            {/* 16:9 Thumbnail Preview */}
                            <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                              <img
                                src={
                                  storyForm.thumbnailUrl ||
                                  storyForm.photoUrl ||
                                  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80"
                                }
                                alt={storyForm.studentName || "Preview"}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                              {/* Overlays */}
                              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                                  Visa Approved
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    storyForm.isPublished !== false
                                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 backdrop-blur-md"
                                      : "bg-slate-800/90 text-slate-400 border border-slate-700 backdrop-blur-md"
                                  }`}
                                >
                                  {storyForm.isPublished !== false ? "Live" : "Draft"}
                                </span>
                              </div>

                              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white border border-slate-800 flex items-center gap-1">
                                <Globe2 className="w-3 h-3 text-blue-400" />
                                {isCustomCountryMode && customCountryInput.trim() ? customCountryInput.trim() : storyForm.country || "Canada"}
                              </div>

                              {storyForm.youtubeUrl && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg shadow-rose-900/40">
                                    <Play className="w-4 h-4 fill-white ml-0.5" />
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Card Content Details */}
                            <div className="p-4 space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border-2 border-blue-500/40 shrink-0">
                                  <img
                                    src={
                                      storyForm.photoUrl ||
                                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                                    }
                                    alt="Student Avatar"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-bold text-white text-sm truncate">
                                    {storyForm.studentName || "Student Full Name"}
                                  </div>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                                    <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                                    <span className="truncate">
                                      {storyForm.hometown ? `${storyForm.hometown} • ` : ""}
                                      {storyForm.homeInstitution || "Previous College / Institute"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {storyForm.scholarshipNote && (
                                <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px] w-full justify-center py-1">
                                  Award: {storyForm.scholarshipNote}
                                </Badge>
                              )}

                              <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1">
                                <div className="font-semibold text-slate-200 truncate">
                                  {storyForm.universityName || "Admitted University Name"}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {storyForm.degreeName || "Program / Major Degree"}
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/80">
                                  <span>{storyForm.intake || "Intake Season"}</span>
                                  <span>Visa: {storyForm.visaDate || "Approval Date"}</span>
                                </div>
                              </div>

                              {/* Testimonial Quote Live Sneak Peek */}
                              {storyForm.testimonial && (
                                <div className="p-3 bg-blue-950/20 border border-blue-900/40 rounded-xl space-y-1">
                                  <div className="text-[10px] font-bold text-blue-400 flex items-center gap-1">
                                    <Quote className="w-3 h-3" />
                                    <span>Review Quote Preview:</span>
                                  </div>
                                  <p className="text-[11px] text-slate-300 italic line-clamp-3 leading-relaxed">
                                    "{storyForm.testimonial}"
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick Pro-Tips for Admin */}
                          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/80 space-y-2 text-[11px] text-slate-400">
                            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                              <span>CMS Best Practices</span>
                            </div>
                            <p>
                              • Use a 16:9 landscape aspect ratio (e.g. 1280x720) for the Card Thumbnail.
                            </p>
                            <p>
                              • Students can view the full story, video interview, and verified details on the dedicated detail page (<code className="text-blue-400">/success/:id</code>).
                            </p>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Organized Form Fields */}
                        <div className="lg:col-span-7 space-y-5">
                          {/* SECTION 1: STUDENT & HOMETOWN IDENTITY */}
                          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>1. Student Identity & Origin</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Student Full Name *</label>
                                <input
                                  type="text"
                                  value={storyForm.studentName || ""}
                                  onChange={(e) => {
                                    const newName = e.target.value;
                                    setStoryForm((prev) => {
                                      const shouldAutoSlug = !prev.slug || prev.slug.startsWith("student-");
                                      return {
                                        ...prev,
                                        studentName: newName,
                                        slug: shouldAutoSlug && newName.trim()
                                          ? `${toUrlSlug(newName)}-${String(adminStoryCards.length + 1).padStart(2, "0")}`
                                          : prev.slug,
                                      };
                                    });
                                  }}
                                  placeholder="e.g. Sadia Rahman"
                                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Hometown / City</label>
                                <input
                                  type="text"
                                  value={storyForm.hometown || ""}
                                  onChange={(e) => setStoryForm({ ...storyForm, hometown: e.target.value })}
                                  placeholder="e.g. Rajshahi, Dhaka, Sylhet"
                                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>

                            {/* Custom URL Slug & Student Serial Identification */}
                            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                                  <span>Custom URL Slug & Student Serial</span>
                                  <span className="text-[10px] text-slate-400 font-normal">(Editable anytime)</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAutoSuggestSlug()}
                                  className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                                >
                                  Auto-Suggest Serial
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono select-none">
                                  /success/
                                </span>
                                <input
                                  type="text"
                                  value={storyForm.slug || ""}
                                  onChange={(e) => {
                                    const val = toUrlSlug(e.target.value);
                                    setStoryForm((prev) => ({ ...prev, slug: val }));
                                    validateSlugUniqueness(val, storyForm.id);
                                  }}
                                  placeholder="e.g. tanvir-ahmed-04"
                                  className={`flex-1 px-3.5 py-2 bg-slate-900 border rounded-xl text-xs text-white placeholder-slate-500 font-mono focus:outline-none ${
                                    slugError ? "border-red-500/80 focus:border-red-500" : "border-slate-800 focus:border-blue-500"
                                  }`}
                                />
                              </div>

                              {/* Validation and Status Feedback */}
                              {slugError ? (
                                <div className="text-[11px] text-red-400 font-medium flex items-center gap-1.5 pt-0.5">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{slugError}</span>
                                </div>
                              ) : storyForm.slug ? (
                                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 pt-0.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>URL Available: /success/{storyForm.slug}</span>
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-500">
                                  Leave blank to auto-generate serial (e.g. <code className="text-slate-400">student-name-01</code>) on save.
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Previous College / Institute *</label>
                                <input
                                  type="text"
                                  value={storyForm.homeInstitution || ""}
                                  onChange={(e) => setStoryForm({ ...storyForm, homeInstitution: e.target.value })}
                                  placeholder="e.g. Rajshahi College"
                                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                  required
                                />
                              </div>

                              {/* Country Selection with Custom Tag Mode */}
                              <div>
                                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Destination Country *</label>
                                {!isCustomCountryMode ? (
                                  <div className="space-y-1.5">
                                    <select
                                      value={storyForm.country || "Canada"}
                                      onChange={(e) => {
                                        if (e.target.value === "__CUSTOM__") {
                                          setIsCustomCountryMode(true);
                                          setCustomCountryInput("");
                                        } else {
                                          setStoryForm({ ...storyForm, country: e.target.value });
                                        }
                                      }}
                                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                                    >
                                      {Array.from(new Set([
                                        "Canada",
                                        "United Kingdom",
                                        "Cyprus",
                                        "USA",
                                        "Australia",
                                        "Germany",
                                        "Sweden",
                                        "Finland",
                                        "Malaysia",
                                        ...adminStoryCards.map(s => s.country).filter(Boolean)
                                      ])).map((cntry) => (
                                        <option key={cntry} value={cntry}>{cntry}</option>
                                      ))}
                                      <option value="__CUSTOM__">+ Add Custom Country Tag...</option>
                                    </select>
                                  </div>
                                ) : (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                      <input
                                        type="text"
                                        value={customCountryInput}
                                        onChange={(e) => setCustomCountryInput(e.target.value)}
                                        placeholder="Type new country (e.g. Ireland, Japan)"
                                        className="flex-1 px-3 py-2 bg-slate-900 border border-blue-500 rounded-xl text-xs text-white focus:outline-none"
                                        autoFocus
                                        required
                                      />
                                      <button
                                        type="button"
                                        onClick={() => setIsCustomCountryMode(false)}
                                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                    <span className="text-[10px] text-blue-400">
                                      This new country will be automatically added to the public filter and tag dropdown.
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* SECTION 2: ADMITTED UNIVERSITY & VISA DETAILS */}
                          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              <span>2. Admitted University & Visa Status</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Admitted University *</label>
                                <input
                                  type="text"
                                  value={storyForm.universityName || ""}
                                  onChange={(e) => setStoryForm({ ...storyForm, universityName: e.target.value })}
                                  placeholder="e.g. University of Windsor"
                                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Degree / Program Name *</label>
                                <input
                                  type="text"
                                  value={storyForm.degreeName || ""}
                                  onChange={(e) => setStoryForm({ ...storyForm, degreeName: e.target.value })}
                                  placeholder="e.g. BBA in International Business"
                                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Intake Season</label>
                                <input
                                  type="text"
                                  value={storyForm.intake || ""}
                                  onChange={(e) => setStoryForm({ ...storyForm, intake: e.target.value })}
                                  placeholder="e.g. Fall 2026 Intake"
                                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Visa Approval Date</label>
                                <input
                                  type="text"
                                  value={storyForm.visaDate || ""}
                                  onChange={(e) => setStoryForm({ ...storyForm, visaDate: e.target.value })}
                                  placeholder="e.g. August 2026"
                                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-slate-300 font-semibold block mb-1.5">Scholarship Award Note</label>
                                <input
                                  type="text"
                                  value={storyForm.scholarshipNote || ""}
                                  onChange={(e) => setStoryForm({ ...storyForm, scholarshipNote: e.target.value })}
                                  placeholder="e.g. $5,000 Entrance Award"
                                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          {/* SECTION 3: MEDIA, VIDEO & PHOTOS */}
                          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                              <ImageIcon className="w-4 h-4" />
                              <span>3. Card Thumbnail & Media URLs</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                                  Card Thumbnail Image URL (16:9 Aspect)
                                </label>
                                <input
                                  type="url"
                                  value={storyForm.thumbnailUrl || ""}
                                  onChange={(e) => setStoryForm({ ...storyForm, thumbnailUrl: e.target.value })}
                                  placeholder="https://images.unsplash.com/..."
                                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                                />
                                <span className="text-[10px] text-slate-500 mt-1 block">
                                  Previewed live on the left in 16:9 YouTube ratio.
                                </span>
                              </div>

                              <div>
                                <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                                  Student Profile Avatar Photo URL
                                </label>
                                <input
                                  type="url"
                                  value={storyForm.photoUrl || ""}
                                  onChange={(e) => setStoryForm({ ...storyForm, photoUrl: e.target.value })}
                                  placeholder="https://images.unsplash.com/..."
                                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                                />
                                <span className="text-[10px] text-slate-500 mt-1 block">
                                  Displayed beside student name on detail page & card.
                                </span>
                              </div>
                            </div>

                            <div>
                              <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                                YouTube Video Interview URL
                              </label>
                              <input
                                type="url"
                                value={storyForm.youtubeUrl || ""}
                                onChange={(e) => setStoryForm({ ...storyForm, youtubeUrl: e.target.value })}
                                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                              />
                            </div>
                          </div>

                          {/* SECTION 4: TESTIMONIAL & FULL STORY NARRATIVE */}
                          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                            <div className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              <span>4. Student Testimonial & Visa Journey</span>
                            </div>

                            <div>
                              <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                                Student Testimonial / Review Quote
                              </label>
                              <textarea
                                rows={2}
                                value={storyForm.testimonial || ""}
                                onChange={(e) => setStoryForm({ ...storyForm, testimonial: e.target.value })}
                                placeholder="Student's personal quote praising the counsel and guidance received from Rise Abroad Education..."
                                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                              />
                              <span className="text-[10px] text-slate-500 mt-0.5 block">
                                Highlighted prominently in the top quotation box on the student detail page.
                              </span>
                            </div>

                            <div>
                              <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                                Full Visa Journey Narrative *
                              </label>
                              <textarea
                                rows={6}
                                value={storyForm.storyContent || ""}
                                onChange={(e) => setStoryForm({ ...storyForm, storyContent: e.target.value })}
                                placeholder="Write the full detailed journey: student's background, academic struggles, profile assessment, SOP guidance, embassy interview preparation, and the joyful moment of visa approval..."
                                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                                required
                              />
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                              <input
                                type="checkbox"
                                id="isPublishedEditorCheck"
                                checked={storyForm.isPublished !== false}
                                onChange={(e) => setStoryForm({ ...storyForm, isPublished: e.target.checked })}
                                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 cursor-pointer"
                              />
                              <label htmlFor="isPublishedEditorCheck" className="text-xs text-slate-300 font-semibold cursor-pointer select-none">
                                Publish this success story immediately on the live public website
                              </label>
                            </div>
                          </div>

                          {/* Bottom Action Footer */}
                          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setStoryCardView("LIST")}
                              className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300 cursor-pointer"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              variant="gradient"
                              disabled={savingStoryCard}
                              className="text-xs gap-1.5 shadow-lg shadow-blue-600/30 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>{savingStoryCard ? "Saving Changes..." : storyForm.id ? "Update Story Card" : "Publish Story Card"}</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =====================================================================
            9.5 TAB: CONTACT PAGE MANAGEMENT & CMS
        ===================================================================== */}
        {activeTab === "CONTACT_CMS" && (
          <ContactCmsTab
            activeSubTab={contactSubTab}
            onSubTabChange={setContactSubTab}
          />
        )}

        {/* =====================================================================
            10. TAB: FINANCIAL CONTROL & COMMISSION LEDGER
        ===================================================================== */}
        {activeTab === "FINANCIALS" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Calculator & Counselor Visibility Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* 3-Way Commission Calculator Form */}
              <Card className="lg:col-span-7 bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary-400" />
                    3-Way Split Calculator & Settlement Creator
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCommission} className="space-y-4 text-xs text-slate-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-medium text-slate-300 block mb-1">
                          Select Application
                        </label>
                        <select
                          value={calcData.applicationId}
                          onChange={(e) => {
                            const found = safeApplications.find((a) => a.id === e.target.value);
                            setCalcData({
                              ...calcData,
                              applicationId: e.target.value,
                              counselorId: found?.counselorId || "",
                            });
                          }}
                          className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white"
                          required
                        >
                          <option value="">Select Student Application</option>
                          {safeApplications.map((app: any) => (
                            <option key={app.id} value={app.id}>
                              {app.student?.user?.name || app.student?.name || "Student"} - {app.university?.name || app.program?.university?.name || "University"}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-medium text-slate-300 block mb-1">
                          Assigned Counselor
                        </label>
                        <input
                          type="text"
                          disabled
                          value={
                            safeUsers.find((u) => u.counselor?.id === calcData.counselorId)?.name ||
                            "Not assigned to counselor"
                          }
                          className="w-full p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="font-medium text-slate-300 block mb-1">
                          Gross (USD)
                        </label>
                        <Input
                          type="number"
                          value={calcData.grossAmountUSD}
                          onChange={(e) =>
                            setCalcData({ ...calcData, grossAmountUSD: Number(e.target.value) })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="font-medium text-slate-300 block mb-1">
                          Tax %
                        </label>
                        <Input
                          type="number"
                          value={calcData.taxPercent}
                          onChange={(e) =>
                            setCalcData({ ...calcData, taxPercent: Number(e.target.value) })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="font-medium text-slate-300 block mb-1">
                          Company %
                        </label>
                        <Input
                          type="number"
                          value={calcData.companySharePercent}
                          onChange={(e) =>
                            setCalcData({ ...calcData, companySharePercent: Number(e.target.value) })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="font-medium text-slate-300 block mb-1">
                          USD-BDT Rate
                        </label>
                        <Input
                          type="number"
                          step="0.1"
                          value={calcData.usdToBdtRate}
                          onChange={(e) =>
                            setCalcData({ ...calcData, usdToBdtRate: Number(e.target.value) })
                          }
                          required
                        />
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 mt-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Net After {taxPct}% Tax:</span>
                        <span className="font-mono font-bold text-white">${netUSD.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-primary-400">
                        <span>Company Share ({companyPct}%):</span>
                        <span className="font-mono font-bold">
                          ${companyShareUSD.toFixed(2)} (BDT {Math.round(companyShareBDT).toLocaleString()})
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-cyan-400">
                        <span>Counselor Share ({counselorPct}%):</span>
                        <span className="font-mono font-bold">
                          ${counselorShareUSD.toFixed(2)} (BDT {Math.round(counselorShareBDT).toLocaleString()})
                        </span>
                      </div>
                    </div>

                    {commSuccess && (
                      <div className="p-3 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
                        Commission record saved successfully!
                      </div>
                    )}

                    <Button variant="gradient" type="submit" isLoading={creatingComm} className="w-full">
                      Post & Settle Commission Entry
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Counselor Visibility Management */}
              <Card className="lg:col-span-5 bg-slate-900/60 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-cyan-400" />
                    Counselor Financial Visibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <p className="text-slate-400">
                    Control whether counselors can view full agency gross margins, net-only payouts, or hide earnings.
                  </p>

                  <div className="space-y-2">
                    {safeUsers
                      .filter((u) => u.role === "COUNSELOR" && u.counselor)
                      .map((cUser) => (
                        <div
                          key={cUser.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-white">{cUser.name}</div>
                            <div className="text-[10px] text-slate-500">{cUser.email}</div>
                          </div>

                          <select
                            value={(cUser.counselor as any)?.commissionVisibilityMode || (cUser.counselor as any)?.visibilityMode || "NET_ONLY"}
                            onChange={(e) =>
                              handleUpdateVisibility(
                                cUser.counselor!.id,
                                e.target.value as "FULL_BREAKDOWN" | "NET_ONLY" | "HIDDEN"
                              )
                            }
                            className="bg-slate-900 border border-slate-700 text-white rounded p-1 text-xs"
                          >
                            <option value="FULL_BREAKDOWN">Full Breakdown</option>
                            <option value="NET_ONLY">Net Only</option>
                            <option value="HIDDEN">Hidden</option>
                          </select>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commission Ledger Table */}
            <Card className="bg-slate-900/60 border-slate-800">
              <CardHeader>
                <CardTitle className="text-base text-white flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-emerald-400" />
                  Recorded Agency Commission Entries ({safeCommissions.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Application</th>
                        <th className="p-3">Gross USD</th>
                        <th className="p-3">Tax %</th>
                        <th className="p-3">Company (BDT)</th>
                        <th className="p-3">Counselor (BDT)</th>
                        <th className="p-3">Withdrawal</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {safeCommissions.map((comm) => {
                        const gross = comm.grossAmountUSD ?? comm.grossCommissionAmount ?? 0;
                        const tax = comm.taxPercent ?? comm.vatPercent ?? 0;
                        const companyShare = comm.companySharePercent ?? 70;
                        const rate = comm.usdToBdtRate ?? comm.exchangeRateToBDT ?? 120;
                        const counselorShareBDT = comm.counselorShareBDT ?? comm.netPayableBDT ?? 0;
                        const companyBDT = Math.round(gross * (1 - tax / 100) * (companyShare / 100) * rate);
                        return (
                          <tr key={comm.id} className="hover:bg-slate-850/50">
                            <td className="p-3 font-semibold text-white">
                              {comm.application?.university?.name || (comm as any).universityName || "University Enrollment"}
                            </td>
                            <td className="p-3 font-mono">${gross}</td>
                            <td className="p-3 font-mono">{tax}%</td>
                            <td className="p-3 font-mono font-bold text-white">
                              BDT {companyBDT.toLocaleString()}
                            </td>
                            <td className="p-3 font-mono text-cyan-400">
                              BDT {Math.round(counselorShareBDT).toLocaleString()}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">
                                {comm.withdrawalStatus || comm.status || "PENDING"}
                              </span>
                            </td>
                          <td className="p-3 text-right">
                            {comm.withdrawalStatus === "PENDING" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => handleUpdateWithdrawal(comm.id, "SETTLED")}
                              >
                                Mark Settled
                              </Button>
                            )}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "SETTINGS" && (
          <AccountSettingsModule embedded />
        )}
          </>
        )}

        {/* Global Create / Edit Partner University Modal */}
        <Modal
          isOpen={uniModalOpen}
          onClose={() => setUniModalOpen(false)}
          title={editingUniId ? "Edit Partner University" : "Add Partner University"}
          maxWidth="xl"
          footer={
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <Button
                variant="outline"
                type="button"
                onClick={() => setUniModalOpen(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  type="button"
                  disabled={creatingUni}
                  onClick={(e) => handleSaveUniversity(e, "DRAFT")}
                  className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 cursor-pointer text-xs"
                >
                  <FileText className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  <span>{creatingUni ? "Saving..." : "Save as Draft"}</span>
                </Button>

                <Button
                  variant="gradient"
                  type="button"
                  disabled={creatingUni}
                  onClick={(e) => handleSaveUniversity(e, "PUBLISHED")}
                  className="shadow-lg shadow-blue-600/30 cursor-pointer text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>{creatingUni ? "Saving..." : editingUniId ? "Update & Publish" : "Publish University"}</span>
                </Button>
              </div>
            </div>
          }
        >
          <form className="space-y-4 text-xs text-slate-300 pr-1 pb-1">
            {/* 1. Direct Cloudinary Cover Photo Upload & Compact Live Preview */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span>University Cover Photo</span>
                </label>
                <span className="text-[10px] text-blue-400/90 font-medium">16:9 • PNG, JPG, WEBP</span>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={coverFileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverFileUpload(file);
                }}
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
              />

              {/* Compact Upload Dropzone OR Uploading State OR Compact Preview Card */}
              {coverUploading ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-500/40 bg-blue-950/20 text-slate-200">
                  <RefreshCw className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white">Uploading to Cloudinary...</p>
                    <p className="text-[10px] text-slate-400">Optimizing format and generating secure CDN URL</p>
                  </div>
                </div>
              ) : newUni.coverImageUrl ? (
                <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 shadow-md">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={newUni.coverImageUrl}
                      alt="University cover"
                      className="w-20 h-12 rounded-lg object-cover border border-slate-700 shrink-0 shadow-sm"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200 truncate">Cover Photo</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold">
                          Cloudinary Hosted
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">High-speed CDN ready</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      disabled={coverDeleting}
                      title="Replace with another image"
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveCoverImage}
                      disabled={coverDeleting}
                      title="Delete image from Cloudinary"
                      className="px-2.5 py-1 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {coverDeleting ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => coverFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleCoverFileUpload(file);
                  }}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-dashed border-slate-700 hover:border-blue-500/60 bg-slate-950/60 hover:bg-blue-950/15 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 group-hover:bg-blue-500/20 transition-all shrink-0">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                        Click or drag & drop university cover photo
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        Direct upload to Cloudinary • Recommended 16:9
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold shrink-0 group-hover:bg-blue-600/30 transition-colors">
                    Browse
                  </span>
                </div>
              )}
            </div>

            {/* 2. Basic Info (Name, Country, City) */}
            <Input
              label="University Full Name"
              value={newUni.name}
              onChange={(e) => setNewUni({ ...newUni, name: e.target.value })}
              placeholder="e.g. University of Manchester, American University of Cyprus"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-300 block mb-1">Country</label>
                <select
                  value={newUni.countryId}
                  onChange={(e) => setNewUni({ ...newUni, countryId: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                  required
                >
                  <option value="">Select Country</option>
                  {safeCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="City / Campus Location"
                value={newUni.city}
                onChange={(e) => setNewUni({ ...newUni, city: e.target.value })}
                placeholder="e.g. Manchester, Larnaca"
                required
              />
            </div>

            {/* 3. Custom Tags (comma-separated keywords) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-300 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-400" />
                  <span>Custom Tags & Highlights</span>
                </label>
                <span className="text-[10px] text-slate-500">Comma-separated keywords</span>
              </div>
              <Input
                placeholder="e.g. UK, Russell Group, STEM, Scholarship, Top 100"
                value={newUni.tags}
                onChange={(e) => setNewUni({ ...newUni, tags: e.target.value })}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {["UK", "Cyprus", "USA", "Canada", "Scholarship", "Fast Visa", "STEM", "Low Tuition", "IELTS Waiver"].map((suggested) => {
                  const currentTags = newUni.tags ? newUni.tags.split(",").map((t) => t.trim()) : [];
                  const isSelected = currentTags.includes(suggested);
                  return (
                    <button
                      key={suggested}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setNewUni({
                            ...newUni,
                            tags: currentTags.filter((t) => t !== suggested).join(", "),
                          });
                        } else {
                          setNewUni({
                            ...newUni,
                            tags: currentTags.length ? `${newUni.tags}, ${suggested}` : suggested,
                          });
                        }
                      }}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-blue-600/30 border-blue-500 text-blue-200"
                          : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/70 hover:border-slate-600"
                      }`}
                    >
                      {isSelected ? `✓ ${suggested}` : `+ ${suggested}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Financials & Offer Letter Access Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Min Tuition Fee ($/yr)"
                type="number"
                value={newUni.minTuitionFee}
                onChange={(e) => setNewUni({ ...newUni, minTuitionFee: Number(e.target.value) })}
                required
              />

              <Input
                label="Max Tuition Fee ($/yr)"
                type="number"
                value={newUni.maxTuitionFee}
                onChange={(e) => setNewUni({ ...newUni, maxTuitionFee: Number(e.target.value) })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-slate-300 block mb-1">
                  Offer Letter Access Policy
                </label>
                <select
                  value={newUni.offerLetterPaymentType}
                  onChange={(e) =>
                    setNewUni({ ...newUni, offerLetterPaymentType: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-xs"
                >
                  <option value="FREE">FREE - Student downloads offer instantly</option>
                  <option value="DEPOSIT_REQUIRED">DEPOSIT_REQUIRED - Tuition deposit required</option>
                </select>
              </div>

              <Input
                label="Official Website URL"
                value={newUni.website}
                onChange={(e) => setNewUni({ ...newUni, website: e.target.value })}
                placeholder="https://www.manchester.ac.uk"
              />
            </div>

            {/* 5. Rich Description with Bold and Link hint */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-medium text-slate-300 block">
                  Detailed Description & Content
                </label>
                <span className="text-[10px] text-emerald-400 font-medium">
                  Supports **bold text** and [Link Name](https://url)
                </span>
              </div>
              <textarea
                rows={3}
                value={newUni.description}
                onChange={(e) => setNewUni({ ...newUni, description: e.target.value })}
                placeholder="Type comprehensive details... Use **bold text** or add links like [Visit Harvard](https://harvard.edu)."
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 6. Subjects / Degree Programs Manager */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                  <GraduationCap className="w-4 h-4 text-indigo-400" />
                  <span>Academic Degree Programs ({newUni.programs.length})</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setNewUni({
                      ...newUni,
                      programs: [
                        ...newUni.programs,
                        { name: "", degreeLevel: "BACHELOR", tuitionFee: 15000, durationYears: 3, intakeSeason: "Sep / Jan" },
                      ],
                    })
                  }
                  className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Course / Subject</span>
                </button>
              </div>

              <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                {newUni.programs.map((prog, pIdx) => (
                  <div key={pIdx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Program Name (e.g. B.Sc in Computer Science)"
                        value={prog.name}
                        onChange={(e) => {
                          const updated = [...newUni.programs];
                          updated[pIdx].name = e.target.value;
                          setNewUni({ ...newUni, programs: updated });
                        }}
                        className="flex-1 p-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                        required
                      />
                      <select
                        value={prog.degreeLevel}
                        onChange={(e) => {
                          const updated = [...newUni.programs];
                          updated[pIdx].degreeLevel = e.target.value;
                          setNewUni({ ...newUni, programs: updated });
                        }}
                        className="p-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                      >
                        <option value="BACHELOR">Bachelor</option>
                        <option value="MASTER">Master</option>
                        <option value="FOUNDATION">Foundation</option>
                        <option value="PHD">PhD</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = newUni.programs.filter((_, idx) => idx !== pIdx);
                          setNewUni({ ...newUni, programs: updated });
                        }}
                        className="p-1.5 text-rose-400 hover:text-rose-300 cursor-pointer"
                        title="Remove program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Tuition Fee ($/yr):</span>
                        <input
                          type="number"
                          value={prog.tuitionFee}
                          onChange={(e) => {
                            const updated = [...newUni.programs];
                            updated[pIdx].tuitionFee = Number(e.target.value);
                            setNewUni({ ...newUni, programs: updated });
                          }}
                          className="w-full p-1 bg-slate-950 border border-slate-700 rounded text-white"
                        />
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">Duration:</span>
                        <input
                          type="number"
                          value={prog.durationYears}
                          onChange={(e) => {
                            const updated = [...newUni.programs];
                            updated[pIdx].durationYears = Number(e.target.value);
                            setNewUni({ ...newUni, programs: updated });
                          }}
                          className="w-full p-1 bg-slate-950 border border-slate-700 rounded text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </Modal>

        {/* Modal: Delete University Confirmation */}
        {selectedUniForDelete && (
          <Modal
            isOpen={uniDeleteModalOpen}
            onClose={() => !isDeletingUni && setUniDeleteModalOpen(false)}
            title={selectedUniForDelete.hard ? "Permanently Delete University" : "Move University to Trash"}
          >
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">
                      {selectedUniForDelete.uni.name}
                    </h4>
                    <p className="text-slate-400 text-[11px]">
                      {selectedUniForDelete.uni.city}{selectedUniForDelete.uni.country?.name ? `, ${selectedUniForDelete.uni.country.name}` : ""}
                    </p>
                  </div>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {selectedUniForDelete.hard
                    ? "Are you sure you want to permanently delete this university from the database? This action cannot be undone and will purge all linked program records."
                    : "Are you sure you want to move this university to Trash? It will be removed from the public website, but can be restored anytime from the Deleted tab."}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setUniDeleteModalOpen(false)}
                  disabled={isDeletingUni}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUni}
                  disabled={isDeletingUni}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeletingUni ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{selectedUniForDelete.hard ? "Delete Permanently" : "Move to Trash"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Contact Inquiry Permanent Deletion Confirmation Modal */}
        {inquiryToDelete && (
          <Modal
            isOpen={Boolean(inquiryToDelete)}
            onClose={() => setInquiryToDelete(null)}
            title="Delete Contact Inquiry"
            maxWidth="sm"
          >
            <div className="space-y-4 pt-1">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">
                    {inquiryToDelete.name}
                  </h4>
                  <p className="text-slate-400 text-[11px] truncate">
                    {inquiryToDelete.subject || "Contact Message"}
                  </p>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed">
                Are you sure you want to permanently delete this message? This record will be permanently deleted and cannot be recovered.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setInquiryToDelete(null)}
                  disabled={isDeletingInquiry}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={confirmDeleteInquiry}
                  disabled={isDeletingInquiry}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeletingInquiry ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal: Delete Application Confirmation */}
        {selectedAppForDelete && (
          <Modal
            isOpen={appDeleteModalOpen}
            onClose={() => !isDeletingApp && setAppDeleteModalOpen(false)}
            title={selectedAppForDelete.hard ? "Permanently Purge Application" : "Move Application to Trash"}
          >
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">
                      {selectedAppForDelete.app.student?.user?.name || selectedAppForDelete.app.student?.name || "Student Applicant"}
                    </h4>
                    <p className="text-slate-400 text-[11px] truncate">
                      {selectedAppForDelete.app.university?.name || selectedAppForDelete.app.program?.university?.name || "Target University"} • {selectedAppForDelete.app.programName || selectedAppForDelete.app.program?.name || "Program"}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-1 text-rose-300">
                  <div className="flex items-center gap-1.5 font-bold text-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{selectedAppForDelete.hard ? "Permanent Database Removal" : "Moving Application to Trash"}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedAppForDelete.hard
                      ? "Are you sure you want to permanently delete this application? All uploaded documents and dossier history will be completely erased from the database and Cloudinary. This action cannot be undone."
                      : `Are you sure you want to move this student application (${selectedAppForDelete.app.documents?.length || 0} attached files) to Trash? It will be hidden from the active list, but can be restored anytime by an Admin or Super Admin.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setAppDeleteModalOpen(false)}
                  disabled={isDeletingApp}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteApp}
                  disabled={isDeletingApp}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isDeletingApp ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{selectedAppForDelete.hard ? "Permanently Purge" : "Move to Trash"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Sleek Floating Toast Notification (Side floating, zero layout shift, auto-hides in 4s) */}
        {appToast && (
          <div
            role="status"
            aria-live="polite"
            className="fixed top-20 right-4 sm:right-8 z-[9999] max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto p-4 rounded-2xl bg-slate-900/95 border backdrop-blur-xl shadow-2xl flex items-start gap-3.5 animate-in fade-in slide-in-from-top-3 sm:slide-in-from-right-4 duration-300"
            style={{
              borderColor: appToast.type === "success" ? "rgba(16, 185, 129, 0.45)" : "rgba(244, 63, 94, 0.45)",
              boxShadow: appToast.type === "success"
                ? "0 20px 40px -15px rgba(5, 150, 105, 0.45), 0 0 20px rgba(16, 185, 129, 0.15)"
                : "0 20px 40px -15px rgba(225, 29, 72, 0.45), 0 0 20px rgba(244, 63, 94, 0.15)"
            }}
          >
            {/* Status Icon with Glowing Badge */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border shadow-sm ${
              appToast.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20"
                : "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-rose-500/20"
            }`}>
              {appToast.type === "success" ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>

            {/* Content text */}
            <div className="flex-1 min-w-0 pr-1">
              <h5 className="font-bold text-xs text-white tracking-wide">
                {appToast.type === "success" ? "Action Successful" : "Attention Required"}
              </h5>
              <p className="text-[12px] text-slate-300 mt-0.5 leading-relaxed break-words font-medium">
                {appToast.message}
              </p>
            </div>

            {/* Dismiss Cross Button */}
            <button
              type="button"
              onClick={() => setAppToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0 mt-0.5"
              title="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        </div>
      </main>

      {/* =========================================================================
          MOBILE STICKY BOTTOM ICON-ONLY BAR (Excludes Notifications which is in Top Navbar)
      ========================================================================= */}
      <nav
        aria-label="Mobile Dashboard Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800/90 z-40 flex items-center justify-around px-1.5 shadow-2xl"
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
                {item.id === "INBOX" && inquiriesUnreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-slate-950" />
                )}
              </button>
            );
          })}
      </nav>
    </div>
  );
}
