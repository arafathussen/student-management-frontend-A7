"use client";

import React, { useState, useEffect } from "react";
import {
  contactService,
  ContactPageSettings,
  SupportTeamMember,
} from "@/services/contactService";
import PhotoCropperModal from "./PhotoCropperModal";
import {
  MapPin,
  Clock,
  Users,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  RefreshCw,
  X,
  Crop,
  ArrowLeft,
  Sparkles,
  Check,
  Building2,
  UserCheck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const BADGE_PRESETS = [
  { label: "Executive", value: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
  { label: "Admissions", value: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
  { label: "Visa Desk", value: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
  { label: "24/7 Hotline", value: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
  { label: "Support Desk", value: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
  { label: "Counselor", value: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
];

interface ContactCmsTabProps {
  activeSubTab?: "OFFICE_INFO" | "TEAM_DESK";
  onSubTabChange?: (tab: "OFFICE_INFO" | "TEAM_DESK") => void;
}

export default function ContactCmsTab({
  activeSubTab: externalSubTab,
  onSubTabChange,
}: ContactCmsTabProps = {}) {
  // Navigation Sub-Tabs controlled from top header
  const [internalSubTab, setInternalSubTab] = useState<"OFFICE_INFO" | "TEAM_DESK">("OFFICE_INFO");
  const activeSubTab = externalSubTab ?? internalSubTab;
  const setActiveSubTab = (tab: "OFFICE_INFO" | "TEAM_DESK") => {
    setInternalSubTab(tab);
    if (onSubTabChange) onSubTabChange(tab);
  };

  // In Team Desk: "LIST" or "FULL_EDITOR" (No cramped modals!)
  const [deskView, setDeskView] = useState<"LIST" | "FULL_EDITOR">("LIST");

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings State (Office & Counseling Hours)
  const [settings, setSettings] = useState<ContactPageSettings>({
    headquartersTitle: "Dhaka Headquarters",
    headquartersAddress: "Level 6, Navana Tower, Gulshan-1, Dhaka-1212, Bangladesh.",
    headquartersNote: "Direct access via Gulshan Circle 1",
    officeHoursTitle: "Office Hours & Counseling",
    officeHoursSchedule: "Saturday – Thursday: 10:00 AM – 7:00 PM",
    officeHoursNote: "Friday: Closed (Hotline & WhatsApp Active)",
  });

  // Team Members State
  const [team, setTeam] = useState<SupportTeamMember[]>([]);

  // Member Dedicated Editor State
  const [editingMember, setEditingMember] = useState<SupportTeamMember | null>(null);
  const [memberForm, setMemberForm] = useState<Omit<SupportTeamMember, "id" | "createdAt" | "updatedAt">>({
    name: "",
    role: "",
    badge: "EXECUTIVE",
    badgeColor: BADGE_PRESETS[0].value,
    department: "",
    avatar: "",
    avatarAlt: "",
    phone: "",
    email: "",
    whatsapp: "",
    facebook: "",
    order: 0,
    isActive: true,
  });
  const [savingMember, setSavingMember] = useState(false);

  // Interactive Photo Cropper state
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  // Load Data from Backend
  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [fetchedSettings, fetchedTeam] = await Promise.all([
        contactService.getSettings(),
        contactService.getTeamMembers(true), // Load all including inactive
      ]);
      if (fetchedSettings) setSettings(fetchedSettings);
      if (fetchedTeam) setTeam(fetchedTeam);
    } catch (err: any) {
      console.error("Failed to load contact CMS data:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to load Contact details";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleGlobalRefresh = () => {
      loadData();
    };
    window.addEventListener("refresh-contact-cms", handleGlobalRefresh);
    return () => {
      window.removeEventListener("refresh-contact-cms", handleGlobalRefresh);
    };
  }, []);

  useEffect(() => {
    if (activeSubTab === "OFFICE_INFO") {
      setDeskView("LIST");
    }
  }, [activeSubTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save Settings Form
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setErrorMsg(null);
      const updated = await contactService.updateSettings(settings);
      setSettings(updated);
      setSettingsSuccess(true);
      showToast("Office Headquarters & Counseling Hours updated successfully!");
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to update office settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // Open Full-Page Editor for New Member
  const handleOpenCreateMember = () => {
    setEditingMember(null);
    setMemberForm({
      name: "",
      role: "",
      badge: "EXECUTIVE",
      badgeColor: BADGE_PRESETS[0].value,
      department: "",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      avatarAlt: "",
      phone: "+880 1712-345678",
      email: "counselor@riseabroad.com",
      whatsapp: "https://wa.me/8801712345678",
      facebook: "https://facebook.com/riseabroad",
      order: team.length + 1,
      isActive: true,
    });
    setDeskView("FULL_EDITOR");
  };

  // Open Full-Page Editor for Existing Member
  const handleOpenEditMember = (m: SupportTeamMember) => {
    setEditingMember(m);
    setMemberForm({
      name: m.name,
      role: m.role,
      badge: m.badge,
      badgeColor: m.badgeColor,
      department: m.department,
      avatar: m.avatar,
      avatarAlt: m.avatarAlt || `${m.name} - ${m.role}`,
      phone: m.phone,
      email: m.email,
      whatsapp: m.whatsapp,
      facebook: m.facebook,
      order: m.order,
      isActive: m.isActive,
    });
    setDeskView("FULL_EDITOR");
  };

  // Save Member Changes
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.name.trim() || !memberForm.role.trim() || !memberForm.department.trim()) {
      alert("Name, Role, and Department are required fields!");
      return;
    }

    try {
      setSavingMember(true);
      if (editingMember) {
        const updated = await contactService.updateTeamMember(editingMember.id, memberForm);
        setTeam((prev) => prev.map((item) => (item.id === editingMember.id ? updated : item)));
        showToast(`Profile for ${updated.name} updated successfully!`);
      } else {
        const created = await contactService.createTeamMember(memberForm);
        setTeam((prev) => [...prev, created]);
        showToast(`New member ${created.name} added successfully!`);
      }
      setDeskView("LIST");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save team member");
    } finally {
      setSavingMember(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name} from the support desk?`)) return;
    try {
      await contactService.deleteTeamMember(id);
      setTeam((prev) => prev.filter((item) => item.id !== id));
      showToast(`${name} removed successfully.`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete team member");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading Contact Page CMS Settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Global Alerts / Toasts */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* =========================================================================
          TAB 1: OFFICE ADDRESS & COUNSELING HOURS (Screenshot 2 Details)
      ========================================================================= */}
      {activeSubTab === "OFFICE_INFO" && (
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-200 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Dhaka Headquarters & Office Schedule</h3>
                <p className="text-xs text-slate-400">Controls the address and business hours shown on the public contact page.</p>
              </div>
            </div>

            {settingsSuccess && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl">
                <Check className="w-3.5 h-3.5" />
                <span>Saved Live</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Headquarters Address */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <MapPin className="w-4 h-4" />
                  <span>Headquarters Information</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Section Title</label>
                  <input
                    type="text"
                    required
                    value={settings.headquartersTitle}
                    onChange={(e) => setSettings({ ...settings, headquartersTitle: e.target.value })}
                    placeholder="e.g. Dhaka Headquarters"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Complete Address</label>
                  <textarea
                    rows={3}
                    required
                    value={settings.headquartersAddress}
                    onChange={(e) => setSettings({ ...settings, headquartersAddress: e.target.value })}
                    placeholder="Level 6, Navana Tower, Gulshan-1, Dhaka-1212, Bangladesh."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Access Subtitle / Location Note</label>
                  <input
                    type="text"
                    value={settings.headquartersNote}
                    onChange={(e) => setSettings({ ...settings, headquartersNote: e.target.value })}
                    placeholder="Direct access via Gulshan Circle 1"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Right Column: Counseling & Opening Hours */}
              <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  <span>Counseling & Business Schedule</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Section Title</label>
                  <input
                    type="text"
                    required
                    value={settings.officeHoursTitle}
                    onChange={(e) => setSettings({ ...settings, officeHoursTitle: e.target.value })}
                    placeholder="e.g. Office Hours & Counseling"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Opening Schedule (Days & Time)</label>
                  <input
                    type="text"
                    required
                    value={settings.officeHoursSchedule}
                    onChange={(e) => setSettings({ ...settings, officeHoursSchedule: e.target.value })}
                    placeholder="Saturday – Thursday: 10:00 AM – 7:00 PM"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Weekend / Holiday Note</label>
                  <input
                    type="text"
                    value={settings.officeHoursNote}
                    onChange={(e) => setSettings({ ...settings, officeHoursNote: e.target.value })}
                    placeholder="Friday: Closed (Hotline & WhatsApp Active)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingSettings}
                variant="gradient"
                className="gap-2 shadow-lg shadow-blue-600/20 text-xs sm:text-sm px-6 py-2.5"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? "Saving Settings..." : "Save Office Settings"}</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB 2: LEADERSHIP & SUPPORT DESK (Screenshot 3 Details)
      ========================================================================= */}
      {activeSubTab === "TEAM_DESK" && (
        <>
          {/* VIEW A: MEMBER CARDS LIST VIEW */}
          {deskView === "LIST" && (
            <div className="bg-slate-900/70 border border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Leadership & Support Desk Cards ({team.length})
                    </h3>
                    <p className="text-xs text-slate-400">
                      Manage official profile cards, photos, contact numbers, and WhatsApp desk.
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleOpenCreateMember}
                  variant="gradient"
                  className="gap-2 shadow-lg shadow-indigo-600/30 text-xs sm:text-sm px-4 py-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Member</span>
                </Button>
              </div>

              {/* Responsive 2x2 / 2-Column Grid of Profile Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {team.map((member) => (
                  <div
                    key={member.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                      member.isActive
                        ? "bg-slate-950/70 border-slate-800/80 hover:border-slate-700 shadow-lg"
                        : "bg-slate-950/40 border-slate-900 opacity-60"
                    }`}
                  >
                    <div>
                      {/* Header: Photo, Name, Badge & Actions */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5 min-w-0">
                          {/* Circular Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 ring-2 ring-blue-500/30 shadow-md">
                              <img
                                src={member.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                                alt={member.avatarAlt || member.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-bold text-white truncate">{member.name}</h4>
                              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase border ${member.badgeColor}`}>
                                {member.badge}
                              </span>
                              {!member.isActive && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-indigo-300 font-medium truncate mt-0.5">{member.role}</p>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{member.department}</p>
                          </div>
                        </div>

                        {/* Card Edit and Delete Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditMember(member)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                            title="Edit this profile in full dedicated editor"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                            title="Delete this profile"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Contact Pills & Channels */}
                    <div className="mt-4 pt-3.5 border-t border-slate-800/70 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="font-mono text-[11px] truncate">{member.phone || "No phone added"}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="text-[11px] truncate">{member.email || "No email added"}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {team.length === 0 && (
                  <div className="col-span-2 text-center py-12 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800">
                    <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-300 font-semibold">No team members loaded yet</p>
                    <p className="text-xs text-slate-500 mt-0.5">Click the button below to add your first leadership profile.</p>
                    <Button onClick={handleOpenCreateMember} size="sm" variant="outline" className="mt-4 text-xs">
                      Add First Member
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW B: DEDICATED FULL-PAGE EDITOR (No Cramped Modal!) */}
          {deskView === "FULL_EDITOR" && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in duration-200">
              {/* Editor Navigation Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setDeskView("LIST")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Team Members</span>
                  </button>

                  <div>
                    <h3 className="text-base font-bold text-white">
                      {editingMember ? `Editing Profile: ${editingMember.name}` : "Create New Team Member Profile"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Full responsive dedicated editor with interactive photo cutter & cropper.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeskView("LIST")}
                    className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    disabled={savingMember}
                    onClick={handleSaveMember}
                    variant="gradient"
                    className="text-xs gap-1.5 shadow-md shadow-blue-600/30"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savingMember ? "Saving Changes..." : editingMember ? "Save Profile" : "Create Profile"}</span>
                  </Button>
                </div>
              </div>

              {/* Full Editor Grid: Left (Photo & Preview) + Right (Fields) */}
              <form onSubmit={handleSaveMember} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Photo & Cropper Controller */}
                  <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                      <Crop className="w-4 h-4" />
                      <span>Profile Photo & Cutter</span>
                    </div>

                    {/* Live Cropped Avatar Display */}
                    <div className="flex flex-col items-center justify-center p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-3">
                      <div className="relative">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-800 ring-2 ring-blue-500 shadow-xl">
                          <img
                            src={memberForm.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                            alt={memberForm.avatarAlt || memberForm.name || "Preview"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-slate-950 rounded-full" />
                      </div>

                      <div className="text-center">
                        <h4 className="text-sm font-bold text-white truncate max-w-[200px]">
                          {memberForm.name || "Member Name"}
                        </h4>
                        <p className="text-xs text-indigo-300 truncate max-w-[200px]">
                          {memberForm.role || "Designation"}
                        </p>
                      </div>

                      {/* Interactive Photo Cutter Button */}
                      <Button
                        type="button"
                        onClick={() => setIsCropperOpen(true)}
                        variant="gradient"
                        className="w-full gap-2 text-xs shadow-md shadow-blue-600/30 cursor-pointer mt-2"
                      >
                        <Crop className="w-3.5 h-3.5" />
                        <span>Open Photo Cutter / Cropper</span>
                      </Button>
                    </div>

                    {/* Direct Image URL input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Or Paste Image URL directly:
                      </label>
                      <input
                        type="url"
                        value={memberForm.avatar}
                        onChange={(e) => setMemberForm({ ...memberForm, avatar: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>

                    {/* SEO Alt Text */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        SEO Alt Text (Image Alt Tag)
                      </label>
                      <input
                        type="text"
                        value={memberForm.avatarAlt}
                        onChange={(e) => setMemberForm({ ...memberForm, avatarAlt: e.target.value })}
                        placeholder="e.g. Arafat Hossain - Rise Abroad CEO"
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <p className="text-[10px] text-slate-500">
                        Search engines use this alt text to index the member profile.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Member Information Fields */}
                  <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      <Users className="w-4 h-4" />
                      <span>Member Details & Contact Channels</span>
                    </div>

                    {/* Name & Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Full Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={memberForm.name}
                          onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                          placeholder="e.g. Arafat Hossain"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Role / Designation <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={memberForm.role}
                          onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                          placeholder="e.g. Founder & Chief Executive Officer"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Department & Badge */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Department / Responsibilities <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={memberForm.department}
                          onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
                          placeholder="e.g. Executive Strategy & University Alliances"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">
                          Badge Label <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={memberForm.badge}
                          onChange={(e) => setMemberForm({ ...memberForm, badge: e.target.value.toUpperCase() })}
                          placeholder="e.g. EXECUTIVE, ADMISSIONS, VISA DESK"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Badge Theme Color Presets */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300">Badge Theme Color</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {BADGE_PRESETS.map((preset) => (
                          <button
                            type="button"
                            key={preset.label}
                            onClick={() => setMemberForm({ ...memberForm, badgeColor: preset.value })}
                            className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                              memberForm.badgeColor === preset.value
                                ? "border-blue-500 bg-blue-500/10 font-bold"
                                : "border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase border ${preset.value} mr-1`}>
                              {preset.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                        <input
                          type="text"
                          value={memberForm.phone}
                          onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                          placeholder="+880 1712-345678"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Official Email</label>
                        <input
                          type="email"
                          value={memberForm.email}
                          onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                          placeholder="ceo@riseabroad.com"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* WhatsApp Link & Facebook Link */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">WhatsApp Chat URL / Number</label>
                        <input
                          type="text"
                          value={memberForm.whatsapp}
                          onChange={(e) => setMemberForm({ ...memberForm, whatsapp: e.target.value })}
                          placeholder="https://wa.me/8801712345678"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Facebook Profile Link</label>
                        <input
                          type="text"
                          value={memberForm.facebook}
                          onChange={(e) => setMemberForm({ ...memberForm, facebook: e.target.value })}
                          placeholder="https://facebook.com/riseabroad"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Display Order & Visibility Toggle */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                        <input
                          type="checkbox"
                          checked={memberForm.isActive}
                          onChange={(e) => setMemberForm({ ...memberForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                        <span>Visible & Active on Public Contact Page</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400">Display Order:</label>
                        <input
                          type="number"
                          value={memberForm.order}
                          onChange={(e) => setMemberForm({ ...memberForm, order: parseInt(e.target.value) || 0 })}
                          className="w-16 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white text-center font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDeskView("LIST")}
                    className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
                  >
                    Cancel & Return
                  </Button>
                  <Button
                    type="submit"
                    disabled={savingMember}
                    variant="gradient"
                    className="text-xs sm:text-sm px-6 py-2.5 gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingMember ? "Saving Changes..." : editingMember ? "Save Profile Changes" : "Create Member Profile"}</span>
                  </Button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          INTERACTIVE PHOTO CUTTER / CROPPER MODAL
      ========================================================================= */}
      <PhotoCropperModal
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        initialImage={memberForm.avatar}
        onCropComplete={(croppedDataUrl) => {
          setMemberForm((prev) => ({
            ...prev,
            avatar: croppedDataUrl,
          }));
          showToast("Profile photo cropped and applied!");
        }}
      />
    </div>
  );
}
