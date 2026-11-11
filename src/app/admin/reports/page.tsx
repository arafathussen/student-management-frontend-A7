"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  useAllApplicationsQuery,
  useAllCommissionsQuery,
  useUniversitiesQuery,
} from "@/hooks/usePortalQueries";
import { AdminAnalyticsCharts } from "@/components/admin/AdminAnalyticsCharts";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  BarChart3,
  ArrowLeft,
  DollarSign,
  FileText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function AdminReportsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const { data: applications = [], isLoading: appLoading } =
    useAllApplicationsQuery(isAuthenticated);
  const { data: commissions = [], isLoading: commLoading } =
    useAllCommissionsQuery(isAuthenticated);
  const { data: universities = [] } = useUniversitiesQuery();

  useEffect(() => {
    document.title = "Analytics & Financial Reports | Rise Abroad Admin";
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const totalGrossTuition = (commissions as any[]).reduce(
    (sum, item) => sum + Number(item.grossTuitionFee || 0),
    0
  );
  const totalNetCommission = (commissions as any[]).reduce(
    (sum, item) => sum + Number(item.netCommission || item.commissionAmount || 0),
    0
  );

  if (isLoading) return null;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
            <BarChart3 className="w-4 h-4" />
            <span>Executive Intelligence &amp; Audit Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Financial Reports &amp; Pipeline Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Real-time university admission conversion metrics and commission settlement reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/manage">
            <Button variant="outline" size="sm" className="cursor-pointer">
              <span>Manage Users &amp; Resources</span>
            </Button>
          </Link>
          <Link href="/admin">
            <Button variant="primary" size="sm" className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Admin Command Center</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Total Applications Tracked</p>
              <p className="text-2xl font-extrabold text-white font-mono mt-1">
                {applications.length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-400/70" />
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Gross Tuition Volume</p>
              <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                ${totalGrossTuition.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-400/70" />
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Net Agency Commission</p>
              <p className="text-2xl font-extrabold text-purple-400 font-mono mt-1">
                ${totalNetCommission.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400/70" />
          </CardContent>
        </Card>
      </div>

      {/* Recharts Visualizations */}
      <AdminAnalyticsCharts
        applications={applications as any[]}
        commissions={commissions as any[]}
        universities={universities as any[]}
      />

      {/* Commission Audit Table */}
      <Card className="border-slate-800 bg-slate-900/70 overflow-hidden">
        <CardHeader className="border-b border-slate-800/80 pb-3">
          <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Recent Commission &amp; Settlement Audit Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {appLoading || commLoading ? (
            <div className="p-8 space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 w-full rounded-xl bg-slate-800/70" />
              ))}
            </div>
          ) : (commissions as any[]).length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              No commission records logged yet. Settlements appear here automatically as student enrollments are finalized.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">Student / Reference</th>
                  <th className="py-3 px-4">Gross Tuition</th>
                  <th className="py-3 px-4">Net Commission</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(commissions as any[]).slice(0, 10).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-medium text-white">
                      {item.studentName || `Record #${item.id?.slice(0, 8)}`}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      ${Number(item.grossTuitionFee || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-bold">
                      ${Number(item.netCommission || item.commissionAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success" className="text-[10px]">
                        {item.status || "VERIFIED"}
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

