"use client";

import React, { useEffect, useState } from "react";

interface PortalLoadingScreenProps {
  isLoading: boolean;
  onFinished?: () => void;
}

export function PortalLoadingScreen({ isLoading, onFinished }: PortalLoadingScreenProps) {
  const [progress, setProgress] = useState(18);
  const [isRendered, setIsRendered] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isLoading) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 94) return 94;
          const jump = Math.floor(Math.random() * 8) + 4;
          return Math.min(prev + jump, 94);
        });
      }, 150);
    } else {
      setProgress(100);
      const finishTimer = setTimeout(() => {
        setIsFadingOut(true);
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        const removeTimer = setTimeout(() => {
          setIsRendered(false);
          if (onFinished) onFinished();
        }, 300);
        return () => clearTimeout(removeTimer);
      }, 200);

      return () => clearTimeout(finishTimer);
    }

    return () => {
      clearInterval(timer);
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isLoading, onFinished]);

  if (!isRendered) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-300 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
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
        className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600/10 via-indigo-600/5 to-cyan-500/10 blur-[130px] pointer-events-none animate-pulse" 
        style={{ animationDuration: '4s' }}
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none -bottom-10 -right-10" 
      />

      {/* Brand Group */}
      <div className="relative flex flex-col items-center">
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
        <div className="mt-3 flex items-center justify-center gap-1.5">
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
