"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  GraduationCap, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Globe2, 
  Play, 
  X, 
  Share2, 
  BookOpen, 
  MessageSquareQuote,
  Star,
  ExternalLink,
  ShieldCheck,
  Trophy,
  ArrowRight,
  Maximize2
} from "lucide-react";
import { successStoryService, SuccessStoryItem } from "@/services/successStoryService";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";

// Fallback demo stories for instant rendering if backend data is empty or during transition
const DEMO_STORIES: Record<string, SuccessStoryItem> = {
  "arafat-hussen-01": {
    id: "f1",
    slug: "arafat-hussen-01",
    studentName: "Arafat Hussen",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    homeInstitution: "Dhaka College, Dhaka",
    hometown: "Dhaka",
    country: "Cyprus",
    universityName: "American University of Cyprus (AUCY)",
    degreeName: "BSc in Computer Science",
    intake: "Fall 2026 Intake",
    visaDate: "July 2026",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    scholarshipNote: "50% Merit Scholarship Awarded",
    testimonial: "Rise Abroad Education made my Cyprus student visa processing seamless. The team helped me secure a 50% tuition waiver and guided my visa interview step-by-step!",
    storyContent:
      "From Dhaka College to Larnaca, Cyprus! Rise Abroad Education guided me through every step from document apostille to visa interview preparation.\n\nWith their expert counseling, I secured a 50% tuition scholarship and my European student visa within just 3 weeks. If you are aiming for European study with scholarship support, Rise Abroad Education is the best companion.",
  },
  "tanvir-ahmed-02": {
    id: "f2",
    slug: "tanvir-ahmed-02",
    studentName: "Tanvir Ahmed",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    homeInstitution: "Notre Dame College, Dhaka",
    hometown: "Rajshahi",
    country: "United Kingdom",
    universityName: "University of Hertfordshire",
    degreeName: "MSc in Data Science & AI",
    intake: "Spring 2026 Intake",
    visaDate: "January 2026",
    youtubeUrl: "https://www.youtube.com/watch?v=7wtfhZwyrcc",
    scholarshipNote: "£3,000 Dean's Excellence Scholarship",
    testimonial: "Securing my UK CAS letter and priority visa with zero hassle was made possible by Rise Abroad Education. Their SOP review and mock interview was an absolute game changer.",
    storyContent:
      "Securing my UK visa with zero hassle was made possible by Rise Abroad Education. Coming from Rajshahi and studying at Notre Dame College, I always wanted to pursue AI & Data Science in the UK.\n\nTheir dedicated counselor reviewed my SOP five times and conducted rigorous mock interviews that made the real embassy interview feel completely effortless. I am proud to now study at University of Hertfordshire.",
  },
  "sadia-rahman-03": {
    id: "f3",
    slug: "sadia-rahman-03",
    studentName: "Sadia Rahman",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    homeInstitution: "Viqarunnisa Noon College, Dhaka",
    hometown: "Dhaka",
    country: "Canada",
    universityName: "University of Windsor",
    degreeName: "BBA in International Business",
    intake: "Fall 2026 Intake",
    visaDate: "August 2026",
    youtubeUrl: "https://www.youtube.com/watch?v=kJQP7kiw5Fk",
    scholarshipNote: "$5,000 CAD Entrance Award",
    testimonial: "My dream of studying in Canada became a reality through Rise Abroad Education. They provided 100% transparent guidelines on SDS stream, GIC account creation, and financial proof documentation.",
    storyContent:
      "My dream of studying in Canada became a reality through Rise Abroad Education. After passing from Viqarunnisa Noon College, the Canadian visa process looked daunting with GIC account creation, upfront medicals, and financial justification.\n\nThe team held my hand through every milestone, helped me attain an entrance award, and my Canada study permit arrived in record time without any issues.",
  },
};

