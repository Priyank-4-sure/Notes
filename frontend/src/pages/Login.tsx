import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_URL } from "@/api/config";
import type { LoginPayload } from "@/types";

export default function Login() {
  const { setToken, setRefreshToken, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginPayload>({
    username: "",
    password: "",
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

    try {
      const res = await fetch(`${API_URL}/api/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        setToken(data.access);
        setRefreshToken(data.refresh);
        setIsLoggedIn(true);
        setSuccess(true);
        setTimeout(() => navigate("/"), 1200);
      } else {
        const data = await res.json();
        setError(data.detail ? data.detail : "Invalid credentials.");
      }
    } catch (err) {
      setError("Could not reach backend.");
      console.error(err);
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
          <h2 className="text-3xl font-black tracking-tight mb-2">Welcome Back</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to access your notes and vector search.
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
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-sm transition-all"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
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
          {loading ? "Signing in..." : "Sign In"}
        </button>

        {/* Feedback Messages */}
        {success && (
          <p className="mt-4 p-3 text-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-xl">
            Login Successful! Redirecting...
          </p>
        )}
        {error && (
          <p className="mt-4 p-3 text-center text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-500/10 rounded-xl">
            {error}
          </p>
        )}

        {/* Signup Link */}
        <p className="mt-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
