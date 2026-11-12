import { apiClient } from "./apiClient";
import { IBlogPost } from "@/types";

export const DEFAULT_GUIDES: IBlogPost[] = [
	{
		id: "demo-1",
		slug: "complete-uk-student-visa-guide-2026",
		title: "Complete Guide to UK Student Visa (CAS & 28-Day Bank Statement Rule)",
		excerpt:
			"Step-by-step roadmap to applying for a UK Student Visa, CAS issuance, maintenance fund calculations inside and outside London, and IOM TB screening.",
		bannerUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",
		coverImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",
		category: "United Kingdom",
		readTime: "6 min read",
		status: "PUBLISHED",
		isPublished: true,
		tags: ["UK Visa", "CAS", "Financial Proof"],
		createdAt: "2026-04-02T10:00:00.000Z",
		content: `### 1. Understanding the Confirmation of Acceptance for Studies (CAS)
A CAS is an official electronic reference number issued by your UK university after you clear all academic conditions, pay the initial tuition deposit, and pass the pre-CAS credibility interview.

### 2. Maintenance Funds & 28-Day Bank Statement Rule
UKVI requires proof that you can cover your remaining first-year tuition plus 9 months of living expenses:
- **Inside London:** £1,334 per month for up to 9 months (£12,006 total).
- **Outside London:** £1,023 per month for up to 9 months (£9,207 total).

> **Important Compliance Rule:** The required balance must remain continuously in your or your legal parent's bank account for at least **28 consecutive days**, and the statement end date must not be older than 31 days on your visa submission date.

### 3. Tuberculosis (TB) Certificate & IHS Fee
Applicants from Bangladesh and listed countries must complete a chest X-ray at an UKVI-approved IOM clinic before submitting the online visa application and paying the Immigration Health Surcharge (IHS).`,
	},
	{
		id: "demo-2",
		slug: "canada-study-permit-pal-gic-handbook-2026",
		title: "Canada Study Permit Handbook: PAL, GIC & Financial Documentation",
		excerpt:
			"Everything international students must know about Provincial Attestation Letters (PAL), Guaranteed Investment Certificates (GIC), and strong study plans.",
		bannerUrl: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1200&q=80",
		coverImage: "https://images.unsplash.com/photo-1517935706615-2717063c2225?w=1200&q=80",
		category: "Canada",
		readTime: "7 min read",
		status: "PUBLISHED",
		isPublished: true,
		tags: ["Canada", "Study Permit", "Scholarship"],
		createdAt: "2026-03-18T10:00:00.000Z",
		content: `### 1. Provincial Attestation Letter (PAL)
Undergraduate and post-graduate diploma applicants to Canadian institutions must obtain a Provincial Attestation Letter (PAL) through their designated learning institution (DLI) upon paying the tuition deposit.

### 2. GIC & Living Cost Proof
A Guaranteed Investment Certificate (GIC) of CAD $20,635 remains the strongest way to demonstrate first-year living expense readiness alongside official sponsor tax and banking records.

> **Counselor Tip:** Always include a clear, well-structured Study Plan explaining why your chosen Canadian program advances your career trajectory in your home country.`,
	},
	{
		id: "demo-3",
		slug: "how-to-write-winning-sop-for-scholarships",
		title: "How to Write a Winning Statement of Purpose (SOP) for 50%–100% Scholarships",
		excerpt:
			"Learn the exact 5-paragraph SOP framework used by successful Rise Abroad scholarship recipients across the UK, USA, Europe, and Australia.",
		bannerUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
		coverImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80",
		category: "Scholarship",
		readTime: "5 min read",
		status: "PUBLISHED",
		isPublished: true,
		tags: ["SOP", "Scholarship", "Admissions"],
		createdAt: "2026-02-25T10:00:00.000Z",
		content: `### 1. The 5-Paragraph Scholarship SOP Architecture
Admissions committees read hundreds of essays daily. Structure your Statement of Purpose into five focused sections:
1. **Academic Hook & Motivation:** A concrete academic or project milestone that sparked your interest.
2. **Undergraduate & Research Foundation:** Quantifiable grades, thesis topics, or technical projects.
3. **Why This Curriculum:** Specific modules, labs, and faculty members at the target university.
4. **Why This Destination:** Industry ecosystem and international academic exposure.
5. **Post-Graduation Career Impact:** Concrete 3-to-5 year career plan upon graduation.

> **Avoid Generic Templates:** Never copy boilerplate introductions. Highlight your authentic academic metrics and leadership impact.`,
	},
	{
		id: "demo-4",
		slug: "germany-public-university-blocked-account-guide",
		title: "Germany Public University Master's Guide: Blocked Account & APS",
		excerpt:
			"Complete checklist for tuition-free German public universities, Uni-Assist VPD evaluation, Expatrio/Fintiba blocked account setup, and embassy slots.",
		bannerUrl: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80",
		coverImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1200&q=80",
		category: "Germany",
		readTime: "6 min read",
		status: "PUBLISHED",
		isPublished: true,
		tags: ["Germany", "Blocked Account", "Europe"],
		createdAt: "2026-01-30T10:00:00.000Z",
		content: `### 1. Tuition-Free Public Universities & VPD
Most public universities in Germany charge zero tuition fees (only a nominal semester contribution of €150–€350). International degrees are verified through Uni-Assist (VPD) or direct university portals.

### 2. Blocked Account (Sperrkonto) Requirement
For the 2026/2027 intake, students must deposit **€11,904** (€992/month) into an approved German Blocked Account (such as Expatrio or Fintiba) prior to attending the German Embassy visa appointment.`,
	},
];

