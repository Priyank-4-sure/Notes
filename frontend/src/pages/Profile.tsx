import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useProfile } from "@/hooks/useProfile";
import { ErrorState } from "@/components/common/ErrorState";

export default function Profile() {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const { data: user, isLoading, isError, error, refetch } = useProfile();

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto my-10 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm filter blur-[2px] animate-pulse space-y-6 select-none pointer-events-none transition-all">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-6 w-32 rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-48 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto my-10">
        <ErrorState
          title="Could not load profile"
          message={error?.message || "Failed to fetch user profile."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "U";

  const joinedDate = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="max-w-md mx-auto my-8 transition-all">
      <div className="p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 transition-all">
        {/* Header/Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-extrabold text-white shadow-lg shadow-indigo-500/20 bg-gradient-to-tr from-indigo-500 to-blue-600">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full ring-2 ring-white dark:ring-slate-800 bg-emerald-500" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {user?.username}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{user?.email}</p>
        </div>

        {/* Stats card */}
        <div className="mb-6 p-4 rounded-2xl flex justify-around items-center border border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/50">
          <div className="text-center">
            <span className="block text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {user?.notes_count ?? 0}
            </span>
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
              Total Notes
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="text-center">
            <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">
              {joinedDate.split(",")[1] || joinedDate.split(" ")[2] || "2026"}
            </span>
            <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
              Member Since
            </span>
          </div>
        </div>

        {/* Info list */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400">Account Status</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
          </div>
          <div className="flex justify-between items-center text-sm py-2 border-b border-slate-100 dark:border-slate-700/60">
            <span className="text-slate-500 dark:text-slate-400">Date Joined</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{joinedDate}</span>
          </div>
          <div className="flex justify-between items-center text-sm py-2">
            <span className="text-slate-500 dark:text-slate-400">Theme Preference</span>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700/80 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition duration-200 flex items-center justify-center gap-2"
            onClick={() => navigate("/")}
          >
            ← Back to Dashboard
          </button>

          <button
            className="w-full py-3 font-semibold rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/40 transition duration-200 flex items-center justify-center gap-2 text-sm"
            onClick={logout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
