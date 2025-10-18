import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // ✅ named import
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:5000/api/users";

  // Login: store token & fetch fresh user from backend
  const login = async (userData, token) => {
    localStorage.setItem("token", token);
    setLoading(true);
    try {
      const latestUser = await refreshUser(userData._id || userData.id);
      if (latestUser) {
        setUser(latestUser);
        localStorage.setItem("user", JSON.stringify(latestUser));
      } else {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (err) {
      console.error("❌ Login: failed to refresh user", err);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const refreshUser = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const res = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const latestUser = res.data;
      setUser(latestUser);
      localStorage.setItem("user", JSON.stringify(latestUser));
      return latestUser;
    } catch (err) {
      console.error("❌ Failed to refresh user data:", err);
      return null;
    }
  };

  // Initialize user: always fetch from backend
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
          return;
        }

        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const latestUser = await refreshUser(storedUser._id || storedUser.id);

        if (latestUser) setUser(latestUser);
        else setUser(storedUser);
      } catch (err) {
        console.error("❌ Invalid token:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        refreshUser,
        isOnboardingIncomplete: user ? user.hasCompletedOnboarding === false : false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
