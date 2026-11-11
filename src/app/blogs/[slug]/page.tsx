"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { higherStudyService } from "@/services/higherStudyService";
import { Blog } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Clock, Calendar, User, Share2, Bookmark, CheckCircle2 } from "lucide-react";

export default function SingleBlogPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBlogDetails();
    }
  }, [slug]);

  const fetchBlogDetails = async () => {
    try {
      setLoading(true);
      const res = await higherStudyService.getBlogBySlug(slug);
      setBlog(res.data);
    } catch (err) {
      console.error("Failed to load blog", err);
    } finally {
      setLoading(false);
    }
  };

  // Fallback content if backend returns null
  const displayTitle = blog?.title || "Complete UK Student Visa (CAS) & Financial Proof Guide 2025";
  const displayContent = blog?.content || `
### 1. Understanding the Confirmation of Acceptance for Studies (CAS)
A CAS is a unique reference number that your UK university provides once you have fulfilled all academic conditions, submitted your initial tuition deposit, and passed any mandatory pre-CAS credibility interviews.

### 2. Maintenance Funds & 28-Day Financial Rule
One of the most critical requirements for UKVI is proving you have enough money to support yourself:
- **Inside London:** £1,334 per month (up to a maximum of 9 months = £12,006).
- **Outside London:** £1,023 per month (up to a maximum of 9 months = £9,207).

> **Crucial Rule:** The funds MUST be held in an acceptable bank account continuously for a minimum consecutive period of **28 days**. The closing balance must not fall below the required threshold for even a single day.

### 3. Tuberculosis (TB) Screening Certificate
Students from high-risk countries (including Bangladesh, India, Pakistan, Nigeria) must undergo a TB screening test at an approved clinic (such as IOM Migration Health Assessment Center).

### 4. Credibility Interview Preparation
During the visa processing stage, UKVI immigration officers may conduct a credibility interview. Expect questions regarding:
1. Why did you choose this specific university over others?
2. What are the core modules of your selected program?
3. How does this course align with your long-term career trajectory back in your home country?
4. How are your studies being funded?
  `;

  return (
    <div className="min-h-screen py-10 px-4 max-w-4xl mx-auto space-y-8">
      <div>
        <Link
          href="/blogs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all guides
        </Link>
      </div>

      {/* Article Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {blog?.tags?.map((t, idx) => (
            <Badge key={idx} variant="primary">
              {t}
            </Badge>
          )) || <Badge variant="primary">UK Visa Guide</Badge>}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {displayTitle}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-b border-slate-800 pb-4">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary-400" />
            UniNext Admissions Editorial
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Updated Sep 2025
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            6 min read
          </span>
        </div>
      </div>

      {/* Featured Image */}
      <div className="rounded-2xl overflow-hidden border border-slate-800 h-64 sm:h-96 w-full relative">
        <img
          src={
            blog?.coverImage ||
            "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80"
          }
          alt={displayTitle}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Body */}
      <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
        <div
          dangerouslySetInnerHTML={{
            __html: displayContent
              .replace(/### (.*?)\n/g, '<h3 class="text-xl font-bold text-white mt-6 mb-2">$1</h3>')
              .replace(/> (.*?)\n/g, '<blockquote class="border-l-4 border-primary-500 pl-4 py-2 my-3 bg-primary-500/10 text-primary-200 rounded-r-lg">$1</blockquote>')
              .replace(/\n\n/g, "<p class='mb-3'></p>"),
          }}
        />
      </div>

      {/* CTA Box */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-primary-950/40 via-slate-900 to-slate-900 border border-primary-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
        <div>
          <h4 className="font-bold text-white text-base">
            Ready to apply to UK or Global Universities?
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Get personalized SOP evaluation, scholarship matching, and fast-track offer processing.
          </p>
        </div>
        <Link href="/universities" className="shrink-0">
          <Button variant="gradient">Explore Universities</Button>
        </Link>
      </div>
    </div>
  );
}
