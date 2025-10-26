import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from "./AuthContext.jsx";

export default function Home() {
  const { token, isLoggedIn, authFetch } = useContext(AuthContext); // ⭐ Use authFetch
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    if (isLoggedIn && token) {
      fetchNotes();
    }
  }, [isLoggedIn, token]);

  const fetchNotes = async () => {
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/notes/'); // ⭐ Use authFetch
      
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
    
    const newNote = { title: 'New Note', markdown: 'Your content here' };
    
    try {
      const res = await authFetch('http://127.0.0.1:8000/api/notes/', { // ⭐ Use authFetch
        method: 'POST',
        body: JSON.stringify(newNote),
      });

      if (res.ok) {
        const data = await res.json();
        setNotes(prev => [...prev, data]);
      } else {
        const err = await res.json();
        alert(err.detail || 'Could not create note!');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      {!isLoggedIn ? (
        <>
          <h1 className="text-3xl font-bold mb-6">AI Notes App</h1>
          <p>Login to get started!</p>
        </>
      ) : (
        <>
          <button onClick={createNote} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
            Create Note
          </button>
          <div className="mt-6">
            {notes.length === 0 ? (
              <p>No notes available.</p>
            ) : (
              notes.map(note => (
                <div key={note.id} className="border rounded p-4 mb-4">
                  <h2 className="font-semibold">{note.title}</h2>
                  <p className="mt-1">{note.markdown}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
