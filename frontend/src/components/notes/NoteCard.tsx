import type { Note } from "@/types";

interface NoteCardProps {
  note: Note;
  onNavigate: () => void;
  onPin: () => void;
  onDelete: () => void;
}

function PinIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className="w-5 h-5"
    >
      <path d="M12 2v10m0 0v10m0-10H2m10 0h10" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function NoteCard({ note, onNavigate, onPin, onDelete }: NoteCardProps) {
  // Clean markdown syntax (such as photo embeds or heading tags) for the snippet preview
  const snippet = note.markdown
    ? note.markdown
        .replace(/!\[(.*?)\]\(.*?\)/g, "📷 $1")
        .replace(/#+\s/g, "")
        .replace(/`{1,3}.*?`{1,3}/g, "")
        .trim() || "No content"
    : "No content";

  return (
    <div
      className="w-full border rounded-2xl p-4 sm:p-5 flex items-start sm:items-center justify-between shadow-sm transition-all border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md gap-3 overflow-hidden"
    >
      <div className="flex-1 min-w-0 cursor-pointer pr-1 sm:pr-4" onClick={onNavigate}>
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
            {note.title}
          </h2>

          {note.match_score !== undefined && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                note.match_score > 70
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : note.match_score > 40
                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  : "bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/20"
              }`}
            >
              {note.match_score}% Match
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate italic">
          {snippet}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPin();
          }}
          aria-label={note.pinned ? "Unpin note" : "Pin note"}
          className={`p-2 rounded-lg hover:bg-amber-500/10 transition-colors ${
            note.pinned ? "text-amber-500" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          <PinIcon filled={note.pinned} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete note"
          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
