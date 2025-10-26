import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ThemeProvider, ThemeContext } from "./ThemeContext"; // import Theme provider and context
import {AuthProvider} from "./AuthContext";
import Header from "./Header";
import Login from "./Login";
import Home from "./Home";
import Signup from "./Signup";
import Profile from "./Profile";
import Notes from "./Notes";

function ThemedApp() {
  const { isDark } = useContext(ThemeContext);

  return (
    <div>
      <Router>
        <Header />
        <main className={`${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} min-h-screen transition-colors duration-300 p-6`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notes/:id" element={<Notes />} />
          </Routes>
        </main>
      </Router>
    </div>
  );
}


function App() {
  return (
    // Wrap the app with ThemeProvider to provide theme context globally
    <AuthProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
