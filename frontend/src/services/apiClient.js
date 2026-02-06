import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem("token");
      const onLoginPage = window.location.pathname === "/login";
      if (token) {
        localStorage.removeItem("token");
      }
      if (!onLoginPage && token) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
