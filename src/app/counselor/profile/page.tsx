"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  profileUpdateSchema,
  type ProfileUpdateFormValues,
} from "@/validation/schemas";
import { userService } from "@/services/userService";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  User,
  Phone,
  MapPin,
  Clock,
  Save,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";

export default function CounselorProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState("AVAILABLE");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || "",
      contactNumber: user?.contactNumber || "",
      address: "Dhaka Admissions Desk, Bangladesh",
    },
  });

  useEffect(() => {
    document.title = "Counselor Profile & Availability | Rise Abroad Education";
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
    if (user) {
      reset({
        name: user.name || "",
        contactNumber: user.contactNumber || "+8801700000000",
        address: "Dhaka Admissions Desk, Bangladesh",
      });
    }
  }, [isLoading, isAuthenticated, user, reset, router]);

  const onSubmit = async (values: ProfileUpdateFormValues) => {
    try {
      setSaving(true);
      await userService.updateMe({
        name: values.name,
        contactNumber: values.contactNumber,
        address: values.address,
      });
      updateUser({
        name: values.name,
        contactNumber: values.contactNumber,
      });
      toast.success("Counselor profile & availability saved!");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to update counselor profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Counselor Desk Configuration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Profile &amp; Consultation Availability
          </h1>
          <p className="text-xs text-slate-400">
            Manage your counselor profile details and student consultation schedule.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/counselor/earnings">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <span>View Earnings</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Counselor Portal</span>
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900/80">
        <CardHeader className="border-b border-slate-800/80 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-white">
              Advisor Details &amp; Desk Status
            </CardTitle>
            <Badge variant="success" className="text-[10px]">
              {user?.role || "COUNSELOR"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            <Input
              label="Full Name"
              placeholder="Counselor full name"
              icon={<User className="w-4 h-4" />}
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Direct Contact / WhatsApp Number"
              placeholder="+8801700000000"
              icon={<Phone className="w-4 h-4" />}
              error={errors.contactNumber?.message}
              {...register("contactNumber")}
            />

            <Input
              label="Office / Desk Location"
              placeholder="Dhaka Admissions Desk"
              icon={<MapPin className="w-4 h-4" />}
              error={errors.address?.message}
              {...register("address")}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">
                Student Consultation Availability
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="AVAILABLE">
                    🟢 Available for New Student Assignments (10:00 AM – 7:00 PM)
                  </option>
                  <option value="INTERVIEW_SESSION">
                    🟡 In Visa Mock Interview Session
                  </option>
                  <option value="OFFLINE">🔴 Away / Document Review Only</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                className="cursor-pointer"
              >
                <Save className="w-4 h-4 mr-1.5" />
                <span>Save Counselor Settings</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

