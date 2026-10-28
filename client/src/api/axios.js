import axios from "axios";

// 1. In production, use VITE_BASE_URL if set, or fallback to the deployed Render backend URL
const rawBaseUrl =
    import.meta.env.VITE_BASE_URL ||
    (import.meta.env.PROD
        ? "https://emp-management-backend-16u5.onrender.com"
        : "http://localhost:4000");

const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const baseURL = cleanBaseUrl.endsWith("/api") ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const api = axios.create({
    baseURL,
    withCredentials: true,
});

// Interceptor: attach token if present in localStorage (ensures auth works even if 3rd-party cookies are blocked)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor: store token if received on login, clear on 401
api.interceptors.response.use(
    (response) => {
        if (response.data?.token) {
            localStorage.setItem("token", response.data.token);
        }
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
        }
        return Promise.reject(error);
    }
);

export default api;
