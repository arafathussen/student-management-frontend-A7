"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { higherStudyService } from "@/services/higherStudyService";
import { Blog } from "@/types";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/common/Footer";
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  Share2,
  Check,
  Tag,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export default function SingleBlogPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlogDetails();
    }
  }, [slug]);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const [singleRes, allRes] = await Promise.all([
        higherStudyService.getBlogBySlug(slug),
        higherStudyService.getBlogs(),
      ]);

      const current: Blog | null = singleRes?.data || null;
      setBlog(current);

      if (current?.title) {
        document.title = `${current.title} | Rise Abroad Education`;
      }

      const allPublished: Blog[] = (allRes?.data || []).filter(
        (b: Blog) =>
          b.status !== "DRAFT" &&
          b.status !== "TRASH" &&
          b.slug !== slug &&
          b.id !== slug
      );
      setRelatedBlogs(allPublished.slice(0, 3));
    } catch (err) {
      console.error("Failed to load blog", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "2026";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "2026";
    }
  };

  const formatArticleHtml = (rawContent: string) => {
    return rawContent
      .replace(/### (.*?)\n/g, '<h3 class="text-lg sm:text-xl font-bold text-white mt-7 mb-2.5">$1</h3>')
      .replace(/## (.*?)\n/g, '<h2 class="text-xl sm:text-2xl font-bold text-white mt-8 mb-3">$1</h2>')
      .replace(
        /> (.*?)\n/g,
        '<blockquote class="border-l-4 border-blue-500 pl-4 py-2.5 my-4 bg-blue-500/10 text-blue-200 rounded-r-xl text-sm">$1</blockquote>'
      )
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/^- (.*?)$/gm, '<li class="ml-5 list-disc text-slate-300 my-1">$1</li>')
      .replace(/\n\n/g, '<div class="h-3.5"></div>');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-800 rounded" />
        <div className="h-10 w-4/5 bg-slate-800 rounded-xl" />
        <div className="h-80 w-full bg-slate-900 rounded-2xl border border-slate-800" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-800 rounded" />
          <div className="h-4 w-5/6 bg-slate-800 rounded" />
          <div className="h-4 w-4/6 bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  const displayTitle =
    blog?.title || "Complete Guide to UK Student Visa (CAS & Bank Statement Rule)";
  const displayCategory = blog?.category || "Study Abroad Guide";
  const displayBanner =
    blog?.bannerUrl ||
    blog?.coverImage ||
    "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80";
  const displayContent =
    blog?.content ||
    "Detailed study abroad admission and visa documentation instructions.";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <article className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to All Guides</span>
          </Link>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Share Guide</span>
              </>
            )}
          </button>
        </div>

        {/* Article Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-bold">
              {displayCategory}
            </span>
            {blog?.tags?.map((t, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium"
              >
                <Tag className="w-3 h-3 text-slate-400" />
                {t}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {displayTitle}
          </h1>

          {blog?.excerpt && (
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-400 pt-2 border-b border-slate-800/80 pb-5">
            <span className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                <User className="w-3.5 h-3.5" />
              </span>
              <strong className="text-slate-200">
                {blog?.author?.name || "Rise Abroad Editorial Desk"}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{formatDate(blog?.createdAt)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{blog?.readTime || "5 min read"}</span>
            </span>
          </div>
        </div>

        {/* Featured 16:9 Banner */}
        <div className="rounded-2xl overflow-hidden border border-slate-800/90 aspect-video w-full bg-slate-900 shadow-2xl">
          <img
            src={displayBanner}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body Content */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-slate-300 text-sm sm:text-base leading-relaxed">
          <div
            dangerouslySetInnerHTML={{
              __html: formatArticleHtml(displayContent),
            }}
          />
        </div>

        {/* Related Guides Section */}
        {relatedBlogs.length > 0 && (
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>More Study Abroad Guides</span>
              </h2>
              <Link
                href="/blogs"
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedBlogs.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blogs/${rel.slug}`}
                  className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/30 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      {rel.category || "Study Guide"}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{rel.readTime || "5 min read"}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-white text-base sm:text-lg">
              Need 1-on-1 Help With Your University Application?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              Browse accredited partner universities or speak directly with our senior counselors.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/universities">
              <Button variant="primary" size="sm" className="cursor-pointer">
                <span>Explore Universities</span>
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="sm" className="cursor-pointer">
                <span>Contact Desk</span>
              </Button>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
