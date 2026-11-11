"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError: (errorMsg: string) => void;
  isLoading?: boolean;
}

export function GoogleSignInButton({
  onSuccess,
  onError,
  isLoading = false,
}: GoogleSignInButtonProps) {
  const btnContainerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const isInitializedRef = useRef(false);
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "74039791543-bfnpqooo3c2e81tjv3du3d5hjqc2bmua.apps.googleusercontent.com";

  const initGsi = () => {
    if (typeof window === "undefined" || !window.google?.accounts?.id) return;

    try {
      if (!isInitializedRef.current) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response?.credential) {
              onSuccess(response.credential);
            } else {
              onError("Google sign in was cancelled or failed to retrieve credentials.");
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        isInitializedRef.current = true;
      }

      if (btnContainerRef.current) {
        btnContainerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(btnContainerRef.current, {
          theme: "filled_black",
          size: "large",
          type: "standard",
          shape: "rectangular",
          width: 400,
        });
      }
    } catch (err: any) {
      console.error("Failed to initialize Google Sign-In:", err);
      onError(err?.message || "Failed to initialize Google Sign-In");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      initGsi();
    }
  }, [scriptLoaded]);

  return (
    <div className="w-full relative min-h-[40px]">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true);
          initGsi();
        }}
      />

      {/* Premium custom designed dark button (identical to previous UI) */}
      <button
        type="button"
        disabled={isLoading}
        className={`w-full h-10 text-xs font-medium border border-slate-800 bg-slate-950/60 hover:bg-slate-800 text-slate-200 hover:text-white flex items-center justify-center gap-2.5 rounded-xl cursor-pointer transition-colors shadow-sm select-none relative overflow-hidden ${
          isLoading ? "opacity-60 pointer-events-none" : ""
        }`}
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span className="font-medium text-slate-200">Sign in with Google</span>

        {/* Real Google OAuth GIS trigger layer mounted invisibly on top */}
        <div
          ref={btnContainerRef}
          className="absolute inset-0 opacity-[0.001] cursor-pointer overflow-hidden flex items-center justify-center scale-150"
          title="Sign in with Google"
        />
      </button>
    </div>
  );
}