export default function StudentSuccessStoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = (params?.id as string) || "";

  const [story, setStory] = useState<SuccessStoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [relatedStories, setRelatedStories] = useState<SuccessStoryItem[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (videoModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [videoModalOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setVideoModalOpen(false);
      }
    };
    if (videoModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [videoModalOpen]);

  useEffect(() => {
    if (!storyId) return;

    const fetchStoryDetail = async () => {
      try {
        setLoading(true);
        // Try fetching from backend (supports both slug and id)
        try {
          const res = await successStoryService.getStoryById(storyId);
          if (res) {
            setStory(res);
            document.title = `${res.studentName} - Success Story | Rise Abroad Education`;
          }
        } catch {
          // Check fallback demo stories
          const match =
            DEMO_STORIES[storyId] ||
            Object.values(DEMO_STORIES).find(
              (s) => s.slug === storyId || s.id === storyId
            );
          if (match) {
            setStory(match);
            document.title = `${match.studentName} - Success Story | Rise Abroad Education`;
          }
        }

        // Fetch related stories
        try {
          const allStories = await successStoryService.getStories({ limit: 4 });
          const items =
            allStories?.data ||
            (Array.isArray(allStories) ? allStories : Object.values(DEMO_STORIES));
          setRelatedStories(
            items
              .filter(
                (item: SuccessStoryItem) =>
                  item.id !== storyId && item.slug !== storyId
              )
              .slice(0, 3)
          );
        } catch {
          setRelatedStories(
            Object.values(DEMO_STORIES)
              .filter((item) => item.id !== storyId && item.slug !== storyId)
              .slice(0, 3)
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStoryDetail();
  }, [storyId]);

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("embed/")) {
      videoId = url.split("embed/")[1].split("?")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : null;
  };

  const getYoutubeThumbnail = (url?: string) => {
    if (!url) return null;
    let videoId = "";
    if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  // Dynamic share link - copies current live domain (not hardcoded localhost)
  const handleShare = () => {
    if (typeof window !== "undefined") {
      const siteOrigin = window.location.origin;
      const shareUrl = `${siteOrigin}/success/${story?.slug || story?.id || storyId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070d1f] text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Trophy className="w-8 h-8 animate-bounce" />
          </div>
          <div className="h-6 w-48 bg-slate-800 rounded-lg" />
          <div className="h-4 w-32 bg-slate-800/60 rounded" />
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-[#070d1f] text-slate-100 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-slate-900/60 border border-slate-800 p-8 rounded-2xl">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white mb-2">Success Story Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">
            The requested student success story may have been relocated or is currently unpublished.
          </p>
          <Link href="/success">
            <Button variant="gradient" size="sm" className="gap-2 cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Back to Success Stories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const videoEmbedUrl = getYoutubeEmbedUrl(story.youtubeUrl);
  const heroBannerImage =
    story.thumbnailUrl ||
    getYoutubeThumbnail(story.youtubeUrl) ||
    story.photoUrl ||
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80";

  return (
    <div className="min-h-screen bg-[#070d1f] text-slate-100 selection:bg-blue-600 selection:text-white pb-24">
      {/* Top Breadcrumb & Share Navigation Bar */}
      <div className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-16 sm:top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href="/success"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-blue-400 transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Success Stories</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer shadow-sm"
              title="Share this student profile"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>{copiedLink ? "Link Copied!" : "Share Profile"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10">
        {/* =====================================================================
            1. BALANCED SIDE-BY-SIDE HERO SHOWCASE (No Giant Fullscreen Banner!)
        ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Student Profile & Verification Snapshot (Prominent & Clear) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-slate-900/70 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="space-y-5">
              {/* Top Row: Avatar & Badges */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-xl bg-slate-800">
                    <img
                      src={story.photoUrl || story.thumbnailUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80"}
                      alt={story.studentName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 border-2 border-slate-900 shadow-md">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Visa Approved
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-white border border-slate-700 flex items-center gap-1">
                      <Globe2 className="w-3 h-3 text-blue-400" />
                      {story.country}
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    {story.studentName}
                  </h1>

                  <p className="text-xs text-blue-400 font-semibold truncate max-w-md">
                    {story.universityName}
                  </p>
                </div>
              </div>

              {/* Student Location & Educational Credentials Grid */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3 text-xs">
                {/* 1. Permanent Home District / City */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Permanent Origin / Home District
                    </div>
                    <div className="font-semibold text-white text-xs mt-0.5">
                      {story.hometown ? `${story.hometown}, Bangladesh` : "Bangladesh"}
                    </div>
                  </div>
                </div>

                {/* 2. Previous College / Institute */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Previous College / Institute
                    </div>
                    <div className="font-semibold text-white text-xs mt-0.5">
                      {story.homeInstitution}
                    </div>
                  </div>
                </div>

                {/* 3. Admitted University & Program */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Admitted Program & Destination
                    </div>
                    <div className="font-semibold text-white text-xs mt-0.5">
                      {story.degreeName}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {story.universityName} • {story.country}
                    </div>
                  </div>
                </div>

                {/* 4. Intake & Visa Approval Season */}
                {story.intake && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      {story.intake}
                    </span>
                    <span className="font-semibold text-slate-300">
                      Visa: {story.visaDate || "Approved"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Scholarship Note Badge if available */}
            {story.scholarshipNote && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-amber-300 block">Scholarship Award:</span>
                  <span className="text-white font-medium">{story.scholarshipNote}</span>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Video Journey & Study Abroad Counseling Card */}
          <div className="lg:col-span-5 flex flex-col items-center gap-3.5">
            <div className="w-full max-w-md mx-auto flex flex-col rounded-3xl overflow-hidden border border-slate-800/90 bg-gradient-to-b from-slate-900/90 to-slate-950 shadow-2xl">
              {/* Card Header: Sleek, Slim & Clean */}
              <div className="px-4 py-2.5 sm:py-3 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
                <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-red-500 fill-current" />
                  <span>Watch Visa Success Journey</span>
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-slate-800/90 text-[10px] font-semibold text-slate-300 border border-slate-700/80">
                  Real Story
                </span>
              </div>

              {/* Compact 16:9 Thumbnail Preview */}
              <div
                onClick={() => story.youtubeUrl && setVideoModalOpen(true)}
                className={`relative aspect-video w-full overflow-hidden bg-slate-950 ${
                  story.youtubeUrl ? "cursor-pointer group" : ""
                }`}
              >
                <img
                  src={heroBannerImage}
                  alt={`${story.studentName} Visa Success Journey`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

                {/* Overlays */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 backdrop-blur-md shadow-sm">
                    <CheckCircle2 className="w-3 h-3 inline mr-1" /> Verified Journey
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-white border border-slate-700/80 flex items-center gap-1">
                    <Globe2 className="w-3 h-3 text-blue-400" />
                    {story.country}
                  </span>
                </div>

                {/* Center Official Flaticon YouTube Play Button */}
                {story.youtubeUrl ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-10 sm:w-16 sm:h-11 drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fill="#FF0000"
                          d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                        />
                        <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="text-[11px] text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                      Official Visa Grant Case Study
                    </span>
                  </div>
                )}
              </div>

              {/* Video Card Quick Footer: Slim & Clean */}
              <div className="px-4 py-2 sm:py-2.5 bg-slate-900/60 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 truncate">
                  Rise Abroad Education × {story.studentName}
                </div>

                {story.youtubeUrl && (
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setVideoModalOpen(true)}
                    className="gap-1.5 text-xs px-3 py-1.5 h-8 shadow-md shadow-red-600/20 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-none cursor-pointer whitespace-nowrap rounded-lg"
                  >
                    <Play className="w-3 h-3 fill-current" /> Watch Video
                  </Button>
                )}
              </div>
            </div>

            {/* Relocated Counseling Box: Compact & Lifted Up */}
            <div className="w-full max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-950/60 via-slate-900/80 to-slate-900 border border-blue-500/30 flex flex-col justify-between gap-3 shadow-xl">
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  Want to Study in {story.country}?
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  Get direct profile evaluation, SOP review, scholarship guidance, and mock embassy interview support from Rise Abroad Education.
                </p>
              </div>
              <Link href="/contact" className="block w-full pt-0.5">
                <Button
                  variant="gradient"
                  size="sm"
                  className="w-full whitespace-nowrap gap-2 shadow-md shadow-blue-600/30 cursor-pointer justify-center py-2 rounded-xl font-semibold text-xs"
                >
                  <span>Book Free Counseling</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* =====================================================================
            2. STUDENT TESTIMONIAL & FULL VISA JOURNEY NARRATIVE
        ===================================================================== */}
        <div className="space-y-8">
          {/* Student Review / Testimonial Quote Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-950/40 via-slate-900/60 to-slate-900/90 border border-blue-500/30 relative overflow-hidden backdrop-blur-xl shadow-xl">
            <MessageSquareQuote className="w-16 h-16 text-blue-500/15 absolute -top-3 -right-3 rotate-12 pointer-events-none" />

            <div className="flex items-center gap-1.5 text-amber-400 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-bold text-slate-300 ml-2">Verified Student Review</span>
            </div>

            <blockquote className="text-base sm:text-xl font-medium text-slate-100 italic leading-relaxed">
              "{story.testimonial || story.storyContent.slice(0, 200) + '...'}"
            </blockquote>

            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-white">{story.studentName}</span>
              <span className="text-blue-400 font-semibold">{story.degreeName} • {story.universityName}</span>
            </div>
          </div>

          {/* Full Visa Journey Narrative Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Full Visa Journey & Experience</h2>
                <p className="text-xs text-slate-400">Step-by-step admissions counsel and embassy preparation insight</p>
              </div>
            </div>

            <div className="text-sm sm:text-base text-slate-300 leading-relaxed space-y-4 whitespace-pre-line pt-2">
              {story.storyContent}
            </div>
          </div>
        </div>

        {/* =====================================================================
            3. RELATED SUCCESS STORIES (Flush Edge Cards with Slugs)
        ===================================================================== */}
        {relatedStories.length > 0 && (
          <div className="pt-10 border-t border-slate-800/80 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">More Student Success Stories</h3>
                <p className="text-xs text-slate-400">Discover other inspiring admissions journeys from Bangladesh</p>
              </div>
              <Link href="/success" className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
                View All Stories →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedStories.map((rel) => (
                <div
                  key={rel.id}
                  className="group rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <Link href={`/success/${rel.slug || rel.id}`} className="block relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer">
                    <img
                      src={rel.thumbnailUrl || rel.photoUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80"}
                      alt={rel.studentName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-white border border-slate-800">
                      {rel.country}
                    </div>

                    {/* Official YouTube Play Badge */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-14 h-10 sm:w-16 sm:h-11 drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fill="#FF0000"
                            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
                          />
                          <path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                      </div>
                    </div>
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <Link href={`/success/${rel.slug || rel.id}`}>
                        <div className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors cursor-pointer">
                          {rel.studentName}
                        </div>
                      </Link>
                      <div className="text-[11px] text-slate-400 mt-0.5 truncate">{rel.universityName}</div>
                      <div className="text-[10px] text-slate-500 truncate">{rel.degreeName}</div>
                    </div>

                    <Link href={`/success/${rel.slug || rel.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs border-slate-700 text-blue-400 hover:text-white hover:bg-blue-600 rounded-lg cursor-pointer">
                        View Full Story
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          4. FOCUSED CINEMA VIDEO MODAL (Responsive, Fullscreen-Ready, Clean Esc)
      ===================================================================== */}
      {mounted && videoModalOpen && createPortal(
        <div
          onClick={() => setVideoModalOpen(false)}
          className="fixed inset-0 top-0 left-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200"
          style={{ margin: 0 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl shadow-blue-950/50"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">
                    {story.studentName} — Visa Success Journey
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Rise Abroad Education × {story.universityName} • {story.country}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Video (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Responsive 16:9 Video Player */}
            <div className="relative aspect-video w-full bg-black">
              {videoEmbedUrl ? (
                <iframe
                  src={videoEmbedUrl}
                  title={`${story.studentName} Visa Success Journey`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                  Video journey is currently unavailable.
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
