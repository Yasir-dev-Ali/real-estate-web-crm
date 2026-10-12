import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    setUser(data.user);
    return data.user;
  }

  async function register(details) {
    const { data } = await api.post("/auth/register", details);
    return data;
  }

  async function verifyEmail(email, code) {
    const { data } = await api.post("/auth/verify-email", { email, code });
    setUser(data.user);
    return data;
  }

  async function resendVerification(email) {
    const { data } = await api.post("/auth/resend-verification", { email });
    return data;
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // Clear the local session even if the server is unreachable.
    }
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, setUser, loading, login, register, verifyEmail, resendVerification, logout }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
