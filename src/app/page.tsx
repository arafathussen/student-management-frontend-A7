"use client";

import { UniversityCard } from "@/components/higher-study/UniversityCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { higherStudyService } from "@/services/higherStudyService";
import { 
  successStoryService, 
  SuccessPageSettings, 
  SuccessStoryItem 
} from "@/services/successStoryService";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import type { IBlogPost, ICountry, IGlobalUniversity } from "@/types";
import {
	ArrowRight,
	Award,
	BookOpen,
	Building2,
	CheckCircle2,
	Compass,
	Globe,
	Globe2,
	GraduationCap,
	MapPin,
	Search,
	ShieldCheck,
	Users,
	Trophy,
	Calendar,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ScrollReveal, ScrollRevealGroup, ScrollRevealItem } from "@/components/common/ScrollReveal";

const homeFallbackStories: SuccessStoryItem[] = [
  {
    id: "f1",
    slug: "arafat-hussen-01",
    studentName: "Arafat Hussen",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    homeInstitution: "Dhaka College, Dhaka",
    hometown: "Dhaka",
    country: "Cyprus",
    universityName: "American University of Cyprus (AUCY)",
    degreeName: "BSc in Computer Science",
    intake: "Fall 2026 Intake",
    visaDate: "July 2026",
    scholarshipNote: "50% Merit Scholarship Awarded",
    storyContent: "From Dhaka College to Larnaca, Cyprus! Rise Abroad Education guided me through every step from document apostille to visa interview preparation.",
  },
  {
    id: "f2",
    slug: "tanvir-ahmed-02",
    studentName: "Tanvir Ahmed",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
    homeInstitution: "Notre Dame College, Dhaka",
    hometown: "Rajshahi",
    country: "United Kingdom",
    universityName: "University of Hertfordshire",
    degreeName: "MSc in Data Science & AI",
    intake: "Spring 2026 Intake",
    visaDate: "January 2026",
    scholarshipNote: "£3,000 Dean's Excellence Scholarship",
    storyContent: "Securing my UK visa with zero hassle was made possible by Rise Abroad Education. Their dedicated counselor reviewed my SOP five times and conducted rigorous mock interviews.",
  },
  {
    id: "f3",
    slug: "sadia-rahman-03",
    studentName: "Sadia Rahman",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    homeInstitution: "Viqarunnisa Noon College, Dhaka",
    hometown: "Dhaka",
    country: "Canada",
    universityName: "University of Windsor",
    degreeName: "BBA in International Business",
    intake: "Fall 2026 Intake",
    visaDate: "August 2026",
    scholarshipNote: "$5,000 CAD Entrance Award",
    storyContent: "My dream of studying in Canada became a reality through Rise Abroad Education. They provided completely transparent guidelines on the SDS stream and GIC account creation.",
  },
];

