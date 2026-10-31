import React from "react";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className="py-12 text-center text-slate-400 dark:text-slate-500 italic text-sm">
        Nothing to preview yet. Write some markdown or drop photos to see them rendered!
      </div>
    );
  }

  // Parse lines into tokens
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  const parseInline = (text: string): React.ReactNode[] => {
    // Handle inline formatting: images, links, bold, italic, code
    // Image regex: !\[(.*?)\]\((.*?)\)
    // Link regex: \[(.*?)\]\((.*?)\)
    // Bold: \*\*(.*?)\*\*
    // Inline code: `(.*?)`
    // Italic: \*(.*?)\*
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Check for image: ![alt](url)
      const imgMatch = remaining.match(/^!\[(.*?)\]\((.*?)\)/);
      if (imgMatch) {
        const alt = imgMatch[1];
        const src = imgMatch[2];
        parts.push(
          <span key={`img-${keyIdx++}`} className="block my-3 group">
            <span className="block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
              <img
                src={src}
                alt={alt}
                className="w-full max-h-96 object-contain rounded-2xl mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              {alt && (
                <span className="block text-center text-xs py-1.5 px-3 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 italic">
                  📷 {alt}
                </span>
              )}
            </span>
          </span>
        );
        remaining = remaining.slice(imgMatch[0].length);
        continue;
      }

      // Check for markdown link: [label](url)
      const linkMatch = remaining.match(/^\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        parts.push(
          <a
            key={`link-${keyIdx++}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 underline underline-offset-2 hover:text-indigo-800 transition-colors"
          >
            {linkMatch[1]}
          </a>
        );
        remaining = remaining.slice(linkMatch[0].length);
        continue;
      }

      // Check for bold: **text**
      const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
      if (boldMatch) {
        parts.push(
          <strong key={`bold-${keyIdx++}`} className="font-bold text-slate-900 dark:text-white">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      // Check for inline code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code
            key={`code-${keyIdx++}`}
            className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 font-mono text-xs border border-slate-200 dark:border-slate-700"
          >
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      // Check for italic: *text*
      const italicMatch = remaining.match(/^\*([^*]+)\*/);
      if (italicMatch) {
        parts.push(
          <em key={`italic-${keyIdx++}`} className="italic text-slate-800 dark:text-slate-200">
            {italicMatch[1]}
          </em>
        );
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      // Consume plain text character
      const nextSpecial = remaining.search(/([!\[*`])/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts;
  };

  lines.forEach((line, idx) => {
    // Fenced code block handling
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`codeblock-${idx}`}
            className="my-3 p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner"
          >
            <code>{codeBuffer.join("\n")}</code>
          </pre>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Headings
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${idx}`}
          className="text-2xl font-black text-slate-900 dark:text-white mt-6 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800"
        >
          {parseInline(line.slice(2))}
        </h1>
      );
      return;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${idx}`}
          className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-5 mb-2"
        >
          {parseInline(line.slice(3))}
        </h2>
      );
      return;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${idx}`}
          className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-1.5"
        >
          {parseInline(line.slice(4))}
        </h3>
      );
      return;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={`quote-${idx}`}
          className="my-3 pl-4 border-l-4 border-indigo-500 italic text-slate-600 dark:text-slate-400 bg-indigo-50/30 dark:bg-indigo-950/20 py-2 rounded-r-xl"
        >
          {parseInline(line.slice(2))}
        </blockquote>
      );
      return;
    }

    // Checklist item: - [ ] or - [x]
    if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
      const checked = line.startsWith("- [x] ");
      elements.push(
        <div key={`check-${idx}`} className="flex items-center gap-2.5 my-1 text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none"
          />
          <span className={checked ? "line-through opacity-60" : ""}>
            {parseInline(line.slice(6))}
          </span>
        </div>
      );
      return;
    }

    // Unordered List
    if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={`li-${idx}`} className="ml-5 list-disc text-slate-700 dark:text-slate-300 my-1">
          {parseInline(line.slice(2))}
        </li>
      );
      return;
    }

    // Empty line / paragraph
    if (!line.trim()) {
      elements.push(<div key={`spacer-${idx}`} className="h-2" />);
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${idx}`} className="my-1.5 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
        {parseInline(line)}
      </p>
    );
  });

  return <div className="prose dark:prose-invert max-w-none">{elements}</div>;
}
