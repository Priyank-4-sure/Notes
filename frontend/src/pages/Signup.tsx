import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "@/api/config";
import type { SignupPayload } from "@/types";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState<SignupPayload>({
    username: "",
    email: "",
    password1: "",
    password2: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
        setTimeout(() => navigate("/login"), 1200);
      } else {
        const data = await res.json();
        const errorMessage =
          typeof data === "object" && data !== null
            ? data.detail || Object.values(data).flat().join(" ") || "Signup failed."
            : "Signup failed.";
        setError(errorMessage);
      }
    } catch {
      setError("Could not reach backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-120px)] px-4 sm:px-0">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/95 text-slate-900 dark:text-slate-100 transition-all"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight mb-2">Create Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Start organizing your thoughts with vector semantic search.
          </p>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-semibold" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
            name="username"
            type="text"
            required
            autoComplete="username"
            placeholder="johndoe"
            value={form.username}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-semibold" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-semibold" htmlFor="password1">
            Password
          </label>
          <input
            id="password1"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
            name="password1"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password1}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold" htmlFor="password2">
            Confirm Password
          </label>
          <input
            id="password2"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
            name="password2"
            type="password"
            required
            autoComplete="new-password"
            placeholder="••••••••"
            value={form.password2}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 text-sm"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        {/* Feedback Messages */}
        {success && (
          <p className="mt-4 p-3 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl">
            Signup successful! Redirecting to login...
          </p>
        )}
        {error && (
          <p className="mt-4 p-3 text-center text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 rounded-xl">
            {error}
          </p>
        )}

        {/* Login Link */}
        <p className="mt-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
