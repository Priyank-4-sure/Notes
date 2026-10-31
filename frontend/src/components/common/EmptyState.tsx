interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  type?: "notes" | "search";
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  type = "notes",
}: EmptyStateProps) {
  return (
    <div className="rounded-3xl p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700/80 bg-white/40 dark:bg-slate-800/30 transition-all my-6">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-indigo-500/10 text-indigo-500">
        {type === "search" ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>
        )}
      </div>

      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="text-sm max-w-sm mx-auto mb-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-all transform hover:scale-105 shadow-md"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
