import axios from "axios";

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL || "https://riseabroad-server.vercel.app/api/v1";

export const apiClient = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

apiClient.interceptors.request.use(
	(config) => {
		if (typeof window !== "undefined") {
			const token = localStorage.getItem("accessToken");
			if (token && config.headers) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const errMsg = error.response?.data?.message || "";

		// If account is banned or role updated, immediately force logout without retrying refresh token
		if (
			error.response?.status === 401 &&
			(errMsg.includes("role has been updated") || errMsg.includes("banned") || errMsg.includes("suspended"))
		) {
			if (typeof window !== "undefined") {
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				localStorage.removeItem("user");
				window.dispatchEvent(new CustomEvent("auth:force_logout", { detail: { message: errMsg } }));
				if (window.location.pathname !== "/login") {
					window.location.href = `/login?reason=${encodeURIComponent(errMsg)}`;
				}
			}
			return Promise.reject(error);
		}

		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				const refreshToken = localStorage.getItem("refreshToken");
				if (refreshToken) {
					const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
						refreshToken,
					});
					const newAccessToken = res.data?.data?.accessToken;
					if (newAccessToken) {
						localStorage.setItem("accessToken", newAccessToken);
						originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
						return apiClient(originalRequest);
					}
				}
			} catch (refreshErr) {
				if (typeof window !== "undefined") {
					localStorage.removeItem("accessToken");
					localStorage.removeItem("refreshToken");
					localStorage.removeItem("user");
					window.dispatchEvent(new Event("auth:force_logout"));
					if (window.location.pathname !== "/login") {
						window.location.href = "/login";
					}
				}
			}
		}
		return Promise.reject(error);
	},
);
