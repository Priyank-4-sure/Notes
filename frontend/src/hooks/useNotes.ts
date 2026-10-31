import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { fetchNotes, searchNotes, createNote, updateNote, deleteNote } from "@/api/notes";
import type { Note, NoteCreateInput } from "@/types";

export function useNotes(query: string = "") {
  const { authFetch, isLoggedIn } = useAuth();
  const trimmedQuery = query.trim();

  return useQuery<Note[], Error>({
    queryKey: ["notes", { query: trimmedQuery }],
    queryFn: () => (trimmedQuery ? searchNotes(authFetch, trimmedQuery) : fetchNotes(authFetch)),
    enabled: isLoggedIn,
    staleTime: 60 * 1000, // 60 seconds sensible cache
  });
}

export function useCreateNote() {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Note, Error, NoteCreateInput>({
    mutationFn: (newNote) => createNote(authFetch, newNote),
    onSuccess: (createdNote) => {
      // Prime single note query cache to make subsequent editor mount instant (0ms LCP)
      queryClient.setQueryData(["note", String(createdNote.id)], createdNote);
      queryClient.setQueryData(["note", createdNote.id], createdNote);

      // Pre-populate list cache
      queryClient.setQueryData<Note[]>(["notes", { query: "" }], (old) =>
        old ? [createdNote, ...old] : [createdNote]
      );

      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useTogglePin() {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Note, Error, { id: number; pinned: boolean }>({
    mutationFn: ({ id, pinned }) => updateNote(authFetch, id, { pinned: !pinned }),
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(["note", String(updatedNote.id)], updatedNote);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useDeleteNote() {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (id) => deleteNote(authFetch, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
