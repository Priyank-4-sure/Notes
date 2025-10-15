import React, { useState,useEffect,useContext } from 'react';
import { AuthContext } from "./AuthContext.jsx";

export default function Home() {
  const {token,isLoggedIn,refreshAccessToken,refreshToken}= useContext(AuthContext);
  const [notes, setNotes] = useState([]);

  {isLoggedIn?useEffect(() => {
        // This function will run once, just after the component loads
        fetchNotes(token);
    }, []):{};}

  // Fetch notes with JWT token
  const fetchNotes = async (jwtToken) => {
    const res = await fetch('http://127.0.0.1:8000/api/notes/', {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    if (res.status === 401 && !token && !!refreshToken) { // Unauthorized, maybe access token expired
        // Try to refresh token
        const newToken = await refreshAccessToken();

        if (!newToken) {
            throw new Error('Session expired');
        }
        setToken(newToken);
    }
    let data;
    try {
        data = await res.json();
    } catch {
        alert("Server error, invalid JSON.");
        setNotes([]);
        return;
    }
    setNotes(Array.isArray(data) ? data : []); // Defensive against non-array results
  };

    
  // Create a new note
  const createNote = async () => {
    if (!token) return alert('Please login first');
    const newNote = { title: 'New Note', markdown: 'Your content here' };
    try {
        const res = await fetch('http://127.0.0.1:8000/api/notes/', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNote)
        });
        if (!res.ok) {
        const err = await res.json();
        alert(err.detail || 'Could not create note!');
        return;
        }
        const data = await res.json();
        setNotes(prev => [...prev, data]);
    } catch (err) {
        alert('Network or server error: ' + err.message);
    }
  };

  return (
    
    <div className="max-w-4xl mx-auto p-8">
      {!isLoggedIn?(<>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">AI Notes App</h1>
      <p>Your own notes app which saves your data in our server, automatically saving your data, so no more inconveniences!</p>
      <p className='mt-4'>
        Login to get started!
      </p></>):
      (<>{/* Create Note Button */}
      <div className="mb-6">
        <button
          onClick={createNote}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Create Note
        </button>
      </div>

      
      <div>
        {notes.length === 0 ? (
          <p>No notes available.</p>
        ) : (
          Array.isArray(notes) && notes.map(note => (
            <div key={note.id} className="border border-gray-300 dark:border-gray-700 rounded p-4 mb-4 bg-white dark:bg-gray-800 shadow-sm transition-colors">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{note.title}</h2>
              <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.markdown}</p>
            </div>
          ))
        )}
      </div></>)}
    </div>
  );
}
