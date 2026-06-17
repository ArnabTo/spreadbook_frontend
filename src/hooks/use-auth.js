"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi, setTokens, clearTokens, getToken } from "@/lib/api-client";

const AuthContext = createContext(null);

const AUTH_COOKIE = "spreadbook_auth";
const USER_KEY = "spreadbook_user";

function setCookie(name, value) {
    const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

function mapBackendUser(backendUser) {
    return {
        id: backendUser.id,
        name: backendUser.fullName || backendUser.name || backendUser.username,
        email: backendUser.email,
        username: backendUser.username,
        avatar: backendUser.avatarUrl,
        role: backendUser.role,
        companyId: backendUser.companyId,
        company: backendUser.company || null,
        resellerId: backendUser.resellerId,
        branchAccess: backendUser.branchAccess || [],
        status: backendUser.status,
    };
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // On mount, check for existing session and validate with backend
    useEffect(() => {
        async function initAuth() {
            const savedUser = localStorage.getItem(USER_KEY);
            const token = getToken();

            if (savedUser && token) {
                // Try to validate the token by fetching the profile
                try {
                    const profileData = await authApi.getProfile();
                    if (profileData?.success && profileData?.user) {
                        const mappedUser = mapBackendUser(profileData.user);
                        localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));
                        setUser(mappedUser);
                        setIsLoading(false);
                        return;
                    }
                } catch {
                    // Token invalid or server unreachable - fall back to cached user
                    try {
                        const parsed = JSON.parse(savedUser);
                        setUser(parsed);
                    } catch {
                        clearTokens();
                        localStorage.removeItem(USER_KEY);
                        removeCookie(AUTH_COOKIE);
                    }
                }
            } else {
                // No saved session
                clearTokens();
                localStorage.removeItem(USER_KEY);
                removeCookie(AUTH_COOKIE);
            }
            setIsLoading(false);
        }

        initAuth();
    }, []);

    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const data = await authApi.login(email, password);

            if (!data?.success) {
                throw new Error(data?.error || "Login failed");
            }

            // Store JWT tokens
            setTokens(data.access_token, data.refresh_token);

            // Map and store user data
            const mappedUser = mapBackendUser(data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(mappedUser));

            // Set middleware cookie for route protection
            setCookie(AUTH_COOKIE, { authenticated: true });

            setUser(mappedUser);
            router.push("/dashboard");
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    const logout = useCallback(() => {
        clearTokens();
        localStorage.removeItem(USER_KEY);
        removeCookie(AUTH_COOKIE);
        setUser(null);
        router.push("/auth/sign-in");
    }, [router]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
