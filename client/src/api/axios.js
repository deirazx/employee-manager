import axios from "axios";

// Determine the backend base URL
const getBaseUrl = () => {
    // 1. If running in a deployed browser environment (Vercel / Netlify / custom domain)
    if (
        typeof window !== "undefined" &&
        !window.location.hostname.includes("localhost") &&
        window.location.hostname !== "127.0.0.1"
    ) {
        return "https://emp-management-backend-16u5.onrender.com";
    }

    // 2. If environment variable is explicitly provided and not localhost in production
    const envUrl = import.meta.env.VITE_BASE_URL;
    if (envUrl && (!envUrl.includes("localhost") || !import.meta.env.PROD)) {
        return envUrl;
    }

    // 3. Fallback for production vs local development
    return import.meta.env.PROD
        ? "https://emp-management-backend-16u5.onrender.com"
        : "http://localhost:4000";
};

const rawBaseUrl = getBaseUrl();
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, "");
const baseURL = cleanBaseUrl.endsWith("/api") ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const api = axios.create({
    baseURL,
    withCredentials: true,
});

export default api;
