import { useEffect, useState, useRef, type ChangeEvent, type DragEvent, type ClipboardEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNoteDetail, useUpdateNote } from "@/hooks/useNoteDetail";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { uploadNotePhoto } from "@/api/notes";
import { ErrorState } from "@/components/common/ErrorState";
import { MarkdownPreview } from "@/components/notes/MarkdownPreview";
import { BlurredScreenLoader } from "@/components/common/BlurredScreenLoader";

type ViewMode = "write" | "split" | "preview";

export default function Notes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authFetch } = useAuth();
  const { showToast } = useToast();

  const { data: initialNote, isLoading, isError, error, refetch } = useNoteDetail(id);
  const updateNoteMutation = useUpdateNote(id);

  const [form, setForm] = useState<{ title: string; markdown: string }>({
    title: "",
    markdown: "",
  });
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  const isInitializedRef = useRef<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (initialNote && !isInitializedRef.current) {
      setForm({
        title: initialNote.title || "",
        markdown: initialNote.markdown || "",
      });
      isInitializedRef.current = true;
      setTimeout(adjustTextareaHeight, 0);
    }
  }, [initialNote]);

  const adjustTextareaHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.max(el.scrollHeight, 380)}px`;
    }
  };

  const triggerAutoSave = (updatedForm: { title: string; markdown: string }) => {
    setSaveStatus("Saving...");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        await updateNoteMutation.mutateAsync(updatedForm);
        setSaveStatus("Saved!");
        setTimeout(() => setSaveStatus(""), 2000);
      } catch {
        setSaveStatus("Failed to save.");
      }
    }, 800);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    if (name === "markdown") {
      adjustTextareaHeight();
    }
    triggerAutoSave(updated);
  };

  const insertTextAtCursor = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = form.markdown;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || "text"}${suffix}`;

    const updatedMarkdown = text.substring(0, start) + replacement + text.substring(end);
    const updated = { ...form, markdown: updatedMarkdown };
    setForm(updated);
    triggerAutoSave(updated);

    setTimeout(() => {
      textarea.focus();
      const newPos = start + prefix.length + (selected ? selected.length : 4);
      textarea.setSelectionRange(newPos, newPos);
      adjustTextareaHeight();
    }, 0);
  };

  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, WebP, GIF).", "error");
      return;
    }

    setIsUploading(true);
    showToast(`Uploading ${file.name}...`, "info");

    try {
      const result = await uploadNotePhoto(authFetch, file);
      const markdownImage = `\n![${file.name.replace(/\.[^/.]+$/, "")}](${result.url})\n`;

      const textarea = textareaRef.current;
      let updatedMarkdown = form.markdown;
      if (textarea) {
        const start = textarea.selectionStart;
        updatedMarkdown = form.markdown.substring(0, start) + markdownImage + form.markdown.substring(start);
      } else {
        updatedMarkdown += markdownImage;
      }

      const updated = { ...form, markdown: updatedMarkdown };
      setForm(updated);
      triggerAutoSave(updated);
      showToast("Photo uploaded and embedded!", "success");
      setTimeout(adjustTextareaHeight, 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image.";
      showToast(msg, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handlePhotoUpload(file);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handlePhotoUpload(file);
          return;
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-80px)] px-2 sm:px-4 py-4 sm:py-6">
      <div className="w-full max-w-5xl rounded-3xl p-4 sm:p-8 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 shadow-sm transition-all">
        {/* Navigation & Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="px-3.5 py-1.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
            >
              ← Back
            </button>

            {/* View Mode Switcher */}
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-900 p-0.5 border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setViewMode("write")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "write"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                className={`hidden md:inline-flex px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "split"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Split View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "preview"
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isUploading && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-ping" />
                Uploading photo...
              </span>
            )}

            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
                saveStatus === "Saved!"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : saveStatus === "Failed to save."
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  : saveStatus === "Saving..."
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 animate-pulse"
                  : "opacity-0"
              }`}
            >
              {saveStatus || "Idle"}
            </span>
          </div>
        </div>

        {/* 3-State Handling for Editor */}
        {isLoading ? (
          <BlurredScreenLoader type="editor" />
        ) : isError ? (
          <ErrorState
            title="Failed to load note"
            message={error?.message || "Could not retrieve the requested note."}
            onRetry={() => refetch()}
          />
        ) : (
          <div className="space-y-4">
            {/* Title input */}
            <input
              name="title"
              type="text"
              placeholder="Note title..."
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-xl sm:text-2xl font-black bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 transition-all"
              value={form.title}
              onChange={handleChange}
            />

            {/* Markdown & Photo Toolbar */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Add photo from your device"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <span>📷</span>
                <span>{isUploading ? "Uploading..." : "Add Photo"}</span>
              </button>

              <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

              <button
                type="button"
                onClick={() => insertTextAtCursor("## ", "")}
                title="Heading 2"
                className="px-2.5 py-1 rounded-lg text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                H2
              </button>

              <button
                type="button"
                onClick={() => insertTextAtCursor("### ", "")}
                title="Heading 3"
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                H3
              </button>

              <button
                type="button"
                onClick={() => insertTextAtCursor("**", "**")}
                title="Bold"
                className="px-2.5 py-1 rounded-lg text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                B
              </button>

              <button
                type="button"
                onClick={() => insertTextAtCursor("*", "*")}
                title="Italic"
                className="px-2.5 py-1 rounded-lg text-xs italic font-serif text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                I
              </button>

              <button
                type="button"
                onClick={() => insertTextAtCursor("```\n", "\n```")}
                title="Code Block"
                className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                {"</>"}
              </button>

              <button
                type="button"
                onClick={() => insertTextAtCursor("- ", "")}
                title="Bulleted List"
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                • List
              </button>

              <button
                type="button"
                onClick={() => insertTextAtCursor("- [ ] ", "")}
                title="Task Checklist"
                className="px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                ☑ Task
              </button>

              <button
                type="button"
                onClick={() => insertTextAtCursor("> ", "")}
                title="Quote"
                className="px-2.5 py-1 rounded-lg text-xs font-serif text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                " Quote
              </button>

              <span className="hidden sm:inline-block ml-auto text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                💡 Tip: Drag & drop photos or paste screenshots directly!
              </span>
            </div>

            {/* Editor & Preview Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              className={`relative grid gap-4 transition-all ${
                viewMode === "split"
                  ? "grid-cols-1 md:grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              {/* Drag and drop overlay */}
              {isDraggingOver && (
                <div className="absolute inset-0 z-30 rounded-2xl bg-indigo-600/20 backdrop-blur-sm border-2 border-dashed border-indigo-500 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold animate-pulse pointer-events-none">
                  <span className="text-4xl mb-2">📸</span>
                  <span>Drop your image here to upload and embed!</span>
                </div>
              )}

              {/* Textarea Editor */}
              {(viewMode === "write" || viewMode === "split") && (
                <div className="flex flex-col">
                  <textarea
                    name="markdown"
                    placeholder="Write markdown here... Drag and drop or paste photos directly into this area."
                    className="w-full px-4 py-3.5 border border-slate-200 dark:border-slate-700 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 min-h-[380px] font-mono text-sm leading-relaxed bg-slate-50/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 placeholder-slate-400 transition-all"
                    value={form.markdown}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    ref={textareaRef}
                  />
                </div>
              )}

              {/* Markdown Rendered Live Preview */}
              {(viewMode === "preview" || viewMode === "split") && (
                <div className="p-5 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50/40 dark:bg-slate-900/40 min-h-[380px] max-h-[700px] overflow-y-auto">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center justify-between">
                    <span>Live Preview</span>
                    <span className="text-[10px] font-mono text-indigo-500 dark:text-indigo-400">
                      ⚡ AI Embeddings Active
                    </span>
                  </div>
                  {form.title && (
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
                      {form.title}
                    </h1>
                  )}
                  <MarkdownPreview content={form.markdown} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
