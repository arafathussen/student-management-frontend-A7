"use client";

import React, { useState, useEffect } from "react";
import { Phone, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { COUNTRY_CODES, detectUserCountry } from "@/utils/countryCodes";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";

interface PhoneOnboardingModalProps {
  isOpen: boolean;
  userName: string;
  userEmail: string;
  onSuccess: (savedPhone: string) => void;
  onLogout?: () => void;
}

export function PhoneOnboardingModal({
  isOpen,
  userName,
  userEmail,
  onSuccess,
  onLogout,
}: PhoneOnboardingModalProps) {
  const { updateUser, logout } = useAuth();
  const [selectedShort, setSelectedShort] = useState("BD");
  const [countryCode, setCountryCode] = useState("+880");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detected = detectUserCountry();
    if (detected) {
      setSelectedShort(detected.short);
      setCountryCode(detected.code);
    }
  }, []);

  if (!isOpen) return null;

  const activeCountry =
    COUNTRY_CODES.find((c) => c.short === selectedShort) ||
    COUNTRY_CODES.find((c) => c.code === countryCode) ||
    COUNTRY_CODES[7];

  const handlePhoneChange = (inputVal: string) => {
    let cleaned = inputVal.replace(/[^\d+]/g, "");

    // Check if user pasted/typed with +code
    if (cleaned.startsWith("+")) {
      const foundCountry = COUNTRY_CODES.find((c) => cleaned.startsWith(c.code));
      if (foundCountry) {
        setSelectedShort(foundCountry.short);
        setCountryCode(foundCountry.code);
        cleaned = cleaned.slice(foundCountry.code.length);
      } else {
        cleaned = cleaned.replace(/^\+/, "");
      }
    } else if (cleaned.startsWith("880") && cleaned.length > 10) {
      cleaned = cleaned.slice(3);
      setSelectedShort("BD");
      setCountryCode("+880");
    }

    // Keep all numeric digits (allows typing 0 without blocking)
    cleaned = cleaned.replace(/\D/g, "");

    const conf = COUNTRY_CODES.find((c) => c.short === selectedShort) || COUNTRY_CODES.find((c) => c.code === countryCode);
    const max = conf?.maxLength || 12;
    if (cleaned.length > max) {
      cleaned = cleaned.slice(0, max);
    }

    setPhone(cleaned);
  };

  const formatPreview = () => {
    if (!phone) return null;
    const raw = phone.startsWith("0") ? phone.slice(1) : phone;
    if (!raw) return `${countryCode} (0)`;
    if (countryCode === "+880") {
      if (raw.length <= 4) return `+880 ${raw}`;
      return `+880 ${raw.slice(0, 4)}-${raw.slice(4)}`;
    }
    return `${countryCode} ${raw}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanNumber = phone.startsWith("0") ? phone.slice(1) : phone;
    if (!cleanNumber || cleanNumber.length < 6) {
      setError("Please provide a valid active contact number (minimum 6 digits).");
      return;
    }

    const finalContactNo = `${countryCode}${cleanNumber}`;

    try {
      setLoading(true);
      await userService.updateMe({ contactNumber: finalContactNo });
      updateUser({ contactNumber: finalContactNo });
      onSuccess(finalContactNo);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Failed to update contact number. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Header Icon & Title */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Complete Your Student Profile
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Google sign-in verified! Please link your active mobile/WhatsApp number so admissions counselors can communicate application updates.
            </p>
          </div>

          {/* User Account Pill */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="truncate mr-2">
              <span className="text-slate-400 block text-[11px]">Connected Google Account</span>
              <span className="font-semibold text-slate-200 truncate block">
                {userName || "Student"} <span className="text-slate-500 font-normal">({userEmail})</span>
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Mobile / WhatsApp Number
                </label>
                {phone ? (
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-semibold animate-in fade-in duration-200">
                    <span>Preview:</span>
                    <strong>{formatPreview()}</strong>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">
                    e.g. 017... or 17...
                  </span>
                )}
              </div>

              <div className="flex rounded-xl overflow-hidden border border-slate-700 bg-slate-950 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/40 transition-all">
                {/* Country Selector */}
                <select
                  value={selectedShort}
                  onChange={(e) => {
                    const found = COUNTRY_CODES.find((c) => c.short === e.target.value);
                    if (found) {
                      setSelectedShort(found.short);
                      setCountryCode(found.code);
                      if (found.code === "+880" && phone.startsWith("0")) {
                        setPhone(phone.slice(1));
                      }
                    }
                  }}
                  className="bg-slate-900 border-r border-slate-800 text-xs text-slate-200 px-2.5 py-2.5 focus:outline-none cursor-pointer hover:bg-slate-800/80 transition-colors shrink-0 font-medium max-w-[155px]"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option
                      key={`${c.short}-${c.code}`}
                      value={c.short}
                      className="bg-slate-900 text-slate-100 py-1 font-sans"
                    >
                      {c.country} ({c.code})
                    </option>
                  ))}
                </select>

                {/* Phone Input */}
                <div className="relative flex-1 min-w-0">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder={activeCountry.placeholder}
                    className="w-full bg-transparent pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                    autoFocus
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-10 text-xs font-semibold cursor-pointer shadow-lg shadow-blue-600/20"
              isLoading={loading}
            >
              <span>Save & Continue to Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Switch Account / Logout */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  logout();
                }
              }}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cancel & Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
