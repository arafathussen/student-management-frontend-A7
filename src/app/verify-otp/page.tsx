"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { GraduationCap, ShieldCheck, ArrowRight, RotateCw, AlertCircle, CheckCircle2 } from "lucide-react";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [countdown, setCountdown] = useState<number>(120);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const queryEmail = searchParams.get("email") || (typeof window !== "undefined" ? sessionStorage.getItem("verify_email") : "") || "";
    setEmail(queryEmail);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [searchParams]);

  useEffect(() => {
    if (countdown > 0 && !isVerified) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, isVerified]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto move to next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const digits = pasteData.split("");
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    if (!email) {
      setError("Email address is missing. Please restart registration.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await verifyOtp(email, fullOtp);
      setIsVerified(true);
      setCountdown(0);
      setSuccess("Your verification code is correct!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1600);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Invalid verification code. Please check and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    try {
      setResending(true);
      setError(null);
      await authService.resendOtp({ email });
      setSuccess("A fresh verification code has been dispatched to your Gmail!");
      setCountdown(120);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend code. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center relative px-4 py-6">
      {/* Ambient glowing auras matching login page */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in duration-300">
        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
          {isVerified ? (
            /* Animated Verification Success State */
            <div className="p-8 text-center space-y-6 animate-in zoom-in-95 duration-400">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 border border-emerald-400/40">
                  <CheckCircle2 className="w-10 h-10 animate-in zoom-in duration-300" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <span>Code Verified</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Your verification code is correct!
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Account successfully activated. Welcome to Rise Abroad Education!
                </p>
              </div>

              {/* Animated Progress & Rotating Redirect Indicator */}
              <div className="pt-2 flex flex-col items-center justify-center gap-3">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-blue-400 font-medium shadow-inner">
                  <RotateCw className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Redirecting to your dashboard...</span>
                </div>
                <div className="w-36 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <CardHeader className="space-y-1.5 pb-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mx-auto mb-1.5 shadow-md shadow-blue-950/40">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-white">
                  Verify Your Account
                </CardTitle>
                <CardDescription className="text-xs text-slate-400 leading-relaxed">
                  We sent a 6-digit verification code to{" "}
                  <span className="text-blue-300 font-semibold break-all">{email || "your email"}</span>
                </CardDescription>
                <p className="text-[11px] text-slate-500 pt-0.5">
                  Check your Gmail inbox or spam folder (code valid for 10 minutes)
                </p>
              </CardHeader>

              <CardContent className="space-y-5 pt-1">
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in duration-200">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-400 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex justify-between items-center gap-2" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          inputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-11 sm:w-12 h-13 sm:h-14 text-center text-xl sm:text-2xl font-bold bg-slate-950 border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full h-11 text-sm font-semibold shadow-lg shadow-blue-600/20 cursor-pointer"
                    isLoading={loading}
                  >
                    <span>Verify & Activate Account</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </form>

                {/* Resend Cooldown Section: Accurate countdown and NO confusing "Code expired" text */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    {countdown > 0 ? (
                      <>Resend code in: <span className="text-slate-200 font-mono font-medium">{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}</span></>
                    ) : (
                      <span className="text-slate-300 font-medium">Didn't receive code?</span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || countdown > 0}
                    className="font-semibold text-blue-400 hover:text-blue-300 disabled:text-slate-600 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
                    <span>Resend Code</span>
                  </button>
                </div>
              </CardContent>

              <CardFooter className="flex justify-center border-t border-slate-800/80 py-3">
                <p className="text-xs text-slate-400">
                  Need to change your email?{" "}
                  <Link
                    href="/register"
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Back to Register
                  </Link>
                </p>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
