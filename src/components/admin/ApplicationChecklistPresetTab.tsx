"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Layers, 
  FolderCheck, 
  AlertCircle, 
  Search,
  RefreshCw,
  X,
  Globe,
  GraduationCap,
  Building,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { higherStudyService } from "@/services/higherStudyService";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";

export interface IChecklistItem {
  id?: string;
  title: string;
  instruction: string;
  isRequired: boolean;
  category?: string;
  createdAt?: string;
}

export interface IChecklistPreset {
  id: string;
  title: string;
  description?: string;
  country?: string;
  university?: string;
  degree?: string;
  category: string;
  isDefault?: boolean;
  items: IChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

interface ApplicationChecklistPresetTabProps {
  onAssignToApp?: (preset: IChecklistPreset) => void;
}

export const ApplicationChecklistPresetTab: React.FC<ApplicationChecklistPresetTabProps> = ({
  onAssignToApp,
}) => {
  // Navigation View: GROUPS or ITEMS
  const [mainView, setMainView] = useState<"GROUPS" | "ITEMS">("GROUPS");

  // Data States
  const [presets, setPresets] = useState<IChecklistPreset[]>([]);
  const [items, setItems] = useState<IChecklistItem[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // Modal 1: Create / Edit Checklist Item (Single Document)
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemFormData, setItemFormData] = useState<{
    title: string;
    instruction: string;
    isRequired: boolean;
    category: string;
  }>({
    title: "",
    instruction: "",
    isRequired: true,
    category: "General",
  });
  const [savingItem, setSavingItem] = useState(false);

  // Modal 2: Create / Edit Checklist Group (Country, University, Degree, Selected Items)
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupFormData, setGroupFormData] = useState<{
    title: string;
    country: string;
    university: string;
    degree: string;
    description: string;
    selectedItemIds: string[];
  }>({
    title: "",
    country: "United Kingdom",
    university: "All Universities",
    degree: "Bachelor / Undergraduate",
    description: "",
    selectedItemIds: [],
  });
  const [savingGroup, setSavingGroup] = useState(false);

  // Delete Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState<{
    type: "GROUP" | "ITEM";
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Floating Toast Notification State
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch all initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [presetsRes, itemsRes, unisRes] = await Promise.all([
        higherStudyService.getChecklistPresets().catch(() => ({ data: [] })),
        higherStudyService.getChecklistItems().catch(() => ({ data: [] })),
        higherStudyService.getUniversities({ limit: 100 }).catch(() => ({ data: [] })),
      ]);

