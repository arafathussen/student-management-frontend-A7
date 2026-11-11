import { apiClient } from "./apiClient";

export const authService = {
	registerStudent: async (payload: {
		name: string;
		email: string;
		password: string;
		contactNumber?: string;
		gender?: string;
	}) => {
		const res = await apiClient.post("/auth/register", payload);
		return res.data;
	},

	verifyEmail: async (payload: { email: string; otpCode: string }) => {
		const res = await apiClient.post("/auth/verify-email", payload);
		return res.data;
	},

	resendOtp: async (payload: { email: string }) => {
		const res = await apiClient.post("/auth/resend-otp", payload);
		return res.data;
	},

	login: async (payload: { email: string; password: string }) => {
		const res = await apiClient.post("/auth/login", payload);
		return res.data;
	},

	googleLogin: async (idToken: string) => {
		const res = await apiClient.post("/auth/google", { idToken });
		return res.data;
	},

	forgotPassword: async (email: string) => {
		const res = await apiClient.post("/auth/forgot-password", { email });
		return res.data;
	},

	resetPassword: async (payload: {
		email: string;
		otpCode: string;
		newPassword: string;
	}) => {
		const res = await apiClient.post("/auth/reset-password", payload);
		return res.data;
	},
};
