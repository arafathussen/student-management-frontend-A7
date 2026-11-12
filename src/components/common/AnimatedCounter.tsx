"use client";

import React, { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
  ready?: boolean;
}

export function AnimatedCounter({
  value,
  duration = 1100,
  className = "",
  ready = true,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState("");
  const ref = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const lastNumericRef = useRef<number>(0);

  useEffect(() => {
    if (!ready) {
      return;
    }

    let isCancelled = false;
    animatedRef.current = false;

    const cancelPendingFrame = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const startCountAnimation = () => {
      cancelPendingFrame();

      const match = value.match(/^([^0-9.-]*)([0-9,.]+)(.*)$/);
      if (!match) {
        setDisplayValue(value);
        return;
      }

      const prefix = match[1] || "";
      const rawNum = match[2];
      const suffix = match[3] || "";
      const hasCommas = rawNum.includes(",");
      const targetNum = parseFloat(rawNum.replace(/,/g, "")) || 0;
      const startNum = lastNumericRef.current;
      const decimalPart = rawNum.replace(/,/g, "").split(".")[1];
      const decimals = decimalPart ? decimalPart.length : 0;

      if (startNum === targetNum) {
        setDisplayValue(value);
        return;
      }

      let startTime: number | null = null;
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

      const step = (timestamp: number) => {
        if (isCancelled) return;
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const current = startNum + (targetNum - startNum) * easedProgress;
        lastNumericRef.current = current;

        let formattedNum = current.toFixed(decimals);
        if (hasCommas) {
          const parts = formattedNum.split(".");
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          formattedNum = parts.join(".");
        }

        setDisplayValue(`${prefix}${formattedNum}${suffix}`);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          lastNumericRef.current = targetNum;
          rafRef.current = null;
          setDisplayValue(value);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animatedRef.current && !isCancelled) {
          animatedRef.current = true;
          startCountAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      isCancelled = true;
      observer.disconnect();
      cancelPendingFrame();
    };
  }, [value, duration, ready]);

  // If not yet ready, show a subtle static placeholder
  if (!ready) {
    return (
      <span
        ref={ref}
        className={`inline-block h-6 w-14 rounded-md bg-slate-800/80 animate-pulse align-middle ${className}`}
        aria-hidden="true"
      />
    );
  }

  // If ready but not yet scrolled into view, show initial zero formatted version
  const getInitialPlaceholder = () => {
    const match = value.match(/^([^0-9.-]*)([0-9,.]+)(.*)$/);
    if (!match) return value;
    const prefix = match[1] || "";
    const rawNum = match[2];
    const suffix = match[3] || "";
    const zeroNum = rawNum.replace(/[0-9]/g, "0");
    return `${prefix}${zeroNum}${suffix}`;
  };

  return (
    <span ref={ref} className={className}>
      {displayValue || getInitialPlaceholder()}
    </span>
  );
}
