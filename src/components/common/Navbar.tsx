"use client";

import { RoleBadge } from "@/components/common/RoleBadge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import {
	ChevronDown,
	GraduationCap,
	LayoutDashboard,
	LogOut,
	Menu,
	MessageSquare,
	Shield,
	User,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useRef, useEffect } from "react";

export const Navbar: React.FC = () => {
	const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();

	const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(2);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("unread_notifications_count");
			if (saved !== null) {
				setUnreadNotificationCount(parseInt(saved, 10));
			}
		}

		const handleNotificationChange = (e: any) => {
			if (e.detail !== undefined) {
				setUnreadNotificationCount(e.detail);
			} else if (typeof window !== "undefined") {
				const saved = localStorage.getItem("unread_notifications_count");
				setUnreadNotificationCount(saved !== null ? parseInt(saved, 10) : 0);
			}
		};

		window.addEventListener("notifications-count-change", handleNotificationChange);
		return () => window.removeEventListener("notifications-count-change", handleNotificationChange);
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsProfileOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const getDashboardLink = () => "/dashboard";

	const handleLogoClick = (e: React.MouseEvent) => {
		if (pathname === "/") {
			e.preventDefault();
			window.scrollTo({ top: 0, behavior: "smooth" });
		} else {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const navLinks = [
		{ name: "Home", href: "/" },
		{ name: "Universities", href: "/universities" },
		{ name: "Services", href: "/services" },
		{ name: "About", href: "/about" },
		{ name: "Guides", href: "/blogs" },
		{ name: "Success", href: "/success" },
		{ name: "Contact", href: "/contact" },
	];

	return (
		<header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#0b1329] shadow-sm shadow-blue-950/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16 sm:h-20">
					{/* Brand Logo */}
					<Link 
						href="/" 
						onClick={handleLogoClick}
						className="flex items-center gap-0.5 sm:gap-1 group cursor-pointer outline-none focus:outline-none focus-visible:outline-none focus:ring-0"
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

					{/* Desktop Navigation */}
					<nav className="hidden md:flex items-center gap-1.5">
						{navLinks.map((link) => {
							const isActive = pathname === link.href;
							return (
								<Link
									key={link.href}
									href={link.href}
									onClick={(e) => {
										if (link.href === "/" && pathname === "/") {
											e.preventDefault();
											window.scrollTo({ top: 0, behavior: "smooth" });
										}
									}}
									className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-150 border outline-none focus:outline-none focus-visible:outline-none focus:ring-0 select-none ${
										isActive
											? "bg-blue-600/15 text-blue-400 border-blue-500/30"
											: "text-white hover:text-blue-400 hover:bg-slate-800/60 border-transparent"
									}`}
								>
									{link.name}
								</Link>
							);
						})}
					</nav>

					{/* User Profile / Auth Action */}
					<div className="hidden md:flex items-center gap-3">
						{isAuthenticated && user ? (
							<div
								ref={dropdownRef}
								className="relative"
								onMouseEnter={() => setIsProfileOpen(true)}
								onMouseLeave={() => setIsProfileOpen(false)}
							>
								{/* Circular Avatar Trigger */}
								<button
									onClick={() => setIsProfileOpen((prev) => !prev)}
									aria-expanded={isProfileOpen}
									className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800/80 border border-white/20 hover:border-blue-400/60 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/40 group shadow-lg shadow-black/20"
								>
									{/* Avatar Circle Container */}
									<div className="relative">
										<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-blue-500/30 group-hover:ring-blue-400/60 transition-all shadow-md">
											{user.imageUrl ? (
												<img
													src={user.imageUrl}
													alt={user.name || "User"}
													className="w-full h-full object-cover"
												/>
											) : (
												<span>{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
											)}
										</div>
										{unreadNotificationCount > 0 && (
											<span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0b1329] shadow-md shadow-rose-950/60 animate-pulse pointer-events-none">
												{unreadNotificationCount}
											</span>
										)}
									</div>

									{/* Chevron indicator */}
									<ChevronDown
										className={`w-4 h-4 text-white group-hover:text-blue-400 transition-all duration-200 ${
											isProfileOpen ? "rotate-180 text-blue-400" : ""
										}`}
									/>
								</button>

								{/* Dropdown Menu Modal */}
								{isProfileOpen && (
									<div className="absolute right-0 top-full pt-2 w-72 z-50">
										<div className="glass-panel bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-3 shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-top-2 duration-150">
											{/* User Card Header */}
											<div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/60 mb-2">
												<div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base ring-2 ring-blue-500/30 shrink-0">
													{user.imageUrl ? (
														<img
															src={user.imageUrl}
															alt={user.name || "User"}
															className="w-full h-full object-cover rounded-full"
														/>
													) : (
														<span>{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
													)}
												</div>
												<div className="min-w-0 flex-1">
													<div className="text-sm font-semibold text-white truncate">
														{user.name}
													</div>
													<div className="text-xs text-slate-400 truncate">
														{user.email}
													</div>
													<div className="mt-1">
														<RoleBadge role={user.role} />
													</div>
												</div>
											</div>

											{/* Role-Based Nav Items */}
											<div className="space-y-1">
												<Link
													href="/dashboard"
													onClick={() => {
														setIsProfileOpen(false);
														if (typeof window !== "undefined") {
															window.dispatchEvent(
																new CustomEvent("admin:switch-tab", { detail: "OVERVIEW" })
															);
														}
													}}
													className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-blue-600/15 hover:border-blue-500/20 border border-transparent transition-all group"
												>
													<LayoutDashboard className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
													<span>Dashboard</span>
												</Link>

												{(user.role === "SUPER_ADMIN" || user.role === "ADMIN") && (
													<>
														<Link
															href="/dashboard?tab=USERS"
															onClick={() => {
																setIsProfileOpen(false);
																if (typeof window !== "undefined") {
																	window.dispatchEvent(
																		new CustomEvent("admin:switch-tab", { detail: "USERS" })
																	);
																}
															}}
															className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-indigo-600/15 hover:border-indigo-500/20 border border-transparent transition-all group"
														>
															<Shield className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
															<span>Manage Users</span>
														</Link>
														<Link
															href="/admin/reports"
															onClick={() => setIsProfileOpen(false)}
															className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-purple-600/15 hover:border-purple-500/20 border border-transparent transition-all group"
														>
															<GraduationCap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
															<span>Analytics &amp; Reports</span>
														</Link>
													</>
												)}

												{user.role === "COUNSELOR" && (
													<>
														<Link
															href="/counselor/earnings"
															onClick={() => setIsProfileOpen(false)}
															className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-amber-600/15 hover:border-amber-500/20 border border-transparent transition-all group"
														>
															<GraduationCap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
															<span>Commission Earnings</span>
														</Link>
														<Link
															href="/counselor/profile"
															onClick={() => setIsProfileOpen(false)}
															className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-cyan-600/15 hover:border-cyan-500/20 border border-transparent transition-all group"
														>
															<User className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
															<span>Counselor Availability</span>
														</Link>
													</>
												)}

												{user.role === "STUDENT" && (
													<Link
														href="/dashboard/payments"
														onClick={() => setIsProfileOpen(false)}
														className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-amber-600/15 hover:border-amber-500/20 border border-transparent transition-all group"
													>
														<GraduationCap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
														<span>Payments &amp; Invoices</span>
													</Link>
												)}

												<Link
													href="/dashboard/profile"
													onClick={() => setIsProfileOpen(false)}
													className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-emerald-600/15 hover:border-emerald-500/20 border border-transparent transition-all group"
												>
													<User className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
													<span>Account Settings</span>
												</Link>
											</div>

											{/* Divider */}
											<div className="border-t border-slate-800/80 my-2" />

											{/* Log Out */}
											<button
												onClick={() => {
													setIsProfileOpen(false);
													logout();
												}}
												className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/15 transition-all group"
											>
												<LogOut className="w-4 h-4 text-rose-400 group-hover:-translate-x-0.5 transition-transform" />
												<span>Log Out</span>
											</button>
										</div>
									</div>
								)}
							</div>
						) : authLoading ? (
							<div className="flex items-center gap-2">
								<div className="w-8 h-8 rounded-full bg-slate-800/80 animate-pulse border border-slate-700/50" />
							</div>
						) : (
							<div className="flex items-center gap-2">
								<Link
									href="/login"
									className="px-4 py-2 rounded-xl text-sm font-medium text-white hover:text-blue-400 hover:bg-slate-800/60 transition-colors duration-150 border border-transparent outline-none focus:outline-none focus-visible:outline-none focus:ring-0 cursor-pointer select-none"
								>
									Sign In
								</Link>
								<Link href="/login">
									<Button variant="primary" size="sm">
										Apply Now
									</Button>
								</Link>
							</div>
						)}
					</div>

					{/* Mobile Hamburger Button */}
					<div className="flex md:hidden items-center gap-2">
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
						>
							{isMobileMenuOpen ? (
								<X className="w-6 h-6" />
							) : (
								<Menu className="w-6 h-6" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Dropdown Menu */}
			{isMobileMenuOpen && (
				<div className="md:hidden border-t border-white/[0.08] bg-[#0b1329] px-4 pt-3 pb-6 space-y-3 shadow-2xl">
					<nav className="space-y-1">
						{navLinks.map((link) => {
							const isActive = pathname === link.href;
							return (
								<Link
									key={link.href}
									href={link.href}
									onClick={() => setIsMobileMenuOpen(false)}
									className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 border outline-none focus:outline-none focus-visible:outline-none focus:ring-0 ${
										isActive
											? "bg-blue-600/15 text-blue-400 border-blue-500/30"
											: "text-white hover:text-blue-400 hover:bg-slate-800 border-transparent"
									}`}
								>
									{link.name}
								</Link>
							);
						})}
					</nav>

					<div className="pt-4 border-t border-slate-800 flex flex-col gap-2">
						{isAuthenticated && user ? (
							<>
								<div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-xl">
									<div className="flex items-center gap-2">
										<span className="text-xs text-slate-300 font-medium">
											{user.name}
										</span>
										{unreadNotificationCount > 0 && (
											<span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
												{unreadNotificationCount}
											</span>
										)}
									</div>
									<RoleBadge role={user.role} />
								</div>
								<Link
									href={getDashboardLink()}
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Button variant="primary" className="w-full justify-center">
										Go to Dashboard
									</Button>
								</Link>
								<Button
									variant="outline"
									onClick={() => {
										logout();
										setIsMobileMenuOpen(false);
									}}
									className="w-full justify-center text-rose-400"
								>
									Log Out
								</Button>
							</>
						) : authLoading ? (
							<div className="h-9 w-full bg-slate-800/60 rounded-xl animate-pulse" />
						) : (
							<div className="grid grid-cols-2 gap-2">
								<Link
									href="/login"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Button variant="outline" className="w-full justify-center">
										Sign In
									</Button>
								</Link>
								<Link
									href="/login"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									<Button variant="primary" className="w-full justify-center">
										Apply Now
									</Button>
								</Link>
							</div>
						)}
					</div>
				</div>
			)}
		</header>
	);
};
