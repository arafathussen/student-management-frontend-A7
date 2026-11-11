"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { registerSchema, type RegisterFormValues } from "@/validation/schemas";
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
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { COUNTRY_CODES, detectUserCountry } from "@/utils/countryCodes";

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, register: registerAccount } = useAuth();

  const [selectedShort, setSelectedShort] = useState("BD");
  const [countryCode, setCountryCode] = useState("+880");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Auto detect user country code on client mount
  useEffect(() => {
    const detected = detectUserCountry();
    if (detected) {
      setSelectedShort(detected.short);
      setCountryCode(detected.code);
    }
  }, []);

  // Auto redirect if already authenticated
  useEffect(() => {
    document.title = "Register | Rise Abroad Education";
    if (isAuthenticated && user) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handlePhoneChange = (inputVal: string) => {
    let cleaned = inputVal.replace(/[^\d+]/g, "");

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

    cleaned = cleaned.replace(/\D/g, "");

    const conf =
      COUNTRY_CODES.find((c) => c.short === selectedShort) ||
      COUNTRY_CODES.find((c) => c.code === countryCode);
    const max = conf?.maxLength || 12;
    if (cleaned.length > max) {
      cleaned = cleaned.slice(0, max);
    }

    setPhone(cleaned);
    setValue("phone", cleaned, { shouldValidate: true });
  };

  const activeCountry =
    COUNTRY_CODES.find((c) => c.short === selectedShort) ||
    COUNTRY_CODES.find((c) => c.code === countryCode) ||
    COUNTRY_CODES[7];

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

  const onSubmit = async (values: RegisterFormValues) => {
    setError(null);
    try {
      setLoading(true);
      const cleanNumber = values.phone.startsWith("0")
        ? values.phone.slice(1)
        : values.phone;
      const finalContactNo = cleanNumber ? `${countryCode}${cleanNumber}` : "";

      await registerAccount({
        name: values.name,
        email: values.email.trim().toLowerCase(),
        password: values.password,
        contactNo: finalContactNo,
      });

      toast.success("Account registered! Please verify your email OTP.");
      sessionStorage.setItem("verify_email", values.email.trim().toLowerCase());
      router.push(
        `/verify-otp?email=${encodeURIComponent(values.email.trim().toLowerCase())}`
      );
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Registration could not be completed. Please check your information.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || (isAuthenticated && user)) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-400 mx-auto" />
          <p className="text-xs text-slate-400">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center relative px-4 py-6">
      {/* Background glows */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Card className="border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1 pb-4 text-center">
            <CardTitle className="text-xl font-bold tracking-tight text-white">
              Create Student Account
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Sign up to begin your international higher study application
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3.5 pt-0">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="space-y-3"
            >
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter full legal name"
                icon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register("email")}
              />

              {/* Contact Phone Number with Smart Country Picker & 0-Trim */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    Contact Number
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

                <div
                  className={`flex rounded-xl overflow-hidden border bg-slate-950 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/40 transition-all ${
                    errors.phone ? "border-rose-500/80" : "border-slate-700"
                  }`}
                >
                  <select
                    value={selectedShort}
                    onChange={(e) => {
                      const found = COUNTRY_CODES.find(
                        (c) => c.short === e.target.value
                      );
                      if (found) {
                        setSelectedShort(found.short);
                        setCountryCode(found.code);
                        if (found.code === "+880" && phone.startsWith("0")) {
                          const trimmed = phone.slice(1);
                          setPhone(trimmed);
                          setValue("phone", trimmed, { shouldValidate: true });
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

                  <div className="relative flex-1 min-w-0">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder={activeCountry.placeholder}
                      className="w-full bg-transparent pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
                {errors.phone?.message && (
                  <p className="text-xs text-rose-400 font-medium">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Min 6 characters"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.password?.message}
                  {...register("password")}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat password"
                  icon={<Lock className="w-4 h-4" />}
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2 h-10 text-xs font-semibold cursor-pointer shadow-lg shadow-blue-600/20"
                isLoading={loading}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-slate-800/80 pt-3 pb-3">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-400 hover:text-white transition-colors duration-200 cursor-pointer ml-1"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
