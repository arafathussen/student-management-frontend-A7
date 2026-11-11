"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  useAllApplicationsQuery,
  useMyCommissionsQuery,
  useUniversitiesQuery,
} from "@/hooks/usePortalQueries";
import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  DollarSign,
  TrendingUp,
  ArrowLeft,
  Award,
  CheckCircle2,
  User,
} from "lucide-react";

export default function CounselorEarningsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: commissions = [], isLoading: commLoading } =
    useMyCommissionsQuery(isAuthenticated);
  const { data: applications = [] } = useAllApplicationsQuery(isAuthenticated);
  const { data: universities = [] } = useUniversitiesQuery();

  useEffect(() => {
    document.title = "Counselor Earnings & Analytics | Rise Abroad Education";
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const safeCommissions = Array.isArray(commissions)
    ? commissions
    : Array.isArray((commissions as any)?.commissions)
    ? (commissions as any).commissions
    : [];
  const safeApplications = Array.isArray(applications) ? applications : [];
  const safeUniversities = Array.isArray(universities) ? universities : [];

  const totalEarned = safeCommissions.reduce(
    (sum: number, c: any) =>
      sum +
      Number(
        c.counselorShareBDT ||
          c.netPayableAmount ||
          c.counselorPayoutAmount ||
          c.netCommission ||
          c.commissionAmount ||
          0
      ),
    0
  );

  if (isLoading) return null;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
            <Award className="w-4 h-4" />
            <span>Senior Counselor Financial Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Commission Earnings &amp; Performance Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Track verified student enrollments, payout milestones, and conversion charts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/counselor/profile">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <User className="w-4 h-4 mr-1.5" />
              <span>Counselor Profile</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Counselor Desk</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Assigned Applications</p>
              <p className="text-2xl font-extrabold text-white font-mono mt-1">
                {safeApplications.length}
              </p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-blue-400/70" />
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Verified Commission Deals</p>
              <p className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
                {safeCommissions.length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-amber-400/70" />
          </CardContent>
        </Card>
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Counselor Earnings</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                ${totalEarned.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-400/70" />
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <AdminAnalyticsCharts
        applications={safeApplications}
        commissions={safeCommissions}
        universities={safeUniversities}
      />

      {/* Commission Table */}
      <Card className="border-slate-800 bg-slate-900/70 overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-white">
            Counselor Commission Ledger ({safeCommissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {commLoading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full rounded-xl bg-slate-800/70" />
              ))}
            </div>
          ) : safeCommissions.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              No commission payouts recorded yet. Completed student enrollments will appear here.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Student / Case</th>
                  <th className="py-3 px-4">University</th>
                  <th className="py-3 px-4">Payout Share</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {safeCommissions.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-white">
                      {c.student?.user?.name ||
                        c.student?.name ||
                        c.studentName ||
                        `Application #${c.id?.slice(0, 8)}`}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {c.universityName || "Partner University"}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                      ${Number(
                        c.counselorShareBDT ||
                          c.netPayableAmount ||
                          c.counselorPayoutAmount ||
                          c.netCommission ||
                          0
                      ).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success" className="text-[10px]">
                        {c.status || c.withdrawalStatus || "APPROVED"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
