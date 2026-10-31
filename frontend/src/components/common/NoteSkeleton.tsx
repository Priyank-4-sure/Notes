interface NoteSkeletonProps {
  count?: number;
}

export function NoteSkeleton({ count = 3 }: NoteSkeletonProps) {
  return (
    <div className="grid gap-4 w-full" aria-busy="true" aria-label="Loading notes">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 bg-white/80 dark:bg-slate-800/80 animate-pulse transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-4 space-y-2.5">
              {/* Title shimmer */}
              <div
                className={`h-6 rounded-lg bg-slate-200 dark:bg-slate-700 ${
                  idx % 2 === 0 ? "w-48" : "w-64"
                }`}
              />
              {/* Body snippet shimmer */}
              <div className="h-4 rounded-md bg-slate-200/70 dark:bg-slate-700/60 w-5/6" />
            </div>
            {/* Actions shimmer */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
