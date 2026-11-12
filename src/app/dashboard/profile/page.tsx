"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { Button } from "@/components/ui/Button";
import { RoleBadge } from "@/components/common/RoleBadge";
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Camera, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Save, 
  KeyRound, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Calendar,
  Layers
} from "lucide-react";

const COUNTRY_CODES = [
  { code: "+971", short: "AE", country: "UAE", placeholder: "e.g. 501234567", minLength: 9, maxLength: 9 },
  { code: "+61", short: "AU", country: "Australia", placeholder: "e.g. 412345678", minLength: 9, maxLength: 9 },
  { code: "+880", short: "BD", country: "Bangladesh", placeholder: "e.g. 1712345678", minLength: 10, maxLength: 10 },
  { code: "+1", short: "CA", country: "Canada", placeholder: "e.g. 4165550123", minLength: 10, maxLength: 10 },
  { code: "+357", short: "CY", country: "Cyprus", placeholder: "e.g. 99123456", minLength: 8, maxLength: 8 },
  { code: "+49", short: "DE", country: "Germany", placeholder: "e.g. 15123456789", minLength: 10, maxLength: 11 },
  { code: "+33", short: "FR", country: "France", placeholder: "e.g. 612345678", minLength: 9, maxLength: 9 },
  { code: "+91", short: "IN", country: "India", placeholder: "e.g. 9812345678", minLength: 10, maxLength: 10 },
  { code: "+39", short: "IT", country: "Italy", placeholder: "e.g. 3123456789", minLength: 10, maxLength: 10 },
  { code: "+81", short: "JP", country: "Japan", placeholder: "e.g. 9012345678", minLength: 10, maxLength: 10 },
  { code: "+82", short: "KR", country: "South Korea", placeholder: "e.g. 1012345678", minLength: 9, maxLength: 10 },
  { code: "+60", short: "MY", country: "Malaysia", placeholder: "e.g. 123456789", minLength: 9, maxLength: 10 },
  { code: "+31", short: "NL", country: "Netherlands", placeholder: "e.g. 612345678", minLength: 9, maxLength: 9 },
  { code: "+966", short: "SA", country: "Saudi Arabia", placeholder: "e.g. 512345678", minLength: 9, maxLength: 9 },
  { code: "+46", short: "SE", country: "Sweden", placeholder: "e.g. 701234567", minLength: 9, maxLength: 9 },
  { code: "+44", short: "UK", country: "United Kingdom", placeholder: "e.g. 7911123456", minLength: 10, maxLength: 10 },
  { code: "+1", short: "US", country: "United States", placeholder: "e.g. 2025550123", minLength: 10, maxLength: 10 },
];

