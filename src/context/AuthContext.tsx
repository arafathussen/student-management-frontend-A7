"use client";

import type { IUser, Role } from "@/types";
import { useRouter } from "next/navigation";
import React, { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/authService";
import { userService } from "@/services/userService";
import { toast } from "sonner";

interface AuthContextType {
	user: IUser | null;
	accessToken: string | null;
	isLoading: boolean;
	loading: boolean;
	login: (emailOrUser: string | IUser, passwordOrToken?: string, refreshToken?: string) => Promise<any>;
	register: (payload: { name: string; email: string; password: string; contactNo?: string; contactNumber?: string }) => Promise<any>;
	verifyOtp: (email: string, otpCode: string) => Promise<any>;
	googleLogin: (idToken: string) => Promise<any>;
	logout: () => void;
	updateUser: (userData: Partial<IUser>) => void;
	refreshUser: () => Promise<IUser | null>;
	isAuthenticated: boolean;
	hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setAuthCookies(user: IUser | null, token: string | null) {
	if (typeof document === "undefined") return;
	if (user && token) {
		document.cookie = `ra_auth=1; path=/; max-age=604800; SameSite=Lax`;
		document.cookie = `ra_role=${encodeURIComponent(user.role)}; path=/; max-age=604800; SameSite=Lax`;
	} else {
		document.cookie = `ra_auth=; path=/; max-age=0; SameSite=Lax`;
		document.cookie = `ra_role=; path=/; max-age=0; SameSite=Lax`;
	}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<IUser | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		const initAuth = async () => {
			try {
				const savedUser = localStorage.getItem("user");
				const savedToken = localStorage.getItem("accessToken");
				if (savedUser && savedToken) {
					const parsed = JSON.parse(savedUser);
					setUser(parsed);
					setAccessToken(savedToken);
					setAuthCookies(parsed, savedToken);
					// Unblock UI immediately with verified cached session while refreshing profile in background
					setIsLoading(false);

					// Always sync live data from database silently
					try {
						const res = await userService.getMe();
						const dbUser = res.data || res;
						if (dbUser && dbUser.id) {
							setUser(dbUser);
							localStorage.setItem("user", JSON.stringify(dbUser));
							setAuthCookies(dbUser, savedToken);
						}
					} catch (fetchErr: any) {
						if (fetchErr?.response?.status === 401) {
							console.warn("Session expired. Logging out.");
							logout();
						}
					}
				} else {
					setAuthCookies(null, null);
				}
			} catch (e) {
				console.error("Failed to parse saved auth session", e);
			} finally {
				setIsLoading(false);
			}
		};

		initAuth();
	}, []);

	// Listen for immediate force_logout events triggered by API interceptor
	useEffect(() => {
		const handleForceLogout = (e: any) => {
			const message = e?.detail?.message;
			setUser(null);
			setAccessToken(null);
			localStorage.removeItem("user");
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			setAuthCookies(null, null);
			if (message) {
				toast.error(message);
			}
			router.push("/login");
		};

		window.addEventListener("auth:force_logout", handleForceLogout);
		return () => window.removeEventListener("auth:force_logout", handleForceLogout);
	}, [router]);

	// Live background heartbeat: immediately kicks out user if role is changed or user is banned
	useEffect(() => {
		if (!accessToken || !user) return;

		const interval = setInterval(async () => {
			try {
				const res = await userService.getMe();
				const dbUser = res.data || res;
				if (dbUser && dbUser.id) {
					if (dbUser.status === "BLOCKED") {
						clearInterval(interval);
						setUser(null);
						setAccessToken(null);
						localStorage.removeItem("user");
						localStorage.removeItem("accessToken");
						localStorage.removeItem("refreshToken");
						setAuthCookies(null, null);
						toast.error("Your account has been suspended by the administrator.");
						router.push("/login");
						return;
					}
					if (dbUser.role !== user.role) {
						clearInterval(interval);
						setUser(null);
						setAccessToken(null);
						localStorage.removeItem("user");
						localStorage.removeItem("accessToken");
						localStorage.removeItem("refreshToken");
						setAuthCookies(null, null);
						toast.info("Your account role has been updated. Please sign in again.");
						router.push("/login");
						return;
					}
				}
			} catch (err: any) {
				if (err?.response?.status === 401) {
					clearInterval(interval);
					setUser(null);
					setAccessToken(null);
					localStorage.removeItem("user");
					localStorage.removeItem("accessToken");
					localStorage.removeItem("refreshToken");
					setAuthCookies(null, null);
					router.push("/login");
				}
			}
		}, 15000);

		return () => clearInterval(interval);
	}, [accessToken, user, router]);

	const login = async (
		emailOrUser: string | IUser,
		passwordOrToken?: string,
		refreshToken?: string
	) => {
		if (typeof emailOrUser === "object") {
			// Direct user object login
			const userData = emailOrUser;
			const token = passwordOrToken || "";
			setUser(userData);
			setAccessToken(token);
			localStorage.setItem("user", JSON.stringify(userData));
			localStorage.setItem("accessToken", token);
			if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
			setAuthCookies(userData, token);
			return userData;
		}

		// API email + password login
		const res = await authService.login({
			email: emailOrUser,
			password: passwordOrToken || "",
		});

		const { user: userData, accessToken: token, refreshToken: rToken } = res.data;
		setUser(userData);
		setAccessToken(token);
		localStorage.setItem("user", JSON.stringify(userData));
		localStorage.setItem("accessToken", token);
		if (rToken) localStorage.setItem("refreshToken", rToken);
		setAuthCookies(userData, token);

		return userData;
	};

	const register = async (payload: {
		name: string;
		email: string;
		password: string;
		contactNo?: string;
		contactNumber?: string;
	}) => {
		const res = await authService.registerStudent({
			name: payload.name,
			email: payload.email,
			password: payload.password,
			contactNumber: payload.contactNo || payload.contactNumber,
		});
		return res;
	};

	const verifyOtp = async (email: string, otpCode: string) => {
		const res = await authService.verifyEmail({ email, otpCode });
		if (res.data?.user && res.data?.accessToken) {
			const { user: userData, accessToken: token, refreshToken: rToken } = res.data;
			setUser(userData);
			setAccessToken(token);
			localStorage.setItem("user", JSON.stringify(userData));
			localStorage.setItem("accessToken", token);
			if (rToken) localStorage.setItem("refreshToken", rToken);
			setAuthCookies(userData, token);
		}
		return res;
	};

	const googleLogin = async (idToken: string) => {
		const res = await authService.googleLogin(idToken);
		if (res.data?.user && res.data?.accessToken) {
			const { user: userData, accessToken: token, refreshToken: rToken } = res.data;
			setUser(userData);
			setAccessToken(token);
			localStorage.setItem("user", JSON.stringify(userData));
			localStorage.setItem("accessToken", token);
			if (rToken) localStorage.setItem("refreshToken", rToken);
			setAuthCookies(userData, token);
		}
		return res;
	};

	const logout = () => {
		setUser(null);
		setAccessToken(null);
		localStorage.removeItem("user");
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		setAuthCookies(null, null);
		toast.success("Signed out successfully");
		router.push("/login");
	};

	const updateUser = (userData: Partial<IUser>) => {
		setUser((prev) => {
			if (!prev) return null;
			const updated = { ...prev, ...userData };
			localStorage.setItem("user", JSON.stringify(updated));
			return updated;
		});
	};

	const refreshUser = async (): Promise<IUser | null> => {
		try {
			const res = await userService.getMe();
			const dbUser = res.data || res;
			if (dbUser && dbUser.id) {
				setUser(dbUser);
				localStorage.setItem("user", JSON.stringify(dbUser));
				return dbUser;
			}
		} catch (err) {
			console.error("Failed to refresh user from database:", err);
		}
		return null;
	};

	const hasRole = (...roles: Role[]) => {
		if (!user) return false;
		return roles.includes(user.role);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				accessToken,
				isLoading,
				loading: isLoading,
				login,
				register,
				verifyOtp,
				googleLogin,
				logout,
				updateUser,
				refreshUser,
				isAuthenticated: !!user && !!accessToken,
				hasRole,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
