"use client";

import React, { useEffect, useState } from "react";

export function AppSplashLoader() {
  const [progress, setProgress] = useState(15);
  const [isRendered, setIsRendered] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // 1. Ensure scrollbar and touch gestures are strictly locked during loading
    if (typeof document !== "undefined") {
      document.documentElement.classList.add("app-splash-active");
      document.body.classList.add("app-splash-active");
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    }

    // 2. Smooth progress simulation on initial load / hard reload
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 94) {
          clearInterval(interval);
          return 94;
        }
        const jump = Math.floor(Math.random() * 10) + 7;
        return Math.min(prev + jump, 94);
      });
    }, 95);

    // 3. After core hydration stabilizes (~750ms), glide to 100%
    const finishTimeout = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      // 4. Brief golden pause (220ms) so user perceives 100% completion before smooth exit
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);

        // 5. Only unlock body scrollbar AFTER the silky 650ms fade-out finishes completely
        const unmountTimer = setTimeout(() => {
          if (typeof document !== "undefined") {
            document.documentElement.classList.remove("app-splash-active");
            document.body.classList.remove("app-splash-active");
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
          }
          setIsRendered(false);
        }, 650);

        return () => clearTimeout(unmountTimer);
      }, 220);

      return () => clearTimeout(fadeTimer);
    }, 750);

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimeout);
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("app-splash-active");
        document.body.classList.remove("app-splash-active");
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }
    };
  }, []);

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-[99999] bg-[#070d1f] flex flex-col items-center justify-center select-none overflow-hidden will-change-[opacity,transform,filter] ${
        isFadingOut 
          ? "opacity-0 scale-[1.04] blur-[10px] pointer-events-none" 
          : "opacity-100 scale-100 blur-0"
      }`}
      style={{
        transition: "opacity 650ms cubic-bezier(0.16, 1, 0.3, 1), transform 650ms cubic-bezier(0.16, 1, 0.3, 1), filter 650ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      aria-hidden={isFadingOut}
    >
      {/* Dynamic Keyframes for Water-wave Shimmer & Wave Dots */}
      <style>{`
        @keyframes waveShimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes dotWave {
          0%, 100% { transform: translateY(0px) scale(0.9); opacity: 0.35; }
          50% { transform: translateY(-2px) scale(1.15); opacity: 1; }
        }
      `}</style>

      {/* Lightweight GPU-accelerated ambient glowing auras */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-cyan-500/15 blur-[130px] pointer-events-none animate-pulse" 
        style={{ animationDuration: '4s' }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -bottom-10 -right-10" 
      />

      {/* Brand Group with smooth floating exit motion */}
      <div 
        className={`relative flex flex-col items-center transition-all duration-500 ease-out ${
          isFadingOut ? "opacity-0 -translate-y-2 scale-95" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Soft breathing halo behind the logo */}
        <div className="absolute -inset-6 rounded-full bg-blue-500/20 blur-2xl animate-pulse pointer-events-none" />

        {/* Authentic Website Logo */}
        <div className="relative flex items-center justify-center mb-2.5">
          <img
            src="/logo.svg"
            alt="Rise Abroad Education"
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.35)]"
          />
        </div>

        {/* 100% Solid White Brand Title */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm text-center">
          Rise Abroad Education
        </h1>

        {/* Clean Subtitle */}
        <p className="text-[10px] sm:text-[11px] text-slate-400 tracking-widest uppercase font-medium mt-0.5 text-center">
          Higher Study & Admissions
        </p>

        {/* Compact, Harmonious Animated Loading & Percentage Line */}
        <div className="mt-3.5 flex items-center justify-center gap-1.5">
          {/* Water-wave light shimmer sweep on LOADING */}
          <span 
            className="text-[10px] sm:text-[11px] font-medium tracking-widest uppercase bg-gradient-to-r from-slate-400 via-white to-slate-400 bg-[length:200%_auto] bg-clip-text text-transparent"
            style={{ animation: "waveShimmer 2.2s linear infinite" }}
          >
            Loading
          </span>

          {/* 3 Dancing / Wave Bouncing Animated Dots */}
          <div className="flex items-center gap-1 mx-0.5">
            <span 
              className="w-1 h-1 rounded-full bg-blue-400" 
              style={{ animation: "dotWave 1.2s ease-in-out infinite 0ms" }} 
            />
            <span 
              className="w-1 h-1 rounded-full bg-indigo-400" 
              style={{ animation: "dotWave 1.2s ease-in-out infinite 200ms" }} 
            />
            <span 
              className="w-1 h-1 rounded-full bg-cyan-400" 
              style={{ animation: "dotWave 1.2s ease-in-out infinite 400ms" }} 
            />
          </div>

          {/* Harmonized, Lightweight Monospace Percentage Indicator */}
          <span className="text-[10px] sm:text-[11px] font-mono font-medium tracking-wider text-blue-400/90 drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
