export const saveAuth = (data) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", data.access_token || "");
  localStorage.setItem("user", JSON.stringify(data));
};

export const getToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
};

export const setUser = (user) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
};

export const setToken = (token) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token || "");
};

export const logout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};