import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD") {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		maximumFractionDigits: 2,
	}).format(amount);
}

export function formatBDT(amount: number) {
	return `৳ ${new Intl.NumberFormat("en-BD", {
		maximumFractionDigits: 2,
	}).format(amount)} BDT`;
}

export function slugify(text: string): string {
	if (!text) return "";
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/&/g, "-and-")
		.replace(/[^\w\-]+/g, "")
		.replace(/\-\-+/g, "-")
		.replace(/^-+/, "")
		.replace(/-+$/, "");
}

export const CURATED_CAMPUS_IMAGES = [
	"https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&q=80",
	"https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1200&q=80",
];

export function getUniversityCoverImage(university?: {
	id?: string;
	name?: string;
	coverImageUrl?: string | null;
	bannerUrl?: string | null;
	logoUrl?: string | null;
}): string {
	const explicit =
		university?.coverImageUrl?.trim() ||
		university?.bannerUrl?.trim() ||
		university?.logoUrl?.trim();
	if (explicit) return explicit;

	const seed = `${university?.id || ""}:${university?.name || "rise-abroad"}`;
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
	}
	return CURATED_CAMPUS_IMAGES[hash % CURATED_CAMPUS_IMAGES.length];
}

