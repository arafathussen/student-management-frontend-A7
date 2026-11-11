import { apiClient } from "./apiClient";

export interface INotificationItem {
  id: string;
  title: string;
  body: string;
  audience?: string;
  priority?: "INFO" | "WARNING" | "CRITICAL_ALERT" | "ACTION_REQUIRED";
  userId?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getMyNotifications: async () => {
    const res = await apiClient.get<{ success: boolean; data: INotificationItem[] }>("/notifications/my");
    return res.data?.data || [];
  },

  markAsRead: async (notificationId: string) => {
    const res = await apiClient.patch(`/notifications/${notificationId}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch("/notifications/mark-all-read");
    return res.data;
  },
};
