import React, { createContext, useState, useEffect } from "react";
// Create the context
export const AuthContext = createContext();

// Provider
export function AuthProvider({ children }) {
  // Load token from localStorage on first render
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  // Whenever token changes, update state and localStorage
  useEffect(() => {
    if (!!token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    if (!!refreshToken) {
      localStorage.setItem('refresh', refreshToken);
    } else {
      localStorage.removeItem('refresh');
    }
  }, [token, refreshToken]);

  // Logout function
  const logout = () => {
    setToken(null);
    setRefreshToken(null);
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      logout();
      return null;
    }
    try {
      const res = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access);
        return data.access;
      } else {
        logout(); // Refresh token invalid
        return null;
      }
    } catch {
        logout();
      return null;
    }
  };
  // On app mount, check token validity (optional: add JWT expiry check here)

  return (
    <AuthContext.Provider value={{
      token,
      setToken,
      isLoggedIn,
      logout,
      refreshToken,
      setRefreshToken,
      refreshAccessToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
