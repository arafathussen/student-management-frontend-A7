"use client";

import { useEffect, useRef } from "react";
import { userService } from "@/services/userService";

export function VisitorTracker() {
  const hasTrackedMount = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasTrackedMount.current) return;
    hasTrackedMount.current = true;

    // Get or create anonymous session ID for this browser session
    let sessionId = sessionStorage.getItem("visitor_session_id");
    if (!sessionId) {
      sessionId = `guest_${Math.random().toString(36).substring(2, 10)}`;
      sessionStorage.setItem("visitor_session_id", sessionId);
    }

    // Ping visitor session on page load/reload (increments total visits & tracks unique IP)
    userService.pingVisitor(sessionId, true).catch(() => {});

    // Periodic heartbeat every 60s while browsing (updates live session without re-incrementing total visits)
    const interval = setInterval(() => {
      userService.pingVisitor(sessionId!, false).catch(() => {});
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
