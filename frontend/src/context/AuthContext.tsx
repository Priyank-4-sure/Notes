import { createContext, useState, useEffect, useContext, type ReactNode } from "react";
import type { AuthContextType } from "@/types";
import { API_URL } from "@/api/config";

// Track original refresh token for rotation
let originalRefreshToken = '';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState<string | null>(() => localStorage.getItem("refresh"));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!token);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
    }

    if (refreshToken) {
      localStorage.setItem("refresh", refreshToken);
      // Store the original refresh token for rotation tracking
      originalRefreshToken = refreshToken;
    } else {
      localStorage.removeItem("refresh");
    }
  }, [token, refreshToken]);

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    // Clear any blacklisted tokens
    localStorage.removeItem("blacklisted_tokens");
    window.location.href = "/login";
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const res = await fetch(`${API_URL}/api/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.access);
        localStorage.setItem("token", data.access);

        // Rotate refresh token - issue new one and invalidate old one
        const newRefreshToken = data.refresh;
        if (newRefreshToken && originalRefreshToken) {
          // Blacklist the old refresh token
          const blacklisted = JSON.parse(localStorage.getItem('blacklisted_tokens') || '[]');
          blacklisted.push(originalRefreshToken);
          localStorage.setItem('blacklisted_tokens', JSON.stringify(blacklisted));
        }

        // Update the stored refresh token
        setRefreshToken(newRefreshToken);
        localStorage.setItem("refresh", newRefreshToken);
        originalRefreshToken = newRefreshToken;  // Update tracking

        return data.access;
      } else if (res.status === 401) {
        logout();
        return null;
      } else {
        console.error("Server error during refresh:", res.status);
        return null;
      }
    } catch (err) {
      console.error("Network error during refresh:", err);
      return null;
    }
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const customHeaders: Record<string, string> = {
      ...((options.headers as Record<string, string>) || {}),
    };

    if (!(options.body instanceof FormData) && !customHeaders["Content-Type"]) {
      customHeaders["Content-Type"] = "application/json";
    }

    if (token) {
      customHeaders["Authorization"] = `Bearer ${token}`;
    }

    let response = await fetch(url, { ...options, headers: customHeaders });

    if (response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        customHeaders["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers: customHeaders });
      } else {
        throw new Error("Session expired. Please log in again.");
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        isLoggedIn,
        setIsLoggedIn,
        logout,
        refreshToken,
        setRefreshToken,
        refreshAccessToken,
        authFetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
