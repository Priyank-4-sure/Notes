import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext.jsx";
import { AuthContext } from "./AuthContext";
const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const { setToken, setRefreshToken, setIsLoggedIn } = useContext(AuthContext); // ⭐ Add setRefreshToken
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setSuccess(false);
    try {
      const res = await fetch("${API_URL}/api/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        
        // ⭐⭐⭐ SAVE BOTH TOKENS ⭐⭐⭐
        console.log('Login response:', data); // Debug
        setToken(data.access);
        setRefreshToken(data.refresh); // ⭐ THIS WAS MISSING!
        setIsLoggedIn(true);
        
        // Verify they're saved
        console.log('✅ Access token saved:', data.access);
        console.log('✅ Refresh token saved:', data.refresh);
        
        setSuccess(true);
        setTimeout(() => navigate("/"), 1500);
      } else {
        const data = await res.json();
        setError(data.detail ? data.detail : "Unknown error");
      }
    } catch (err) {
      setError("Could not reach backend.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4 sm:px-0">
      <form
        onSubmit={handleSubmit}
        className={
          "w-full max-w-md p-6 sm:p-8 rounded-xl shadow-xl text-sm sm:text-base transition-all duration-300 " +
          (isDark
            ? "bg-gray-900 border border-gray-700 text-white"
            : "bg-yellow-100 border border-gray-300 text-gray-900")
        }
      >
        <h2 className="mb-6 text-2xl sm:text-3xl font-extrabold text-center">
          LOGIN
        </h2>

        {/* Username */}
        <div className="mb-4">
          <label className="block mb-2 font-medium" htmlFor="username">
            Username
          </label>
          <input
            className="text-black w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
            name="username"
            type="text"
            required
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-2 font-medium" htmlFor="password">
            Password
          </label>
          <input
            className="text-black w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={
            "w-full mt-2 py-2 font-semibold rounded-lg transition-all duration-300 " +
            (isDark
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white")
          }
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Messages */}
        {success && (
          <p className="mt-4 text-green-500 text-center text-sm sm:text-base">
            Login Successful! Redirecting to notes...
          </p>
        )}
        {error && (
          <p className="mt-4 text-red-500 text-center text-sm sm:text-base">
            {error}
          </p>
        )}

        {/* Signup Link */}
        <p className="mt-6 text-center text-xs sm:text-sm">
          Don't have an account?{" "}
          <a
            href="/signup"
            className={
              isDark
                ? "text-yellow-400 hover:text-yellow-300"
                : "text-blue-700 hover:underline"
            }
          >
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
