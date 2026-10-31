interface BlurredScreenLoaderProps {
  type?: "feed" | "editor";
}

export function BlurredScreenLoader({ type = "feed" }: BlurredScreenLoaderProps) {
  if (type === "editor") {
    return (
      <div
        className="flex flex-col items-center min-h-[calc(100vh-80px)] px-2 sm:px-4 py-6 select-none pointer-events-none"
        aria-busy="true"
        aria-label="Loading note editor..."
      >
        <div className="w-full max-w-5xl rounded-3xl p-4 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-800/80 shadow-sm filter blur-[2px] animate-pulse space-y-4">
          {/* Header Action Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <div className="h-8 w-20 rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-8 w-44 rounded-xl bg-slate-200/70 dark:bg-slate-700/70" />
            <div className="h-6 w-16 rounded-full bg-slate-200/50 dark:bg-slate-700/50" />
          </div>

          {/* Title Placeholder */}
          <div className="h-12 w-3/4 rounded-2xl bg-slate-200/80 dark:bg-slate-700/80" />

          {/* Toolbar Placeholder */}
          <div className="h-10 w-full rounded-2xl bg-slate-100 dark:bg-slate-900/60" />

          {/* Editor Area (Split Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-80 rounded-2xl bg-slate-100 dark:bg-slate-900/40" />
            <div className="hidden md:block h-80 rounded-2xl bg-slate-100 dark:bg-slate-900/40" />
          </div>
        </div>
      </div>
    );
  }

  // "feed" type: Exactly matches Home.tsx dashboard layout
  return (
    <div
      className="max-w-4xl mx-auto p-4 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm select-none pointer-events-none filter blur-[2px] animate-pulse"
      aria-busy="true"
      aria-label="Loading notes..."
    >
      {/* Header Action Bar */}
      <div className="mb-6 sm:mb-8 flex flex-col md:flex-row gap-3 sm:gap-4 items-stretch md:items-center justify-between">
        <div className="w-full md:w-32 h-11 rounded-xl bg-indigo-600/40" />
        <div className="flex w-full max-w-lg gap-2">
          <div className="flex-1 h-11 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="w-24 h-11 rounded-xl bg-slate-300 dark:bg-slate-700" />
        </div>
      </div>

      {/* Grid of Note Cards matching NoteCard.tsx */}
      <div className="grid grid-cols-1 gap-4 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-full border rounded-2xl p-4 sm:p-5 flex items-center justify-between border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800"
          >
            <div className="flex-1 pr-4 space-y-2">
              <div
                className={`h-5 rounded-md bg-slate-300 dark:bg-slate-700 ${
                  i % 2 === 0 ? "w-52" : "w-40"
                }`}
              />
              <div
                className={`h-3.5 rounded bg-slate-200 dark:bg-slate-800 ${
                  i % 2 === 0 ? "w-3/4" : "w-1/2"
                }`}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
