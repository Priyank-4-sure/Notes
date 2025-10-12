import React, { useState, useContext } from "react";
import { ThemeContext } from "./ThemeContext.jsx";
import { AuthContext } from "./AuthContext.jsx";
import { Link } from "react-router-dom";
import '../dist/output.css'; // Tailwind CSS

export default function Header() {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { token, isLoggedIn } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleProfileClick = () => {
    window.location.href = "/profile";
  };

  return (
    <header className={'bg-yellow-200 text-gray-900 dark:bg-gray-900 dark:text-white dark shadow-lg sticky top-0 z-50 transition-colors duration-300'}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Brand / Logo */}
        <Link
          to="/"
          className={'text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 text-3xl font-extrabold tracking-wide transition-colors duration-300'}
        >
          NOTES
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {!isLoggedIn ? (
            <>
              <Link
                to="/signup"
                className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 hover:bg-blue-500'} px-5 py-2 rounded-lg transition-colors duration-300`}
              >
                Sign Up
              </Link>
              <Link
                to="/login"
                className={`${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-400 hover:bg-green-500'} px-5 py-2 rounded-lg transition-colors duration-300`}
              >
                Login
              </Link>
            </>
          ) : (
            <button onClick={handleProfileClick}>
              <img
                src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-white hover:scale-105 transition-transform"
              />
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
          className={`${isDark ? 'text-white' : 'text-black'} ml-4 px-3 py-1 rounded-lg transition-colors duration-300`}>
            {isDark ?
              // Night Mode (Moon SVG)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="h-6 w-6 text-gray-900 dark:text-yellow-400 transition-colors duration-300"
              >
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8568C19.9289 13.7406 17.8615 15 15.5 15C11.9101 15 9 12.0899 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69347 12.4627 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
              </svg>
              :
              // Day Mode (Sun SVG)
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            }
          </button>
        </nav>

        {/* Mobile Menu and Theme Toggle */}
        <div className="flex items-center md:hidden space-x-2">
          <button
            onClick={toggleTheme}
            className={`${isDark ? 'text-white' : 'text-black'} ml-4 px-3 py-1 rounded-lg transition-colors duration-300`}>
            {isDark ?
              // Night Mode (Moon SVG)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="h-6 w-6 text-gray-900 dark:text-yellow-400 transition-colors duration-300"
              >
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 11.5373 21.3065 11.4608 21.0672 11.8568C19.9289 13.7406 17.8615 15 15.5 15C11.9101 15 9 12.0899 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69347 12.4627 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
              </svg>
              :
              // Day Mode (Sun SVG)
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth={2} />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            }
          </button>
          {/* Mobile Menu Button */}
          <button
            className="focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-300'} md:hidden border-t shadow-inner transition-colors duration-300`}>
          <div className="flex flex-col items-center py-4 space-y-3">
            {!isLoggedIn ? (
              <>
                <Link
                  to="/signup"
                  className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 hover:bg-blue-400'} w-10/12 text-center py-2 rounded-lg transition-colors duration-300`}
                  onClick={() => setMenuOpen(false)}
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className={`${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-300 hover:bg-green-400'} w-10/12 text-center py-2 rounded-lg transition-colors duration-300`}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleProfileClick();
                }}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                  alt="Profile"
                  className="w-14 h-14 rounded-full border-2 border-white hover:scale-105 transition-transform"
                />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
