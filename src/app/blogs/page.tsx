"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { higherStudyService } from "@/services/higherStudyService";
import { Blog } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Compass, 
  GraduationCap, 
  FileText 
} from "lucide-react";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");

  useEffect(() => {
    document.title = "Guides & Blogs | Rise Abroad Education";
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await higherStudyService.getBlogs();
      setBlogs(res.data || []);
    } catch (err) {
      console.error("Failed to load blogs", err);
    } finally {
      setLoading(false);
    }
  };

  const defaultBlogs: Partial<Blog>[] = [
    {
      id: "demo-1",
      slug: "complete-uk-student-visa-guide-2025",
      title: "Complete UK Student Visa (CAS) & Financial Proof Guide",
      excerpt: "Step-by-step roadmap to successfully applying for a UK Tier 4 / Student Visa, maintenance fund requirements, and tuberculosis testing.",
      coverImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80",
      tags: ["UK Visa", "CAS", "Finance"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-2",
      slug: "how-to-write-winning-sop-scholarship",
      title: "How to Write a Winning Statement of Purpose (SOP) for Scholarships",
      excerpt: "Avoid common mistakes that lead to rejection. Learn structure, hooks, career goal articulation, and professorial alignment.",
      coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
      tags: ["SOP", "Scholarship", "Admissions"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-3",
      slug: "germany-blocked-account-public-universities",
      title: "Studying in Germany: Blocked Account, APS, & English Taught Masters",
      excerpt: "Everything you need to know about zero-tuition German public universities, Expatrio blocked account deposit, and APS certificate processing.",
      coverImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80",
      tags: ["Germany", "Blocked Account", "Free Tuition"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "demo-4",
      slug: "usa-f1-visa-interview-questions",
      title: "Top 25 US F-1 Visa Interview Questions & Best Answers",
      excerpt: "Master your visa interview at the US Embassy. How to demonstrate strong home ties, explain gap years, and articulate sponsor funds.",
      coverImage: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80",
      tags: ["USA", "F-1 Visa", "Interview Tips"],
      createdAt: new Date().toISOString(),
    },
  ];

  const allArticles = blogs.length > 0 ? blogs : (defaultBlogs as Blog[]);

  const filteredBlogs = allArticles.filter((b) => {
    const matchesSearch =
      (b.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.excerpt || b.content || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag =
      selectedTag === "ALL" || (b.tags && b.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen py-10 px-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <Badge variant="primary" className="mb-3">
          <BookOpen className="w-3.5 h-3.5 mr-1" />
          Knowledge Hub & Visa Guides
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Study Abroad Insights & Application Guides
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base">
          Expert articles on university admissions, visa interviews, financial proofs, and scholarship strategies.
        </p>
      </div>

      {/* Search and Tag filter */}
      <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-4 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-96">
          <Input
            type="text"
            placeholder="Search guides by keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {["ALL", "UK Visa", "USA", "Germany", "SOP", "Scholarship"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                selectedTag === tag
                  ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <Link
            key={blog.id || blog.slug}
            href={`/blogs/${blog.slug}`}
            className="group block"
          >
            <Card className="h-full border-slate-800/80 bg-slate-900/60 backdrop-blur-md overflow-hidden hover:border-primary-500/50 hover:shadow-xl transition-all flex flex-col">
              <div className="relative h-48 w-full bg-slate-800 overflow-hidden">
                {blog.coverImage || (blog as any).bannerUrl ? (
                  <img
                    src={blog.coverImage || (blog as any).bannerUrl}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <img
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {blog.tags?.slice(0, 2).map((t, idx) => (
                    <Badge key={idx} variant="primary" className="text-[10px]">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              <CardContent className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white group-hover:text-primary-300 transition-colors line-clamp-2 text-base mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {blog.excerpt}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 5 min read
                  </span>
                  <span className="text-primary-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Read Guide <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
