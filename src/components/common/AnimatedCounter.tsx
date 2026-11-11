"use client";

import React, { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1400,
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState("");
  const ref = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    // Reset if value changes
    animatedRef.current = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          startCountAnimation();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [value, duration]);

  const startCountAnimation = () => {
    const match = value.match(/^([^0-9.-]*)([0-9,.]+)(.*)$/);
    if (!match) {
      setDisplayValue(value);
      return;
    }

    const prefix = match[1] || "";
    const rawNum = match[2];
    const suffix = match[3] || "";
    const hasCommas = rawNum.includes(",");
    const num = parseFloat(rawNum.replace(/,/g, "")) || 0;
    const decimalPart = rawNum.replace(/,/g, "").split(".")[1];
    const decimals = decimalPart ? decimalPart.length : 0;

    let startTime: number | null = null;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = num * easedProgress;

      let formattedNum = current.toFixed(decimals);
      if (hasCommas) {
        const parts = formattedNum.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        formattedNum = parts.join(".");
      }

      setDisplayValue(`${prefix}${formattedNum}${suffix}`);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(step);
  };

  // If not yet started, show initial zero formatted version
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
