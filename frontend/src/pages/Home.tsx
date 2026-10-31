import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotes, useCreateNote, useTogglePin, useDeleteNote } from "@/hooks/useNotes";
import { NoteCard } from "@/components/notes/NoteCard";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import { BlurredScreenLoader } from "@/components/common/BlurredScreenLoader";

export default function Home() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [inputQuery, setInputQuery] = useState<string>("");
  const [activeQuery, setActiveQuery] = useState<string>("");

  const {
    data: notes = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useNotes(activeQuery);

  const createNoteMutation = useCreateNote();
  const togglePinMutation = useTogglePin();
  const deleteNoteMutation = useDeleteNote();

  const handleCreate = async () => {
    try {
      const newNote = await createNoteMutation.mutateAsync({
        title: "New Note",
        markdown: "",
        pinned: false,
      });
      navigate(`/notes/${newNote.id}`);
    } catch (err) {
      alert("Failed to create note: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActiveQuery(inputQuery.trim());
  };

  const clearSearch = () => {
    setInputQuery("");
    setActiveQuery("");
  };

  const handleTogglePin = (id: number, pinned: boolean) => {
    togglePinMutation.mutate({ id, pinned });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  const isSearching = !!activeQuery;
  const displayNotes = isSearching
    ? notes
    : [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned));

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 rounded-3xl transition-all border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm">
      {!isLoggedIn ? (
        <div className="text-center py-12 sm:py-20 px-2">
          <h1 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">
            AI Notes Workspace
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 text-sm sm:text-base">
            Smart semantic search powered by pgvector embeddings. Find ideas by meaning, not just exact keywords.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/25 transform hover:-translate-y-0.5"
          >
            Get Started Free
          </button>
        </div>
      ) : (
        <>
          {/* Header Action Bar */}
          <div className="mb-6 sm:mb-8 flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
            <button
              onClick={handleCreate}
              onMouseEnter={() => import("@/pages/Notes")}
              disabled={createNoteMutation.isPending}
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all transform hover:scale-[1.02] active:scale-95 font-bold shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1z" clipRule="evenodd" />
              </svg>
              <span>{createNoteMutation.isPending ? "Creating..." : "New Note"}</span>
            </button>

            {/* Semantic Search Form */}
            <form onSubmit={handleSearch} className="flex w-full max-w-lg gap-2">
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="Search notes by idea..."
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="w-full px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-sm"
                />
                {isFetching && (
                  <span className="absolute right-2.5 top-2.5 sm:top-3 flex items-center gap-1.5 px-2 py-0.5 sm:py-1 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold animate-pulse pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                    Searching...
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isFetching}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex-shrink-0"
              >
                Search
              </button>
              {isSearching && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors font-semibold text-sm flex-shrink-0"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Semantic Search Indicator */}
          {isSearching && (
            <div className="flex items-center gap-2.5 mb-6 px-1 animate-fade-in">
              <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                AI Semantic Results for "{activeQuery}"
              </p>
            </div>
          )}

          {/* 3-State UI Handling */}
          {isLoading ? (
            <BlurredScreenLoader type="feed" />
          ) : isError ? (
            <ErrorState
              title="Failed to load notes"
              message={error?.message || "An unexpected network error occurred."}
              onRetry={() => refetch()}
            />
          ) : displayNotes.length === 0 ? (
            isSearching ? (
              <EmptyState
                type="search"
                title="No matching notes found"
                description={`No notes matched "${activeQuery}". Try rephrasing your search idea.`}
                actionLabel="Clear Search"
                onAction={clearSearch}
              />
            ) : (
              <EmptyState
                type="notes"
                title="Your notebook is empty"
                description="Write markdown notes, code snippets, or ideas. Vector search will index them automatically."
                actionLabel="+ Create Your First Note"
                onAction={handleCreate}
              />
            )
          ) : (
            <div className="grid grid-cols-1 gap-4 w-full">
              {displayNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onNavigate={() => navigate(`/notes/${note.id}`)}
                  onPin={() => handleTogglePin(note.id, note.pinned)}
                  onDelete={() => handleDelete(note.id)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
