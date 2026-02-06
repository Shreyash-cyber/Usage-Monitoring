import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { login as loginApi, me as meApi, logout as logoutApi } from "../services/authService.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const bootstrap = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await meApi();
      setUser(res);
    } catch (err) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const login = async (email, password) => {
    await loginApi(email, password);
    await bootstrap();
  };

  const logout = () => {
    logoutApi();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
