import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { fetchNoteById, updateNote } from "@/api/notes";
import type { Note, NoteUpdateInput } from "@/types";

export function useNoteDetail(id: string | undefined) {
  const { authFetch, isLoggedIn } = useAuth();
  const queryClient = useQueryClient();

  return useQuery<Note, Error>({
    queryKey: ["note", id],
    queryFn: () => {
      if (!id) throw new Error("Note ID is required");
      return fetchNoteById(authFetch, id);
    },
    // Immediately use existing data from the notes feed cache if available (eliminates skeleton flicker & optimizes LCP)
    initialData: () => {
      if (!id) return undefined;
      const cached = queryClient.getQueryData<Note>(["note", id]);
      if (cached) return cached;
      const list = queryClient.getQueryData<Note[]>(["notes", { query: "" }]);
      return list?.find((n) => String(n.id) === String(id));
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(["notes", { query: "" }])?.dataUpdatedAt,
    enabled: isLoggedIn && !!id,
    staleTime: 60 * 1000,
  });
}

export function useUpdateNote(id: string | undefined) {
  const { authFetch } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Note, Error, NoteUpdateInput>({
    mutationFn: (payload) => {
      if (!id) throw new Error("Note ID is required");
      return updateNote(authFetch, id, payload);
    },
    onSuccess: (updatedNote) => {
      queryClient.setQueryData(["note", id], updatedNote);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
