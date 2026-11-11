import { NextRequest, NextResponse } from "next/server";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];
const COUNSELOR_ROLES = ["COUNSELOR", "SUPER_ADMIN", "ADMIN"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get("ra_auth")?.value === "1";
  const userRole = request.cookies.get("ra_role")?.value || "";

  // Enforce role-based access control on /admin/* routes
  if (pathname.startsWith("/admin")) {
    if (isAuthenticated && userRole && !ADMIN_ROLES.includes(userRole)) {
      const target = userRole === "COUNSELOR" ? "/counselor" : "/dashboard";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  // Enforce role-based access control on /counselor/* routes
  if (pathname.startsWith("/counselor")) {
    if (isAuthenticated && userRole && !COUNSELOR_ROLES.includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/counselor/:path*", "/dashboard/:path*"],
};

