"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { higherStudyService } from "@/services/higherStudyService";
import { Blog } from "@/types";
import { Footer } from "@/components/common/Footer";
import {
  BookOpen,
  Search,
  Clock,
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Tag,
  X,
} from "lucide-react";

const PAGE_SIZE = 6;

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    document.title = "Study Guides & Visa Articles | Rise Abroad Education";
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await higherStudyService.getBlogs();
      const all: Blog[] = Array.isArray(res.data) ? res.data : [];
      // Only show PUBLISHED guides on the public page
      const published = all.filter((b) => b.status !== "DRAFT" && b.status !== "TRASH");
      setBlogs(published);
    } catch (err) {
      console.error("Failed to load blogs", err);
    } finally {
      setLoading(false);
    }
  };

  // Extract dynamic categories from published blogs
  const categories = useMemo(() => {
    const base = new Set<string>(["ALL"]);
    blogs.forEach((b) => {
      if (b.category?.trim()) base.add(b.category.trim());
    });
    return Array.from(base);
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        (b.title || "").toLowerCase().includes(q) ||
        (b.excerpt || "").toLowerCase().includes(q) ||
        (b.content || "").toLowerCase().includes(q) ||
        (b.category || "").toLowerCase().includes(q) ||
        (b.tags || []).some((t) => t.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "ALL" ||
        (b.category || "").toLowerCase() === selectedCategory.toLowerCase() ||
        (b.tags || []).some((t) => t.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchTerm, selectedCategory]);

  // Reset to page 1 when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredBlogs.length / PAGE_SIZE));
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "2026";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "2026";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
        {/* Clean Minimal Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wide">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Knowledge Hub &amp; Study Abroad Guides</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Higher Study Insights &amp;{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Visa Handbooks
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Step-by-step guides on university admissions, student visa interviews, financial proof rules, and merit scholarship strategies.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80 lg:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search guides, countries, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                    active
                      ? "bg-blue-600/20 text-blue-400 border-blue-500/40 shadow-sm shadow-blue-950/50"
                      : "bg-slate-950/80 text-slate-400 hover:text-white border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {cat === "ALL" ? "All Guides" : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-900/50 border border-slate-800/80 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-slate-800/70" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-24 bg-slate-800 rounded" />
                  <div className="h-5 w-full bg-slate-800 rounded" />
                  <div className="h-4 w-4/5 bg-slate-800/70 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedBlogs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Matching Study Guides Found</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Try clearing your search keyword or switching back to All Guides.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("ALL");
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Modern Blog Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedBlogs.map((blog) => {
                const banner =
                  blog.bannerUrl ||
                  blog.coverImage ||
                  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&q=80";

                return (
                  <Link
                    key={blog.id || blog.slug}
                    href={`/blogs/${blog.slug}`}
                    className="group rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-900/80 overflow-hidden transition-all flex flex-col justify-between shadow-lg shadow-black/20"
                  >
                    <div>
                      {/* 16:9 Cover Banner */}
                      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                        <img
                          src={banner}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                        {/* Category Pill */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-blue-400 text-[11px] font-bold">
                            {blog.category || "Study Guide"}
                          </span>
                        </div>

                        {/* Read Time */}
                        <div className="absolute bottom-2.5 right-3 flex items-center gap-1 text-[11px] text-slate-200 font-medium bg-slate-950/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800">
                          <Clock className="w-3 h-3 text-blue-400" />
                          <span>{blog.readTime || "5 min read"}</span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {blog.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/70 text-slate-300 text-[10px] font-medium"
                              >
                                <Tag className="w-2.5 h-2.5 text-slate-400" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                          {blog.title}
                        </h2>

                        <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                          {blog.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-5 py-3.5 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formatDate(blog.createdAt)}</span>
                      </span>

                      <span className="text-blue-400 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80">
                <p className="text-xs text-slate-400">
                  Showing{" "}
                  <strong className="text-white">
                    {(currentPage - 1) * PAGE_SIZE + 1}–
                    {Math.min(currentPage * PAGE_SIZE, filteredBlogs.length)}
                  </strong>{" "}
                  of <strong className="text-white">{filteredBlogs.length}</strong> guides
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-950/60"
                          : "bg-slate-900 text-slate-400 hover:text-white border-slate-800"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
