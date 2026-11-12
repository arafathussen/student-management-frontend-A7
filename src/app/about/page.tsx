import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/common/Footer";
import {
  Globe2,
  ShieldCheck,
  Award,
  Users,
  Building2,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Compass,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | Rise Abroad Education",
  description:
    "Learn how Rise Abroad Education connects students with accredited global universities across the UK, USA, Canada, Cyprus, Europe, and Australia.",
};

const STATS = [
  { label: "Partner Universities", value: "50+", note: "UK, USA, Canada, Europe & Australia", icon: Building2 },
  { label: "Visa Success Rate", value: "98.4%", note: "Verified documentation & SOP desk", icon: CheckCircle2 },
  { label: "Students Guided", value: "5,500+", note: "Enrolled in global degree programs", icon: GraduationCap },
  { label: "Expert Counselors", value: "35+", note: "Dedicated 1-on-1 admission support", icon: Users },
];

const PILLARS = [
  {
    title: "Direct Global University Partnerships",
    description:
      "We work directly with accredited universities across the UK, Canada, USA, Cyprus, Germany, and Australia to ensure fast offer letters and authentic scholarship opportunities.",
    icon: Building2,
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    title: "Digital Admission & Document Tracking",
    description:
      "No lost files or hidden steps. Students upload academic transcripts once, track counselor verification live, and download official offer letters directly from their dashboard.",
    icon: ShieldCheck,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Scholarship & Tuition Transparency",
    description:
      "Clear breakdown of tuition fees, up to 50% merit scholarship assessments, and secure online tuition deposit clearance with instant official receipts.",
    icon: Award,
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    title: "Dedicated Visa & Pre-Departure Care",
    description:
      "From Statement of Purpose (SOP) refinement and financial file preparation to mock embassy interviews and accommodation guidance.",
    icon: Compass,
    accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
        {/* Minimal Clean Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wide">
            <Globe2 className="w-3.5 h-3.5" />
            <span>About Rise Abroad Education</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your Trusted Partner for{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Global Higher Education
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Rise Abroad Education connects ambitious students with world-class universities through transparent counseling, verified documentation, and end-to-end visa support.
          </p>
        </div>

        {/* Clean 4-Column Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">
                    {stat.label}
                  </span>
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </div>
                <p className="text-xs text-slate-500">{stat.note}</p>
              </div>
            );
          })}
        </div>

        {/* Minimal 2x2 Institutional Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PILLARS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 sm:p-7 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/30 transition-all flex items-start gap-4"
              >
                <div
                  className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${item.accent}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    {item.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimal Bottom CTA */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Begin Your Higher Study Journey Today
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Browse accredited universities, check scholarship eligibility, or connect directly with our Dhaka counseling desk.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link href="/universities">
              <Button variant="primary" size="md" className="cursor-pointer">
                <span>Browse Universities</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="md" className="cursor-pointer">
                <span>Contact Us</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
