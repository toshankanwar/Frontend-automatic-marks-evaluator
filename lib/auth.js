export const saveAuth = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data));
  };
  
  export const getUser = () => {
    if (typeof window === "undefined") return null;
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  };
  
  export const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };