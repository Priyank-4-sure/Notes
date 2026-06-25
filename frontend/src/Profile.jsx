import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext.jsx';
import { ThemeContext } from './ThemeContext.jsx';

export default function Profile() {
  const { authFetch, logout, isLoggedIn } = useContext(AuthContext);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const res = await authFetch(`${API_URL}/api/user/me/`);
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authFetch, isLoggedIn, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Get user avatar initials
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : "U";

  // Format Date Joined
  const joinedDate = user?.date_joined
    ? new Date(user.date_joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently';

  return (
    <div className="max-w-md mx-auto my-10 transition-all duration-300">
      <div className={`p-8 rounded-2xl shadow-xl transition-all duration-300 border ${isDark
          ? 'bg-gray-900 text-white border-gray-800'
          : 'bg-white text-gray-800 border-gray-200'
        }`}>
        {/* Header/Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg bg-gradient-to-tr from-blue-500 to-indigo-600">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full ring-2 ring-white bg-green-400"></span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">{user?.username}</h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user?.email}</p>
        </div>

        {/* Stats card */}
        <div className={`mb-6 p-4 rounded-xl flex justify-around items-center transition-colors duration-300 ${isDark ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
          <div className="text-center">
            <span className="block text-2xl font-bold text-blue-500">{user?.notes_count ?? 0}</span>
            <span className={`text-xs uppercase font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Notes</span>
          </div>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700"></div>
          <div className="text-center">
            <span className="block text-2xl font-bold text-indigo-500">{joinedDate.split(',')[1] || joinedDate.split(' ')[2] || '2026'}</span>
            <span className={`text-xs uppercase font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Member Since</span>
          </div>
        </div>

        {/* Info list */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100 dark:border-gray-800">
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Account Status</span>
            <span className="font-semibold text-green-500">Active</span>
          </div>
          <div className="flex justify-between items-center text-sm py-2 border-b border-gray-100 dark:border-gray-800">
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Date Joined</span>
            <span className="font-semibold">{joinedDate}</span>
          </div>
          <div className="flex justify-between items-center text-sm py-2">
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Visual Mode</span>
            <button
              onClick={toggleTheme}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${isDark
                  ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
            >
              {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2"
            onClick={() => navigate('/')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Go to Dashboard
          </button>

          <button
            className={`w-full py-3 font-semibold rounded-xl border transition duration-200 flex items-center justify-center gap-2 ${isDark
                ? 'border-red-900/50 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:border-red-900'
                : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300'
              }`}
            onClick={logout}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}