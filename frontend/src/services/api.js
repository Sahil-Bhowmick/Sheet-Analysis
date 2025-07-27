import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Change this in production
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const registerUser = (userData) => API.post("/auth/register", userData);
export const loginUser = (userData) => API.post("/auth/login", userData);
export const loginWithGoogle = (data) => API.post("/auth/firebase-login", data);

// Forgot & Reset Password
export const sendForgotPasswordLink = (email) =>
  API.post("/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
  API.post(`/auth/reset-password/${token}`, { password });

// File Upload
export const uploadFile = (formData) => API.post("/upload", formData);

// Chart Metadata
export const saveChartMetadata = (metadata) =>
  API.post("/charts/save", metadata);
export const updateChartMetadata = (chartId, metadata) =>
  API.put(`/charts/${chartId}`, metadata);
export const getChartHistory = () => API.get("/charts/history");
export const deleteChartById = (id) => API.delete(`/charts/${id}`);

// Pinned Charts
export const getSavedCharts = () => API.get("/charts/saved");

// AI Insights
export const getChartInsight = (payload) => API.post("/ai/summary", payload);
