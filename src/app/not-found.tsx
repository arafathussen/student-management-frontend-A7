"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/common/Footer";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    document.title = "404 - Page Not Found | Rise Abroad Education";
  }, []);

  return (
    <div
      id="not-found-root"
      className="min-h-[calc(100dvh-4rem-1px)] sm:min-h-[calc(100dvh-5rem-1px)] flex flex-col justify-between bg-[#070d1f] text-slate-100 overflow-x-hidden selection:bg-blue-600 selection:text-white"
    >
      {/* Upper Content Section */}
      <div className="relative flex-1 flex flex-col items-center justify-start px-4 sm:px-6 pt-8 sm:pt-12 pb-6 text-center overflow-hidden">
        {/* Subtle Ambient Glowing Background Orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] h-[250px] bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Central Container - Lifted Up */}
        <div className="max-w-xl w-full mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-300">
          {/* Big 404 Display */}
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-tight bg-gradient-to-r from-blue-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent drop-shadow select-none leading-none">
            404
          </h1>

          {/* Title & Clear Description */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Page Not Found
            </h2>

            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              দুঃখিত, আপনি যে পেজটি খুঁজছেন তা খুঁজে পাওয়া যাচ্ছে না। আপনি সম্ভবত ভুল লিংকে প্রবেশ করেছেন অথবা পেজটি সরিয়ে ফেলা হয়েছে।
            </p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Oops! The page you are looking for does not exist or you may have entered an incorrect URL.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row items-center justify-center gap-3 pt-2">
            {/* Go to Home - Primary User Request */}
            <Link href="/">
              <Button
                variant="gradient"
                size="md"
                className="px-6 py-2.5 font-bold cursor-pointer shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home</span>
              </Button>
            </Link>

            {/* Go Back */}
            <Button
              variant="outline"
              size="md"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-xs text-slate-300 hover:text-white border-slate-700 hover:border-slate-600 bg-slate-900/60 cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Go Back</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Embedded Footer */}
      <Footer embedded={true} />
    </div>
  );
}