      if (presetsRes && presetsRes.data) {
        setPresets(presetsRes.data);
      }
      if (itemsRes && itemsRes.data) {
        setItems(itemsRes.data);
      }
      if (unisRes && unisRes.data) {
        const uList = Array.isArray(unisRes.data) ? unisRes.data : unisRes.data?.data || [];
        setUniversities(uList);
      }
    } catch (err: any) {
      console.error("Failed to load checklist data:", err);
      showToast("error", err?.response?.data?.message || "Failed to load checklist data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute dynamic countries from actual created groups
  const dynamicCountries = useMemo(() => {
    const list = presets.map((p) => p.country?.trim()).filter(Boolean) as string[];
    const unique = Array.from(new Set(list));
    return ["ALL", ...unique];
  }, [presets]);

  // Available countries for dropdown (dynamic from universities + popular)
  const availableCountries = useMemo(() => {
    const set = new Set<string>([
      "United Kingdom",
      "Canada",
      "United States",
      "Australia",
      "Germany",
      "Sweden",
      "Malaysia",
      "Japan",
      "All Countries",
    ]);
    universities.forEach((u) => {
      if (u.country?.name) set.add(u.country.name);
    });
    return Array.from(set);
  }, [universities]);

  // Degree options
  const degreeOptions = [
    "Bachelor / Undergraduate",
    "Master / Postgraduate",
    "PhD / Doctorate",
    "Foundation / Diploma",
    "Language Course",
    "All Degrees",
  ];

  // ==================== ITEM HANDLERS (Create Checklist) ====================
  const handleOpenCreateItemModal = () => {
    setEditingItemId(null);
    setItemFormData({
      title: "",
      instruction: "",
      isRequired: true,
      category: "General",
    });
    setItemModalOpen(true);
  };

  const handleOpenEditItemModal = (item: IChecklistItem) => {
    setEditingItemId(item.id || null);
    setItemFormData({
      title: item.title,
      instruction: item.instruction || "",
      isRequired: item.isRequired !== false,
      category: item.category || "General",
    });
    setItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemFormData.title.trim()) {
      showToast("error", "Please provide a checklist document title!");
      return;
    }

    try {
      setSavingItem(true);
      if (editingItemId) {
        await higherStudyService.updateChecklistItem(editingItemId, {
          title: itemFormData.title.trim(),
          instruction: itemFormData.instruction.trim(),
          isRequired: itemFormData.isRequired,
          category: itemFormData.category,
        });
        showToast("success", "Checklist item updated successfully!");
      } else {
        await higherStudyService.createChecklistItem({
          title: itemFormData.title.trim(),
          instruction: itemFormData.instruction.trim(),
          isRequired: itemFormData.isRequired,
          category: itemFormData.category,
        });
        showToast("success", "New checklist item created successfully!");
      }
      setItemModalOpen(false);
      // Refresh items
      const res = await higherStudyService.getChecklistItems();
      if (res && res.data) setItems(res.data);
    } catch (err: any) {
      console.error("Failed to save checklist item:", err);
      showToast("error", err?.response?.data?.message || "Failed to save checklist item");
    } finally {
      setSavingItem(false);
    }
  };

  // ==================== GROUP HANDLERS (Create Group) ====================
  const handleOpenCreateGroupModal = () => {
    setEditingGroupId(null);
    // Pre-select first 3 items if available, or empty
    const initialSelected = items.slice(0, 3).map((it) => it.id).filter(Boolean) as string[];
    setGroupFormData({
      title: "",
      country: "United Kingdom",
      university: "All Universities",
      degree: "Bachelor / Undergraduate",
      description: "",
      selectedItemIds: initialSelected,
    });
    setGroupModalOpen(true);
  };

  const handleOpenEditGroupModal = (group: IChecklistPreset) => {
    setEditingGroupId(group.id);
    // Match item IDs with current library
    const matchedIds = group.items.map((gi) => {
      const foundInLibrary = items.find(
        (li) => li.id === gi.id || li.title.toLowerCase() === gi.title.toLowerCase()
      );
      return foundInLibrary?.id || gi.id;
    }).filter(Boolean) as string[];

    setGroupFormData({
      title: group.title,
      country: group.country || "All Countries",
      university: group.university || "All Universities",
      degree: group.degree || "All Degrees",
      description: group.description || "",
      selectedItemIds: matchedIds,
    });
    setGroupModalOpen(true);
  };

  const toggleItemSelection = (itemId: string) => {
    setGroupFormData((prev) => {
      const exists = prev.selectedItemIds.includes(itemId);
      return {
        ...prev,
        selectedItemIds: exists
          ? prev.selectedItemIds.filter((id) => id !== itemId)
          : [...prev.selectedItemIds, itemId],
      };
    });
  };

  const handleSelectAllItems = () => {
    const allIds = items.map((i) => i.id).filter(Boolean) as string[];
    setGroupFormData((prev) => ({ ...prev, selectedItemIds: allIds }));
  };

  const handleDeselectAllItems = () => {
    setGroupFormData((prev) => ({ ...prev, selectedItemIds: [] }));
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupFormData.title.trim()) {
      showToast("error", "Please provide a checklist group name!");
      return;
    }
    if (groupFormData.selectedItemIds.length === 0) {
      showToast("error", "Please select at least one document requirement for this group!");
      return;
    }

    // Build items payload from selected IDs
    const selectedDocuments = groupFormData.selectedItemIds
      .map((id) => items.find((it) => it.id === id))
      .filter(Boolean)
      .map((it: any) => ({
        id: it.id,
        title: it.title,
        instruction: it.instruction || "Upload requested document.",
        isRequired: it.isRequired !== false,
        category: it.category || "General",
      }));

    try {
      setSavingGroup(true);
      if (editingGroupId) {
        await higherStudyService.updateChecklistPreset(editingGroupId, {
          title: groupFormData.title.trim(),
          country: groupFormData.country,
          university: groupFormData.university,
          degree: groupFormData.degree,
          description: groupFormData.description.trim(),
          items: selectedDocuments,
        });
        showToast("success", "Checklist group updated successfully!");
      } else {
        await higherStudyService.createChecklistPreset({
          title: groupFormData.title.trim(),
          country: groupFormData.country,
          university: groupFormData.university,
          degree: groupFormData.degree,
          description: groupFormData.description.trim(),
          category: groupFormData.country,
          items: selectedDocuments,
        });
        showToast("success", "New checklist group created successfully!");
      }

      setGroupModalOpen(false);
      // Refresh presets
      const res = await higherStudyService.getChecklistPresets();
      if (res && res.data) setPresets(res.data);
    } catch (err: any) {
      console.error("Failed to save checklist group:", err);
      showToast("error", err?.response?.data?.message || "Failed to save checklist group");
    } finally {
      setSavingGroup(false);
    }
  };

  // ==================== DELETE HANDLERS ====================
  const handleOpenDelete = (type: "GROUP" | "ITEM", id: string, name: string) => {
    setTargetToDelete({ type, id, name });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetToDelete) return;
    try {
      setDeleting(true);
      if (targetToDelete.type === "GROUP") {
        await higherStudyService.deleteChecklistPreset(targetToDelete.id);
        showToast("success", `Group "${targetToDelete.name}" deleted successfully!`);
        const res = await higherStudyService.getChecklistPresets();
        if (res && res.data) setPresets(res.data);
      } else {
        await higherStudyService.deleteChecklistItem(targetToDelete.id);
        showToast("success", `Item "${targetToDelete.name}" deleted successfully!`);
        const res = await higherStudyService.getChecklistItems();
        if (res && res.data) setItems(res.data);
      }
      setDeleteModalOpen(false);
      setTargetToDelete(null);
    } catch (err: any) {
      console.error("Failed to delete:", err);
      showToast("error", err?.response?.data?.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  // Filter groups
  const filteredPresets = presets.filter((p) => {
    const matchesCountry = selectedCountry === "ALL" || p.country === selectedCountry;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      (p.country && p.country.toLowerCase().includes(q)) ||
      (p.university && p.university.toLowerCase().includes(q)) ||
      (p.degree && p.degree.toLowerCase().includes(q)) ||
      p.items.some((it) => it.title.toLowerCase().includes(q));
    return matchesCountry && matchesSearch;
  });

  // Filter items
  const filteredItems = items.filter((it) => {
    const q = searchQuery.toLowerCase();
    return !q || it.title.toLowerCase().includes(q) || (it.instruction && it.instruction.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Floating Side Toast Notification (Zero layout space / shift, auto-hides in 4s) */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 right-4 sm:right-8 z-[9999] max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto p-4 rounded-2xl bg-slate-900/95 border backdrop-blur-xl shadow-2xl flex items-start gap-3.5 animate-in fade-in slide-in-from-top-3 sm:slide-in-from-right-4 duration-300"
          style={{
            borderColor: toast.type === "success" ? "rgba(16, 185, 129, 0.45)" : "rgba(244, 63, 94, 0.45)",
            boxShadow: toast.type === "success"
              ? "0 20px 40px -15px rgba(5, 150, 105, 0.45), 0 0 20px rgba(16, 185, 129, 0.15)"
              : "0 20px 40px -15px rgba(225, 29, 72, 0.45), 0 0 20px rgba(244, 63, 94, 0.15)",
          }}
        >
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border shadow-sm ${
            toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-emerald-500/20"
              : "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-rose-500/20"
          }`}>
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <h5 className="font-bold text-xs text-white tracking-wide">
              {toast.type === "success" ? "Action Completed" : "Notification"}
            </h5>
            <p className="text-[12px] text-slate-300 mt-0.5 leading-relaxed break-words font-medium">
              {toast.message}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0 mt-0.5"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP CONTROL BAR (Clean: View Switcher + Action Buttons, No Big Header, No Refresh Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setMainView("GROUPS")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              mainView === "GROUPS"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Checklist Groups</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              mainView === "GROUPS" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
            }`}>
              {presets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainView("ITEMS")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              mainView === "ITEMS"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Checklist Items</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              mainView === "ITEMS" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
            }`}>
              {items.length}
            </span>
          </button>
        </div>

        {/* Action Buttons: Create Checklist (Single item) & Create Group */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenCreateItemModal}
            className="border-slate-700/80 hover:border-blue-500/50 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Create Checklist</span>
          </Button>

          <Button
            variant="gradient"
            size="sm"
            onClick={handleOpenCreateGroupModal}
            className="text-xs font-semibold gap-1.5 cursor-pointer shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Group</span>
          </Button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW 1: CHECKLIST GROUPS VIEW                            */}
      {/* ======================================================== */}
      {mainView === "GROUPS" && (
        <div className="space-y-4">
          {/* Search & Dynamic Country Filter Pills */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search groups, university, degree..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Dynamic country filter pills based on created groups */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {dynamicCountries.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCountry(c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCountry === c
                      ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40 border border-blue-500/50"
                      : "bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/80"
                  }`}
                >
                  {c === "ALL" ? "All Groups" : c}
                </button>
              ))}
            </div>
          </div>

          {/* Groups Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredPresets.length === 0 ? (
            <Card className="p-10 text-center bg-slate-900/40 border-slate-800/80">
              <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-white">No checklist groups found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {searchQuery || selectedCountry !== "ALL"
                  ? "No groups match your current filter. Try selecting 'All Groups' or clearing your search."
                  : "You haven't created any checklist groups yet. Click 'Create Group' above to group requirements by country, university, and degree."}
              </p>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleOpenCreateGroupModal}
                className="mt-4 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Group</span>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPresets.map((group) => {
                const isExpanded = expandedGroupId === group.id;
                const visibleDocs = isExpanded ? group.items : group.items.slice(0, 3);
                const hasMore = group.items.length > 3;

                return (
                  <div
                    key={group.id}
                    className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-slate-700/80 hover:bg-slate-900/90 transition-all shadow-lg overflow-hidden group"
                  >
                    {/* Card Header: Country & Degree Badges */}
                    <div className="p-4 pb-3 border-b border-slate-800/60 flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                            <Globe className="w-2.5 h-2.5" />
                            <span>{group.country || "All Countries"}</span>
                          </span>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                            <GraduationCap className="w-2.5 h-2.5" />
                            <span>{group.degree || "All Degrees"}</span>
                          </span>
                        </div>

                        {group.university && group.university !== "All Universities" && (
                          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 truncate pt-0.5">
                            <Building className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{group.university}</span>
                          </p>
                        )}
                      </div>

                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 shrink-0 border border-slate-700/60">
                        {group.items.length} Docs
                      </span>
                    </div>

                    {/* Group Title & Details */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="text-sm font-bold text-white tracking-tight mb-1">
                        {group.title}
                      </h4>
                      {group.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                          {group.description}
                        </p>
                      )}

                      {/* Documents List Preview */}
                      <div className="mt-2 space-y-2 flex-1">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Required Documents ({group.items.length})
                        </div>

                        <div className="space-y-1.5">
                          {visibleDocs.map((doc, idx) => (
                            <div
                              key={doc.id || idx}
                              className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-0.5 text-xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                                  <FileText className="w-3 h-3 text-blue-400 shrink-0" />
                                  <span className="truncate">{doc.title}</span>
                                </span>
                                {doc.isRequired ? (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
                                    REQUIRED
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-400 shrink-0">
                                    OPTIONAL
                                  </span>
                                )}
                              </div>
                              {doc.instruction && (
                                <p className="text-[11px] text-slate-400 pl-4.5 line-clamp-1 leading-tight">
                                  {doc.instruction}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {hasMore && (
                          <button
                            type="button"
                            onClick={() => setExpandedGroupId(isExpanded ? null : group.id)}
                            className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 pt-1 cursor-pointer"
                          >
                            <span>{isExpanded ? "Show Less" : `+ View ${group.items.length - 3} more items`}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions: Edit & Delete */}
                    <div className="p-3 bg-slate-950/60 border-t border-slate-800/70 flex items-center justify-between gap-2">
                      {onAssignToApp ? (
                        <button
                          type="button"
                          onClick={() => onAssignToApp(group)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FolderCheck className="w-3.5 h-3.5" />
                          <span>Apply to Student</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">ID: {group.id.slice(0, 10)}</span>
                      )}

                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          type="button"
                          onClick={() => handleOpenEditGroupModal(group)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="Edit group"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDelete("GROUP", group.id, group.title)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VIEW 2: INDIVIDUAL CHECKLIST ITEMS VIEW (All Checklists) */}
      {/* ======================================================== */}
      {mainView === "ITEMS" && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search checklist document titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Showing <strong>{filteredItems.length}</strong> checklist documents in library
            </div>
          </div>

          {/* Items Grid */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-16 rounded-xl bg-slate-900/40 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <Card className="p-10 text-center bg-slate-900/40 border-slate-800/80">
              <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-white">No checklist items found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                {searchQuery
                  ? "No documents match your search term. Try a different query."
                  : "You haven't created any checklist items yet. Click 'Create Checklist' above to add documents like Passport, Academic Certificates, etc."}
              </p>
              <Button
                variant="gradient"
                size="sm"
                onClick={handleOpenCreateItemModal}
                className="mt-4 gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Checklist</span>
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredItems.map((item) => {
                // Count how many groups use this item
                const usedInGroupsCount = presets.filter((g) =>
                  g.items.some((gi) => gi.id === item.id || gi.title.toLowerCase() === item.title.toLowerCase())
                ).length;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/70 hover:border-slate-700/80 hover:bg-slate-900/90 transition-all flex items-start justify-between gap-3 shadow-md group"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{item.title}</span>
                        </span>
                        {item.isRequired ? (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0">
                            REQUIRED
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-slate-400 shrink-0">
                            OPTIONAL
                          </span>
                        )}
                        {usedInGroupsCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                            In {usedInGroupsCount} {usedInGroupsCount === 1 ? "group" : "groups"}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed pl-5">
                        {item.instruction || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditItemModal(item)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Edit checklist item"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenDelete("ITEM", item.id!, item.title)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete checklist item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: CREATE / EDIT CHECKLIST ITEM (Single Document)  */}
      {/* ======================================================== */}
      {itemModalOpen && (
        <Modal
          isOpen={itemModalOpen}
          onClose={() => setItemModalOpen(false)}
          title={editingItemId ? "Edit Checklist Document" : "Create Checklist Document"}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveItem} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Document Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={itemFormData.title}
                onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                placeholder="e.g. Upload your Passport, Academic Transcripts & Certificates..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Small Description / Instructions
              </label>
              <textarea
                rows={3}
                value={itemFormData.instruction}
                onChange={(e) => setItemFormData({ ...itemFormData, instruction: e.target.value })}
                placeholder="e.g. তোমার পাসপোর্টের প্রথম ও শেষ পাতার রঙিন স্ক্যান কপি আপলোড করো..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-500">
                This description will appear directly below the document title in the student checklist.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={itemFormData.isRequired}
                  onChange={(e) => setItemFormData({ ...itemFormData, isRequired: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold">Mark as Mandatory (Required Document)</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/80">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setItemModalOpen(false)}
                disabled={savingItem}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={savingItem}
                className="gap-1.5"
              >
                {savingItem ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingItemId ? "Update Document" : "Save Document"}</span>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CREATE / EDIT CHECKLIST GROUP (Country + Items) */}
      {/* ======================================================== */}
      {groupModalOpen && (
        <Modal
          isOpen={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          title={editingGroupId ? "Edit Checklist Group" : "Create Checklist Group"}
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveGroup} className="space-y-4 pt-2">
            {/* Group Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Checklist Group Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={groupFormData.title}
                onChange={(e) => setGroupFormData({ ...groupFormData, title: e.target.value })}
                placeholder="e.g. UK Undergraduate Admission, Canada SDS Master Dossier..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            {/* Country & University Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>Target Country</span>
                </label>
                <select
                  value={groupFormData.country}
                  onChange={(e) => setGroupFormData({ ...groupFormData, country: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {availableCountries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  <span>Target University</span>
                </label>
                <select
                  value={groupFormData.university}
                  onChange={(e) => setGroupFormData({ ...groupFormData, university: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="All Universities">All Universities (General for Country)</option>
                  {universities.map((u) => (
                    <option key={u.id} value={u.name}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Degree Selection & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Degree / Study Level</span>
                </label>
                <select
                  value={groupFormData.degree}
                  onChange={(e) => setGroupFormData({ ...groupFormData, degree: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {degreeOptions.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block">
                  Short Description (Optional)
                </label>
                <input
                  type="text"
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                  placeholder="e.g. Standard admission bundle for international students..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Documents Selection Area */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-white block">
                    Select Documents To Include in This Group <span className="text-rose-400">*</span>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Check the documents that students applying to this group must submit.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={handleSelectAllItems}
                    className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">|</span>
                  <button
                    type="button"
                    onClick={handleDeselectAllItems}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Items Checkbox List */}
              <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 rounded-xl p-2 bg-slate-950/80 border border-slate-800">
                {items.length === 0 ? (
                  <p className="text-xs text-slate-500 p-3 text-center">
                    No documents created in library yet. Save this group and click 'Create Checklist' to add documents.
                  </p>
                ) : (
                  items.map((it) => {
                    const isChecked = groupFormData.selectedItemIds.includes(it.id || "");
                    return (
                      <label
                        key={it.id}
                        onClick={() => toggleItemSelection(it.id || "")}
                        className={`p-2.5 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                          isChecked
                            ? "bg-blue-600/15 border-blue-500/40 text-white"
                            : "bg-slate-900/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/60"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                          isChecked
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "border-slate-700 bg-slate-950"
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-xs text-white truncate">
                              {it.title}
                            </span>
                            {it.isRequired && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/15 text-rose-400 shrink-0">
                                REQUIRED
                              </span>
                            )}
                          </div>
                          {it.instruction && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {it.instruction}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>Selected: <strong className="text-white">{groupFormData.selectedItemIds.length}</strong> documents</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800/80">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setGroupModalOpen(false)}
                disabled={savingGroup}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="sm"
                type="submit"
                disabled={savingGroup}
                className="gap-1.5"
              >
                {savingGroup ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingGroupId ? "Update Group" : "Create Group"}</span>
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ======================================================== */}
      {/* DELETE CONFIRMATION MODAL (For both Group and Item)      */}
      {/* ======================================================== */}
      {deleteModalOpen && targetToDelete && (
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title={`Delete ${targetToDelete.type === "GROUP" ? "Checklist Group" : "Checklist Item"}`}
          maxWidth="md"
        >
          <div className="space-y-4 pt-2">
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">
                  Are you sure you want to delete "{targetToDelete.name}"?
                </p>
                <p className="mt-1 text-slate-400 text-[11px]">
                  {targetToDelete.type === "GROUP"
                    ? "This checklist group will be permanently removed. Any applicant who already had documents assigned will retain their documents."
                    : "This document item will be removed from the checklist library."}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
