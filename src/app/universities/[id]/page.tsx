"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { higherStudyService } from "@/services/higherStudyService";
import { University, Program } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getUniversityCoverImage, slugify } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  GraduationCap, 
  FileCheck, 
  CheckCircle2, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  Globe2, 
  Lock, 
  Download, 
  Calendar,
  AlertCircle,
  ExternalLink,
  BookOpen,
  MessageSquare,
  Tag,
  ArrowRight
} from "lucide-react";

// Rich Markdown Post Renderer: parses ### Headings, > Callout Quotes, - Bullet lists, **bold**, and [Link Text](url)
function FormattedDescription({ content }: { content: string }) {
  if (!content) return null;

  const renderInline = (text: string) => {
    const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*)/g;
    const chunks = text.split(regex);
    return chunks.map((chunk, cIdx) => {
      if (chunk.startsWith("[") && chunk.includes("](") && chunk.endsWith(")")) {
        const closeBracket = chunk.indexOf("](");
        const title = chunk.slice(1, closeBracket);
        const url = chunk.slice(closeBracket + 2, -1);
        return (
          <a
            key={cIdx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-blue-400 hover:text-blue-300 underline underline-offset-2 mx-0.5 group"
          >
            <span>{title}</span>
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </a>
        );
      }
      if (chunk.startsWith("**") && chunk.endsWith("**") && chunk.length >= 4) {
        return (
          <strong key={cIdx} className="font-bold text-white">
            {chunk.slice(2, -2)}
          </strong>
        );
      }
      return <span key={cIdx}>{chunk}</span>;
    });
  };

  const blocks = content.split(/\n{2,}/);

  return (
    <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("### ") || trimmed.startsWith("## ") || trimmed.startsWith("# ")) {
          const headingText = trimmed.replace(/^#{1,3}\s+/, "");
          return (
            <h3 key={bIdx} className="text-base sm:text-lg font-extrabold text-white pt-2 border-t border-slate-800/60 first:border-t-0 first:pt-0">
              {renderInline(headingText)}
            </h3>
          );
        }

        if (trimmed.startsWith("> ")) {
          const quoteText = trimmed.replace(/^>\s+/gm, "");
          return (
            <div
              key={bIdx}
              className="p-4 rounded-xl bg-blue-950/35 border-l-4 border-blue-500 text-blue-100 text-xs sm:text-sm leading-relaxed"
            >
              {renderInline(quoteText)}
            </div>
          );
        }

        const lines = trimmed.split("\n").map((l) => l.trim());
        if (lines.every((l) => l.startsWith("- ") || l.startsWith("* "))) {
          return (
            <ul key={bIdx} className="space-y-2 pl-1">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{renderInline(line.replace(/^[-*]\s+/, ""))}</span>
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={bIdx} className="whitespace-pre-line">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

export default function UniversityDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const uniId = params.id as string;

  const [university, setUniversity] = useState<University | null>(null);
  const [suggestedUnis, setSuggestedUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Multi-Step Application Wizard State
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardData, setWizardData] = useState({
    intake: "Fall 2026",
    fundingSource: "Self-Funded / Family",
    previousQualification: "Bachelor / HSC Equivalent",
    cgpaOrScore: "3.50 / 4.00",
    englishProficiency: "IELTS / Medium of Instruction (MOI)",
  });
  const [wizardFieldError, setWizardFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (uniId) {
      fetchDetails();
    }
  }, [uniId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [res, allUnisRes] = await Promise.all([
        higherStudyService.getUniversityDetails(uniId),
        higherStudyService.getUniversities().catch(() => ({ data: [] })),
      ]);
      const uniData = res.data;
      setUniversity(uniData);
      if (uniData?.name) {
        document.title = `${uniData.name} - Tuition Fees & Admissions | Rise Abroad Education`;
        // Replace raw UUID in browser URL bar with clean SEO slug if accessed via ID
        const cleanSlug = slugify(uniData.name);
        if (cleanSlug && uniId !== cleanSlug && typeof window !== "undefined") {
          window.history.replaceState(null, "", `/universities/${cleanSlug}`);
        }
      }
      const all = allUnisRes.data || [];
      const others = all.filter((u: any) => u.id !== uniData?.id && !u.isDeleted && u.status !== "DRAFT" && !u.isDraft);
      setSuggestedUnis(others.slice(0, 4));
    } catch (err) {
      console.error("Failed to load university details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (program: Program) => {
    const slugOrId = university?.name ? slugify(university.name) : uniId;
    if (!user) {
      router.push(`/login?redirect=/universities/${slugOrId}`);
      return;
    }
    setSelectedProgram(program);
    setWizardStep(1);
    setWizardFieldError(null);
    setApplyModalOpen(true);
    setApplySuccess(false);
    setError(null);
  };

  const confirmApplication = async () => {
    if (!selectedProgram) return;

    try {
      setApplying(true);
      setError(null);
      await higherStudyService.applyForProgram(selectedProgram.id);
      setApplySuccess(true);
      setTimeout(() => {
        setApplyModalOpen(false);
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to submit application. You may have already applied to this program."
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">Fetching university details...</p>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-white mb-2">University Not Found</h2>
        <p className="text-slate-400 text-sm mb-6">The institution you are looking for does not exist or has been removed.</p>
        <Link href="/universities">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>
        </Link>
      </div>
    );
  }

  const coverImg = getUniversityCoverImage(university);
  const officialLink = university.programsCtaUrl || university.website || "";
  const officialLabel = university.programsCtaLabel || "View Official Programs";

  return (
    <div className="min-h-screen py-8 px-4 max-w-7xl mx-auto space-y-8 page-transition">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          href="/universities"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all universities
        </Link>
      </div>

      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
        {coverImg && (
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] max-h-72 overflow-hidden bg-slate-950">
            <img
              src={coverImg}
              alt={university.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </div>
        )}

        <div className="p-6 sm:p-8">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-primary-500/20 shrink-0">
                {university.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <Badge variant="primary">{university.country?.name || "Global"}</Badge>
                  {university.offerLetterPaymentType === "FREE" ? (
                    <Badge variant="success">Free Offer Letter</Badge>
                  ) : (
                    <Badge variant="warning">Tuition Deposit Required</Badge>
                  )}
                  {university.worldRanking && (
                    <Badge variant="info">QS Top #{university.worldRanking}</Badge>
                  )}
                  {university.tags && university.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[10px] font-semibold flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {university.name}
                </h1>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-400" />
                    {university.city}, {university.country?.name}
                  </span>
                  {university.website && (
                    <a
                      href={university.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary-400 hover:underline"
                    >
                      <Globe2 className="w-3.5 h-3.5" />
                      Official Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
              {university.scholarshipHighlight && (
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-left">
                  <span className="text-[11px] text-amber-300/80 block uppercase tracking-wider font-semibold">
                    Scholarship &amp; Aid
                  </span>
                  <span className="text-sm sm:text-base font-bold text-amber-300">
                    {university.scholarshipHighlight}
                  </span>
                </div>
              )}

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-left">
                <span className="text-[11px] text-slate-400 block uppercase tracking-wider font-semibold">
                  Estimated Tuition
                </span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  ${university.minTuitionFee?.toLocaleString() || "12,000"} - $
                  {university.maxTuitionFee?.toLocaleString() || "28,000"}
                  <span className="text-xs text-slate-400 font-normal"> / yr</span>
                </span>
              </div>

              {officialLink && (
                <a
                  href={officialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0"
                >
                  <Button variant="gradient" size="md" className="w-full sm:w-auto gap-2 shadow-lg shadow-blue-900/40 cursor-pointer">
                    <span>{officialLabel}</span>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Details (2 cols) & Right Sidebar (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Complete University Post Content + Official Programs CTA */}
        <div className="lg:col-span-2 space-y-8">
          {/* Complete University Post */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-400" />
                University Overview, Scholarships, Hostel &amp; Admission Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {university.description ? (
                <FormattedDescription content={university.description} />
              ) : (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {`${university.name} is a premier accredited institution located in ${university.city}, ${university.country?.name}. Renowned for modern research facilities, exceptional career outcome rates, and dedicated international student support services.`}
                </p>
              )}

              {/* Prominent Configurable Official Programs & Course Link Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>Explore All Official Degree Programs &amp; Fees</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Open {university.name}&apos;s official catalog to browse complete subjects, tuition breakdown, and department requirements.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                  {officialLink ? (
                    <a
                      href={officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/50 flex items-center gap-2 group cursor-pointer"
                    >
                      <span>{officialLabel}</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500 italic">Official link not added yet</span>
                  )}

                  <Link
                    href="/contact"
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Apply / Free Counseling</span>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Legacy Programs List (only shown if programs exist) */}
          {university.programs && university.programs.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary-400" />
                    Featured Degree Programs ({university.programs.length})
                  </CardTitle>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select a degree program below to submit an admission application
                  </p>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {university.programs.map((prog) => (
                  <div
                    key={prog.id}
                    className="p-4 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">
                          {prog.level || prog.degreeLevel}
                        </Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {prog.duration || `${prog.durationYears || 3} Years`}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Intake: {prog.intake || prog.intakeSeason || "Sep / Jan"}
                        </span>
                      </div>
                      <h4 className="font-semibold text-white group-hover:text-primary-300 transition-colors">
                        {prog.title || prog.name}
                      </h4>
                      <p className="text-xs text-emerald-400 font-medium mt-1 font-mono">
                        Tuition: ${prog.tuitionFee?.toLocaleString()} / year
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => handleApplyClick(prog)}
                      className="shrink-0 w-full sm:w-auto"
                    >
                      Apply Now
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Dynamic Document Requirements Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-primary-400" />
                Required Application Documents Checklist
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                These documents are dynamically requested upon submission
              </p>
            </CardHeader>

            <CardContent>
              {university.docRequirements && university.docRequirements.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {university.docRequirements.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-white block">
                          {doc.documentName || doc.title}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {doc.isRequired ? "Mandatory" : "Optional"} {doc.formatAllowed ? `(${doc.formatAllowed})` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-900/40 rounded-lg text-xs text-slate-400 space-y-1">
                  <p>Standard documents required: Academic Transcripts, Passport Copy, English Proficiency Score (IELTS/PTE), and Statement of Purpose (SOP).</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Admission Policy & Suggested Universities */}
        <div className="space-y-6">
          <Card className="border-primary-500/20 bg-gradient-to-b from-primary-950/20 to-slate-900">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-400" />
                Offer Letter Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-300">
              {university.offerLetterPaymentType === "FREE" ? (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-400">
                    <Download className="w-4 h-4" />
                    100% Free Instant Download
                  </div>
                  <p className="text-slate-300">
                    Once the admissions committee issues your formal offer letter, you can immediately download your official letter without paying an upfront agency deposit.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <Lock className="w-4 h-4" />
                    Deposit / Locked Offer
                  </div>
                  <p className="text-slate-300">
                    This institution issues conditional/unconditional offers upon verification of university deposit confirmation or receipt upload.
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Application Fee:</span>
                  <span className="text-white font-semibold">Free (Rise Abroad Partner)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Average Turnaround:</span>
                  <span className="text-white font-semibold">5 - 10 Business Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Success Rate:</span>
                  <span className="text-emerald-400 font-semibold font-mono">98.5% Visa Approval</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Sidebar Suggestions: Other Recommended Universities */}
          {suggestedUnis.length > 0 && (
            <Card className="border-slate-800 bg-slate-900/70">
              <CardHeader className="pb-3 border-b border-slate-800/80">
                <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400" />
                    Other Institutions
                  </span>
                  <Link href="/universities" className="text-xs text-blue-400 hover:underline font-normal">
                    View all
                  </Link>
                </CardTitle>
                <p className="text-[11px] text-slate-400">
                  Explore other partner campuses worldwide
                </p>
              </CardHeader>
              <CardContent className="p-3.5 space-y-3">
                {suggestedUnis.map((other) => {
                  const otherImg = other.coverImageUrl || other.bannerUrl;
                  return (
                    <Link
                      key={other.id}
                      href={`/universities/${slugify(other.name) || other.id}`}
                      className="group flex gap-3 p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 transition-all"
                    >
                      <div className="w-20 h-14 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-700/60 relative">
                        {otherImg ? (
                          <img src={otherImg} alt={other.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-950/30">
                            <Building2 className="w-6 h-6 text-blue-400/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-300 transition-colors">
                            {other.name}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-rose-400" />
                            {other.city}, {other.country?.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] mt-1">
                          <span className="font-mono text-emerald-400 font-semibold">
                            ${(other.minTuitionFee || 12000).toLocaleString()}/yr
                          </span>
                          <span className="text-blue-400 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                            Details <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Full-width Action / Contact Admissions Bar */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-extrabold text-white">
            Ready to Apply or Have Questions About {university.name}?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Our certified counselors provide direct admissions, SOP review, and 100% case support.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link href="/contact">
            <Button variant="outline" size="md" className="gap-2 border-slate-700 hover:border-blue-500 text-slate-200">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Contact Admissions Desk</span>
            </Button>
          </Link>
          {officialLink && (
            <a href={officialLink} target="_blank" rel="noopener noreferrer">
              <Button variant="gradient" size="md" className="gap-2 shadow-lg shadow-blue-950/60 cursor-pointer">
                <span>{officialLabel}</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Multi-Step Program Application Wizard Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Admission Application Wizard (Step ${wizardStep} of 3)`}
      >
        <div className="space-y-4 text-xs text-slate-300">
          {/* Wizard Stepper Progress */}
          <div className="grid grid-cols-3 gap-2 pb-2">
            {[
              { step: 1, label: "1. Intake & Plan" },
              { step: 2, label: "2. Academics" },
              { step: 3, label: "3. Review" },
            ].map((item) => (
              <div
                key={item.step}
                className={`px-2.5 py-1.5 rounded-lg text-center font-semibold border transition-all ${
                  wizardStep === item.step
                    ? "bg-blue-600/20 border-blue-500/50 text-blue-300"
                    : wizardStep > item.step
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-900/60 border-slate-800 text-slate-500"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">
              Selected Program
            </span>
            <div className="font-bold text-white text-sm">
              {selectedProgram?.title || selectedProgram?.name}
            </div>
            <div className="text-slate-400">
              {university.name} • {university.city}, {university.country?.name}
            </div>
          </div>

          {wizardStep === 1 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Preferred Intake Session
                </label>
                <select
                  value={wizardData.intake}
                  onChange={(e) =>
                    setWizardData((p) => ({ ...p, intake: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Fall 2026">Fall 2026 (September / October)</option>
                  <option value="Spring 2027">Spring 2027 (January / February)</option>
                  <option value="Summer 2027">Summer 2027 (May / June)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Primary Tuition Funding Source
                </label>
                <select
                  value={wizardData.fundingSource}
                  onChange={(e) =>
                    setWizardData((p) => ({
                      ...p,
                      fundingSource: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Self-Funded / Family">
                    Self-Funded / Family Sponsorship
                  </option>
                  <option value="Partial Merit Scholarship">
                    Partial Merit Scholarship + Family
                  </option>
                  <option value="Education Bank Loan">
                    Education Bank Loan / Sponsor
                  </option>
                </select>
              </div>
            </div>
          )}

          {wizardStep === 2 && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Highest Academic Qualification
                </label>
                <input
                  type="text"
                  value={wizardData.previousQualification}
                  onChange={(e) =>
                    setWizardData((p) => ({
                      ...p,
                      previousQualification: e.target.value,
                    }))
                  }
                  placeholder="e.g. B.Sc in CSE / HSC Science"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    CGPA / Grade Score
                  </label>
                  <input
                    type="text"
                    value={wizardData.cgpaOrScore}
                    onChange={(e) =>
                      setWizardData((p) => ({
                        ...p,
                        cgpaOrScore: e.target.value,
                      }))
                    }
                    placeholder="e.g. 3.65 / 4.00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    English Proficiency
                  </label>
                  <select
                    value={wizardData.englishProficiency}
                    onChange={(e) =>
                      setWizardData((p) => ({
                        ...p,
                        englishProficiency: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="IELTS / Medium of Instruction (MOI)">
                      IELTS / MOI Ready
                    </option>
                    <option value="Duolingo / PTE">Duolingo / PTE Ready</option>
                    <option value="Awaiting Exam Result">
                      Awaiting Test Score
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {wizardStep === 3 && (
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Intake:</span>
                <span className="font-bold text-white">{wizardData.intake}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Funding Plan:</span>
                <span className="font-semibold text-blue-300">
                  {wizardData.fundingSource}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Academic Background:</span>
                <span className="font-semibold text-slate-200">
                  {wizardData.previousQualification} ({wizardData.cgpaOrScore})
                </span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-slate-800">
                <span className="text-slate-400">Program Tuition:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  ${selectedProgram?.tuitionFee?.toLocaleString()} / yr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Application Processing:</span>
                <span className="font-bold text-white">
                  Free (Rise Abroad Direct)
                </span>
              </div>
            </div>
          )}

          {wizardFieldError && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl text-xs">
              {wizardFieldError}
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {applySuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                Application successfully submitted! Redirecting to dashboard...
              </span>
            </div>
          )}

          <div className="flex justify-between items-center gap-2 pt-2">
            {wizardStep > 1 ? (
              <Button
                variant="outline"
                onClick={() => {
                  setWizardFieldError(null);
                  setWizardStep((s) => (s === 3 ? 2 : 1));
                }}
              >
                Back
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
                Cancel
              </Button>
            )}

            {wizardStep < 3 ? (
              <Button
                variant="primary"
                onClick={() => {
                  if (
                    wizardStep === 2 &&
                    (!wizardData.previousQualification.trim() ||
                      !wizardData.cgpaOrScore.trim())
                  ) {
                    setWizardFieldError(
                      "Please enter your highest qualification and CGPA/score."
                    );
                    return;
                  }
                  setWizardFieldError(null);
                  setWizardStep((s) => (s === 1 ? 2 : 3));
                }}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="gradient"
                onClick={confirmApplication}
                isLoading={applying}
                disabled={applySuccess}
              >
                Confirm &amp; Submit Application
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
