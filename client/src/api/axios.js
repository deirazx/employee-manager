import axios from "axios";

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

export default api;
