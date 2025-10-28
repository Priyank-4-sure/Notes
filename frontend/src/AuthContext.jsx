import React, { createContext, useState, useEffect } from "react";
const API_URL = import.meta.env.VITE_API_URL;

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refresh'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  useEffect(() => {
    if (!!token) {
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
    }
    if (!!refreshToken) {
      localStorage.setItem('refresh', refreshToken);
    } else {
      localStorage.removeItem('refresh');
    }
  }, [token, refreshToken]);

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    window.location.href = "/login";
  };

  const refreshAccessToken = async () => {
    if (!refreshToken) {
      logout();
      return null;
    }
    
    try {
      const res = await fetch('${API_URL}/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setToken(data.access);
        localStorage.setItem('token', data.access);
        console.log('✅ Token refreshed successfully');
        return data.access;
      } else if (res.status === 401) {
        // Refresh token is actually invalid/expired
        console.log('❌ Refresh token expired');
        logout();
        return null;
      } else {
        // Other server errors (500, 503, etc.) - DON'T logout
        console.error('⚠️ Server error during refresh:', res.status);
        return null;
      }
    } catch (err) {
      // Network error - DON'T logout, might be temporary
      console.error('⚠️ Network error during refresh:', err);
      return null;
    }
  };

  // ⭐ THE KEY FUNCTION THAT MAKES AUTO-REFRESH WORK ⭐
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // First attempt with current token
    let response = await fetch(url, { ...options, headers });

    // If 401 Unauthorized, try refreshing the token
    if (response.status === 401) {
      console.log('🔄 Access token expired, refreshing...');
      const newToken = await refreshAccessToken();
      
      if (newToken) {
        // Retry the original request with new token
        console.log('✅ Retrying request with new token');
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh failed - user already logged out by refreshAccessToken
        throw new Error('Session expired. Please log in again.');
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider value={{
      token,
      setToken,
      isLoggedIn,
      setIsLoggedIn,
      logout,
      refreshToken,
      setRefreshToken,
      refreshAccessToken,
      authFetch, // ⭐ MUST EXPORT THIS ⭐
    }}>
      {children}
    </AuthContext.Provider>
  );
}
