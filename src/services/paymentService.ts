import { apiClient } from "./apiClient";

export interface IPaymentRecord {
	id: string;
	amount: number;
	currency: string;
	paymentType: string;
	status: "PAID" | "PENDING" | "UNPAID" | "FAILED";
	invoiceNumber?: string;
	stripeSessionId?: string;
	stripeReceiptUrl?: string;
	paidAt?: string;
	description?: string;
	createdAt: string;
	higherStudyApplicationId?: string;
}

export const paymentService = {
	createCheckoutSession: async (payload: {
		amount: number;
		paymentType?: string;
		description?: string;
		applicationId?: string;
		higherStudyApplicationId?: string;
		paymentId?: string;
	}) => {
		const res = await apiClient.post("/payments/create-checkout-session", {
			amount: payload.amount,
			paymentType: payload.paymentType || "OFFER_DEPOSIT",
			description: payload.description,
			higherStudyApplicationId: payload.higherStudyApplicationId || payload.applicationId,
			paymentId: payload.paymentId,
		});
		return res.data;
	},

	verifyCheckoutSession: async (payload: {
		sessionId: string;
		paymentId?: string;
	}) => {
		const res = await apiClient.post("/payments/verify-session", payload);
		return res.data;
	},

	getMyPayments: async () => {
		try {
			const res = await apiClient.get("/payments/my-history");
			return res.data;
		} catch (err) {
			console.warn("Could not fetch payment history, returning empty list", err);
			return { data: [] };
		}
	},

	createApplicationInvoice: async (payload: {
		higherStudyApplicationId: string;
		amount: number;
		currency?: string;
		description: string;
		paymentType?: string;
	}) => {
		const res = await apiClient.post("/payments/invoices", payload);
		return res.data;
	},

	downloadReceipt: async (paymentId: string) => {
		const res = await apiClient.get(`/payments/receipt/${paymentId}`, {
			responseType: "blob",
		});
		return res.data;
	},

	deletePendingInvoice: async (paymentId: string) => {
		const res = await apiClient.delete(`/payments/invoices/${paymentId}`);
		return res.data;
	},

	updatePendingInvoice: async (
		paymentId: string,
		payload: { description?: string; amount?: number; currency?: string }
	) => {
		const res = await apiClient.patch(`/payments/invoices/${paymentId}`, payload);
		return res.data;
	},
};
