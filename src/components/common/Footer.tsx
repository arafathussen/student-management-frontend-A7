"use client";

import {
	BookOpen,
	Globe,
	GraduationCap,
	Heart,
	Mail,
	MapPin,
	Phone,
	ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

interface FooterProps {
	embedded?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ embedded = false }) => {
	const pathname = usePathname();
	const router = useRouter();

	const handleLogoClick = (e: React.MouseEvent) => {
		if (pathname === "/") {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: "smooth" });
		} else {
			e.preventDefault();
			router.push("/");
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const isDashboard = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

	// Don't render the outer footer on dashboard/admin pages (it's embedded inside the scrollable workspace)
	// or when rendered inside not-found page
	if (!embedded) {
		if (isDashboard) return null;
		if (typeof document !== "undefined" && document.getElementById("not-found-root")) {
			return null;
		}
	}

	return (
		<footer className={`border-t border-slate-800/80 bg-slate-950 ${embedded ? "pt-8 pb-6 mt-4 sm:mt-6" : "pt-16 pb-12"}`}>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
					{/* Brand & Bio */}
					<div className="lg:col-span-2 space-y-4">
						<Link 
							href="/" 
							onClick={handleLogoClick}
							className="flex items-center gap-0.5 sm:gap-1 group inline-flex cursor-pointer"
						>
							<img
								src="/logo.svg"
								alt="Rise Abroad Education"
								className="h-10 w-10 sm:h-12 sm:w-12 object-contain group-hover:scale-105 transition-transform"
							/>
							<div>
								<div className="font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-blue-100 transition-colors">
									Rise Abroad Education
								</div>
								<p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
									Higher Study & Admissions
								</p>
							</div>
						</Link>
						<p className="text-sm text-slate-400 leading-relaxed pr-6">
							Direct admissions, transparent scholarship counseling, official
							university partnerships, and automated visa pipeline management for
							international students worldwide.
						</p>
						<div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
							<ShieldCheck className="w-4 h-4 text-emerald-400" />
							<span>Verified Global Partner Institutions</span>
						</div>
					</div>

					{/* Destinations */}
					<div className="space-y-3">
						<h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
							Top Destinations
						</h4>
						<ul className="space-y-2 text-sm text-slate-400">
							<li>
								<Link
									href="/universities?country=UK"
									className="hover:text-blue-400 transition-colors"
								>
									United Kingdom
								</Link>
							</li>
							<li>
								<Link
									href="/universities?country=CA"
									className="hover:text-blue-400 transition-colors"
								>
									Canada
								</Link>
							</li>
							<li>
								<Link
									href="/universities?country=CY"
									className="hover:text-blue-400 transition-colors"
								>
									Cyprus (Europe)
								</Link>
							</li>
							<li>
								<Link
									href="/universities?country=DE"
									className="hover:text-blue-400 transition-colors"
								>
									Germany
								</Link>
							</li>
							<li>
								<Link
									href="/universities?country=US"
									className="hover:text-blue-400 transition-colors"
								>
									United States
								</Link>
							</li>
						</ul>
					</div>

					{/* Quick Portals */}
					<div className="space-y-3">
						<h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
							Student Services
						</h4>
						<ul className="space-y-2 text-sm text-slate-400">
							<li>
								<Link
									href="/login"
									className="hover:text-blue-400 transition-colors"
								>
									Apply Online
								</Link>
							</li>
							<li>
								<Link
									href="/dashboard"
									className="hover:text-blue-400 transition-colors"
								>
									Student Dashboard
								</Link>
							</li>
							<li>
								<Link
									href="/blogs"
									className="hover:text-blue-400 transition-colors"
								>
									Visa & Financial Guides
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="hover:text-blue-400 transition-colors"
								>
									Contact & Support Desk
								</Link>
							</li>
							<li>
								<Link
									href="/login"
									className="hover:text-blue-400 transition-colors"
								>
									Counselor & Staff Desk
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact Info */}
					<div className="space-y-3">
						<h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
							Admissions Desk
						</h4>
						<ul className="space-y-2 text-sm text-slate-400">
							<li className="flex items-center gap-2">
								<Mail className="w-4 h-4 text-slate-500" />
								<span>admissions@riseabroad.com</span>
							</li>
							<li className="flex items-center gap-2">
								<Phone className="w-4 h-4 text-slate-500" />
								<span>+880 1700-000000</span>
							</li>
							<li className="flex items-start gap-2">
								<MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
								<span>Gulshan-2, Dhaka 1212, Bangladesh</span>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-12 pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
					<p>
						© {new Date().getFullYear()} Rise Abroad Education. All rights reserved.
					</p>
					<div className="flex items-center gap-6">
						<Link href="/" className="hover:text-slate-400">
							Privacy Policy
						</Link>
						<Link href="/" className="hover:text-slate-400">
							Terms of Service
						</Link>
						<Link href="/contact" className="hover:text-slate-400">
							Help & Support
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
};
