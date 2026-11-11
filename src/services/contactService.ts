import { apiClient } from "./apiClient";

export interface ContactPageSettings {
	id?: string;
	headquartersTitle: string;
	headquartersAddress: string;
	headquartersNote: string;
	officeHoursTitle: string;
	officeHoursSchedule: string;
	officeHoursNote: string;
	autoResponderSubject?: string;
	autoResponderSenderName?: string;
	autoResponderSenderEmail?: string;
	autoResponderWhatsAppText?: string;
	autoResponderWhatsAppNumber?: string;
	autoResponderOfficeAddress?: string;
	autoResponderHotline?: string;
	autoResponderEmail?: string;
	autoResponderHours?: string;
	autoResponderLogoUrl?: string;
	otpEmailSubject?: string;
	otpEmailHeading?: string;
	otpEmailBodyMessage?: string;
	otpEmailExpiryNote?: string;
	regOtpEmailSubject?: string;
	regOtpEmailHeading?: string;
	regOtpEmailBodyMessage?: string;
	regOtpEmailExpiryNote?: string;
	welcomeEmailSubject?: string;
	welcomeEmailHeading?: string;
	welcomeEmailMessage?: string;
	welcomeEmailBtnText?: string;
	welcomeEmailBtnUrl?: string;
	updatedAt?: string;
}

export interface SupportTeamMember {
	id: string;
	name: string;
	role: string;
	badge: string;
	badgeColor: string;
	department: string;
	avatar: string;
	avatarAlt?: string;
	phone: string;
	email: string;
	whatsapp: string;
	facebook: string;
	order: number;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface ContactInquiry {
	id: string;
	name: string;
	email: string;
	phone?: string | null;
	subject: string;
	message: string;
	country?: string | null;
	isRead: boolean;
	status: string;
	reply?: string | null;
	repliedAt?: string | null;
	createdAt: string;
	updatedAt: string;
}

export const contactService = {
	// Public & Admin: Fetch settings
	getSettings: async (): Promise<ContactPageSettings> => {
		const response = await apiClient.get("/contact/settings");
		return response.data?.data;
	},

	// Admin: Update settings
	updateSettings: async (payload: Partial<ContactPageSettings>): Promise<ContactPageSettings> => {
		const response = await apiClient.patch("/contact/settings", payload);
		return response.data?.data;
	},

	// Public: Fetch active support team members
	getTeamMembers: async (all = false): Promise<SupportTeamMember[]> => {
		const response = await apiClient.get(`/contact/team${all ? "?all=true" : ""}`);
		return response.data?.data || [];
	},

	// Admin: Create member
	createTeamMember: async (payload: Omit<SupportTeamMember, "id" | "createdAt" | "updatedAt">): Promise<SupportTeamMember> => {
		const response = await apiClient.post("/contact/team", payload);
		return response.data?.data;
	},

	// Admin: Update member
	updateTeamMember: async (id: string, payload: Partial<SupportTeamMember>): Promise<SupportTeamMember> => {
		const response = await apiClient.patch(`/contact/team/${id}`, payload);
		return response.data?.data;
	},

	// Admin: Delete member
	deleteTeamMember: async (id: string): Promise<{ id: string; message: string }> => {
		const response = await apiClient.delete(`/contact/team/${id}`);
		return response.data?.data;
	},

	// Public: Submit inquiry
	sendInquiry: async (payload: {
		name: string;
		email: string;
		phone?: string;
		subject: string;
		message: string;
		country?: string;
	}): Promise<ContactInquiry> => {
		const response = await apiClient.post("/contact/inquiries", payload);
		return response.data?.data;
	},

	// Admin: Fetch all inquiries
	getInquiries: async (): Promise<{ inquiries: ContactInquiry[]; unreadCount: number }> => {
		const response = await apiClient.get("/contact/inquiries");
		return response.data?.data || { inquiries: [], unreadCount: 0 };
	},

	// Admin: Mark inquiry as read
	markInquiryRead: async (id: string): Promise<ContactInquiry> => {
		const response = await apiClient.patch(`/contact/inquiries/${id}/read`);
		return response.data?.data;
	},

	// Admin: Reply to inquiry
	replyToInquiry: async (id: string, reply: string): Promise<ContactInquiry> => {
		const response = await apiClient.post(`/contact/inquiries/${id}/reply`, { reply });
		return response.data?.data;
	},

	// Admin: Delete inquiry
	deleteInquiry: async (id: string): Promise<{ id: string; message: string }> => {
		const response = await apiClient.delete(`/contact/inquiries/${id}`);
		return response.data?.data;
	},

	// Admin: Upload high quality PNG logo for Auto-Responder
	uploadLogo: async (formData: FormData): Promise<{ url: string; publicId: string }> => {
		const response = await apiClient.post("/contact/upload-logo", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return response.data?.data;
	},
};
