import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, CornerDownLeft } from "lucide-react";
import { getCategory, popularTools, searchTools, toneClass } from "@/lib/tools";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const nav = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const results = q ? searchTools(q).slice(0, 8) : popularTools.slice(0, 6);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => input.current?.focus(), 10);
    }
  }, [open]);

  if (!open) return null;
  const go = (slug: string) => {
    onClose();
    nav({ to: "/tools/$slug", params: { slug } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-foreground/20 p-4 pt-[12vh] backdrop-blur-sm" onClick={onClose}>
      <div className="glass w-full max-w-xl overflow-hidden rounded-2xl shadow-lift" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Search tools">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <input
            ref={input}
            value={q}
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === "Enter" && results[idx]) go(results[idx].slug);
            }}
            placeholder="Search 50 tools…"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 text-xs text-muted-foreground">Esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{q ? "Results" : "Popular"}</p>
          {results.length === 0 && (
            <div className="px-3 py-10 text-center text-sm text-muted-foreground">No tools match "{q}". Try "pdf", "json" or "image".</div>
          )}
          {results.map((r, i) => {
            const cat = getCategory(r.category)!;
            const Icon = r.icon;
            return (
              <button
                key={r.slug}
                onMouseEnter={() => setIdx(i)}
                onClick={() => go(r.slug)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === idx ? "bg-accent" : ""}`}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${toneClass[cat.tone]}`}><Icon className="h-4 w-4" /></span>
                <span className="flex-1">
                  <span className="block text-sm font-medium">{r.name}</span>
                  <span className="block text-xs text-muted-foreground">{cat.name}</span>
                </span>
                {i === idx && <CornerDownLeft className="h-4 w-4 text-muted-foreground" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
