import type { Note, NoteCreateInput, NoteUpdateInput } from "@/types";
import { API_URL } from "./config";

type AuthFetch = (url: string, options?: RequestInit) => Promise<Response>;

export async function fetchNotes(authFetch: AuthFetch): Promise<Note[]> {
  const res = await authFetch(`${API_URL}/api/notes/`);
  if (!res.ok) {
    throw new Error(`Failed to fetch notes (Status: ${res.status})`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function searchNotes(authFetch: AuthFetch, query: string): Promise<Note[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return fetchNotes(authFetch);
  }
  const res = await authFetch(`${API_URL}/api/notes/search/?q=${encodeURIComponent(trimmed)}`);
  if (!res.ok) {
    throw new Error(`Search failed (Status: ${res.status})`);
  }
  return res.json();
}

export async function fetchNoteById(authFetch: AuthFetch, id: string | number): Promise<Note> {
  const res = await authFetch(`${API_URL}/api/notes/${id}/`);
  if (!res.ok) {
    throw new Error(`Failed to load note #${id} (Status: ${res.status})`);
  }
  return res.json();
}

export async function createNote(authFetch: AuthFetch, payload: NoteCreateInput): Promise<Note> {
  const res = await authFetch(`${API_URL}/api/notes/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to create note (Status: ${res.status})`);
  }
  return res.json();
}

export async function updateNote(
  authFetch: AuthFetch,
  id: string | number,
  payload: NoteUpdateInput
): Promise<Note> {
  const res = await authFetch(`${API_URL}/api/notes/${id}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Failed to update note #${id} (Status: ${res.status})`);
  }
  return res.json();
}

export async function deleteNote(authFetch: AuthFetch, id: string | number): Promise<void> {
  const res = await authFetch(`${API_URL}/api/notes/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(`Failed to delete note #${id} (Status: ${res.status})`);
  }
}

export async function uploadNotePhoto(
  authFetch: AuthFetch,
  file: File
): Promise<{ url: string; filename: string; size: number }> {
  const formData = new FormData();
  formData.append("photo", file);

  const res = await authFetch(`${API_URL}/api/upload/`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || `Upload failed with status ${res.status}`);
  }

  const data = await res.json();
  // Ensure the URL is absolute or properly prefixed with API_URL if relative
  const fullUrl = data.url.startsWith("http") ? data.url : `${API_URL}${data.url}`;
  return { ...data, url: fullUrl };
}