const LOCAL_BLOG_OVERRIDES_KEY = "rise_abroad_guides_overrides_v1";

function getLocalOverrides(): Record<string, Partial<IBlogPost> & { _deletedPermanently?: boolean }> {
	if (typeof window === "undefined") return {};
	try {
		const raw = localStorage.getItem(LOCAL_BLOG_OVERRIDES_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}

function saveLocalOverride(id: string, data: Partial<IBlogPost> & { _deletedPermanently?: boolean }) {
	if (typeof window === "undefined") return;
	try {
		const current = getLocalOverrides();
		current[id] = { ...(current[id] || {}), ...data };
		localStorage.setItem(LOCAL_BLOG_OVERRIDES_KEY, JSON.stringify(current));
	} catch {
		// ignore storage errors
	}
}

export function normalizeBlogPost(raw: any): IBlogPost {
	const rawTags: string[] = Array.isArray(raw.tags) ? raw.tags : [];
	let status: "PUBLISHED" | "DRAFT" | "TRASH" = "PUBLISHED";
	let readTime = raw.readTime || "5 min read";
	let excerpt = raw.excerpt || "";

	const cleanTags: string[] = [];
	for (const t of rawTags) {
		if (typeof t !== "string") continue;
		if (t === "__STATUS:DRAFT__") {
			status = "DRAFT";
		} else if (t === "__STATUS:TRASH__") {
			status = "TRASH";
		} else if (t.startsWith("__READ:")) {
			readTime = t.replace("__READ:", "").replace(/__$/, "");
		} else if (t.startsWith("__EXCERPT:")) {
			excerpt = t.replace("__EXCERPT:", "").replace(/__$/, "");
		} else if (!t.startsWith("__")) {
			cleanTags.push(t);
		}
	}

	if (raw.isDeleted) status = "TRASH";
	else if (raw.isPublished === false) status = "DRAFT";
	else if (raw.status === "DRAFT" || raw.status === "TRASH") status = raw.status;

	const plainContent = (raw.content || "").replace(/[#>*_`~-]/g, "").trim();
	if (!excerpt) {
		excerpt = plainContent.length > 160 ? `${plainContent.slice(0, 160)}...` : plainContent;
	}

	return {
		id: raw.id,
		title: raw.title || "Untitled Guide",
		slug: raw.slug || raw.id,
		content: raw.content || "",
		excerpt,
		bannerUrl: raw.bannerUrl || raw.coverImage || "",
		coverImage: raw.coverImage || raw.bannerUrl || "",
		category: raw.category || "Study Abroad Guide",
		readTime,
		status,
		isPublished: status === "PUBLISHED",
		isDeleted: status === "TRASH",
		tags: cleanTags,
		authorId: raw.authorId,
		author: raw.author,
		createdAt: raw.createdAt || new Date().toISOString(),
		updatedAt: raw.updatedAt || raw.createdAt || new Date().toISOString(),
	};
}

export function encodeBlogPayload(input: {
	title: string;
	content: string;
	excerpt?: string;
	bannerUrl?: string;
	category?: string;
	readTime?: string;
	status?: "PUBLISHED" | "DRAFT" | "TRASH";
	tags?: string[];
}) {
	const cleanTags = (input.tags || []).filter((t) => t && !t.startsWith("__"));
	const metaTags = [...cleanTags];
	if (input.status === "DRAFT") metaTags.push("__STATUS:DRAFT__");
	if (input.status === "TRASH") metaTags.push("__STATUS:TRASH__");
	if (input.readTime?.trim()) metaTags.push(`__READ:${input.readTime.trim()}__`);
	if (input.excerpt?.trim()) metaTags.push(`__EXCERPT:${input.excerpt.trim().slice(0, 220)}__`);

	return {
		title: input.title.trim(),
		content: input.content,
		bannerUrl: input.bannerUrl || "",
		category: input.category || "Study Abroad Guide",
		tags: metaTags,
	};
}

export function normalizeUniversity(raw: any) {
	if (!raw) return raw;
	const rawTags: string[] = Array.isArray(raw.tags) ? raw.tags : [];
	let scholarshipHighlight = raw.scholarshipHighlight || "";
	let programsCtaLabel = raw.programsCtaLabel || "";
	let programsCtaUrl = raw.programsCtaUrl || "";
	let excerpt = raw.excerpt || "";
	const cleanTags: string[] = [];

	for (const tag of rawTags) {
		if (typeof tag !== "string") continue;
		if (tag.startsWith("__SCHOLARSHIP:") && tag.endsWith("__")) {
			scholarshipHighlight = tag.slice("__SCHOLARSHIP:".length, -2);
		} else if (tag.startsWith("__CTA_LABEL:") && tag.endsWith("__")) {
			programsCtaLabel = tag.slice("__CTA_LABEL:".length, -2);
		} else if (tag.startsWith("__CTA_URL:") && tag.endsWith("__")) {
			programsCtaUrl = tag.slice("__CTA_URL:".length, -2);
		} else if (tag.startsWith("__EXCERPT:") && tag.endsWith("__")) {
			excerpt = tag.slice("__EXCERPT:".length, -2);
		} else if (!tag.startsWith("__")) {
			cleanTags.push(tag);
		}
	}

	const plainDesc = (raw.description || "")
		.replace(/^#{1,6}\s+/gm, "")
		.replace(/^>\s+/gm, "")
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
		.replace(/[*_`>-]/g, "")
		.replace(/\s+/g, " ")
		.trim();

	if (!excerpt && plainDesc) {
		excerpt = plainDesc.length > 155 ? `${plainDesc.slice(0, 155)}...` : plainDesc;
	}

	return {
		...raw,
		tags: cleanTags,
		scholarshipHighlight,
		programsCtaLabel: programsCtaLabel || "View Official Programs",
		programsCtaUrl: programsCtaUrl || raw.website || "",
		excerpt,
	};
}

export function encodeUniversityTags(input: {
	tags?: string[];
	scholarshipHighlight?: string;
	programsCtaLabel?: string;
	programsCtaUrl?: string;
	excerpt?: string;
}) {
	const cleanTags = (input.tags || []).filter((t) => t && !t.startsWith("__"));
	const metaTags = [...cleanTags];
	if (input.scholarshipHighlight?.trim()) {
		metaTags.push(`__SCHOLARSHIP:${input.scholarshipHighlight.trim().slice(0, 120)}__`);
	}
	if (input.programsCtaLabel?.trim()) {
		metaTags.push(`__CTA_LABEL:${input.programsCtaLabel.trim().slice(0, 80)}__`);
	}
	if (input.programsCtaUrl?.trim()) {
		metaTags.push(`__CTA_URL:${input.programsCtaUrl.trim().slice(0, 300)}__`);
	}
	if (input.excerpt?.trim()) {
		metaTags.push(`__EXCERPT:${input.excerpt.trim().slice(0, 220)}__`);
	}
	return metaTags;
}

export const higherStudyService = {
	getCountries: async () => {
		const res = await apiClient.get("/higher-study/countries");
		return res.data;
	},

	createCountry: async (payload: {
		name: string;
		code: string;
		currency: string;
		description?: string;
		flagUrl?: string;
	}) => {
		const res = await apiClient.post("/higher-study/countries", payload);
		return res.data;
	},

	getUniversities: async (params?: Record<string, any>) => {
		const res = await apiClient.get("/higher-study/universities", { params });
		const body = res.data;
		if (Array.isArray(body?.data?.data)) {
			body.data.data = body.data.data.map(normalizeUniversity);
		} else if (Array.isArray(body?.data)) {
			body.data = body.data.map(normalizeUniversity);
		} else if (Array.isArray(body)) {
			return body.map(normalizeUniversity);
		}
		return body;
	},

	getUniversityDetails: async (id: string) => {
		const res = await apiClient.get(`/higher-study/universities/${id}`);
		const body = res.data;
		if (body?.data && typeof body.data === "object") {
			body.data = normalizeUniversity(body.data);
		} else if (body && typeof body === "object" && body.id) {
			return normalizeUniversity(body);
		}
		return body;
	},

	createUniversity: async (payload: any) => {
		const encodedTags = encodeUniversityTags({
			tags: Array.isArray(payload.tags) ? payload.tags : [],
			scholarshipHighlight: payload.scholarshipHighlight,
			programsCtaLabel: payload.programsCtaLabel,
			programsCtaUrl: payload.programsCtaUrl,
			excerpt: payload.excerpt,
		});
		const cleanPayload = {
			...payload,
			tags: encodedTags,
			website: payload.website || payload.programsCtaUrl || "",
		};
		delete cleanPayload.scholarshipHighlight;
		delete cleanPayload.programsCtaLabel;
		delete cleanPayload.programsCtaUrl;
		delete cleanPayload.excerpt;

		const res = await apiClient.post("/higher-study/universities", cleanPayload);
		return res.data;
	},

	uploadUniversityCover: async (formData: FormData) => {
		const res = await apiClient.post("/higher-study/universities/upload-cover", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return res.data;
	},

	deleteUniversityImage: async (payload: { publicId?: string; imageUrl?: string }) => {
		const res = await apiClient.delete("/higher-study/universities/delete-image", {
			data: payload,
		});
		return res.data;
	},

	updateUniversity: async (id: string, payload: any) => {
		const encodedTags = encodeUniversityTags({
			tags: Array.isArray(payload.tags) ? payload.tags : [],
			scholarshipHighlight: payload.scholarshipHighlight,
			programsCtaLabel: payload.programsCtaLabel,
			programsCtaUrl: payload.programsCtaUrl,
			excerpt: payload.excerpt,
		});
		const cleanPayload = {
			...payload,
			tags: encodedTags,
			website: payload.website || payload.programsCtaUrl || "",
		};
		delete cleanPayload.scholarshipHighlight;
		delete cleanPayload.programsCtaLabel;
		delete cleanPayload.programsCtaUrl;
		delete cleanPayload.excerpt;

		const res = await apiClient.patch(`/higher-study/universities/${id}`, cleanPayload);
		return res.data;
	},

	deleteUniversity: async (id: string, hard = false) => {
		const res = await apiClient.delete(`/higher-study/universities/${id}?hard=${hard}`);
		return res.data;
	},

	restoreUniversity: async (id: string) => {
		const res = await apiClient.patch(`/higher-study/universities/${id}/restore`);
		return res.data;
	},

	addDocRequirement: async (universityId: string, payload: any) => {
		const res = await apiClient.post(
			`/higher-study/universities/${universityId}/doc-requirements`,
			payload,
		);
		return res.data;
	},

	getPrograms: async (params?: Record<string, any>) => {
		const res = await apiClient.get("/higher-study/programs", { params });
		return res.data;
	},

	createProgram: async (payload: any) => {
		const res = await apiClient.post("/higher-study/programs", payload);
		return res.data;
	},

	applyForProgram: async (programId: string) => {
		const res = await apiClient.post("/higher-study/applications/apply", {
			programId,
		});
		return res.data;
	},

	getMyApplications: async () => {
		const res = await apiClient.get("/higher-study/applications/my");
		return res.data;
	},

	getAllApplications: async (params?: Record<string, any>) => {
		const res = await apiClient.get("/higher-study/applications", { params });
		return res.data;
	},

	assignCounselor: async (applicationId: string, counselorId: string) => {
		const res = await apiClient.patch(
			`/higher-study/applications/${applicationId}/assign-counselor`,
			{ counselorId },
		);
		return res.data;
	},

	addCounselorNote: async (
		applicationId: string,
		payload: { note: string; isPrivate: boolean },
	) => {
		const res = await apiClient.post(
			`/higher-study/applications/${applicationId}/notes`,
			payload,
		);
		return res.data;
	},

	updateStage: async (applicationId: string, status: string) => {
		const res = await apiClient.patch(
			`/higher-study/applications/${applicationId}/stage`,
			{ status },
		);
		return res.data;
	},

	toggleOfferLock: async (applicationId: string, isOfferUnlocked: boolean) => {
		const res = await apiClient.patch(
			`/higher-study/applications/${applicationId}/toggle-offer-lock`,
			{ isOfferUnlocked },
		);
		return res.data;
	},

	downloadOfferLetter: async (applicationId: string) => {
		const res = await apiClient.get(
			`/higher-study/applications/${applicationId}/download-offer-letter`,
		);
		return res.data;
	},

	uploadApplicationDocument: async (documentId: string, formData: FormData) => {
		const res = await apiClient.post(
			`/higher-study/documents/${documentId}/upload`,
			formData,
			{
				headers: { "Content-Type": "multipart/form-data" },
			},
		);
		return res.data;
	},

	verifyDocument: async (
		documentId: string,
		payload: { status: string; adminFeedback?: string },
	) => {
		const res = await apiClient.patch(
			`/higher-study/documents/${documentId}/verify`,
			payload,
		);
		return res.data;
	},

	issueOfferLetter: async (applicationId: string, formData: FormData) => {
		const res = await apiClient.post(
			`/higher-study/applications/${applicationId}/issue-offer-letter`,
			formData,
			{
				headers: { "Content-Type": "multipart/form-data" },
			},
		);
		return res.data;
	},

	getBlogs: async (params?: Record<string, any>) => {
		let apiPosts: IBlogPost[] = [];
		try {
			const res = await apiClient.get("/higher-study/blogs", {
				params: { limit: 100, ...params },
			});
			const rawData = res.data?.data?.data || res.data?.data || [];
			const list = Array.isArray(rawData) ? rawData : [];
			apiPosts = list.map(normalizeBlogPost);
		} catch {
			apiPosts = [];
		}

		const overrides = getLocalOverrides();
		const mergedDemos = DEFAULT_GUIDES.filter((d) => !overrides[d.id]?._deletedPermanently).map(
			(d) => normalizeBlogPost({ ...d, ...(overrides[d.id] || {}) })
		);

		const combined = [...apiPosts];
		for (const demo of mergedDemos) {
			if (!combined.some((p) => p.id === demo.id || p.slug === demo.slug)) {
				combined.push(demo);
			}
		}

		return {
			success: true,
			data: combined,
		};
	},

	getBlogBySlug: async (slug: string) => {
		try {
			const res = await apiClient.get(`/higher-study/blogs/${slug}`);
			const item = res.data?.data || res.data;
			if (item && item.id) {
				return { success: true, data: normalizeBlogPost(item) };
			}
		} catch {
			// Fallback to full list or default guides
		}
		const all = await higherStudyService.getBlogs();
		const found = (all.data || []).find((b: IBlogPost) => b.slug === slug || b.id === slug);
		return { success: Boolean(found), data: found || null };
	},

	createBlog: async (input: {
		title: string;
		content: string;
		excerpt?: string;
		bannerUrl?: string;
		category?: string;
		readTime?: string;
		status?: "PUBLISHED" | "DRAFT" | "TRASH";
		tags?: string[];
	}) => {
		const payload = encodeBlogPayload(input);
		const res = await apiClient.post("/higher-study/blogs", payload);
		const created = res.data?.data || res.data;
		return normalizeBlogPost(created);
	},

	updateBlog: async (
		id: string,
		input: {
			title: string;
			content: string;
			excerpt?: string;
			bannerUrl?: string;
			category?: string;
			readTime?: string;
			status?: "PUBLISHED" | "DRAFT" | "TRASH";
			tags?: string[];
		}
	) => {
		if (id.startsWith("demo-")) {
			saveLocalOverride(id, {
				...input,
				coverImage: input.bannerUrl,
				isPublished: input.status === "PUBLISHED",
				isDeleted: input.status === "TRASH",
				updatedAt: new Date().toISOString(),
			});
			const base = DEFAULT_GUIDES.find((d) => d.id === id) || DEFAULT_GUIDES[0];
			return normalizeBlogPost({ ...base, ...getLocalOverrides()[id] });
		}
		const payload = encodeBlogPayload(input);
		const createdRes = await apiClient.post("/higher-study/blogs", payload);
		const created = createdRes.data?.data || createdRes.data;
		await apiClient.delete(`/higher-study/blogs/${id}`).catch(() => null);
		return normalizeBlogPost(created);
	},

	deleteBlog: async (id: string) => {
		if (id.startsWith("demo-")) {
			saveLocalOverride(id, { _deletedPermanently: true });
			return { success: true };
		}
		const res = await apiClient.delete(`/higher-study/blogs/${id}`);
		return res.data;
	},

	addCustomDocument: async (
		applicationId: string,
		payload: { title: string; instruction?: string },
	) => {
		const res = await apiClient.post(
			`/higher-study/applications/${applicationId}/documents`,
			payload,
		);
		return res.data;
	},

	assignPresetDocuments: async (
		applicationId: string,
		payload: { presetType: "5_DOCS" | "7_DOCS" | "9_DOCS" | "CUSTOM"; customTitles?: string[] },
	) => {
		const res = await apiClient.post(
			`/higher-study/applications/${applicationId}/assign-presets`,
			payload,
		);
		return res.data;
	},

	deleteDocument: async (documentId: string) => {
		const res = await apiClient.delete(`/higher-study/documents/${documentId}`);
		return res.data;
	},

	// Application Trash & Deletion
	deleteApplication: async (applicationId: string) => {
		const res = await apiClient.delete(`/higher-study/applications/${applicationId}`);
		return res.data;
	},

	getTrashApplications: async () => {
		const res = await apiClient.get("/higher-study/applications/trash");
		return res.data;
	},

	restoreApplication: async (applicationId: string) => {
		const res = await apiClient.patch(`/higher-study/applications/${applicationId}/restore`);
		return res.data;
	},

	permanentDeleteApplication: async (applicationId: string) => {
		const res = await apiClient.delete(`/higher-study/applications/${applicationId}/permanent`);
		return res.data;
	},

	emptyTrashApplications: async () => {
		const res = await apiClient.delete("/higher-study/applications/trash/empty");
		return res.data;
	},

	// Checklist Presets / Groups Management
	getChecklistPresets: async () => {
		const res = await apiClient.get("/higher-study/checklist-presets");
		return res.data;
	},

	createChecklistPreset: async (payload: {
		title: string;
		country?: string;
		university?: string;
		degree?: string;
		description?: string;
		category?: string;
		items: Array<{ id?: string; title: string; instruction?: string; isRequired?: boolean; category?: string }>;
	}) => {
		const res = await apiClient.post("/higher-study/checklist-presets", payload);
		return res.data;
	},

	updateChecklistPreset: async (
		id: string,
		payload: {
			title?: string;
			country?: string;
			university?: string;
			degree?: string;
			description?: string;
			category?: string;
			items?: Array<{ id?: string; title: string; instruction?: string; isRequired?: boolean; category?: string }>;
		},
	) => {
		const res = await apiClient.put(`/higher-study/checklist-presets/${id}`, payload);
		return res.data;
	},

	deleteChecklistPreset: async (id: string) => {
		const res = await apiClient.delete(`/higher-study/checklist-presets/${id}`);
		return res.data;
	},

	// Individual Checklist Items Library Management
	getChecklistItems: async () => {
		const res = await apiClient.get("/higher-study/checklist-items");
		return res.data;
	},

	createChecklistItem: async (payload: {
		title: string;
		instruction?: string;
		isRequired?: boolean;
		category?: string;
	}) => {
		const res = await apiClient.post("/higher-study/checklist-items", payload);
		return res.data;
	},

	updateChecklistItem: async (
		id: string,
		payload: {
			title?: string;
			instruction?: string;
			isRequired?: boolean;
			category?: string;
		},
	) => {
		const res = await apiClient.put(`/higher-study/checklist-items/${id}`, payload);
		return res.data;
	},

	deleteChecklistItem: async (id: string) => {
		const res = await apiClient.delete(`/higher-study/checklist-items/${id}`);
		return res.data;
	},

	applyPresetToApplication: async (
		applicationId: string,
		payload: {
			presetId?: string;
			items?: Array<{ title: string; instruction?: string; isRequired?: boolean }>;
		},
	) => {
		const res = await apiClient.post(
			`/higher-study/applications/${applicationId}/apply-preset`,
			payload,
		);
		return res.data;
	},

	getApplicationById: async (id: string) => {
		const res = await apiClient.get(`/higher-study/applications/${id}`);
		return res.data;
	},

	downloadDossierPDF: async (
		applicationId: string,
		payload?: { documentIds?: string[]; customTitle?: string },
	) => {
		const res = await apiClient.post(
			`/higher-study/applications/${applicationId}/download-dossier-pdf`,
			payload,
			{ responseType: "blob" },
		);
		return res;
	},

	updateApplicationInformation: async (
		id: string,
		payload: {
			customInformation?: any;
			appliedUniversities?: any;
			contactNumber?: string;
			address?: string;
		},
	) => {
		const res = await apiClient.patch(
			`/higher-study/applications/${id}/information`,
			payload,
		);
		return res.data;
	},

	updateApplicationTracking: async (
		id: string,
		payload: { trackingMilestones: any; notifyStudent?: boolean; updateMessage?: string },
	) => {
		const res = await apiClient.patch(
			`/higher-study/applications/${id}/tracking`,
			payload,
		);
		return res.data;
	},

	addApplicationInternalNote: async (
		id: string,
		payload: { note: string },
	) => {
		const res = await apiClient.post(
			`/higher-study/applications/${id}/internal-notes`,
			payload,
		);
		return res.data;
	},

	deleteApplicationInternalNote: async (id: string, noteId: string) => {
		const res = await apiClient.delete(
			`/higher-study/applications/${id}/internal-notes/${noteId}`,
		);
		return res.data;
	},
};
