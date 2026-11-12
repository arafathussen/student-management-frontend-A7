"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { higherStudyService } from "@/services/higherStudyService";
import { successStoryService } from "@/services/successStoryService";
import { contactService } from "@/services/contactService";
import { userService } from "@/services/userService";
import { commissionService } from "@/services/commissionService";
import {
  Database,
  Download,
  UploadCloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  Server,
  FileJson,
  HardDriveDownload,
  RotateCcw,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

interface PingLogItem {
  id: string;
  checkedAt: string;
  status: "ONLINE" | "DEGRADED" | "ERROR";
  latencyMs: number;
  triggerSource: string;
  details: string;
}

interface BackupPayload {
  meta: {
    app: string;
    backupVersion: string;
    exportedAt: string;
    exportedBy: string;
    counts: Record<string, number>;
  };
  data: {
    countries: any[];
    universities: any[];
    guides: any[];
    successSettings: any | null;
    successStories: any[];
    contactSettings: any | null;
    supportTeam: any[];
    contactInquiries: any[];
    checklistPresets: any[];
    checklistItems: any[];
    users: any[];
    applications: any[];
    commissions: any[];
  };
}

interface BackupDataCenterTabProps {
  userRole?: string;
  userEmail?: string;
  userName?: string;
  counts?: {
    countries?: number;
    universities?: number;
    guides?: number;
    applications?: number;
    users?: number;
    commissions?: number;
    inquiries?: number;
  };
  onRestoreComplete?: () => Promise<void> | void;
}

const PING_LOG_STORAGE_KEY = "rise_abroad_supabase_ping_log_v1";

const SUPABASE_RLS_SQL = `-- Run once in Supabase Dashboard -> SQL Editor
-- Enables Row-Level Security on all Prisma tables in 'public' schema
-- Blocks unauthorized Supabase Data API access while keeping Express + Prisma 100% functional
DO $$
DECLARE
  tbl RECORD;
BEGIN
  FOR tbl IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT LIKE '_prisma_%'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
  END LOOP;
END $$;`;

export default function BackupDataCenterTab({
  userRole,
  userEmail,
  userName,
  counts,
  onRestoreComplete,
}: BackupDataCenterTabProps) {
  const [pingLoading, setPingLoading] = useState(false);
  const [lastPingResult, setLastPingResult] = useState<{
    success: boolean;
    status: string;
    latencyMs: number;
    checkedAt: string;
    triggerSource: string;
    checks?: Array<{ endpoint: string; ok: boolean; status: number; latencyMs: number; records?: number; error?: string }>;
  } | null>(null);
  const [pingLogs, setPingLogs] = useState<PingLogItem[]>([]);

  // Export State
  const [exporting, setExporting] = useState(false);
  const [exportSummary, setExportSummary] = useState<{
    fileName: string;
    totalRecords: number;
    exportedAt: string;
    breakdown: Record<string, number>;
  } | null>(null);

  // Import / Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedBackup, setParsedBackup] = useState<BackupPayload | null>(null);
  const [backupFileName, setBackupFileName] = useState<string>("");
  const [importError, setImportError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState<string>("");
  const [restoreResult, setRestoreResult] = useState<{
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  const [restoreModules, setRestoreModules] = useState({
    countries: true,
    universities: true,
    guides: true,
    successStories: true,
    successSettings: true,
    contactSettings: true,
    supportTeam: true,
    checklistPresets: true,
  });

  // RLS SQL Helper Toggle
  const [showRlsHelper, setShowRlsHelper] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Load ping history from localStorage & trigger 24h safety ping if overdue
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem(PING_LOG_STORAGE_KEY);
      if (saved) {
        const parsed: PingLogItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setPingLogs(parsed);
          if (parsed.length > 0) {
            const latest = parsed[0];
            setLastPingResult({
              success: latest.status === "ONLINE",
              status: latest.status,
              latencyMs: latest.latencyMs,
              checkedAt: latest.checkedAt,
              triggerSource: latest.triggerSource,
            });
            const hoursSinceLast =
              (Date.now() - new Date(latest.checkedAt).getTime()) / (1000 * 60 * 60);
            if (hoursSinceLast >= 24) {
              handleManualPing("auto-24h-check");
            }
          }
        }
      } else {
        handleManualPing("initial-health-check");
      }
    } catch {
      // ignore localStorage issues
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Strict Super Admin access check
  if (userRole !== "SUPER_ADMIN") {
    return (
      <Card className="bg-slate-900/60 border-rose-500/30 p-8 text-center space-y-3">
        <Lock className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Super Admin Access Required</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Full system backup, restore, and Supabase keep-alive controls are restricted exclusively to Super Admin accounts.
        </p>
      </Card>
    );
  }

  const handleManualPing = async (sourceOverride?: string) => {
    try {
      setPingLoading(true);
      const startedAt = Date.now();
      const res = await fetch("/api/keep-alive", {
        method: sourceOverride ? "GET" : "POST",
        cache: "no-store",
      });
      const json = await res.json();
      const latency = json?.latencyMs ?? Date.now() - startedAt;
      const status: "ONLINE" | "DEGRADED" | "ERROR" = json?.success
        ? "ONLINE"
        : json?.status === "DEGRADED"
        ? "DEGRADED"
        : "ERROR";

      const resultObj = {
        success: Boolean(json?.success),
        status,
        latencyMs: latency,
        checkedAt: json?.checkedAt || new Date().toISOString(),
        triggerSource: sourceOverride || json?.triggerSource || "super-admin-manual-ping",
        checks: Array.isArray(json?.checks) ? json.checks : undefined,
      };
      setLastPingResult(resultObj);

      const newLog: PingLogItem = {
        id: `ping-${Date.now()}`,
        checkedAt: resultObj.checkedAt,
        status,
        latencyMs: latency,
        triggerSource: resultObj.triggerSource,
        details: resultObj.checks
          ? resultObj.checks.map((c: any) => `${c.endpoint} (${c.status})`).join(" • ")
          : "Database connectivity verified",
      };

      setPingLogs((prev) => {
        const next = [newLog, ...prev].slice(0, 12);
        try {
          localStorage.setItem(PING_LOG_STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    } catch (err: any) {
      const errorLog: PingLogItem = {
        id: `ping-err-${Date.now()}`,
        checkedAt: new Date().toISOString(),
        status: "ERROR",
        latencyMs: 0,
        triggerSource: sourceOverride || "super-admin-manual-ping",
        details: err?.message || "Failed to reach keep-alive route",
      };
      setLastPingResult({
        success: false,
        status: "ERROR",
        latencyMs: 0,
        checkedAt: errorLog.checkedAt,
        triggerSource: errorLog.triggerSource,
      });
      setPingLogs((prev) => [errorLog, ...prev].slice(0, 12));
    } finally {
      setPingLoading(false);
    }
  };

  const handleClearPingLogs = () => {
    setPingLogs([]);
    try {
      localStorage.removeItem(PING_LOG_STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleExportFullBackup = async () => {
    try {
      setExporting(true);
      const [
        countriesRes,
        universitiesRes,
        blogsRes,
        successSettingsRes,
        successStoriesRes,
        contactSettingsRes,
        teamRes,
        inquiriesRes,
        presetsRes,
        itemsRes,
        usersRes,
        appsRes,
        commsRes,
      ] = await Promise.all([
        higherStudyService.getCountries().catch(() => ({ data: [] })),
        higherStudyService.getUniversities({ includeDeleted: "true", limit: 500 }).catch(() => ({ data: [] })),
        higherStudyService.getBlogs({ limit: 500 }).catch(() => ({ data: [] })),
        successStoryService.getSettings().catch(() => null),
        successStoryService.getStories({ limit: 500 }).catch(() => []),
        contactService.getSettings().catch(() => null),
        contactService.getTeamMembers(true).catch(() => []),
        contactService.getInquiries().catch(() => ({ inquiries: [] })),
        higherStudyService.getChecklistPresets().catch(() => ({ data: [] })),
        higherStudyService.getChecklistItems().catch(() => ({ data: [] })),
        userService.getUsers({ limit: 500 }).catch(() => ({ data: [] })),
        higherStudyService.getAllApplications({ limit: 500 }).catch(() => ({ data: [] })),
        commissionService.getAllCommissions({ limit: 500 }).catch(() => ({ data: [] })),
      ]);

      const extractArray = (res: any) => {
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.commissions)) return res.data.commissions;
        if (Array.isArray(res?.inquiries)) return res.inquiries;
        return [];
      };

      const countriesList = extractArray(countriesRes);
      const universitiesList = extractArray(universitiesRes);
      const guidesList = extractArray(blogsRes);
      const storiesList = extractArray(successStoriesRes);
      const teamList = extractArray(teamRes);
      const inquiriesList = Array.isArray(inquiriesRes?.inquiries)
        ? inquiriesRes.inquiries
        : extractArray(inquiriesRes);
      const presetsList = extractArray(presetsRes);
      const itemsList = extractArray(itemsRes);
      const usersList = extractArray(usersRes);
      const appsList = extractArray(appsRes);
      const commsList = extractArray(commsRes);

      const breakdown: Record<string, number> = {
        countries: countriesList.length,
        universities: universitiesList.length,
        guides: guidesList.length,
        successStories: storiesList.length,
        supportTeam: teamList.length,
        contactInquiries: inquiriesList.length,
        checklistPresets: presetsList.length,
        checklistItems: itemsList.length,
        users: usersList.length,
        applications: appsList.length,
        commissions: commsList.length,
      };

      const totalRecords = Object.values(breakdown).reduce((sum, n) => sum + n, 0);
      const nowIso = new Date().toISOString();

      const payload: BackupPayload = {
        meta: {
          app: "Rise Abroad Education Portal",
          backupVersion: "1.0.0",
          exportedAt: nowIso,
          exportedBy: `${userName || "Super Admin"} (${userEmail || "super_admin"})`,
          counts: breakdown,
        },
        data: {
          countries: countriesList,
          universities: universitiesList,
          guides: guidesList,
          successSettings: successSettingsRes || null,
          successStories: storiesList,
          contactSettings: contactSettingsRes || null,
          supportTeam: teamList,
          contactInquiries: inquiriesList,
          checklistPresets: presetsList,
          checklistItems: itemsList,
          users: usersList,
          applications: appsList,
          commissions: commsList,
        },
      };

      const stamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 16);
      const fileName = `rise-abroad-full-backup-${stamp}.json`;

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportSummary({
        fileName,
        totalRecords,
        exportedAt: nowIso,
        breakdown,
      });
    } catch (err: any) {
      console.error("Failed to export full backup", err);
      alert(err?.message || "Failed to generate full website backup.");
    } finally {
      setExporting(false);
    }
  };

  const handleSelectBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setRestoreResult(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);
      if (!json || typeof json !== "object" || !json.data) {
        setImportError("Invalid backup file structure. Please upload a valid Rise Abroad JSON backup.");
        setParsedBackup(null);
        return;
      }
      setParsedBackup(json as BackupPayload);
      setBackupFileName(file.name);
    } catch {
      setImportError("Could not parse JSON file. Ensure the file is a valid uncompressed .json backup.");
      setParsedBackup(null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRestoreBackup = async () => {
    if (!parsedBackup?.data) return;

    try {
      setRestoring(true);
      setRestoreResult(null);
      let created = 0;
      let updated = 0;
      let skipped = 0;
      const errors: string[] = [];

      const d = parsedBackup.data;

      // Load live records to avoid duplicating existing entries
      setRestoreProgress("Checking existing live database records...");
      const [liveCountriesRes, liveUnisRes, liveBlogsRes, liveStoriesRes, liveTeamRes, livePresetsRes] =
        await Promise.all([
          higherStudyService.getCountries().catch(() => ({ data: [] })),
          higherStudyService.getUniversities({ includeDeleted: "true", limit: 500 }).catch(() => ({ data: [] })),
          higherStudyService.getBlogs({ limit: 500 }).catch(() => ({ data: [] })),
          successStoryService.getStories({ limit: 500 }).catch(() => []),
          contactService.getTeamMembers(true).catch(() => []),
          higherStudyService.getChecklistPresets().catch(() => ({ data: [] })),
        ]);

      const extractArr = (r: any) =>
        Array.isArray(r) ? r : Array.isArray(r?.data?.data) ? r.data.data : Array.isArray(r?.data) ? r.data : [];

      const liveCountries = extractArr(liveCountriesRes);
      const liveUnis = extractArr(liveUnisRes);
      const liveBlogs = extractArr(liveBlogsRes);
      const liveStories = extractArr(liveStoriesRes);
      const liveTeam = extractArr(liveTeamRes);
      const livePresets = extractArr(livePresetsRes);

      // Map old countryId/name -> live countryId
      const countryIdMap: Record<string, string> = {};
      for (const lc of liveCountries) {
        countryIdMap[lc.id] = lc.id;
        if (lc.name) countryIdMap[lc.name.toLowerCase()] = lc.id;
      }

      // 1. Countries
      if (restoreModules.countries && Array.isArray(d.countries)) {
        setRestoreProgress(`Restoring Countries (${d.countries.length})...`);
        for (const c of d.countries) {
          const existing = liveCountries.find(
            (lc: any) =>
              lc.id === c.id ||
              lc.name?.toLowerCase() === c.name?.toLowerCase() ||
              lc.code?.toLowerCase() === c.code?.toLowerCase()
          );
          if (existing) {
            countryIdMap[c.id] = existing.id;
            skipped++;
            continue;
          }
          try {
            const res = await higherStudyService.createCountry({
              name: c.name,
              code: c.code || c.name?.slice(0, 3).toUpperCase() || "INT",
              currency: c.currency || "USD",
              description: c.description || "",
              flagUrl: c.flagUrl || "",
            });
            const newId = res?.data?.id || res?.id;
            if (newId) countryIdMap[c.id] = newId;
            created++;
          } catch (err: any) {
            errors.push(`Country "${c.name}": ${err?.response?.data?.message || err?.message}`);
          }
        }
      }

      // 2. Universities
      if (restoreModules.universities && Array.isArray(d.universities)) {
        setRestoreProgress(`Restoring Universities (${d.universities.length})...`);
        for (const u of d.universities) {
          const existing = liveUnis.find(
            (lu: any) => lu.id === u.id || lu.name?.toLowerCase() === u.name?.toLowerCase()
          );
          if (existing) {
            skipped++;
            continue;
          }
          const resolvedCountryId =
            countryIdMap[u.countryId] ||
            (u.country?.name ? countryIdMap[u.country.name.toLowerCase()] : "") ||
            liveCountries[0]?.id;
          if (!resolvedCountryId) {
            errors.push(`University "${u.name}": Missing target countryId`);
            continue;
          }
          try {
            await higherStudyService.createUniversity({
              name: u.name,
              countryId: resolvedCountryId,
              city: u.city || "Main Campus",
              minTuitionFee: Number(u.minTuitionFee) || 12000,
              maxTuitionFee: Number(u.maxTuitionFee) || 25000,
              offerLetterPaymentType: u.offerLetterPaymentType || "FREE",
              website: u.website || u.programsCtaUrl || "",
              coverImageUrl: u.coverImageUrl || u.bannerUrl || undefined,
              scholarshipHighlight: u.scholarshipHighlight || "",
              excerpt: u.excerpt || "",
              programsCtaLabel: u.programsCtaLabel || "View Official Programs",
              programsCtaUrl: u.programsCtaUrl || u.website || "",
              description: u.description || "",
              status: u.status === "DRAFT" || u.isDraft ? "DRAFT" : "PUBLISHED",
              isDraft: Boolean(u.status === "DRAFT" || u.isDraft),
              tags: Array.isArray(u.tags) ? u.tags : [],
            });
            created++;
          } catch (err: any) {
            errors.push(`University "${u.name}": ${err?.response?.data?.message || err?.message}`);
          }
        }
      }

      // 3. Guides & Blogs
      if (restoreModules.guides && Array.isArray(d.guides)) {
        const customGuides = d.guides.filter((g: any) => !String(g.id || "").startsWith("demo-"));
        setRestoreProgress(`Restoring Guides & Blogs (${customGuides.length})...`);
        for (const g of customGuides) {
          const existing = liveBlogs.find(
            (lb: any) =>
              lb.id === g.id ||
              lb.slug === g.slug ||
              lb.title?.toLowerCase() === g.title?.toLowerCase()
          );
          if (existing) {
            skipped++;
            continue;
          }
          try {
            await higherStudyService.createBlog({
              title: g.title,
              content: g.content || "",
              excerpt: g.excerpt || "",
              bannerUrl: g.bannerUrl || g.coverImage || "",
              category: g.category || "Study Abroad Guide",
              readTime: g.readTime || "5 min read",
              status: g.status === "DRAFT" || g.status === "TRASH" ? g.status : "PUBLISHED",
              tags: Array.isArray(g.tags) ? g.tags : [],
            });
            created++;
          } catch (err: any) {
            errors.push(`Guide "${g.title}": ${err?.response?.data?.message || err?.message}`);
          }
        }
      }

      // 4. Success Page Settings
      if (restoreModules.successSettings && d.successSettings) {
        setRestoreProgress("Restoring Success Stories Header & Stats Settings...");
        try {
          const { id: _id, ...settingsPayload } = d.successSettings;
          await successStoryService.updateSettings(settingsPayload);
          updated++;
        } catch (err: any) {
          errors.push(`Success Settings: ${err?.response?.data?.message || err?.message}`);
        }
      }

      // 5. Success Stories
      if (restoreModules.successStories && Array.isArray(d.successStories)) {
        setRestoreProgress(`Restoring Success Stories (${d.successStories.length})...`);
        for (const s of d.successStories) {
          const existing = liveStories.find(
            (ls: any) =>
              ls.id === s.id ||
              (s.slug && ls.slug === s.slug) ||
              (ls.studentName?.toLowerCase() === s.studentName?.toLowerCase() &&
                ls.universityName?.toLowerCase() === s.universityName?.toLowerCase())
          );
          if (existing) {
            skipped++;
            continue;
          }
          try {
            const { id: _sid, createdAt: _c, updatedAt: _u, ...storyPayload } = s;
            await successStoryService.createStory(storyPayload);
            created++;
          } catch (err: any) {
            errors.push(`Story "${s.studentName}": ${err?.response?.data?.message || err?.message}`);
          }
        }
      }

      // 6. Contact Page & Email Template Settings
      if (restoreModules.contactSettings && d.contactSettings) {
        setRestoreProgress("Restoring Contact Page & Email Template Settings...");
        try {
          const { id: _cid, updatedAt: _cu, ...contactPayload } = d.contactSettings;
          await contactService.updateSettings(contactPayload);
          updated++;
        } catch (err: any) {
          errors.push(`Contact Settings: ${err?.response?.data?.message || err?.message}`);
        }
      }

      // 7. Support Team Members
      if (restoreModules.supportTeam && Array.isArray(d.supportTeam)) {
        setRestoreProgress(`Restoring Support Team Members (${d.supportTeam.length})...`);
        for (const m of d.supportTeam) {
          const existing = liveTeam.find(
            (lm: any) => lm.id === m.id || lm.email?.toLowerCase() === m.email?.toLowerCase()
          );
          if (existing) {
            skipped++;
            continue;
          }
          try {
            const { id: _mid, createdAt: _mc, updatedAt: _mu, ...memberPayload } = m;
            await contactService.createTeamMember(memberPayload);
            created++;
          } catch (err: any) {
            errors.push(`Team "${m.name}": ${err?.response?.data?.message || err?.message}`);
          }
        }
      }

      // 8. Document Checklist Presets
      if (restoreModules.checklistPresets && Array.isArray(d.checklistPresets)) {
        setRestoreProgress(`Restoring Checklist Presets (${d.checklistPresets.length})...`);
        for (const p of d.checklistPresets) {
          const existing = livePresets.find(
            (lp: any) => lp.id === p.id || lp.title?.toLowerCase() === p.title?.toLowerCase()
          );
          if (existing) {
            skipped++;
            continue;
          }
          try {
            await higherStudyService.createChecklistPreset({
              title: p.title,
              country: p.country,
              university: p.university,
              degree: p.degree,
              description: p.description,
              category: p.category,
              items: Array.isArray(p.items) ? p.items : [],
            });
            created++;
          } catch (err: any) {
            errors.push(`Preset "${p.title}": ${err?.response?.data?.message || err?.message}`);
          }
        }
      }

      setRestoreResult({ created, updated, skipped, errors });
      setRestoreProgress("");
      if (onRestoreComplete) {
        await onRestoreComplete();
      }
    } catch (err: any) {
      setImportError(err?.message || "Restore process failed unexpectedly.");
      setRestoreProgress("");
    } finally {
      setRestoring(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_RLS_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              <span>Backup &amp; Data Center</span>
            </h3>
            <Badge variant="gold">SUPER ADMIN ONLY</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated daily 6:00 AM Supabase Keep-Alive monitoring, instant database ping, full-website JSON export, and one-click restore.
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          onClick={() => handleManualPing()}
          disabled={pingLoading}
          className="gap-2 shadow-lg shadow-blue-600/20 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${pingLoading ? "animate-spin" : ""}`} />
          <span>{pingLoading ? "Pinging Supabase..." : "Ping Supabase Now"}</span>
        </Button>
      </div>

      {/* Top Status KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/60 border-slate-800/90 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Supabase Status</span>
            <Activity className={`w-4 h-4 ${lastPingResult?.success ? "text-emerald-400" : "text-amber-400"}`} />
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                lastPingResult?.success ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="text-base font-extrabold text-white">
              {lastPingResult ? lastPingResult.status : "Checking..."}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {lastPingResult?.latencyMs ? `Latency: ${lastPingResult.latencyMs} ms` : "Awaiting health check"}
          </p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/90 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Auto Keep-Alive Cron</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-base font-extrabold text-white">Daily • 6:00 AM BST</div>
          <p className="text-[11px] text-slate-500 font-mono">0 0 * * * UTC (/api/keep-alive)</p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/90 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Live Portal Records</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-base font-extrabold text-white">
            {(counts?.universities || 0) +
              (counts?.guides || 0) +
              (counts?.applications || 0) +
              (counts?.users || 0)}{" "}
            Core Entries
          </div>
          <p className="text-[11px] text-slate-500">
            {counts?.universities || 0} Unis • {counts?.guides || 0} Guides • {counts?.users || 0} Users
          </p>
        </Card>

        <Card className="bg-slate-900/60 border-slate-800/90 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>7-Day Auto-Pause Guard</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-extrabold text-emerald-400">Protected</div>
          <p className="text-[11px] text-slate-500">Reads DB via Express/Prisma daily</p>
        </Card>
      </div>

      {/* Main Two-Column Grid: Keep-Alive Monitor & Backup/Restore */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (5 cols): Supabase Keep-Alive Ping Panel */}
        <Card className="lg:col-span-5 bg-slate-900/60 border-slate-800/90">
          <CardHeader className="pb-3 border-b border-slate-800/80">
            <CardTitle className="text-sm sm:text-base text-white flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Supabase Keep-Alive Monitor
              </span>
              <Badge variant="success">24h Auto Ping</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Schedule:</span>
                <span className="text-blue-300 font-semibold">Every Day at 6:00 AM (BD Time)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Cron Endpoint:</span>
                <span className="font-mono text-[11px] text-slate-300">/api/keep-alive</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Last Checked:</span>
                <span className="text-slate-200">
                  {lastPingResult?.checkedAt
                    ? new Date(lastPingResult.checkedAt).toLocaleString()
                    : "Not checked yet"}
                </span>
              </div>
            </div>

            {/* Live Check Breakdown */}
            {lastPingResult?.checks && lastPingResult.checks.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Latest Endpoint Probe Results
                </div>
                {lastPingResult.checks.map((chk, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {chk.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className="font-mono text-[11px] text-slate-200 truncate">
                        {chk.endpoint}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-[11px]">
                      {typeof chk.records === "number" && (
                        <span className="text-slate-400">{chk.records} rows</span>
                      )}
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono font-bold ${
                          chk.ok
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-rose-500/15 text-rose-300"
                        }`}
                      >
                        {chk.latencyMs}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ping Logs History */}
            <div className="space-y-2 pt-2 border-t border-slate-800/70">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Recent Ping Activity ({pingLogs.length})
                </span>
                {pingLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearPingLogs}
                    className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {pingLogs.length === 0 ? (
                <p className="text-[11px] text-slate-500 py-3 text-center">
                  No manual pings recorded in this browser yet.
                </p>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {pingLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/70 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              log.status === "ONLINE"
                                ? "bg-emerald-400"
                                : log.status === "DEGRADED"
                                ? "bg-amber-400"
                                : "bg-rose-400"
                            }`}
                          />
                          <span className="font-semibold text-slate-200 truncate">
                            {log.triggerSource}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate mt-0.5">
                          {new Date(log.checkedAt).toLocaleString()}
                        </div>
                      </div>
                      <span className="font-mono text-[11px] text-emerald-400 font-bold shrink-0">
                        {log.latencyMs}ms
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN (7 cols): Full Website JSON Export + Import/Restore */}
        <div className="lg:col-span-7 space-y-6">
          {/* Export Full Website JSON */}
          <Card className="bg-slate-900/60 border-slate-800/90">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm sm:text-base text-white flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <HardDriveDownload className="w-4 h-4 text-blue-400" />
                  Full Website Data Backup (Export JSON)
                </span>
                <Badge variant="primary">Portable Snapshot</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Download a complete single-file `.json` snapshot containing all{" "}
                <strong className="text-white">
                  Countries, Universities, Guides &amp; Blogs, Success Stories &amp; Stats, Contact &amp; Email Templates, Team Members, Inquiries, Checklist Presets, Users, Applications, and Commissions
                </strong>
                . Keep this safely offline to migrate or restore anytime.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="gradient"
                  size="md"
                  onClick={handleExportFullBackup}
                  disabled={exporting}
                  className="gap-2 shadow-lg shadow-blue-900/40 cursor-pointer"
                >
                  {exporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Collecting Live Database Tables...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Full Website Backup (.json)</span>
                    </>
                  )}
                </Button>
              </div>

              {exportSummary && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Backup Downloaded: {exportSummary.fileName}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(exportSummary.breakdown).map(([key, count]) => (
                      <span
                        key={key}
                        className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300"
                      >
                        {key}: <strong className="text-white">{count}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Import & Restore Backup */}
          <Card className="bg-slate-900/60 border-slate-800/90">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-sm sm:text-base text-white flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  Restore Website from Backup (Import JSON)
                </span>
                <Badge variant="warning">Non-Destructive Merge</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Upload a previously exported <code className="text-blue-300">.json</code> backup file. Existing records with matching names/IDs are safely skipped without creating duplicates, while missing CMS entries and settings are restored automatically.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleSelectBackupFile}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-5 rounded-2xl border-2 border-dashed border-slate-700/80 hover:border-blue-500/60 bg-slate-950/60 hover:bg-slate-900/80 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group"
              >
                <UploadCloud className="w-7 h-7 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-slate-200">
                  {backupFileName ? `Selected: ${backupFileName}` : "Click to Select Backup File (.json)"}
                </span>
                <span className="text-[11px] text-slate-500">
                  Supports rise-abroad-full-backup-*.json snapshots
                </span>
              </button>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {parsedBackup && (
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-white">Backup Preview</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Exported: {new Date(parsedBackup.meta?.exportedAt || Date.now()).toLocaleString()}
                    </span>
                  </div>

                  {/* Module Selection Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { key: "countries", label: "Countries", count: parsedBackup.data.countries?.length || 0 },
                      { key: "universities", label: "Universities", count: parsedBackup.data.universities?.length || 0 },
                      { key: "guides", label: "Guides & Blogs", count: parsedBackup.data.guides?.length || 0 },
                      { key: "successStories", label: "Success Stories", count: parsedBackup.data.successStories?.length || 0 },
                      { key: "successSettings", label: "Success Header Settings", count: parsedBackup.data.successSettings ? 1 : 0 },
                      { key: "contactSettings", label: "Contact & Email Templates", count: parsedBackup.data.contactSettings ? 1 : 0 },
                      { key: "supportTeam", label: "Support Team Members", count: parsedBackup.data.supportTeam?.length || 0 },
                      { key: "checklistPresets", label: "Checklist Presets", count: parsedBackup.data.checklistPresets?.length || 0 },
                    ].map((mod) => {
                      const k = mod.key as keyof typeof restoreModules;
                      return (
                        <label
                          key={mod.key}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 cursor-pointer hover:border-slate-700"
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={restoreModules[k]}
                              onChange={(e) =>
                                setRestoreModules((prev) => ({
                                  ...prev,
                                  [k]: e.target.checked,
                                }))
                              }
                              className="rounded border-slate-600 bg-slate-950 text-blue-500"
                            />
                            <span className="text-slate-200 font-medium">{mod.label}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300">
                            {mod.count}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {restoreProgress ? (
                      <span className="text-blue-300 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{restoreProgress}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Users &amp; Applications inside JSON are preserved for audit archive.
                      </span>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleRestoreBackup}
                      disabled={restoring}
                      className="gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{restoring ? "Restoring..." : "Restore Selected Modules"}</span>
                    </Button>
                  </div>
                </div>
              )}

              {restoreResult && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Restore Completed</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-300">
                    <span>
                      Created: <strong className="text-emerald-400">{restoreResult.created}</strong>
                    </span>
                    <span>
                      Settings Updated: <strong className="text-blue-400">{restoreResult.updated}</strong>
                    </span>
                    <span>
                      Already Existing (Skipped): <strong className="text-slate-400">{restoreResult.skipped}</strong>
                    </span>
                  </div>
                  {restoreResult.errors.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px] text-rose-300 max-h-28 overflow-y-auto">
                      {restoreResult.errors.map((errMsg, idx) => (
                        <div key={idx}>• {errMsg}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collapsible Supabase RLS Security Advisor Fix Helper */}
      <Card className="bg-slate-900/50 border-amber-500/25 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRlsHelper((v) => !v)}
          className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-900/80 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-bold text-white truncate">
                Supabase Email Fix: &ldquo;Table publicly accessible (rls_disabled_in_public)&rdquo;
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                One-time SQL script for Supabase SQL Editor to lock public Data API while keeping Express + Prisma untouched.
              </p>
            </div>
          </div>
          {showRlsHelper ? (
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </button>

        {showRlsHelper && (
          <div className="p-4 pt-0 border-t border-slate-800/70 space-y-3 text-xs animate-in fade-in duration-200">
            <p className="text-slate-300 pt-3 leading-relaxed">
              Supabase sends this warning when Prisma creates tables in the <code className="text-amber-300">public</code> schema without Row-Level Security enabled. Run the SQL below once inside{" "}
              <strong className="text-white">Supabase Dashboard → SQL Editor</strong> to block direct public REST exposure without affecting your Express API:
            </p>
            <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-emerald-300 font-mono overflow-x-auto leading-relaxed">
              {SUPABASE_RLS_SQL}
            </pre>
            <div className="flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={handleCopySql} className="gap-1.5 cursor-pointer">
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SQL Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Supabase RLS SQL</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
