"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useUniversitiesQuery, useCountriesQuery } from "@/hooks/usePortalQueries";
import { useDebounce } from "@/hooks/useDebounce";
import { University, Country } from "@/types";
import { UniversityCard } from "@/components/higher-study/UniversityCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Filter,
  Building2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ITEMS_PER_PAGE = 6;

function UniversitiesCatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL search params for bookmarkable / shareable views
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCountry, setSelectedCountry] = useState<string>(
    searchParams.get("country") || "ALL"
  );
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>(
    searchParams.get("paymentType") || "ALL"
  );
  const [selectedTag, setSelectedTag] = useState<string>(
    searchParams.get("tag") || "ALL"
  );
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sort") || "ranking"
  );
  const [currentPage, setCurrentPage] = useState<number>(
    Math.max(1, Number(searchParams.get("page") || "1"))
  );

  const debouncedSearch = useDebounce(searchTerm, 300);

  // TanStack Query cached server state
  const { data: universities = [], isLoading: uniLoading } =
    useUniversitiesQuery();
  const { data: countries = [], isLoading: countryLoading } =
    useCountriesQuery();
  const loading = uniLoading || countryLoading;

  useEffect(() => {
    document.title = "Universities | Rise Abroad Education";
  }, []);

  // Synchronize filter, search, sort & pagination state to URL query parameters
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());
    if (selectedCountry !== "ALL") params.set("country", selectedCountry);
    if (selectedPaymentType !== "ALL")
      params.set("paymentType", selectedPaymentType);
    if (selectedTag !== "ALL") params.set("tag", selectedTag);
    if (sortBy !== "ranking") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));

    const queryString = params.toString();
    const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(targetUrl, { scroll: false });
  }, [
    debouncedSearch,
    selectedCountry,
    selectedPaymentType,
    selectedTag,
    sortBy,
    currentPage,
    pathname,
    router,
  ]);

  const publishedUniversities = (universities as University[]).filter(
    (uni) => !uni.isDeleted && uni.status !== "DRAFT" && !uni.isDraft
  );

  const allTags = Array.from(
    new Set(
      publishedUniversities.flatMap((u) => u.tags || []).filter(Boolean)
    )
  );

  const filteredUniversities = publishedUniversities
    .filter((uni) => {
      const q = debouncedSearch.toLowerCase();
      const matchesSearch =
        !q ||
        uni.name.toLowerCase().includes(q) ||
        uni.city.toLowerCase().includes(q) ||
        uni.country?.name.toLowerCase().includes(q) ||
        (uni.tags && uni.tags.some((t: string) => t.toLowerCase().includes(q)));

      const matchesCountry =
        selectedCountry === "ALL" ||
        uni.countryId === selectedCountry ||
        uni.country?.name === selectedCountry;

      const matchesPayment =
        selectedPaymentType === "ALL" ||
        uni.offerLetterPaymentType === selectedPaymentType;

      const matchesTag =
        selectedTag === "ALL" ||
        (uni.tags &&
          uni.tags.some(
            (t: string) => t.toLowerCase() === selectedTag.toLowerCase()
          ));

      return matchesSearch && matchesCountry && matchesPayment && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "ranking") {
        const rankA = a.worldRanking || 9999;
        const rankB = b.worldRanking || 9999;
        return rankA - rankB;
      }
      return 0;
    });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUniversities.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedUniversities = filteredUniversities.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCountry("ALL");
    setSelectedPaymentType("ALL");
    setSelectedTag("ALL");
    setSortBy("ranking");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen py-8 px-4 max-w-7xl mx-auto">
      {/* Search, Filter & Sort Bar (URL State Synchronized) */}
      <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-4 sm:p-5 rounded-2xl mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search Input */}
          <div className="md:col-span-4">
            <Input
              type="text"
              placeholder="Search by university, city, or tag..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              icon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>

          {/* Country Filter */}
          <div className="md:col-span-3 flex items-center gap-2">
            <div className="relative w-full">
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
              >
                <option value="ALL">🌍 All Countries</option>
                {(countries as Country[]).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.flagUrl ? `${c.flagUrl} ` : ""} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Offer Letter Payment Type */}
          <div className="md:col-span-3">
            <select
              value={selectedPaymentType}
              onChange={(e) => {
                setSelectedPaymentType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
            >
              <option value="ALL">📄 All Offer Types</option>
              <option value="FREE">🎉 100% Free Offer Download</option>
              <option value="DEPOSIT_REQUIRED">🔒 Deposit / Tuition Required</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <div className="relative w-full">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Sort universities"
                className="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-lg text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer"
              >
                <option value="ranking">🏆 Top Ranked</option>
                <option value="name">🔤 Name (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Popular Destinations:
          </span>
          <button
            onClick={() => {
              setSelectedCountry("ALL");
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              selectedCountry === "ALL"
                ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                : "bg-slate-800/60 text-slate-400 hover:text-white"
            }`}
          >
            All
          </button>
          {(countries as Country[]).slice(0, 5).map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCountry(c.id);
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                selectedCountry === c.id
                  ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              {c.name}
            </button>
          ))}

          {allTags.length > 0 && (
            <div className="w-full flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-400 font-medium">
                Filter by Tag:
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedTag("ALL");
                  setCurrentPage(1);
                }}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  selectedTag === "ALL"
                    ? "bg-blue-600/30 text-blue-300 border border-blue-500/40"
                    : "bg-slate-800/50 text-slate-400 hover:text-white"
                }`}
              >
                All Tags
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSelectedTag(selectedTag === tag ? "ALL" : tag);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                    selectedTag === tag
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/80"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}

          <span className="ml-auto text-xs text-slate-400 flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
            Showing <strong className="text-white">{filteredUniversities.length}</strong>{" "}
            Universities
          </span>
        </div>
      </div>

      {/* University Grid with Skeleton Loader */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-3/4 rounded bg-slate-800" />
                  <div className="h-3.5 w-1/2 rounded bg-slate-800/70" />
                </div>
              </div>
              <div className="h-16 w-full rounded-xl bg-slate-800/50" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 w-24 rounded-full bg-slate-800" />
                <div className="h-9 w-28 rounded-xl bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredUniversities.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto">
          <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">
            No Universities Found
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">
            Try adjusting your search criteria or resetting filters to view more
            options.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters}>
            Reset All Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedUniversities.map((uni) => (
              <UniversityCard key={uni.id} university={uni} />
            ))}
          </div>

          {/* URL-Synchronized Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                <span>Previous</span>
              </Button>
              <div className="flex items-center gap-1.5 px-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        pageNum === safePage
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function UniversitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen py-10 px-4 max-w-7xl mx-auto animate-pulse">
          <div className="h-10 w-80 rounded-xl bg-slate-800 mx-auto mb-10" />
          <div className="h-24 w-full rounded-2xl bg-slate-900 mb-8" />
        </div>
      }
    >
      <UniversitiesCatalogContent />
    </Suspense>
  );
}
