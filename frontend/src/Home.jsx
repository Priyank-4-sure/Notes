import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "./AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext.jsx";

export default function Home() {
  const { token, isLoggedIn, authFetch } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchNotes();
    }
    // eslint-disable-next-line
  }, [isLoggedIn, token]);

  const fetchNotes = async () => {
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/notes/');
      if (res.ok) {
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setNotes([]);
    }
  };

  const createNote = async () => {
    if (!token) return alert('Please login first');
    const newNote = { title: 'New Note', markdown: 'Your content here', pinned: false };
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/notes/', {
        method: 'POST',
        body: JSON.stringify(newNote),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(prev => [...prev, data]);
        navigate(`/notes/${data.id}`);
      } else {
        const err = await res.json();
        alert(err.detail || 'Could not create note!');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/notes/${id}/`, {
        method: 'DELETE',
      });
      if (res.ok || res.status === 204) {
        setNotes(notes => notes.filter(note => note.id !== id));
      } else {
        alert('Could not delete note!');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const togglePin = async (id, pinned) => {
    try {
      const res = await authFetch(`http://127.0.0.1:8000/api/notes/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ pinned: !pinned })
      });
      if (res.ok) {
        // Fetch notes again to get correct backend state
        fetchNotes();
      }
    } catch (err) {
      alert("Error pinning note: " + err.message);
    }
  };

  // Pin Icon (from your SVG)
  const PinIcon = ({ filled }) => (
    <svg viewBox="0 0 24 24" fill={filled ? "#facc15" : "none"} xmlns="http://www.w3.org/2000/svg" 
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <g><path fillRule="evenodd" clipRule="evenodd" d="M6.5 5C6.5 4.44772 6.94772 4 7.5 4H9H15H16.5C17.0523 4 17.5 4.44772 17.5 5C17.5 5.55228 17.0523 6 16.5 6H16.095L16.9132 15H19C19.5523 15 20 15.4477 20 16C20 16.5523 19.5523 17 19 17H16H13V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22V17H8H5C4.44772 17 4 16.5523 4 16C4 15.4477 4.44772 15 5 15H7.08679L7.90497 6H7.5C6.94772 6 6.5 5.55228 6.5 5ZM9.91321 6L9.09503 15H12H14.905L14.0868 6H9.91321Z" fill={filled ? "#facc15" : "#bdbdbd"}></path></g>
    </svg>
  );

  // Trash Icon (from your SVG)
  const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      className="w-6 h-6">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/>
      <path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );

  // Always calculate sorted notes before render
  const sortedNotes = [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className={`max-w-4xl mx-auto p-8 rounded-2xl transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-yellow-100 text-gray-900'}`}>
      {!isLoggedIn ? (
        <>
          <h1 className="text-3xl font-bold mb-6">AI Notes App</h1>
          <p>Your own notes app which saves your data in our server, automatically saving your data, so no more inconveniences!</p>
          <p className='mt-4'>Login to get started!</p>
        </>
      ) : (
        <>
          <div className="mb-6 flex justify-start">
            <button
              onClick={createNote}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold"
            >
              Create Note
            </button>
          </div>
          <div>
            {sortedNotes.length === 0 ? (
              <p>No notes available.</p>
            ) : (
              sortedNotes.map(note => (
                <div
                  key={note.id}
                  className="border rounded-xl border-gray-300 dark:border-gray-700 p-4 mb-4 bg-white dark:bg-gray-800 shadow-sm transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="flex-1"
                      onClick={() => navigate(`/notes/${note.id}`)}
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === "Enter") navigate(`/notes/${note.id}`); }}
                      role="button"
                      aria-label={`Open note titled ${note.title}`}
                    >
                      <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {note.title}
                      </h2>
                    </div>
                    <div className="flex gap-3 ml-4">
                      <button
                        onClick={e => { e.stopPropagation(); togglePin(note.id, note.pinned); }}
                        title={note.pinned ? "Unpin" : "Pin"}
                        className={`rounded-full p-2 hover:bg-yellow-100 focus:outline-none transition
                          ${note.pinned ? "text-yellow-400" : "text-gray-400 hover:text-yellow-500"}`}
                        aria-label={note.pinned ? "Unpin note" : "Pin note"}
                      >
                        <PinIcon filled={note.pinned} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                        title="Delete"
                        className="rounded-full p-2 hover:bg-red-200 text-red-500 focus:outline-none transition"
                        aria-label="Delete note"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
