import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests and dynamically add the Authorization token
API.interceptors.request.use(
  (config) => {
    // If Authorization header is already provided explicitly, keep it
    if (config.headers?.Authorization) {
      return config;
    }

    const isGovRoute = config.url && config.url.includes("/gov");
    const token = isGovRoute
      ? localStorage.getItem("govToken")
      : localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;