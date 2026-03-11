import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from "./AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext.jsx";

// Ensure no trailing slash on API_URL
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export default function Home() {
  const { token, isLoggedIn, authFetch } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const [notes, setNotes] = useState([]);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New Loading State
  const navigate = useNavigate();

  // Optimized Fetch
  const fetchNotes = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await authFetch(`${API_URL}/api/notes/`);
      if (res.ok) {
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
        setIsSearching(false);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  }, [isLoggedIn, authFetch]);

  const createNote = async () => {
    if (!token) return alert('Please login first');
    
    // We create a blank note so the user has something to start with
    const newNote = { title: 'New Note', markdown: '', pinned: false };
    
    try {
      const res = await authFetch(`${API_URL}/api/notes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNote),
      });

      if (res.ok) {
        const data = await res.json();
        // 1. Update the local list so the new note appears immediately
        setNotes(prev => [data, ...prev]);
        
        // 2. REDIRECT to the Note Detail/Editor page using the new ID
        navigate(`/notes/${data.id}`); 
      } else {
        alert('Could not create note!');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return fetchNotes();

    setIsLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/notes/search/?q=${encodeURIComponent(trimmedQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setNotes(data);
        setIsSearching(true);
      }
    } catch (err) {
      alert("Search failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setQuery("");
    fetchNotes();
  };

  const togglePin = async (id, pinned) => {
    try {
      const res = await authFetch(`${API_URL}/api/notes/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ pinned: !pinned })
      });
      if (res.ok) {
        // SMART REFRESH: If searching, stay in search. If not, fetch all.
        if (isSearching) {
          // Manually update local state to keep search results visible
          setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !pinned } : n));
        } else {
          fetchNotes();
        }
      }
    } catch (err) {
      alert("Error pinning note: " + err.message);
    }
  };

    
  // Sub-component to keep Home.jsx clean
  function NoteCard({ note, onNavigate, onPin, onDelete }) {
    return (
      <div className={`group border rounded-2xl p-5 flex items-center justify-between shadow-sm transition-all ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex-1 cursor-pointer pr-4" onClick={onNavigate}>
          <div className="flex items-center gap-3 mb-1">
            <h2 className={`font-bold text-xl ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {note.title}
            </h2>
            
            {/* THE MATCH SCORE BADGE */}
            {note.match_score !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                note.match_score > 70 ? 'bg-green-500/20 text-green-500' : 
                note.match_score > 40 ? 'bg-yellow-500/20 text-yellow-500' : 
                'bg-gray-500/20 text-gray-500'
              }`}>
                {note.match_score}% Match
              </span>
            )}
          </div>
          <p className="text-sm opacity-60 line-clamp-1 italic">{note.markdown}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onPin} className={`p-2 rounded-lg hover:bg-yellow-500/10 transition-colors ${note.pinned ? 'text-yellow-400' : 'text-gray-400'}`}>
            <PinIcon filled={note.pinned} />
          </button>
          <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            <TrashIcon />
          </button>
        </div>
      </div>
    );
  }
  const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
  // Helper icons...
  function PinIcon({ filled }) {
    return (
      <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-6 h-6">
        <path d="M12 2L12 12M12 12L12 22M12 12H2M12 12H22" strokeLinecap="round"/> 
        {/* (Replace with your specific Pin SVG path) */}
      </svg>
    );
  }

  const displayNotes = isSearching 
    ? notes  
    : [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className={`max-w-4xl mx-auto p-8 rounded-2xl transition-all duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-yellow-50 text-gray-900 shadow-xl'}`}>
      {!isLoggedIn ? (
        <div className="text-center py-20">
          <h1 className="text-4xl font-black mb-4">AI Notes App</h1>
          <p className="opacity-70">Login to unlock semantic search and smart organization.</p>
        </div>
      ) : (
        <>
          <div className="mb-10 flex flex-col md:flex-row gap-6 items-center justify-between">
            <button 
              onClick={() => createNote()} // Assuming you have a route or use your createNote func
              className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all transform hover:scale-105 font-bold shadow-lg"
            >
              + New Note
            </button>

            <form onSubmit={handleSearch} className="flex w-full max-w-lg gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by meaning..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`w-full px-5 py-3 rounded-xl border-2 transition-all outline-none focus:ring-4 focus:ring-indigo-500/20 ${
                    isDark 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-indigo-500' 
                    : 'bg-white border-gray-200 text-black focus:border-indigo-600'
                  }`}
                />
                {isLoading && (
                  <div className="absolute right-4 top-3.5 animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
                )}
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Search
              </button>
              {isSearching && (
                <button type="button" onClick={clearSearch} className="px-4 py-3 bg-gray-500/20 hover:bg-gray-500/30 rounded-xl transition-colors">
                  Clear
                </button>
              )}
            </form>
          </div>

          {isSearching && (
            <div className="flex items-center gap-2 mb-6 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
              <p className="text-sm font-medium text-indigo-400">Semantic AI Results for "{query}"</p>
            </div>
          )}

          <div className="grid gap-4">
            {displayNotes.length === 0 ? (
              <div className="text-center py-20 opacity-50 border-2 border-dashed border-gray-700 rounded-3xl">
                <p>No notes found. Try a different search phrase!</p>
              </div>
            ) : (
              displayNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onNavigate={() => navigate(`/notes/${note.id}`)} 
                  onPin={() => togglePin(note.id, note.pinned)}
                  onDelete={() => deleteNote(note.id)} // Pass your delete func here
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
