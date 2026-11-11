import { apiClient } from "./apiClient";

export interface SuccessPageSettings {
  id?: string;
  badgeText: string;
  titlePart1: string;
  titlePart2: string;
  description: string;
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
  stat3Value: string;
  stat3Label: string;
  stat4Value: string;
  stat4Label: string;
}

export interface SuccessStoryItem {
  id: string;
  slug?: string;
  studentName: string;
  photoUrl?: string;
  thumbnailUrl?: string;
  homeInstitution: string;
  hometown?: string;
  country: string;
  universityName: string;
  degreeName: string;
  intake?: string;
  visaDate?: string;
  youtubeUrl?: string;
  testimonial?: string;
  storyContent: string;
  scholarshipNote?: string;
  viewsCount?: number;
  isPublished?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const successStoryService = {
  // Public & admin settings
  getSettings: async (): Promise<SuccessPageSettings> => {
    const res = await apiClient.get<{ success: boolean; data: SuccessPageSettings }>(
      "/success-stories/settings"
    );
    return res.data.data;
  },

  updateSettings: async (
    payload: Partial<SuccessPageSettings>
  ): Promise<SuccessPageSettings> => {
    const res = await apiClient.patch<{ success: boolean; data: SuccessPageSettings }>(
      "/success-stories/settings",
      payload
    );
    return res.data.data;
  },

  // Stories CRUD
  getStories: async (query?: { country?: string; searchTerm?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get("/success-stories", { params: query });
    return res.data.data;
  },

  getStoryById: async (id: string): Promise<SuccessStoryItem> => {
    const res = await apiClient.get<{ success: boolean; data: SuccessStoryItem }>(
      `/success-stories/${id}`
    );
    return res.data.data;
  },

  getCountries: async (): Promise<Array<{ country: string; count: number; totalViews: number }>> => {
    const res = await apiClient.get<{ success: boolean; data: Array<{ country: string; count: number; totalViews: number }> }>(
      "/success-stories/countries"
    );
    return res.data.data;
  },

  createStory: async (payload: Partial<SuccessStoryItem>) => {
    const res = await apiClient.post("/success-stories", payload);
    return res.data.data;
  },

  updateStory: async (id: string, payload: Partial<SuccessStoryItem>) => {
    const res = await apiClient.patch(`/success-stories/${id}`, payload);
    return res.data.data;
  },

  trashStory: async (id: string) => {
    const res = await apiClient.patch(`/success-stories/${id}/trash`);
    return res.data.data;
  },

  restoreStory: async (id: string) => {
    const res = await apiClient.patch(`/success-stories/${id}/restore`);
    return res.data.data;
  },

  getTrashedStories: async () => {
    const res = await apiClient.get("/success-stories/admin/trash");
    return res.data.data;
  },
};
