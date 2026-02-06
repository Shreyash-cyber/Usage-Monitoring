import api from "./apiClient.js";

export async function login(email, password) {
  const form = new FormData();
  form.append("username", email);
  form.append("password", password);
  const res = await api.post("/auth/login", form);
  localStorage.setItem("token", res.data.access_token);
  return res.data;
}

export async function me() {
  const res = await api.get("/auth/me");
  return res.data;
}

export function logout() {
  localStorage.removeItem("token");
}
