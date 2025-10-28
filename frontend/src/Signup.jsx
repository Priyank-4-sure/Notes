import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext.jsx";
const API_URL = import.meta.env.VITE_API_URL;

export default function Signup() {
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
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

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password1,
      password2: form.password2,
    };

    try {
      const res = await fetch(`${API_URL}/api/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        const data = await res.json();
        setError(
          data.detail
            ? data.detail
            : Object.values(data).flat().join(" ") || "Unknown error"
        );
      }
    } catch (err) {
      setError("Could not reach backend.");
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
          Fill up your details
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

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-2 font-medium" htmlFor="email">
            Email
          </label>
          <input
            className="text-black w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-2 font-medium" htmlFor="password1">
            Password
          </label>
          <input
            className="text-black w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
            name="password1"
            type="password"
            required
            autoComplete="new-password"
            value={form.password1}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block mb-2 font-medium" htmlFor="password2">
            Confirm Password
          </label>
          <input
            className="text-black w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-400"
            name="password2"
            type="password"
            required
            autoComplete="new-password"
            value={form.password2}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={
            "w-full py-2 font-semibold rounded-lg transition-all duration-300 " +
            (isDark
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white")
          }
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>

        {/* Messages */}
        {success && (
          <p className="mt-4 text-green-500 text-center text-sm sm:text-base">
            Signup successful! Redirecting to login...
          </p>
        )}
        {error && (
          <p className="mt-4 text-red-500 text-center text-sm sm:text-base">
            {error}
          </p>
        )}

        {/* Login Link */}
        <p className="mt-6 text-center text-xs sm:text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className={
              isDark
                ? "text-yellow-400 hover:text-yellow-300"
                : "text-blue-700 hover:underline"
            }
          >
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
