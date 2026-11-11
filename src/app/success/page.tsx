"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Search, 
  GraduationCap, 
  Globe, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  Award, 
  Building2,
  Calendar,
  Filter,
  ChevronDown,
  RotateCcw
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import { 
  successStoryService, 
  SuccessPageSettings, 
  SuccessStoryItem 
} from "@/services/successStoryService";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";

const fallbackStories: SuccessStoryItem[] = [
  {
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
    testimonial: "From Dhaka College to Larnaca, Cyprus! Rise Abroad Education guided me through every step from document apostille to visa interview preparation.",
    storyContent:
      "From Dhaka College to Larnaca, Cyprus! Rise Abroad Education guided me through every step from document apostille to visa interview preparation. With their expert counseling, I secured a 50% tuition scholarship and my European student visa within just 3 weeks.",
  },
  {
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
    testimonial: "Securing my UK visa with zero hassle was made possible by Rise Abroad Education. Their dedicated counselor reviewed my SOP five times and conducted rigorous mock interviews.",
    storyContent:
      "Securing my UK visa with zero hassle was made possible by Rise Abroad Education. Their dedicated counselor reviewed my SOP five times and conducted rigorous mock interviews that made the real embassy interview feel effortless.",
  },
  {
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
    testimonial: "My dream of studying in Canada became a reality through Rise Abroad Education. They provided completely transparent guidelines on the SDS stream and GIC account creation.",
    storyContent:
      "My dream of studying in Canada became a reality through Rise Abroad Education. They provided completely transparent guidelines on the SDS stream, GIC account creation, and financial proof documentation.",
  },
];

