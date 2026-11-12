import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/common/Footer";
import {
  GraduationCap,
  FileCheck,
  CreditCard,
  Plane,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Compass,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services | Rise Abroad Education",
  description:
    "Explore our higher study admission services, scholarship guidance, document verification, and student visa support.",
};

const SERVICES = [
  {
    title: "University & Program Matching",
    step: "01",
    description:
      "Personalized shortlisting of accredited global universities based on your academic profile, preferred intake, and tuition budget.",
    highlights: ["Free vs. deposit-required offer filter", "Direct curriculum & intake matching"],
    icon: GraduationCap,
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    title: "Document & SOP Verification",
    step: "02",
    description:
      "Dedicated counselor review of academic transcripts, passport copies, IELTS/MOI certificates, and Statement of Purpose.",
    highlights: ["Fast digital document checklist", "Instant counselor feedback & re-upload"],
    icon: FileCheck,
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    title: "Official Offer Letter & Scholarships",
    step: "03",
    description:
      "Receive conditional and unconditional university offer letters directly inside your student dashboard with merit scholarship assessment.",
    highlights: ["Up to 50% merit tuition waivers", "Direct PDF offer letter download"],
    icon: Award,
    accent: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    title: "Secure Tuition Deposit & Invoices",
    step: "04",
    description:
      "Settle university confirmation deposits safely through encrypted Stripe checkout and download official payment receipts.",
    highlights: ["Instant payment verification", "Downloadable PDF invoice & receipt"],
    icon: CreditCard,
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    title: "Visa Processing & Flight Tracker",
    step: "05",
    description:
      "Step-by-step guidance from CAS/I-20 issuance and embassy interview preparation to visa stamping and pre-departure briefing.",
    highlights: ["Live application stage tracker", "1-on-1 embassy mock interviews"],
    icon: Plane,
    accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    title: "Direct Counselor Support Desk",
    step: "06",
    description:
      "Collaborate with your assigned senior counselor and admissions team in real time through your portal chat room.",
    highlights: ["Dedicated 1-on-1 counselor chat", "Real-time status notifications"],
    icon: MessageSquare,
    accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-14">
        {/* Minimal Clean Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wide">
            <Compass className="w-3.5 h-3.5" />
            <span>Student Admission Services</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Simple, Transparent{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Study Abroad Journey
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            From selecting the right university to securing your student visa, every step is managed cleanly inside your Rise Abroad Education portal.
          </p>
        </div>

        {/* Minimal 3-Column Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="group p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/30 hover:bg-slate-900/80 transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center ${service.accent}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 group-hover:text-blue-400 transition-colors">
                      STEP {service.step}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {service.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/70 space-y-2">
                  {service.highlights.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Minimal Call To Action Banner */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified University Admissions</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Ready to Start Your University Application?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Explore partner universities or speak with our counseling team for a free profile assessment.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link href="/universities">
              <Button variant="primary" size="md" className="cursor-pointer">
                <span>Explore Universities</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="md" className="cursor-pointer">
                <span>Contact Counselor</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
