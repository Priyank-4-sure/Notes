import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext.jsx";
import { AuthContext } from "./AuthContext.jsx";

const API_URL = import.meta.env.VITE_API_URL;

export default function Notes() {
  const { isDark } = useContext(ThemeContext);
  const { authFetch } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const [note, setNote] = useState({ title: "", markdown: "" });
  const [saveStatus, setSaveStatus] = useState("");
  const [isLoaded, setIsLoaded] = useState(false); // 🔥 CRITICAL: Prevents saving empty data on mount

  const textareaRef = useRef(null);
  const debounceRef = useRef();

  // 1. Fetch initial note details
  useEffect(() => {
    const fetchNote = async () => {
      try {
        // Clean up URL to prevent double slashes
        const url = `${API_URL.replace(/\/$/, "")}/api/notes/${id}/`;
        const res = await authFetch(url);
        
        if (res.ok) {
          const data = await res.json();
          setNote({ title: data.title || "", markdown: data.markdown || "" });
          // We wrap this in a timeout to ensure DOM has rendered before measuring height
          setTimeout(adjustTextareaHeight, 0);
        }
      } catch (err) {
        console.error("Failed to fetch note:", err);
      } finally {
        setIsLoaded(true); // 🔥 Now we are ready to allow autosaving
      }
    };
    fetchNote();
  }, [id]); // Only re-run if ID changes

  // 2. Adjust textarea height
  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  };

  // 3. Autosave Logic
  useEffect(() => {
    // DO NOT save if:
    // - Initial data hasn't loaded yet (prevents overwriting with blanks)
    // - We don't have an ID
    if (!isLoaded || !id) return;

    setSaveStatus("Saving...");
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        const url = `${API_URL.replace(/\/$/, "")}/api/notes/${id}/`;
        const res = await authFetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(note),
        });

        if (res.ok) {
          setSaveStatus("Saved!");
          setTimeout(() => setSaveStatus(""), 2000);
        } else {
          const errData = await res.json();
          console.error("Server Error:", errData);
          setSaveStatus("Failed to save.");
        }
      } catch (err) {
        console.error("Network Error:", err);
        setSaveStatus("Failed to save.");
      }
    }, 1000); // 1 second debounce is safer for performance

    return () => clearTimeout(debounceRef.current);
  }, [note, id, isLoaded]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNote((prev) => ({ ...prev, [name]: value }));
    if (name === "markdown") {
      adjustTextareaHeight();
    }
  };

  return (
    <div
      className={`flex flex-col items-center min-h-screen px-4 sm:px-0 ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-yellow-100 text-gray-900"
      } transition-all duration-300`}
    >
      <div
        className={`w-full max-w-2xl mt-20 p-6 sm:p-8 rounded-xl shadow-xl relative ${
          isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-300"
        }`}
      >
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className={`mr-4 px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none transition-colors duration-300
              ${
                isDark
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
          >
            ← Back
          </button>
          <input
            name="title"
            type="text"
            placeholder="Title"
            className={`grow px-3 py-2 border rounded-xl focus:outline-none focus:ring focus:border-blue-400 text-2xl font-bold
              ${isDark ? "text-white bg-gray-900 border-gray-700" : "text-gray-900 bg-yellow-50 border-gray-300"}`}
            value={note.title}
            onChange={handleChange}
          />
        </div>

        <textarea
          name="markdown"
          placeholder="Start writing your note..."
          className={`w-full px-3 py-2 border rounded-xl resize-none focus:outline-none focus:ring focus:border-blue-400 mb-4 font-mono
              ${isDark ? "text-white bg-gray-900 border-gray-700" : "text-gray-900 bg-yellow-50 border-gray-300"}`}
          value={note.markdown}
          onChange={handleChange}
          ref={textareaRef}
          style={{ overflow: "hidden" }}
        />

        <p
          className={`text-right text-xs sm:text-sm font-medium ${
            saveStatus === "Saved!"
              ? "text-green-500"
              : saveStatus === "Failed to save."
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          {saveStatus}
        </p>
      </div>
    </div>
  );
}