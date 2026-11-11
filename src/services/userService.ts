import { apiClient } from "./apiClient";

export const userService = {
	getUsers: async (params?: Record<string, any>) => {
		const res = await apiClient.get("/users", { params });
		return res.data;
	},

	getAllUsers: async (params?: Record<string, any>) => {
		const res = await apiClient.get("/users", { params });
		return res.data;
	},

	createCustomUser: async (payload: {
		name: string;
		email: string;
		password?: string;
		role: string;
		contactNumber?: string;
	}) => {
		const res = await apiClient.post("/users/custom-create", payload);
		return res.data;
	},

	updateStatus: async (userId: string, status: string) => {
		const res = await apiClient.patch(`/users/${userId}/status`, { status });
		return res.data;
	},

	updateRole: async (userId: string, role: string) => {
		const res = await apiClient.patch(`/users/${userId}/role`, { role });
		return res.data;
	},

	deleteUser: async (userId: string) => {
		const res = await apiClient.delete(`/users/${userId}`);
		return res.data;
	},

	resetPassword: async (payload: {
		userId: string;
		newPassword?: string;
		sendResetEmail?: boolean;
	}) => {
		const res = await apiClient.post("/users/reset-user-password", payload);
		return res.data;
	},

	getMe: async () => {
		const res = await apiClient.get("/users/me");
		return res.data;
	},

	updateMe: async (payload: { name?: string; contactNumber?: string; address?: string }) => {
		const res = await apiClient.patch("/users/me", payload);
		return res.data;
	},

	updateProfileImage: async (formData: FormData) => {
		const res = await apiClient.patch("/users/profile-image", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return res.data;
	},

	changePassword: async (payload: { oldPassword: string; newPassword: string }) => {
		const res = await apiClient.post("/auth/change-password", payload);
		return res.data;
	},

	getVisitorStats: async () => {
		const res = await apiClient.get("/admin/visitor-stats");
		return res.data?.data || res.data;
	},

	pingVisitor: async (sessionId: string, isPageLoad: boolean = true) => {
		const res = await apiClient.post("/admin/visitor-ping", { sessionId, isPageLoad });
		return res.data?.data || res.data;
	},
};
