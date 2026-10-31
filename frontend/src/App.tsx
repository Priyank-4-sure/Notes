import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Header from "./components/layout/Header";

import { BlurredScreenLoader } from "./components/common/BlurredScreenLoader";

// Route-level code splitting via React.lazy reduces the initial bundle size, significantly accelerating LCP
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Profile = lazy(() => import("./pages/Profile"));
const Notes = lazy(() => import("./pages/Notes"));

function LoadingFallback() {
  return <BlurredScreenLoader type="feed" />;
}

function ThemedApp() {
  return (
    <Router>
      <Header />
      <main className="min-h-[calc(100vh-80px)] p-4 sm:p-6 transition-colors duration-200">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notes/:id" element={<Notes />} />
          </Routes>
        </Suspense>
      </main>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <ThemedApp />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