export default function SuccessPage() {
  const [stories, setStories] = useState<SuccessStoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("ALL");
  const [countryList, setCountryList] = useState<Array<{ country: string; count: number }>>([]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [settings, setSettings] = useState<SuccessPageSettings>({
    badgeText: "Real Students • Real Visas • Proven Results",
    titlePart1: "Student",
    titlePart2: "Success Stories",
    description: "Celebrating Bangladeshi students accepted into premier global universities. Watch their interviews, read their visa journeys, and discover scholarship awards achieved with Rise Abroad Education.",
    stat1Value: "98.4%",
    stat1Label: "Visa Success Rate",
    stat2Value: "1,250+",
    stat2Label: "Visas Approved",
    stat3Value: "50%+",
    stat3Label: "Average Scholarship",
    stat4Value: "15+",
    stat4Label: "Study Destinations",
  });

  useEffect(() => {
    document.title = "Success Stories | Rise Abroad Education";
    fetchPageSettings();
    fetchCountryStats();
    fetchStories();
  }, [selectedCountry]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPageSettings = async () => {
    try {
      const data = await successStoryService.getSettings();
      if (data) setSettings(data);
    } catch {
      // fallback
    }
  };

  const fetchCountryStats = async () => {
    try {
      const list = await successStoryService.getCountries();
      if (Array.isArray(list) && list.length > 0) {
        setCountryList(list);
      } else {
        // compute from fallback
        const counts: Record<string, number> = {};
        fallbackStories.forEach((s) => {
          counts[s.country] = (counts[s.country] || 0) + 1;
        });
        setCountryList(Object.entries(counts).map(([country, count]) => ({ country, count })));
      }
    } catch {
      const counts: Record<string, number> = {};
      fallbackStories.forEach((s) => {
        counts[s.country] = (counts[s.country] || 0) + 1;
      });
      setCountryList(Object.entries(counts).map(([country, count]) => ({ country, count })));
    }
  };

  const fetchStories = async () => {
    try {
      setLoading(true);
      const res = await successStoryService.getStories({
        country: selectedCountry !== "ALL" ? selectedCountry : undefined,
        limit: 30,
      });

      const items = res?.data || (Array.isArray(res) ? res : null);
      if (items && items.length > 0) {
        setStories(items);
      } else {
        setStories(fallbackStories);
      }
    } catch {
      setStories(fallbackStories);
    } finally {
      setLoading(false);
    }
  };

  // Extract top dynamic countries: top 4 most frequent or clicked
  const topTrendingCountries = useMemo(() => {
    if (countryList.length > 0) {
      return countryList.slice(0, 4).map((c) => c.country);
    }
    return ["Cyprus", "United Kingdom", "Canada", "USA"];
  }, [countryList]);

  // Dynamic Multi-Field Search Filter
  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      const term = searchTerm.trim().toLowerCase();
      const matchCountry =
        selectedCountry === "ALL" ||
        story.country.toLowerCase() === selectedCountry.toLowerCase();

      if (!term) return matchCountry;

      const matchTerm =
        (story.studentName && story.studentName.toLowerCase().includes(term)) ||
        (story.country && story.country.toLowerCase().includes(term)) ||
        (story.homeInstitution && story.homeInstitution.toLowerCase().includes(term)) ||
        (story.hometown && story.hometown.toLowerCase().includes(term)) ||
        (story.universityName && story.universityName.toLowerCase().includes(term)) ||
        (story.degreeName && story.degreeName.toLowerCase().includes(term)) ||
        (story.intake && story.intake.toLowerCase().includes(term)) ||
        (story.scholarshipNote && story.scholarshipNote.toLowerCase().includes(term)) ||
        (story.testimonial && story.testimonial.toLowerCase().includes(term)) ||
        (story.storyContent && story.storyContent.toLowerCase().includes(term));

      return matchCountry && matchTerm;
    });
  }, [stories, searchTerm, selectedCountry]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-6 pb-16 px-4 sm:px-6 lg:px-8">

      {/* =====================================================================
          SEARCH & DYNAMIC SINGLE-LINE COUNTRY FILTER BAR
      ===================================================================== */}
      <div className="max-w-7xl mx-auto mb-8 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          {/* Dynamic Search Box */}
          <div className="relative w-full lg:w-72 xl:w-80 order-2 lg:order-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by student, college, city, university..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 bg-slate-900/80 border-slate-800 text-xs sm:text-sm text-white focus:border-blue-500 h-10 rounded-xl shadow-inner placeholder-slate-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Official Student Visa Grant Archive (Slightly larger, prominent in the center) */}
          <div className="order-1 lg:order-2 shrink-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-sm">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Official Student Visa Grant Archive</span>
            </div>
          </div>

          {/* Dynamic Single-Line Country Filter Strip (Zero wrapping on mobile!) */}
          <div className="w-full lg:w-auto overflow-x-auto no-scrollbar py-1 order-3 shrink-0">
            <div className="flex items-center gap-1.5 min-w-max">
              {/* 1. ALL Button */}
              <button
                onClick={() => setSelectedCountry("ALL")}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCountry === "ALL"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                ALL
              </button>

              {/* 2. Dynamic Top Trending Country Pills */}
              {topTrendingCountries.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCountry(c)}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedCountry.toLowerCase() === c.toLowerCase()
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-1 ring-blue-400"
                      : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {c}
                </button>
              ))}

              {/* 3. All Countries Dropdown Filter Menu */}
              <div className="shrink-0 relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    !["ALL", ...topTrendingCountries.map(t => t.toLowerCase())].includes(selectedCountry.toLowerCase())
                      ? "bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                      : "bg-slate-900/90 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {!["ALL", ...topTrendingCountries.map(t => t.toLowerCase())].includes(selectedCountry.toLowerCase())
                      ? selectedCountry
                      : "All Countries"}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${countryDropdownOpen ? "rotate-180 text-blue-400" : ""}`} />
                </button>

              {countryDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-2xl z-40 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-h-72 overflow-y-auto">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800/80">
                    Filter by Country
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCountry("ALL");
                      setCountryDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      selectedCountry === "ALL"
                        ? "bg-blue-600/20 text-blue-400 font-bold"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <span>All Countries</span>
                    <span className="text-[10px] text-slate-500">{stories.length}</span>
                  </button>

                  {countryList.map((item) => (
                    <button
                      key={item.country}
                      onClick={() => {
                        setSelectedCountry(item.country);
                        setCountryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                        selectedCountry.toLowerCase() === item.country.toLowerCase()
                          ? "bg-blue-600/20 text-blue-400 font-bold"
                          : "text-slate-300 hover:bg-slate-900 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{item.country}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                        {item.count}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Active Filter Info Strip */}
        {(searchTerm || selectedCountry !== "ALL") && (
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/40 px-3.5 py-2 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-2">
              <span>Showing <strong>{filteredStories.length}</strong> success stories</span>
              {selectedCountry !== "ALL" && (
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-medium border border-blue-500/20">
                  Country: {selectedCountry}
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 font-medium border border-indigo-500/20">
                  Search: "{searchTerm}"
                </span>
              )}
            </div>

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCountry("ALL");
              }}
              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* =====================================================================
          SUCCESS STORIES GRID: 16:9 YOUTUBE-STYLE THUMBNAIL CARDS
      ===================================================================== */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-2xl bg-slate-900/50 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-300">No Success Stories Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No matching records for your current search criteria. Try clearing the filter or checking another country.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCountry("ALL");
              }}
              className="mt-4 gap-1.5 text-xs border-slate-700 text-blue-400 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Search Filter
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                className="group rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden h-full"
              >
                {/* Flush 16:9 Thumbnail Preview */}
                <Link
                  href={`/success/${story.slug || story.id}`}
                  className="block relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                >
                  <img
                    src={story.thumbnailUrl || story.photoUrl || "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80"}
                    alt={story.studentName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md text-[10px] font-bold">
                    Visa Approved
                  </div>
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-white border border-slate-800 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-400" />
                    {story.country}
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

                {/* Card Content Info */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/success/${story.slug || story.id}`}>
                          <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors cursor-pointer">
                            {story.studentName}
                          </h3>
                        </Link>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">
                            {story.homeInstitution}
                          </span>
                        </div>
                      </div>

                      {story.scholarshipNote && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold shrink-0">
                          {story.scholarshipNote}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                      <div className="font-semibold text-slate-200 truncate">{story.universityName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{story.degreeName}</div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
                        <span>{story.intake || "Upcoming Intake"}</span>
                        <span className="text-emerald-400 font-medium">Visa Verified</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/success/${story.slug || story.id}`}>
                    <Button variant="outline" size="sm" className="w-full text-xs border-slate-700 text-blue-400 hover:text-white hover:bg-blue-600 rounded-xl cursor-pointer">
                      View Full Visa Journey
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Bottom Banner */}
      <div className="max-w-7xl mx-auto mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-950/60 via-indigo-950/50 to-slate-900 border border-blue-500/30 text-center relative overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 max-w-2xl mx-auto">
          <Trophy className="w-10 h-10 text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
            Want to Be Our Next Success Story?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
            Our specialized admissions team offers complete profile evaluation, university selection, SOP coaching, and mock visa interview preparation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact">
              <Button size="lg" variant="gradient" className="shadow-lg shadow-blue-600/30 text-xs sm:text-sm cursor-pointer">
                Schedule a Free Counseling Session
              </Button>
            </Link>
            <Link href="/universities">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm cursor-pointer">
                Explore Universities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
