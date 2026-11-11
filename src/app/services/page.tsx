import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  GraduationCap,
  FileCheck,
  CreditCard,
  Plane,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Services & Admissions Workflow | Rise Abroad Education",
  description:
    "Explore our end-to-end university admission services, document verification desk, scholarship evaluation, Stripe tuition settlement, and visa support.",
};

const SERVICES = [
  {
    title: "University & Program Matching",
    badge: "Step 01",
    description:
      "Filter accredited universities by country, world ranking, tuition fee budget, and 100% free vs. deposit-required offer letter policies.",
    features: [
      "Direct curriculum & prerequisite mapping",
      "Real-time seat capacity & intake tracking",
      "Multi-step online application wizard",
    ],
    icon: GraduationCap,
    color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  {
    title: "Document Verification & SOP Desk",
    badge: "Step 02",
    description:
      "Upload academic transcripts, passport copies, IELTS/MOI certificates, and Statements of Purpose directly to our Cloudinary-backed vault.",
    features: [
      "Line-by-line counselor verification",
      "Instant rejection feedback & re-upload flow",
      "Automated status notifications",
    ],
    icon: FileCheck,
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    title: "Offer Letter Issuance & Evaluation",
    badge: "Step 03",
    description:
      "Receive official conditional or unconditional offer letters directly inside your student portal once academic documents are cleared.",
    features: [
      "Digital PDF offer letter preview & download",
      "Scholarship & tuition waiver assessment",
      "Dedicated counselor case notes",
    ],
    icon: Award,
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  {
    title: "Stripe Tuition Deposit & Invoices",
    badge: "Step 04",
    description:
      "Settle university confirmation deposits securely via Stripe Checkout (Test Mode) and download electronically stamped PDF receipts.",
    features: [
      "Instant Stripe session verification",
      "Automated offer letter unlocking upon payment",
      "Downloadable PDF invoice & receipt ledger",
    ],
    icon: CreditCard,
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    title: "Visa Processing & Flight Tracker",
    badge: "Step 05",
    description:
      "Track every milestone from CAS/I-20 issuance to embassy appointment scheduling and pre-departure briefing.",
    features: [
      "Interactive Application Flight Tracker",
      "Embassy mock interview preparation",
      "Pre-departure accommodation guidance",
    ],
    icon: Plane,
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    title: "Live Collaborative Support Chat",
    badge: "24/7 Desk",
    description:
      "Communicate directly with assigned Senior Counselors and Admissions Officers inside your encrypted application chat room.",
    features: [
      "Role-badged counselor & admin responses",
      "Instant invoice & document alerts in chat",
      "Zero third-party messaging required",
    ],
    icon: MessageSquare,
    color: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="primary" className="mx-auto">
          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
          <span>Comprehensive Higher Study Services</span>
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          End-to-End University Admission &amp; Visa Architecture
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Every service is integrated directly into our 3-role digital platform—from
          your first university search to official offer letter download and Stripe
          tuition clearance.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <Card
              key={service.title}
              className="border-slate-800 bg-slate-900/70 hover:border-blue-500/30 transition-all flex flex-col justify-between"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center ${service.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {service.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-white">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <p className="text-xs text-slate-400 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2 pt-2 border-t border-slate-800/80">
                  {service.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-2 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Action Card */}
      <Card className="border-slate-800 bg-slate-900/90 rounded-3xl">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Admissions Pipeline</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Ready to Browse Accredited Programs?
            </h2>
            <p className="text-xs text-slate-400">
              Filter universities by country, ranking, or tuition fee and submit your
              application in minutes.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/universities">
              <Button variant="primary" size="md" className="cursor-pointer">
                <span>Browse Universities</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="md" className="cursor-pointer">
                <span>Student Login</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

