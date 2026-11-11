import { apiClient } from "./apiClient";

export const commissionService = {
	createCommission: async (payload: any) => {
		const res = await apiClient.post("/commissions", payload);
		return res.data;
	},

	updateStatus: async (id: string, status: string, notes?: string) => {
		const res = await apiClient.patch(`/commissions/${id}/status`, {
			status,
			notes,
		});
		return res.data;
	},

	updateWithdrawalStatus: async (id: string, withdrawalStatus: string, notes?: string) => {
		const res = await apiClient.patch(`/commissions/${id}/status`, {
			status: withdrawalStatus,
			notes,
		});
		return res.data;
	},

	getAllCommissions: async (params?: Record<string, any>) => {
		const res = await apiClient.get("/commissions/all-ledger", { params });
		return res.data;
	},

	getMyLedger: async () => {
		const res = await apiClient.get("/commissions/my-ledger");
		return res.data;
	},

	getMyCommissions: async () => {
		const res = await apiClient.get("/commissions/my-ledger");
		return res.data;
	},

	updateCounselorVisibility: async (
		counselorId: string,
		payload: any,
	) => {
		const formatted = typeof payload === "string" ? { mode: payload } : payload;
		const res = await apiClient.patch(
			`/commissions/counselor/${counselorId}/visibility`,
			formatted,
		);
		return res.data;
	},

	assignStudentReferral: async (
		studentId: string,
		referredByUserId: string,
	) => {
		const res = await apiClient.patch(`/commissions/referral/${studentId}`, {
			referredByUserId,
		});
		return res.data;
	},
};
