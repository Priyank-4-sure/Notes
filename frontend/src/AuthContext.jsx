import React, { createContext, useState, useEffect } from "react";

// Create the context
export const AuthContext = createContext();

// Provider
export function AuthProvider({ children }) {
  // Load token from localStorage on first render
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  // Whenever token changes, update state and localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setIsLoggedIn(true);
    } else {
      localStorage.removeItem("token");
      setIsLoggedIn(false);
    }
  }, [token]);

  // Logout function
  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
  };

  // On app mount, check token validity (optional: add JWT expiry check here)

  return (
    <AuthContext.Provider value={{
      token,
      setToken,
      isLoggedIn,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}
