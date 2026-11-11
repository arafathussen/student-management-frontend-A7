import { apiClient } from "./apiClient";

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
		return res.data;
	},

	getUniversityDetails: async (id: string) => {
		const res = await apiClient.get(`/higher-study/universities/${id}`);
		return res.data;
	},

	createUniversity: async (payload: any) => {
		const res = await apiClient.post("/higher-study/universities", payload);
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
		const res = await apiClient.patch(`/higher-study/universities/${id}`, payload);
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
		const res = await apiClient.get("/higher-study/blogs", { params });
		return res.data;
	},

	getBlogBySlug: async (slug: string) => {
		const res = await apiClient.get(`/higher-study/blogs/${slug}`);
		return res.data;
	},

	createBlog: async (payload: any) => {
		const res = await apiClient.post("/higher-study/blogs", payload);
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
