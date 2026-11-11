"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, type LoginFormValues } from "@/validation/schemas";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { PhoneOnboardingModal } from "@/components/auth/PhoneOnboardingModal";
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Zap,
  Eye,
  EyeOff,
} from "lucide-react";

const DEMO_ACCOUNTS = [
  {
    roleLabel: "Admin",
    subtitle: "Super Admin Control",
    email: "admin@university.com",
    password: "AdminPassword123!",
    icon: ShieldCheck,
    accentClass:
      "border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300",
    badgeClass: "text-rose-400",
  },
  {
    roleLabel: "Counselor",
    subtitle: "Admissions Desk",
    email: "counselor@university.com",
    password: "Counselor123!",
    icon: Briefcase,
    accentClass:
      "border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300",
    badgeClass: "text-amber-400",
  },
  {
    roleLabel: "Student",
    subtitle: "Applicant Portal",
    email: "arafat.student@gmail.com",
    password: "Student123!",
    icon: GraduationCap,
    accentClass:
      "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300",
    badgeClass: "text-emerald-400",
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, login, googleLogin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Phone onboarding modal state for Google Sign-in users without contact number
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Auto redirect or prompt phone onboarding if already logged in
  useEffect(() => {
    document.title = "Login | Rise Abroad Education";
    if (isAuthenticated && user) {
      if (user.role === "STUDENT" && !user.contactNumber) {
        setShowPhoneModal(true);
      } else {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login(
        values.email.trim().toLowerCase(),
        values.password
      );
      toast.success(`Welcome back, ${loggedUser?.name || "User"}!`);
      if (loggedUser?.role === "STUDENT" && !loggedUser?.contactNumber) {
        setShowPhoneModal(true);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Invalid credentials or unverified account. Please verify email and password.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
      setActiveDemoRole(null);
    }
  };

  const handleOneClickDemoLogin = async (
    demoRole: string,
    demoEmail: string,
    demoPassword: string
  ) => {
    setError(null);
    setActiveDemoRole(demoRole);
    setValue("email", demoEmail, { shouldValidate: true });
    setValue("password", demoPassword, { shouldValidate: true });
    await onSubmit({ email: demoEmail, password: demoPassword });
  };

  const handleGoogleSuccess = async (credential: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await googleLogin(credential);
      const loggedUser = res?.data?.user || res?.user || user;
      toast.success("Signed in with Google successfully!");

      if (
        loggedUser &&
        !loggedUser.contactNumber &&
        loggedUser.role === "STUDENT"
      ) {
        setShowPhoneModal(true);
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Google authentication failed. Please try again or sign in with your email.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleGoogleError = (errorMsg: string) => {
    setError(errorMsg);
    toast.error(errorMsg);
  };

  const handlePhoneOnboardingSuccess = () => {
    setShowPhoneModal(false);
    router.push("/dashboard");
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center relative px-4 py-8">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Mandatory Phone Onboarding Modal */}
      {showPhoneModal && user && (
        <PhoneOnboardingModal
          isOpen={showPhoneModal}
          userName={user.name}
          userEmail={user.email}
          onSuccess={handlePhoneOnboardingSuccess}
        />
      )}

      <div className="w-full max-w-md relative z-10">
        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-xl font-bold tracking-tight text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Sign in to access your admissions &amp; management portal
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-0">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-3.5"
            >
              <div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-slate-300">Password</label>
                  <Link
                    href="/forgot-password"
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    icon={<Lock className="w-4 h-4" />}
                    error={errors.password?.message}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 h-10 text-xs font-semibold cursor-pointer shadow-lg shadow-blue-600/20"
                isLoading={loading && !activeDemoRole}
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            {/* Mandatory One-Click Demo Login Section (3 Roles) */}
            <div className="pt-2">
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <span className="relative px-3 bg-slate-900 text-[10px] text-blue-400 uppercase tracking-wider font-bold inline-flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Quick Demo Login (1-Click)</span>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((demo) => {
                  const Icon = demo.icon;
                  const isDemoLoading =
                    loading && activeDemoRole === demo.roleLabel;
                  return (
                    <button
                      key={demo.roleLabel}
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        handleOneClickDemoLogin(
                          demo.roleLabel,
                          demo.email,
                          demo.password
                        )
                      }
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${demo.accentClass}`}
                    >
                      <Icon className={`w-4 h-4 mb-1 ${demo.badgeClass}`} />
                      <span className="text-xs font-bold text-white">
                        {demo.roleLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 truncate max-w-full">
                        {isDemoLoading ? "Signing in..." : "Demo Login"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <span className="relative px-3 bg-slate-900 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Or continue with
              </span>
            </div>

            {/* Official Google Social Sign In with Real OAuth */}
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              isLoading={loading}
            />
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-800/80 pt-3 pb-3">
            <p className="text-xs text-slate-400">
              Don&apos;t have an applicant account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-400 hover:text-white transition-colors duration-200 cursor-pointer ml-1"
              >
                Register as Student
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
