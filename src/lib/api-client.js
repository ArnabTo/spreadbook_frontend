import { API_BASE_URL } from "@/config/api";

const TOKEN_KEY = "spreadbook_access_token";
const REFRESH_KEY = "spreadbook_refresh_token";

function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

function setTokens(accessToken, refreshToken) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
        localStorage.setItem(REFRESH_KEY, refreshToken);
    }
}

function clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
}

async function request(endpoint, options = {}) {
    const { method = "GET", body, headers = {}, auth = true } = options;

    const requestHeaders = {
        "Content-Type": "application/json",
        ...headers,
    };

    if (auth) {
        const token = getToken();
        if (token) {
            requestHeaders["Authorization"] = `Bearer ${token}`;
        }
    }

    const config = {
        method,
        headers: requestHeaders,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            const errorMsg = data?.error || data?.detail || `Request failed with status ${response.status}`;
            throw new Error(errorMsg);
        }

        return data;
    } catch (error) {
        if (error.name === "TypeError" && error.message === "Failed to fetch") {
            throw new Error(
                `Unable to connect to the server at ${API_BASE_URL}. Please ensure the backend is running.`
            );
        }
        throw error;
    }
}

// Auth-specific API calls
export const authApi = {
    login: (username, password) =>
        request("/api/auth/megashop-login/", {
            method: "POST",
            body: { username, password },
            auth: false,
        }),

    getProfile: () => request("/api/auth/profile/"),

    refreshToken: (refreshToken) =>
        request("/api/auth/token/refresh/", {
            method: "POST",
            body: { refresh: refreshToken },
            auth: false,
        }),
};

export { getToken, setTokens, clearTokens };
export default request;
