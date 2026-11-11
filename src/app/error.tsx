"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error Boundary caught an error:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#070d1f]">
      <Card className="w-full max-w-lg border-red-500/20 bg-slate-900/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-amber-500 to-rose-600" />
        <CardContent className="p-6 sm:p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto shadow-lg shadow-red-500/10">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Unexpected Application Error</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Something went wrong
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              {error?.message ||
                "An unexpected error occurred while rendering this view. You can retry the request or return to the home portal."}
            </p>
          </div>

          {error?.digest && (
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-500">
              Error Digest: {error.digest}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => reset()}
              className="w-full sm:w-auto cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              <span>Try Again</span>
            </Button>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full cursor-pointer">
                <Home className="w-4 h-4 mr-2" />
                <span>Return Home</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

