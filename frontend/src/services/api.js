import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Update this if deployed
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Auth
export const registerUser = (userData) => API.post("/auth/register", userData);
export const loginUser = (userData) => API.post("/auth/login", userData);

// ✅ File Upload
export const uploadFile = (data) => API.post("/upload", data);

// ✅ Chart Metadata
export const saveChartMetadata = (metadata) =>
  API.post("/charts/save", metadata);
export const getChartHistory = () => API.get("/charts/history");

// ✅ Route for AI Insight
export const getChartInsight = (payload) => API.post("/ai/summary", payload);
