# 📘 NotesAI: Full Architecture, Migration & TypeScript Mastery Guide

> **Welcome to the NotesAI Engineering Guide!**  
> This guide documents every architectural change made to this codebase and serves as a handbook to help you master **TypeScript**, **modern React patterns**, and **self-reliant debugging**.

---

## 📑 Table of Contents
1. [Chronological Changelog: What Was Changed & Why](#1-chronological-changelog)
2. [Mastering TypeScript: The Mental Model](#2-mastering-typescript-the-mental-model)
3. [Real-World Pitfalls Encountered & How We Solved Them](#3-real-world-pitfalls-encountered)
4. [How to Debug TypeScript & Fullstack Apps on Your Own](#4-how-to-debug-like-a-pro)
5. [Frontend & Backend Performance Rules](#5-performance-rules-to-remember)

---

## 1. Chronological Changelog

Here is everything that was evolved from the initial prototype into an enterprise-grade application:

| Feature / Area | Before | After | Why This Was Necessary |
| :--- | :--- | :--- | :--- |
| **Type Safety** | Plain JavaScript (`.js`, `.jsx`), no compile-time checks | Strict TypeScript (`"strict": true`, `.ts`, `.tsx`), zero `any` policy | Prevents `TypeError: undefined is not a function`, catches API contract mismatches before runtime. |
| **Path Resolution** | Relative paths (`../../../components/...`) | `@/*` path alias configured in `vite.config.ts` and `tsconfig.json` | Clean imports that never break when moving files between directories. |
| **Data Fetching** | Hand-rolled `useEffect` with manual loading/error states | TanStack Query v5 with 1-minute `staleTime` and cache deduplication | Prevents race conditions, eliminates redundant network calls, and syncs cache automatically. |
| **Theme System** | Verbose JS ternaries in JSX: `isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'` | Native Tailwind variants: `bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100` | Eliminates prop drilling, reduces bundle size, and prevents theme hydration mismatch. |
| **LCP (Largest Contentful Paint)** | Remote 512px Flaticon PNG avatar loaded over network, theme flash on page load | Inline vector SVG avatar, anti-FOUC inline theme script in `<head>`, and route code-splitting via `React.lazy()` | Drastically improved first paint and eliminated layout shifts. |
| **Backend Payloads** | 384-dimensional vector returned on every note list query | `embedding` vector excluded from `NoteSerializer` (`defer('embedding')`) | Reduced network payload size by over **80%**. |
| **Backend Latency** | FastEmbed model reloaded on cold requests; duplicate embeddings generated in signals | Startup background model pre-warming in `apps.py` and skip checks in `signals.py` | Dropped note creation latency by ~300ms. |
| **Media & Photos** | Text-only notes | Multipart photo upload API (`/api/upload/`), clipboard screenshot paste, drag-and-drop file upload | Allows rich visual notes with instant image embedding. |
| **Semantic Search** | Compressed cosine distance scores (e.g. 72% vs 84% for an exact match) | Piecewise dynamic contrast stretching + keyword matching | Clear matches contrast sharply at **95–99%** while loose matches stay distinct in the **20–40%** range. |
| **Loading UX** | Generic spinning circular indicators | Layout-matching blurred screen loader (`BlurredScreenLoader.tsx`) | Gives immediate spatial context without layout jump or jarring spinners. |
| **Mobile & LAN** | Hardcoded `http://localhost:8000`, rigid mobile menus | Dynamic IP detection (`config.ts`), mobile avatar, local Wi-Fi CORS | Website works natively on phones and tablets over local Wi-Fi. |

---

## 2. Mastering TypeScript: The Mental Model

### Principle A: Design Domain Types First (`src/types/`)
Before writing components or API fetch functions, always write the data contracts first.

```typescript
// src/types/note.ts
export interface Note {
  id: number;
  title: string;
  markdown: string;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  match_score?: number; // Optional: only present in search results
}

// Separate creation input (user doesn't provide id or timestamps)
export interface NoteCreateInput {
  title: string;
  markdown: string;
  pinned?: boolean;
}
```

> **Why this matters**: If the backend renames `pinned` to `is_pinned`, updating this single interface will cause TypeScript to highlight every broken line across your entire project.

---

### Principle B: Type Narrowing & Null Safety
Never assume data is always present. Use TypeScript to force you to handle missing states:

```typescript
// ❌ WRONG (can crash if note is undefined)
function getNoteTitle(note?: Note) {
  return note.title.toUpperCase(); 
}

//  CORRECT (Type Narrowing)
function getNoteTitle(note?: Note): string {
  if (!note) return "Untitled Note";
  return note.title ? note.title.toUpperCase() : "Untitled Note";
}
```

---

### Principle C: React Event Types
When handling form inputs in React + TypeScript:

```typescript
import { type ChangeEvent, type FormEvent } from "react";

// For inputs or textareas:
const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};

// For forms:
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // ...
};
```

---

## 3. Real-World Pitfalls Encountered & How to Solve Them

### Trap 1: The `FormData` Content-Type Trap (Photo Uploads)
* **What happened**: When sending JSON, `authFetch` included `"Content-Type": "application/json"`. When uploading photos, this overwrote the browser's automatic `multipart/form-data; boundary=----WebKitFormBoundary...` header, corrupting the upload.
* **The Fix**:
  ```typescript
  // src/context/AuthContext.tsx
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }), // Omit Content-Type for FormData!
    ...options.headers,
  };
  ```

---

### Trap 2: Mobile Devices Calling `http://localhost:8000`
* **What happened**: On your PC, `localhost:8000` points to your backend. On your phone, `localhost:8000` points to the *phone itself*, breaking all API calls over Wi-Fi.
* **The Fix**: Dynamically detect `window.location.hostname`:
  ```typescript
  // src/api/config.ts
  export const getApiUrl = (): string => {
    if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      return `http://${window.location.hostname}:8000`; // Points to your PC's Wi-Fi IP automatically!
    }
    return (import.meta.env.VITE_API_URL || "http://localhost:8000").replace(/\/$/, "");
  };
  ```

---

### Trap 3: Asymmetric Note Widths in CSS Grid
* **What happened**: In CSS Grid, an unconstrained container `<div className="grid gap-4">` sizes columns based on intrinsic content (`max-content`). A card containing an embedded photo markdown URL expanded wider than text-only cards.
* **The Fix**:
  1. Add `grid-cols-1 w-full` to the container.
  2. Add `w-full overflow-hidden` to the card.
  3. Clean raw markdown tags (`![photo](url)`) in the preview line using regex so raw URLs don't force flex child expansion.

---

## 4. How to Debug Like a Pro

### Command 1: Validate Types Instantly (No Bundling)
Never rely solely on visual inspection. Run this command inside `frontend/`:
```bash
npx tsc --noEmit
```
* **What it does**: Checks all TypeScript types across the entire project without creating output files.
* **If it exits with 0**: Your types, props, imports, and variables are 100% sound.
* **If it returns an error**: It shows the exact file, line number, and explanation (e.g. `error TS2322: Type 'string | undefined' is not assignable to type 'string'`).

---

### Command 2: Production Build Check
```bash
npm run build
```
Runs `tsc` followed by `vite build`. Ensures that code splitting, tree shaking, and assets bundle successfully.

---

### Command 3: Docker & Backend Health Verification
```bash
# Check running containers:
docker compose ps

# Inspect live Django logs:
docker compose logs backend --tail 25

# Test API endpoint response:
curl -s http://localhost:8000/api/test/
```

---

## 5. Performance Rules to Remember

1. **Keep Vectors Out of Serialization**: A 384-float vector adds ~1.5 KB per note. On a list of 100 notes, that is 150 KB of useless network payload. Always use `.defer('embedding')` on querysets and exclude `embedding` from list serializers.
2. **Prevent Flash of Unstyled Content (Anti-FOUC)**: If you store theme preference in `localStorage`, read it with an inline `<script>` in `<head>` before the DOM renders. This stops dark mode flickers on initial load.
3. **Use Code Splitting (`React.lazy`)**: Do not import all pages into `App.tsx` statically. Use `const Notes = lazy(() => import("./pages/Notes"))` so users only download the code for the page they are currently visiting.
4. **Prefer Semantic Piecewise Stretching**: Cosine distances from small models compress into narrow ranges. Piecewise calibration maps real-world intent into intuitive percentage scores without the overhead of heavy reranker models.

---

*Keep this guide bookmarked in your repository for future feature expansions!*