export default function HomePage() {
	const [countries, setCountries] = useState<ICountry[]>([]);
	const [universities, setUniversities] = useState<IGlobalUniversity[]>([]);
	const [blogs, setBlogs] = useState<IBlogPost[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCountry, setSelectedCountry] = useState("ALL");
	const [isLoading, setIsLoading] = useState(true);
	const [successLoaded, setSuccessLoaded] = useState(false);

	const [successSettings, setSuccessSettings] = useState<SuccessPageSettings>({
		badgeText: "Real Students • Real Visas • Proven Results",
		titlePart1: "Student",
		titlePart2: "Success Stories",
		description: "Celebrating Bangladeshi students accepted into premier global universities. Watch their interviews, read their visa journeys, and discover scholarship awards achieved with Rise Abroad Education.",
		stat1Value: "98.4%",
		stat1Label: "Visa Success Rate",
		stat2Value: "1,250+",
		stat2Label: "Visas Approved",
		stat3Value: "50%+",
		stat3Label: "Average Scholarship",
		stat4Value: "15+",
		stat4Label: "Study Destinations",
	});
	const [successStories, setSuccessStories] = useState<SuccessStoryItem[]>([]);

	useEffect(() => {
		document.title = "Home | Rise Abroad Education";

		const loadSuccessData = async () => {
			try {
				const [sSettingsRes, sStoriesRes] = await Promise.all([
					successStoryService.getSettings().catch(() => null),
					successStoryService.getStories({ limit: 6 }).catch(() => null),
				]);

				if (sSettingsRes) setSuccessSettings(sSettingsRes);

				const rawStories = sStoriesRes?.data || (Array.isArray(sStoriesRes) ? sStoriesRes : null);
				if (Array.isArray(rawStories) && rawStories.length > 0) {
					setSuccessStories(rawStories);
				} else {
					setSuccessStories(homeFallbackStories);
				}
			} catch {
				setSuccessStories(homeFallbackStories);
			} finally {
				setSuccessLoaded(true);
			}
		};

		const loadInitialData = async () => {
			try {
				const [countriesRes, unisRes, blogsRes] = await Promise.all([
					higherStudyService.getCountries(),
					higherStudyService.getUniversities({ limit: 6 }),
					higherStudyService.getBlogs({ limit: 3 }),
				]);
				const rawCountries = countriesRes?.data?.data || countriesRes?.data || countriesRes;
				if (Array.isArray(rawCountries)) setCountries(rawCountries);

				const rawUnis = unisRes?.data?.data || unisRes?.data || unisRes;
				if (Array.isArray(rawUnis)) {
					setUniversities(
						rawUnis.filter((u: any) => !u.isDeleted && u.status !== "DRAFT" && !u.isDraft)
					);
				}

				const rawBlogs = Array.isArray(blogsRes?.data)
					? blogsRes.data
					: Array.isArray(blogsRes)
					? blogsRes
					: [];
				setBlogs(
					rawBlogs
						.filter((b: any) => b.status !== "DRAFT" && b.status !== "TRASH")
						.slice(0, 3)
				);
			} catch (err) {
				console.error("Failed to load home page data", err);
			} finally {
				setIsLoading(false);
			}
		};

		loadSuccessData();
		loadInitialData();
	}, []);

	const filteredUniversities = universities.filter((uni) => {
		const matchesSearch =
			uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			uni.city.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesCountry =
			selectedCountry === "ALL" || uni.country?.code === selectedCountry;
		return matchesSearch && matchesCountry;
	});

	return (
		<div className="space-y-16 sm:space-y-20 lg:space-y-24 pb-16 sm:pb-20">
			{/* HERO SECTION */}
			<section className="relative pt-12 sm:pt-20 pb-16 overflow-hidden">
				{/* Background Glow Accents */}
				<div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
				<div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
					<div className="text-center max-w-3xl mx-auto space-y-6">
						<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium backdrop-blur-md">
							<GraduationCap className="w-3.5 h-3.5" />
							<span>Fall 2026 / Spring 2027 Admissions Open Worldwide</span>
						</div>

						<h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
							Your Global Pathway to{" "}
							<span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
								World-Class Universities
							</span>
						</h1>

						<p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
							Direct admissions, transparent scholarship counseling, official
							university offer letters, and multi-country application tracking in
							one unified portal.
						</p>

						{/* Quick Search & Filter Box */}
						<div className="p-3 glass-panel rounded-2xl border border-slate-800 shadow-2xl max-w-2xl mx-auto mt-8 flex flex-col sm:flex-row gap-2">
							<div className="relative flex-1">
								<Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
								<input
									type="text"
									placeholder="Search university, program, or city..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full bg-slate-900/90 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-slate-500"
								/>
							</div>

							<select
								value={selectedCountry}
								onChange={(e) => setSelectedCountry(e.target.value)}
								className="bg-slate-900/90 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
							>
								<option value="ALL">All Countries</option>
								{countries.map((c) => (
									<option key={c.id} value={c.code}>
										{c.name} ({c.code})
									</option>
								))}
							</select>

							<Link
								href={
									searchQuery.trim()
										? `/universities?q=${encodeURIComponent(searchQuery.trim())}`
										: "/universities"
								}
							>
								<Button variant="primary" className="w-full sm:w-auto gap-2 cursor-pointer">
									<span>Explore</span>
									<ArrowRight className="w-4 h-4" />
								</Button>
							</Link>
						</div>

						{/* Trust Badges */}
						<div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
							<span className="flex items-center gap-1.5">
								<CheckCircle2 className="w-4 h-4 text-emerald-400" />
								<span>No Hidden Application Charges</span>
							</span>
							<span className="flex items-center gap-1.5">
								<CheckCircle2 className="w-4 h-4 text-emerald-400" />
								<span>Direct Embassy Recognized Letters</span>
							</span>
							<span className="flex items-center gap-1.5">
								<CheckCircle2 className="w-4 h-4 text-emerald-400" />
								<span>Multi-Agent Support Chat</span>
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* =====================================================================
			    2. STUDENT SUCCESS STORIES SHOWCASE (REAL VISAS & SOCIAL PROOF)
			===================================================================== */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<ScrollReveal direction="up" yOffset={24} duration={0.5}>
					<div className="text-center max-w-3xl mx-auto mb-10">
						<div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-3 backdrop-blur-md shadow-sm">
							<Trophy className="w-3.5 h-3.5 text-amber-400" />
							<span>{successSettings.badgeText || "Real Students • Real Visas • Proven Results"}</span>
						</div>

						<h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
							{successSettings.titlePart1 || "Student"}{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
								{successSettings.titlePart2 || "Success Stories"}
							</span>
						</h2>

						<p className="text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
							{successSettings.description || "Celebrating Bangladeshi students accepted into premier global universities. Watch their interviews, read their visa journeys, and discover scholarship awards achieved with Rise Abroad Education."}
						</p>

						{/* 4 Sleek Horizontal Animated Metric Boxes */}
						<div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
							{/* Stat 1 */}
							<div className="group relative flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-blue-500/40 hover:bg-slate-900/90 transition-all duration-300 shadow-xl overflow-hidden text-left">
								<div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
									<ShieldCheck className="w-5 h-5" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">
										<AnimatedCounter value={successSettings.stat1Value || "98.4%"} duration={1100} ready={successLoaded} />
									</div>
									<div className="text-xs text-slate-400 truncate mt-0.5">{successSettings.stat1Label || "Visa Success Rate"}</div>
								</div>
							</div>

							{/* Stat 2 */}
							<div className="group relative flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all duration-300 shadow-xl overflow-hidden text-left">
								<div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
									<GraduationCap className="w-5 h-5" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">
										<AnimatedCounter value={successSettings.stat2Value || "1,250+"} duration={1100} ready={successLoaded} />
									</div>
									<div className="text-xs text-slate-400 truncate mt-0.5">{successSettings.stat2Label || "Visas Approved"}</div>
								</div>
							</div>

							{/* Stat 3 */}
							<div className="group relative flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-amber-500/40 hover:bg-slate-900/90 transition-all duration-300 shadow-xl overflow-hidden text-left">
								<div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
									<Award className="w-5 h-5" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">
										<AnimatedCounter value={successSettings.stat3Value || "50%+"} duration={1100} ready={successLoaded} />
									</div>
									<div className="text-xs text-slate-400 truncate mt-0.5">{successSettings.stat3Label || "Average Scholarship"}</div>
								</div>
							</div>

							{/* Stat 4 */}
							<div className="group relative flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/40 hover:bg-slate-900/90 transition-all duration-300 shadow-xl overflow-hidden text-left">
								<div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
									<Globe className="w-5 h-5" />
								</div>
								<div className="min-w-0 flex-1">
									<div className="text-lg sm:text-2xl font-bold tracking-tight text-white leading-tight">
										<AnimatedCounter value={successSettings.stat4Value || "15+"} duration={1100} ready={successLoaded} />
									</div>
									<div className="text-xs text-slate-400 truncate mt-0.5">{successSettings.stat4Label || "Study Destinations"}</div>
								</div>
							</div>
						</div>
					</div>
				</ScrollReveal>

				{/* Latest 6 Success Cards Grid */}
				{!successLoaded ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
						{[1, 2, 3].map((idx) => (
							<div
								key={idx}
								className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden"
							>
								<div className="aspect-video w-full bg-slate-800" />
								<div className="p-5 space-y-3">
									<div className="h-5 w-2/3 rounded bg-slate-800" />
									<div className="h-3.5 w-1/2 rounded bg-slate-800/70" />
									<div className="h-16 w-full rounded-xl bg-slate-800/60" />
									<div className="h-8 w-full rounded-xl bg-slate-800/70" />
								</div>
							</div>
						))}
					</div>
				) : (
				<ScrollRevealGroup staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{successStories.slice(0, 6).map((story) => (
						<ScrollRevealItem key={story.id} yOffset={30}>
							<div className="group rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden h-full">
								{/* Flush 16:9 Thumbnail Preview */}
								<Link href={`/success/${story.slug || story.id}`} className="block relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer">
									<img
										src={story.thumbnailUrl || story.photoUrl || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"}
										alt={story.studentName}
										onError={(e) => {
											e.currentTarget.onerror = null;
											e.currentTarget.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80";
										}}
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
									/>
									<div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 backdrop-blur-md text-[10px] font-bold">
										Visa Approved
									</div>
									<div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-white border border-slate-800 flex items-center gap-1">
										<Globe className="w-3 h-3 text-blue-400" />
										{story.country}
									</div>
									{/* Official YouTube Play Badge */}
									<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
										<div className="w-14 h-10 sm:w-16 sm:h-11 drop-shadow-2xl group-hover:scale-110 transition-transform duration-300">
											<svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path
													fill="#FF0000"
													d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
												/>
												<path fill="#FFFFFF" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
											</svg>
										</div>
									</div>
								</Link>

								{/* Card Content Info */}
								<div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
									<div className="space-y-2">
										<div className="flex items-start justify-between gap-2">
											<div>
												<Link href={`/success/${story.slug || story.id}`}>
													<h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors cursor-pointer">
														{story.studentName}
													</h3>
												</Link>
												<div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
													<MapPin className="w-3 h-3 text-slate-500 shrink-0" />
													<span className="truncate">
														{story.homeInstitution}
													</span>
												</div>
											</div>

											{story.scholarshipNote && (
												<span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-semibold shrink-0">
													{story.scholarshipNote}
												</span>
											)}
										</div>

										<div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
											<div className="font-semibold text-slate-200 truncate">{story.universityName}</div>
											<div className="text-[11px] text-slate-400 truncate">{story.degreeName}</div>
											<div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
												<span>{story.intake || "Upcoming Intake"}</span>
												<span className="text-emerald-400 font-medium">Visa Verified</span>
											</div>
										</div>
									</div>

									<Link href={`/success/${story.slug || story.id}`}>
										<Button variant="outline" size="sm" className="w-full text-xs border-slate-700 text-blue-400 hover:text-white hover:bg-blue-600 rounded-xl cursor-pointer">
											View Full Visa Journey
										</Button>
									</Link>
								</div>
							</div>
						</ScrollRevealItem>
					))}
				</ScrollRevealGroup>
				)}

				{/* "More" / View All Stories CTA */}
				<div className="text-center pt-10">
					<Link href="/success">
						<Button
							variant="secondary"
							size="lg"
							className="gap-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30 px-7 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer font-medium"
						>
							<span>Explore All Success Stories</span>
							<ArrowRight className="w-4 h-4" />
						</Button>
					</Link>
				</div>
			</section>

			{/* =====================================================================
			    3. EXPLORE ACCREDITED UNIVERSITIES SHOWCASE (RIGHT AFTER SUCCESS)
			===================================================================== */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<ScrollReveal direction="up" yOffset={24} duration={0.5}>
					<div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
						<div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wide">
							<Globe2 className="w-3.5 h-3.5" />
							<span>Global Partner Directory</span>
						</div>

						<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
							Explore{" "}
							<span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
								Accredited Universities
							</span>
						</h2>

						<p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
							Browse top institutions in the UK, USA, Canada, Germany, and Australia. Check admission criteria, tuition fees, and offer letter policies.
						</p>
					</div>
				</ScrollReveal>

				{isLoading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
						{[1, 2, 3].map((idx) => (
							<div
								key={idx}
								className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden"
							>
								<div className="aspect-[16/9] w-full bg-slate-800" />
								<div className="p-5 space-y-3">
									<div className="h-5 w-3/4 rounded bg-slate-800" />
									<div className="h-12 w-full rounded bg-slate-800/60" />
								</div>
							</div>
						))}
					</div>
				) : filteredUniversities.length === 0 ? (
					<div className="text-center py-14 bg-slate-900/40 rounded-2xl border border-slate-800">
						<Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
						<h3 className="text-base font-semibold text-slate-200">
							No universities found
						</h3>
						<p className="text-xs text-slate-500 mt-1">
							Try changing your search query or country filter.
						</p>
					</div>
				) : (
					<ScrollRevealGroup staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredUniversities.slice(0, 3).map((uni) => (
							<ScrollRevealItem key={uni.id} yOffset={30}>
								<UniversityCard university={uni} />
							</ScrollRevealItem>
						))}
					</ScrollRevealGroup>
				)}

				{/* Explore All Universities CTA */}
				<div className="text-center pt-10">
					<Link href="/universities">
						<Button
							variant="secondary"
							size="lg"
							className="gap-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30 px-7 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer font-medium"
						>
							<span>Explore All Universities</span>
							<ArrowRight className="w-4 h-4" />
						</Button>
					</Link>
				</div>
			</section>

			{/* =====================================================================
			    4. HIGHER STUDY GUIDES & VISA HANDBOOKS SHOWCASE
			===================================================================== */}
			{blogs.length > 0 && (
				<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<ScrollReveal direction="up" yOffset={24} duration={0.5}>
						<div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
							<div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold tracking-wide">
								<BookOpen className="w-3.5 h-3.5" />
								<span>Knowledge Hub &amp; Study Abroad Guides</span>
							</div>

							<h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
								Higher Study Insights &amp;{" "}
								<span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
									Visa Handbooks
								</span>
							</h2>

							<p className="text-slate-400 text-sm max-w-2xl mx-auto leading-relaxed">
								Step-by-step guides on university admissions, student visa interviews, financial proof rules, and merit scholarship strategies.
							</p>
						</div>
					</ScrollReveal>

					<ScrollRevealGroup staggerDelay={0.09} className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{blogs.slice(0, 3).map((blog) => {
							const banner =
								blog.bannerUrl ||
								blog.coverImage ||
								"https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80";

							return (
								<ScrollRevealItem key={blog.id} yOffset={30}>
									<Link
										href={`/blogs/${blog.slug}`}
										className="group rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-blue-500/50 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden h-full"
									>
										<div>
											{/* 16:9 Cover Banner */}
											<div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
												<img
													src={banner}
													alt={blog.title}
													onError={(e) => {
														e.currentTarget.onerror = null;
														e.currentTarget.src = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80";
													}}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
												/>
												<div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

												<div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-bold text-blue-400 border border-slate-800">
													{blog.category || "Study Abroad Guide"}
												</div>

												{blog.readTime && (
													<div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] text-slate-300 font-medium">
														{blog.readTime}
													</div>
												)}
											</div>

											<div className="p-5 space-y-2.5">
												<h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
													{blog.title}
												</h3>
												<p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
													{blog.excerpt || blog.content}
												</p>
											</div>
										</div>

										<div className="px-5 py-3.5 border-t border-slate-800/70 bg-slate-950/30 flex items-center justify-between text-xs">
											<span className="text-slate-500 flex items-center gap-1.5">
												<Calendar className="w-3.5 h-3.5" />
												{blog.createdAt
													? new Date(blog.createdAt).toLocaleDateString("en-US", {
															month: "short",
															day: "numeric",
															year: "numeric",
													  })
													: "Recent"}
											</span>
											<span className="font-semibold text-blue-400 group-hover:underline flex items-center gap-1">
												<span>Read Guide</span>
												<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
											</span>
										</div>
									</Link>
								</ScrollRevealItem>
							);
						})}
					</ScrollRevealGroup>

					{/* Explore All Guides CTA */}
					<div className="text-center pt-10">
						<Link href="/blogs">
							<Button
								variant="secondary"
								size="lg"
								className="gap-2 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/30 px-7 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer font-medium"
							>
								<span>Explore All Guides</span>
								<ArrowRight className="w-4 h-4" />
							</Button>
						</Link>
					</div>
				</section>
			)}

			{/* 4 REASONS WHY CHOOSE THIS PORTAL */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<ScrollReveal direction="up" yOffset={32} duration={0.6} className="glass-panel rounded-3xl p-8 sm:p-14 border border-slate-800 shadow-2xl relative overflow-hidden">
					<div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

					<div className="text-center max-w-2xl mx-auto mb-12">
						<Badge variant="default" className="mb-2">
							PORTAL BENEFITS
						</Badge>
						<h2 className="text-2xl sm:text-3xl font-bold text-white">
							Engineered for Transparent Higher Study Admissions
						</h2>
					</div>

					<ScrollRevealGroup staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						<ScrollRevealItem yOffset={24} className="space-y-3">
							<div className="w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
								<Compass className="w-6 h-6" />
							</div>
							<h4 className="font-bold text-base text-white">
								Multi-University Apply
							</h4>
							<p className="text-xs text-slate-400 leading-relaxed">
								Apply to multiple universities across UK, Canada, and Europe in
								one single student account.
							</p>
						</ScrollRevealItem>

						<ScrollRevealItem yOffset={24} className="space-y-3">
							<div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
								<Award className="w-6 h-6" />
							</div>
							<h4 className="font-bold text-base text-white">
								Dynamic Doc Checklist
							</h4>
							<p className="text-xs text-slate-400 leading-relaxed">
								See exact mandatory vs optional documents required per university
								before submission.
							</p>
						</ScrollRevealItem>

						<ScrollRevealItem yOffset={24} className="space-y-3">
							<div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
								<ShieldCheck className="w-6 h-6" />
							</div>
							<h4 className="font-bold text-base text-white">
								Official Offer Letters
							</h4>
							<p className="text-xs text-slate-400 leading-relaxed">
								Instant free or verified deposit download directly in your student
								dashboard.
							</p>
						</ScrollRevealItem>

						<ScrollRevealItem yOffset={24} className="space-y-3">
							<div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
								<Users className="w-6 h-6" />
							</div>
							<h4 className="font-bold text-base text-white">
								Counselor Support Desk
							</h4>
							<p className="text-xs text-slate-400 leading-relaxed">
								Live chat with assigned counselors and admissions desk for SOP &
								visa file guidance.
							</p>
						</ScrollRevealItem>
					</ScrollRevealGroup>
				</ScrollReveal>
			</section>

			{/* CTA BANNER (CONNECT & COUNSELING) */}
			<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<ScrollReveal direction="up" yOffset={30} duration={0.6}>
					<div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-blue-500/30">
						<div className="space-y-3 max-w-xl text-center md:text-left">
							<h3 className="text-2xl sm:text-3xl font-extrabold text-white">
								Ready to Start Your Study Abroad Journey?
							</h3>
							<p className="text-sm text-blue-100/90 leading-relaxed">
								Book a free one-on-one session with our senior visa & admission counselors. Get complete guidance on university shortlisting, scholarships, and file preparation.
							</p>
						</div>
						<div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
							<Link href="/contact">
								<Button variant="gold" size="lg" className="shadow-xl cursor-pointer">
									<span>Book Free Counseling</span>
									<ArrowRight className="w-4 h-4 ml-2" />
								</Button>
							</Link>
							<Link href="/login">
								<Button variant="outline" size="lg" className="border-slate-600 hover:bg-slate-800 text-white cursor-pointer">
									<span>Student Portal</span>
								</Button>
							</Link>
						</div>
					</div>
				</ScrollReveal>
			</section>
		</div>
	);
}
