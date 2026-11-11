"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const routeTitleMap: Record<string, string> = {
  "/": "Home",
  "/universities": "Universities",
  "/dashboard": "Dashboard",
  "/dashboard/profile": "Profile",
  "/dashboard/settings": "Settings",
  "/contact": "Contact",
  "/blogs": "Guides & Blogs",
  "/success": "Success Stories",
  "/login": "Login",
  "/register": "Register",
  "/forgot-password": "Forgot Password",
  "/reset-password": "Reset Password",
  "/verify-otp": "Verify OTP",
  "/counselor": "Counselor Portal",
  "/admin": "Dashboard",
};

export function PageTitleUpdater() {
  const pathname = usePathname();

  useEffect(() => {
    let pageName = routeTitleMap[pathname];

    if (!pageName) {
      if (pathname.startsWith("/universities/")) {
        pageName = "University Details";
      } else if (pathname.startsWith("/blogs/")) {
        pageName = "Guide Details";
      } else if (pathname.startsWith("/dashboard/")) {
        pageName = "Dashboard";
      } else {
        const segment = pathname.split("/").filter(Boolean)[0];
        pageName = segment
          ? segment.charAt(0).toUpperCase() + segment.slice(1)
          : "Home";
      }
    }

    const expectedTitle = `${pageName} | Rise Abroad Education`;
    
    // Set title immediately
    document.title = expectedTitle;

    // Guardian timers: prevent Next.js client hydration from reverting to root layout's default title
    const enforceTitle = () => {
      if (pathname !== "/" && (document.title.startsWith("Home |") || !document.title.startsWith(pageName))) {
        document.title = expectedTitle;
      }
    };

    const t1 = setTimeout(enforceTitle, 50);
    const t2 = setTimeout(enforceTitle, 150);
    const t3 = setTimeout(enforceTitle, 300);
    const t4 = setTimeout(enforceTitle, 600);
    const t5 = setTimeout(enforceTitle, 1000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [pathname]);

  return null;
}
