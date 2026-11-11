import { apiClient } from "./apiClient";

export const chatService = {
	getOrCreateRoom: async (studentUserId: string, applicationId?: string) => {
		const res = await apiClient.get(`/chat/room/${studentUserId}`, {
			params: applicationId ? { applicationId } : undefined,
		});
		return res.data;
	},

	getRoomMessages: async (roomId: string) => {
		const res = await apiClient.get(`/chat/room/messages/${roomId}`);
		return res.data;
	},

	sendMessage: async (payload: {
		receiverId: string;
		message: string;
		senderDisplayName?: string;
		roomId?: string;
		attachmentUrl?: string;
	}) => {
		const res = await apiClient.post("/chat/send", payload);
		return res.data;
	},

	toggleRoomLock: async (roomId: string, lock: boolean) => {
		const res = await apiClient.patch(`/chat/room/${roomId}/lock`, { lock });
		return res.data;
	},

	setChatMode: async (
		roomId: string,
		mode: "EXCLUSIVE_LOCK" | "COLLABORATIVE_GROUP",
	) => {
		const res = await apiClient.patch(`/chat/room/${roomId}/mode`, { mode });
		return res.data;
	},

	updateStudentBudget: async (
		studentUserId: string,
		payload: { targetBudget: number; preferredCurrency: string },
	) => {
		const res = await apiClient.patch(
			`/chat/student/${studentUserId}/budget`,
			payload,
		);
		return res.data;
	},

	markMessagesAsRead: async (senderId: string) => {
		const res = await apiClient.patch(`/chat/read/${senderId}`);
		return res.data;
	},
};
