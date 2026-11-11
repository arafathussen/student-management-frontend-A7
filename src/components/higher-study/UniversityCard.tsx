"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatCurrency, slugify } from "@/lib/utils";
import type { IGlobalUniversity } from "@/types";
import {
	ArrowRight,
	Building2,
	DollarSign,
	GraduationCap,
	MapPin,
	Tag,
	Sparkles,
	FileText,
} from "lucide-react";

export const UniversityCard: React.FC<{
	university: IGlobalUniversity;
}> = ({ university }) => {
	const getPaymentTypeBadge = () => {
		const type = university.offerLetterPaymentType || university.paymentType;
		switch (type) {
			case "FREE":
				return <Badge variant="success">FREE APPLICATION</Badge>;
			case "UPFRONT_FEE":
				return (
					<Badge variant="warning">
						Fee: {formatCurrency(university.applicationFee || 0)}
					</Badge>
				);
			case "OFFER_DEPOSIT":
			case "DEPOSIT_REQUIRED":
				return (
					<Badge variant="gold">
						Deposit On Offer: {formatCurrency(university.offerDepositFee || 500)}
					</Badge>
				);
			default:
				return <Badge variant="primary">Partner Campus</Badge>;
		}
	};

	const coverImg = university.coverImageUrl || university.bannerUrl || university.logoUrl;

	return (
		<Card className="glass-card-hover flex flex-col justify-between h-full group border-slate-800/80 overflow-hidden p-0">
			<div>
				{/* 16:9 Thumbnail Banner Container */}
				<div className="relative w-full aspect-[16/9] bg-slate-900 border-b border-slate-800/80 overflow-hidden">
					{coverImg ? (
						<img
							src={coverImg}
							alt={university.name}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							loading="lazy"
						/>
					) : (
						<div className="w-full h-full bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/70 flex items-center justify-center">
							<Building2 className="w-12 h-12 text-blue-400/30" />
						</div>
					)}

					<div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

					{/* Top Left Policy Badge */}
					<div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
						{getPaymentTypeBadge()}
					</div>

					{/* Top Right Country Badge */}
					{university.country && (
						<div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-[11px] font-semibold text-slate-200 flex items-center gap-1 shadow-md">
							<MapPin className="w-3.5 h-3.5 text-rose-400" />
							<span>{university.city}, {university.country.name}</span>
						</div>
					)}

					{/* Bottom Left University Name on Image */}
					<div className="absolute bottom-3 left-3 right-3">
						<h3 className="text-base sm:text-lg font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1 drop-shadow-md">
							{university.name}
						</h3>
					</div>
				</div>

				{/* Card Body Content */}
				<div className="p-4 sm:p-5 space-y-3.5">
					{/* Custom Tags */}
					{university.tags && university.tags.length > 0 && (
						<div className="flex flex-wrap items-center gap-1.5">
							{university.tags.slice(0, 3).map((tag, idx) => (
								<span
									key={idx}
									className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/25 text-[10px] font-semibold text-blue-300 flex items-center gap-1"
								>
									<Tag className="w-2.5 h-2.5" />
									<span>{tag}</span>
								</span>
							))}
						</div>
					)}

					{/* Description */}
					<p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
						{university.description ||
							"Premier accredited institution offering globally-recognized undergraduate and postgraduate degrees with comprehensive student guidance."}
					</p>

					{/* Tuition Fee & Quick Highlights */}
					<div className="pt-3 border-t border-slate-800/70 grid grid-cols-2 gap-3 text-xs">
						<div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
							<span className="text-[10px] text-slate-400 block uppercase font-medium">Estimated Tuition</span>
							<span className="text-xs font-bold text-emerald-400 font-mono mt-0.5 block">
								${(university.minTuitionFee || 12000).toLocaleString()} - ${(university.maxTuitionFee || 26000).toLocaleString()}
								<span className="text-[10px] text-slate-500 font-normal"> /yr</span>
							</span>
						</div>

						<div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
							<span className="text-[10px] text-slate-400 block uppercase font-medium">Programs Offered</span>
							<span className="text-xs font-bold text-blue-300 flex items-center gap-1 mt-0.5">
								<GraduationCap className="w-3.5 h-3.5 text-blue-400" />
								<span>{university.programs?.length || 4}+ Academic Courses</span>
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Footer Action */}
			<div className="p-4 sm:p-5 pt-0">
				<div className="pt-3.5 border-t border-slate-800/80 flex items-center justify-between gap-3">
					<div className="text-[11px] text-slate-400 flex items-center gap-1">
						<Sparkles className="w-3.5 h-3.5 text-amber-400" />
						<span>Direct Admission</span>
					</div>

					<Link href={`/universities/${slugify(university.name) || university.id}`} className="shrink-0">
						<Button variant="gradient" size="sm" className="gap-1.5 group/btn px-4 shadow-md shadow-blue-950/40">
							<span>More Details</span>
							<ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
						</Button>
					</Link>
				</div>
			</div>
		</Card>
	);
};