export function AccountSettingsModule({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, updateUser, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<"PROFILE" | "SECURITY">("PROFILE");

  // Profile Form State
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("+880");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneValidationError, setPhoneValidationError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Password Change State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Validate phone number based on selected country
  const validatePhone = (num: string, code: string): { isValid: boolean; message?: string } => {
    const cleaned = num.trim();
    if (!cleaned) return { isValid: true }; // Allowed to be empty if not provided yet

    if (code === "+880") {
      // BD numbers must be 10 digits starting with 13-19
      if (!/^1[3-9]\d{8}$/.test(cleaned)) {
        if (cleaned.length !== 10) {
          return { isValid: false, message: `BD numbers must be 10 digits (currently ${cleaned.length})` };
        }
        return { isValid: false, message: "BD numbers must start with 1 followed by 3-9 (e.g. 17...)" };
      }
      return { isValid: true };
    }

    const conf = COUNTRY_CODES.find((c) => c.code === code);
    const min = conf?.minLength || 7;
    const max = conf?.maxLength || 12;

    if (cleaned.length < min || cleaned.length > max) {
      return { isValid: false, message: `Number must be between ${min} and ${max} digits for ${code}` };
    }

    if (!/^\d+$/.test(cleaned)) {
      return { isValid: false, message: "Only numeric digits allowed" };
    }

    return { isValid: true };
  };

  // Smart input handler with country code auto-strip
  const handlePhoneChange = (inputVal: string) => {
    let cleaned = inputVal.replace(/[^\d+]/g, "");

    // Check if user pasted/typed with +code
    if (cleaned.startsWith("+")) {
      const foundCountry = COUNTRY_CODES.find((c) => cleaned.startsWith(c.code));
      if (foundCountry) {
        setCountryCode(foundCountry.code);
        cleaned = cleaned.slice(foundCountry.code.length);
      } else {
        cleaned = cleaned.replace(/^\+/, "");
      }
    } else if (cleaned.startsWith("880") && cleaned.length > 10) {
      // User typed 880 without +
      cleaned = cleaned.slice(3);
      setCountryCode("+880");
    }

    // Strip leading 0 if BD
    if (countryCode === "+880" && cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }

    cleaned = cleaned.replace(/\D/g, "");

    const conf = COUNTRY_CODES.find((c) => c.code === countryCode);
    const max = conf?.maxLength || 12;
    if (cleaned.length > max) {
      cleaned = cleaned.slice(0, max);
    }

    setPhoneNumber(cleaned);

    const validation = validatePhone(cleaned, countryCode);
    if (!validation.isValid && cleaned.length > 0) {
      setPhoneValidationError(validation.message || "Invalid phone number format");
    } else {
      setPhoneValidationError(null);
    }
  };

  const activeCountryConfig = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  const parseAndApplyUserData = (data: any) => {
    if (!data) return;
    if (data.name) setName(data.name);
    const phone =
      data.contactNumber ||
      data.contactNo ||
      data.student?.contactNumber ||
      data.counselor?.contactNumber ||
      "";
    if (phone) {
      const matched = COUNTRY_CODES.find((c) => phone.startsWith(c.code));
      if (matched) {
        setCountryCode(matched.code);
        const rawNum = phone.slice(matched.code.length).trim();
        setPhoneNumber(rawNum);
      } else if (phone.startsWith("+")) {
        const parts = phone.split(" ");
        if (parts.length > 1) {
          setCountryCode(parts[0]);
          setPhoneNumber(parts.slice(1).join("").trim());
        } else {
          setPhoneNumber(phone.trim());
        }
      } else {
        setCountryCode("+880");
        setPhoneNumber(phone.startsWith("0") ? phone.slice(1) : phone);
      }
    } else {
      // Auto-detect visitor's country code based on system timezone if not already set
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (tz.includes("Dhaka")) setCountryCode("+880");
        else if (tz.includes("London")) setCountryCode("+44");
        else if (tz.includes("New_York") || tz.includes("Chicago") || tz.includes("Los_Angeles")) setCountryCode("+1");
        else if (tz.includes("Toronto") || tz.includes("Vancouver")) setCountryCode("+1");
        else if (tz.includes("Sydney") || tz.includes("Melbourne") || tz.includes("Brisbane")) setCountryCode("+61");
        else if (tz.includes("Kuala_Lumpur")) setCountryCode("+60");
        else if (tz.includes("Berlin") || tz.includes("Frankfurt")) setCountryCode("+49");
        else if (tz.includes("Dubai")) setCountryCode("+971");
        else if (tz.includes("Kolkata") || tz.includes("Calcutta")) setCountryCode("+91");
        else if (tz.includes("Riyadh")) setCountryCode("+966");
        else if (tz.includes("Tokyo")) setCountryCode("+81");
        else if (tz.includes("Seoul")) setCountryCode("+82");
        else if (tz.includes("Paris")) setCountryCode("+33");
        else if (tz.includes("Rome")) setCountryCode("+39");
        else if (tz.includes("Stockholm")) setCountryCode("+46");
        else if (tz.includes("Amsterdam")) setCountryCode("+31");
        else if (tz.includes("Nicosia")) setCountryCode("+357");
      } catch (e) {
        // Keep +880 default
      }
    }
    if (data.imageUrl) {
      setAvatarPreview(data.imageUrl);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login?redirect=/dashboard/profile");
      return;
    }

    // Direct fetch live profile data from database on mount
    const fetchDbProfile = async () => {
      try {
        const res = await userService.getMe();
        const dbUser = res.data || res;
        if (dbUser && dbUser.id) {
          updateUser(dbUser);
          parseAndApplyUserData(dbUser);
        }
      } catch (err) {
        console.error("Failed to load profile directly from database:", err);
      }
    };

    if (isAuthenticated) {
      fetchDbProfile();
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      parseAndApplyUserData(user);
    }
  }, [user]);

  // Handle Avatar Image Selection & Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Image size must be less than 5MB");
      return;
    }

    // Local preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploadingAvatar(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await userService.updateProfileImage(formData);
      
      const updatedUrl = res.data?.imageUrl || res.imageUrl;
      if (updatedUrl) {
        updateUser({ imageUrl: updatedUrl });
        setAvatarPreview(updatedUrl);
      }
      if (refreshUser) {
        await refreshUser();
      }
      setProfileSuccess("Profile picture updated successfully!");
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      setProfileError(err.response?.data?.message || "Failed to upload avatar image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handle Profile Information Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    // Validate phone number if entered
    if (phoneNumber.trim()) {
      const validation = validatePhone(phoneNumber, countryCode);
      if (!validation.isValid) {
        setProfileError(validation.message || "Please provide a valid phone number before saving.");
        setProfileSaving(false);
        return;
      }
    }

    try {
      const fullPhone = phoneNumber.trim() ? `${countryCode} ${phoneNumber.trim()}` : "";
      const payload: { name?: string; contactNumber?: string } = {
        name: name.trim(),
        contactNumber: fullPhone,
      };

      const res = await userService.updateMe(payload);
      const updatedUser = res.data || res;
      
      // Update global auth context and local state
      updateUser({
        name: name.trim(),
        contactNumber: fullPhone,
        ...(updatedUser && typeof updatedUser === "object" ? updatedUser : {}),
      });

      if (refreshUser) {
        await refreshUser();
      }

      setProfileSuccess("Personal details updated successfully!");
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setProfileError(err.response?.data?.message || "Failed to update profile information");
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      setPasswordSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      setPasswordSaving(false);
      return;
    }

    try {
      await userService.changePassword({
        oldPassword,
        newPassword,
      });

      setPasswordSuccess("Password changed successfully! Keep it secure.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Password change failed:", err);
      setPasswordError(err.response?.data?.message || "Failed to change password. Please verify your current password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-3 w-28 bg-slate-800/80 rounded" />
              <div className="h-8 w-52 bg-slate-800/80 rounded-lg" />
              <div className="h-3.5 w-72 bg-slate-800/60 rounded" />
            </div>
            <div className="h-7 w-24 bg-slate-800/80 rounded-full" />
          </div>

          {/* User Card Overview Skeleton */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-slate-800/80 shrink-0" />
            <div className="space-y-2.5 flex-1 w-full">
              <div className="h-5 w-40 bg-slate-800/80 rounded" />
              <div className="h-3.5 w-56 bg-slate-800/60 rounded" />
              <div className="h-6 w-24 bg-slate-800/60 rounded-full mt-2" />
            </div>
          </div>

          {/* Tabs and Form Card Skeleton */}
          <div className="h-10 w-64 bg-slate-900/80 rounded-xl" />
          <div className="h-80 bg-slate-900/60 border border-slate-800/80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "text-slate-100 pb-8 w-full" : "min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 page-transition"}>
      <div className={embedded ? "w-full max-w-5xl mx-auto space-y-6 pt-1" : "max-w-4xl mx-auto space-y-8"}>
        {/* Navigation & Header */}
        {!embedded && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link 
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors mb-2 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span>Back to Dashboard</span>
              </Link>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Settings
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Manage your personal credentials, contact info, security, and profile photo.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <RoleBadge role={user.role} />
            </div>
          </div>
        )}

        {/* User Card Overview */}
        <div className="glass-panel bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 relative z-10">
            {/* Avatar & Upload Trigger */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 ring-4 ring-blue-500/30 flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl shadow-xl">
                {avatarPreview || user.imageUrl ? (
                  <img 
                    src={avatarPreview || user.imageUrl} 
                    alt={name || user.name || "User"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{(name || user.name)?.charAt(0)?.toUpperCase() || "U"}</span>
                )}
              </div>

              {/* Upload Button overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                title="Change Profile Picture"
                className="absolute inset-0 rounded-full bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-xs font-semibold backdrop-blur-xs cursor-pointer"
              >
                {uploadingAvatar ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-white" />
                    <span>Change</span>
                  </>
                )}
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Profile Info Summary */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{name || user.name}</h2>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-center sm:self-auto">
                  Active
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-300 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>{user.email}</span>
              </p>
              <div className="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Role: <strong className="text-slate-200">{user.role}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  ID: <span className="font-mono text-slate-300">{user.id?.slice(0, 10)}...</span>
                </span>
              </div>
            </div>

            {/* Change photo button */}
            <Button
              variant="outline"
              size="md"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="gap-2 shrink-0 border-slate-700 hover:border-blue-500 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-blue-400" />
              <span>{uploadingAvatar ? "Uploading..." : "Upload Photo"}</span>
            </Button>
          </div>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex items-center justify-center sm:justify-start border-b border-slate-800 gap-6">
          <button
            onClick={() => setActiveTab("PROFILE")}
            className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
              activeTab === "PROFILE"
                ? "text-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
            {activeTab === "PROFILE" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-sm shadow-blue-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("SECURITY")}
            className={`pb-3 text-sm font-semibold transition-colors relative flex items-center gap-2 ${
              activeTab === "SECURITY"
                ? "text-blue-400"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Password & Security</span>
            {activeTab === "SECURITY" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 shadow-sm shadow-blue-500" />
            )}
          </button>
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === "PROFILE" && (
          <div className="glass-panel bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Personal Information</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Update your public profile display name and contact phone number.
              </p>
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Email Address
                    </label>
                    <span className="text-[10px] text-slate-400">Fixed</span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full bg-slate-950/60 border border-slate-800/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Contact Phone Number (col-span-1, compact and balanced) */}
                <div className="space-y-1.5 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Contact Phone Number
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Current: <strong className="text-blue-400">{phoneNumber ? `${countryCode} ${phoneNumber}` : "Not set"}</strong>
                    </span>
                  </div>

                  <div className={`flex rounded-xl overflow-hidden border bg-slate-950 transition-all ${
                    phoneValidationError 
                      ? "border-rose-500/80 focus-within:ring-1 focus-within:ring-rose-500/40" 
                      : "border-slate-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/30"
                  }`}>
                    {/* Country Code Select */}
                    <select
                      value={countryCode}
                      onChange={(e) => {
                        setCountryCode(e.target.value);
                        const validation = validatePhone(phoneNumber, e.target.value);
                        if (!validation.isValid && phoneNumber.length > 0) {
                          setPhoneValidationError(validation.message || "Invalid format");
                        } else {
                          setPhoneValidationError(null);
                        }
                      }}
                      className="bg-slate-900 border-r border-slate-800 text-xs text-slate-200 px-2.5 py-2.5 focus:outline-none cursor-pointer hover:bg-slate-800/80 transition-colors shrink-0 font-mono"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option
                          key={`${c.code}-${c.short}`}
                          value={c.code}
                          className="bg-slate-900 text-slate-100 py-1 font-sans"
                        >
                          {c.short} ({c.code})
                        </option>
                      ))}
                    </select>

                    {/* Local Mobile Number */}
                    <div className="relative flex-1 min-w-0">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder={activeCountryConfig.placeholder}
                        className="w-full bg-transparent pl-8 pr-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Validation & Feedback helper */}
                  {phoneValidationError ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-400 pt-0.5">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{phoneValidationError}</span>
                    </div>
                  ) : phoneNumber.length > 0 ? (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Valid: <strong className="font-mono">{countryCode} {phoneNumber}</strong></span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Auto-formatted</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500 pt-0.5">
                      Country code is already selected on the left. Enter mobile digits only.
                    </p>
                  )}
                </div>

                {/* Account Role & System Status (col-span-1, completes the balanced 2x2 grid) */}
                <div className="space-y-1.5 sm:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Account Status & Role
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">Verified</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs h-[42px]">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-slate-300 font-medium truncate">System Role</span>
                    </div>
                    <RoleBadge role={user.role} />
                  </div>

                  <p className="text-[11px] text-slate-500 pt-0.5">
                    Official platform permissions assigned to your user account.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={profileSaving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileSaving ? "Saving..." : "Save Changes"}</span>
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Password & Security */}
        {activeTab === "SECURITY" && (
          <div className="glass-panel bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">Change Password</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ensure your account is protected with a strong, distinct password.
              </p>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5 max-w-lg">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Current Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showOldPassword ? "text" : "password"}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Confirm New Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={passwordSaving}
                  className="gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{passwordSaving ? "Updating..." : "Update Password"}</span>
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountSettingsPage() {
  return <AccountSettingsModule embedded={false} />;
}
