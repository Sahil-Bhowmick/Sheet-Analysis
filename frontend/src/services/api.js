// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api", // Update this if deployed
// });

// // Attach token to every request
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // ✅ Auth
// export const registerUser = (userData) => API.post("/auth/register", userData);
// export const loginUser = (userData) => API.post("/auth/login", userData);

// // ✅ File Upload
// export const uploadFile = (data) => API.post("/upload", data);

// // ✅ Chart Metadata
// // export const saveChartMetadata = (metadata) =>
// //   API.post("/charts/save", metadata);
// export const saveChartMetadata = (metadata) =>
//   API.post("/charts/save", metadata); // Ensure `metadata` includes: data, chartType, xKey, yKey, title

// export const getChartHistory = () => API.get("/charts/history");

// // ✅ Route for Delete Chart Metadata
// export const deleteChartById = (id) => API.delete(`/charts/${id}`);

// // ✅ Route for AI Insight
// export const getChartInsight = (payload) => API.post("/ai/summary", payload);

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // ⚠️ Update this if deploying
});

// ✅ Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//
// ✅ Auth Routes
//
export const registerUser = (userData) => API.post("/auth/register", userData);
export const loginUser = (userData) => API.post("/auth/login", userData);

//
// ✅ File Upload - Now also saves metadata
//
export const uploadFile = (formData) => API.post("/upload", formData); // response contains { data, chart }

//
// ✅ Chart Metadata (manual save if needed)
//
export const saveChartMetadata = (metadata) =>
  API.post("/charts/save", metadata); // metadata must include: data, chartType, xKey, yKey, title

export const getChartHistory = () => API.get("/charts/history");
export const deleteChartById = (id) => API.delete(`/charts/${id}`);

//
// ✅ AI Insight (chart summary from OpenAI API)
//
export const getChartInsight = (payload) => API.post("/ai/summary", payload); // expects { xKey, yKey, data }
