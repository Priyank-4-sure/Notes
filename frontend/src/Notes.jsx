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
  const [saveStatus, setSaveStatus] = useState(""); // Save status message
  const textareaRef = useRef(null);
  const debounceRef = useRef();

  // Fetch note details on mount
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await authFetch(`${API_URL}api/notes/${id}/`);
        if (res.ok) {
          const data = await res.json();
          setNote({ title: data.title, markdown: data.markdown });
          adjustTextareaHeight();
        } else {
          setNote({ title: "", markdown: "" });
        }
      } catch {
        setNote({ title: "", markdown: "" });
      }
    };
    fetchNote();
  }, [id, authFetch]);

  // Adjust textarea height to fit content
  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto"; // Reset height
      el.style.height = el.scrollHeight + "px"; // Set height to scrollHeight
    }
  };

  // Autosave on title or markdown change with debounce
  useEffect(() => {
    if (!note.title && !note.markdown) return; // Skip saving empty note
    setSaveStatus("Saving...");
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const saveNote = async () => {
        try {
          await authFetch(`http://127.0.0.1:8000/api/notes/${id}/`, {
            method: "PATCH",
            body: JSON.stringify(note),
          });
          setSaveStatus("Saved!");
          setTimeout(() => setSaveStatus(""), 1200);
        } catch {
          setSaveStatus("Failed to save.");
        }
      };
      saveNote();
    }, 400);
  }, [note.title, note.markdown, id, authFetch]);

  // Handle changes to both title and markdown
  const handleChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
    if (e.target.name === "markdown") {
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
        {/* Title row with back button */}
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
            id="title"
            name="title"
            type="text"
            placeholder="Title"
            className={`grow px-3 py-2 border rounded-xl focus:outline-none focus:ring focus:border-blue-400 text-2xl font-bold
              ${isDark ? "text-white bg-gray-900 border-gray-700" : "text-gray-900 bg-yellow-50 border-gray-300"}`}
            value={note.title}
            onChange={handleChange}
          />
        </div>

        {/* Markdown Content */}
        <textarea
          id="markdown"
          name="markdown"
          placeholder="Start writing your note..."
          className={`w-full px-3 py-2 border rounded-xl resize-none focus:outline-none focus:ring focus:border-blue-400 mb-4 font-mono
              ${isDark ? "text-white bg-gray-900 border-gray-700" : "text-gray-900 bg-yellow-50 border-gray-300"}`}
          value={note.markdown}
          onChange={handleChange}
          ref={textareaRef}
          style={{ overflow: "hidden" }} // prevents scrollbar, height controlled manually
        />

        {/* Save status */}
        <p
          className={`text-right text-xs sm:text-sm ${
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
