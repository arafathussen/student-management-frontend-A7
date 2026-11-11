import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Globe2,
  ShieldCheck,
  Award,
  Users,
  Building2,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  FileCheck2,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Rise Abroad Education",
  description:
    "Learn how Rise Abroad Education connects ambitious students with accredited global universities across the UK, USA, Canada, Cyprus, Germany, and Australia.",
};

const PILLARS = [
  {
    title: "Direct University Partnerships",
    description:
      "Official representation agreements with top-ranked institutions across Europe, North America, and Asia-Pacific.",
    icon: Building2,
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    title: "3-Tier Verified Governance",
    description:
      "Dedicated workflows separating Student Applicants, Senior Admissions Counselors, and Super Admin Compliance Officers.",
    icon: ShieldCheck,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Transparent Stripe Fee Settlement",
    description:
      "256-bit SSL encrypted tuition deposits and instant electronically stamped PDF payment receipts.",
    icon: Award,
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    title: "End-to-End Visa & SOP Desk",
    description:
      "Comprehensive academic document verification, offer letter issuance, and embassy interview readiness.",
    icon: FileCheck2,
    accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-14">
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" className="mx-auto">
          <Globe2 className="w-3.5 h-3.5 mr-1.5" />
          <span>Global University Admission Management System</span>
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Empowering Global Higher Study Through Verified Digital Admissions
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Rise Abroad Education is a unified university admission and academic
          lifecycle platform engineered to eliminate paperwork bottlenecks between
          international applicants, admissions counselors, and partner universities.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/universities">
            <Button variant="primary" size="md" className="cursor-pointer">
              <span>Explore Partner Universities</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/services">
            <Button variant="outline" size="md" className="cursor-pointer">
              <Compass className="w-4 h-4 mr-2" />
              <span>View Our Services</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Partner Universities", value: "50+", sub: "UK, USA, Canada, EU", icon: Building2 },
          { label: "Visa & Offer Success", value: "98.4%", sub: "Verified compliance desk", icon: CheckCircle2 },
          { label: "Active Students", value: "2,400+", sub: "Enrolled globally", icon: GraduationCap },
          { label: "Certified Counselors", value: "35+", sub: "Dedicated 1-on-1 support", icon: Users },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="border-slate-800 bg-slate-900/70 backdrop-blur-xl"
            >
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    {stat.label}
                  </span>
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {stat.value}
                </div>
                <p className="text-[11px] text-slate-500">{stat.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Core Institutional Pillars */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Why Universities &amp; Students Trust Us
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Built on strict role-based security, real-time application tracking,
            and auditable financial workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all"
              >
                <CardContent className="p-6 flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${item.accent}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Banner */}
      <Card className="border-blue-500/20 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 rounded-3xl overflow-hidden">
        <CardContent className="p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400">
              <Sparkles className="w-4 h-4" />
              <span>Fall 2026 &amp; Spring 2027 Intakes Open</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Start Your International University Application Today
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Create your student account or use our One-Click Demo Login on the
              sign-in page to explore all 3 role dashboards.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/login">
              <Button variant="primary" size="md" className="cursor-pointer">
                <span>Access Portal</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="md" className="cursor-pointer">
                <span>Contact Desk</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

