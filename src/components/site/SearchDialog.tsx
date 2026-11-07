import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, CornerDownLeft, SearchX } from "lucide-react";
import { getCategory, popularTools, searchTools, toneClass } from "@/lib/tools";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const matches = q.trim() ? searchTools(q) : popularTools.slice(0, 6);
  const results = matches.slice(0, 8);
  useEffect(() => { if (open) { setQ(""); setIdx(0); } }, [open]);
  useEffect(() => { listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" }); }, [idx, q]);
  const go = (slug: string) => { onClose(); nav({ to: "/tools/$slug", params: { slug } }); };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent aria-describedby={undefined} className="top-[12vh] w-[calc(100%-2rem)] max-w-xl translate-y-0 gap-0 overflow-hidden rounded-lg border-border bg-popover p-0 shadow-lift">
        <DialogTitle className="sr-only">Search DOVZO tools</DialogTitle>
        <div className="flex items-center gap-3 border-b border-border px-5 pr-12">
          <Search className="h-5 w-5 shrink-0 text-primary" />
          <input autoFocus value={q} aria-label="Search 50 tools" role="combobox" aria-expanded="true" aria-controls="tool-search-results" aria-autocomplete="list" aria-activedescendant={results[idx] ? `search-${results[idx].slug}` : undefined}
            onChange={(e) => { setQ(e.target.value); setIdx(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.max(0, Math.min(i + 1, results.length - 1))); }
              if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
              if (e.key === "Enter" && results[idx]) { e.preventDefault(); go(results[idx].slug); }
            }} placeholder="Search 50 tools…" className="h-16 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground" />
        </div>
        <div className="max-h-[min(60dvh,520px)] overflow-y-auto p-2">
          <p role="status" className="px-3 py-3 text-xs font-medium text-muted-foreground">{q.trim() ? `${matches.length} matching tools` : "Popular tools"}</p>
          <div ref={listRef} id="tool-search-results" role="listbox" aria-label="Tools">
            {results.length === 0 && <div className="flex flex-col items-center gap-3 px-4 py-10 text-center"><SearchX className="h-6 w-6 text-muted-foreground" /><p className="text-sm font-medium">No tools found</p><p className="text-xs text-muted-foreground">Try a different search.</p></div>}
            {results.map((r, i) => {
              const cat = getCategory(r.category);
              if (!cat) return null;
              return <Button key={r.slug} id={`search-${r.slug}`} role="option" aria-selected={i === idx} variant="ghost"
                onMouseEnter={() => setIdx(i)} onClick={() => go(r.slug)}
                className={`h-auto w-full justify-start gap-3 whitespace-normal px-3 py-3 text-left ${i === idx ? "bg-secondary" : ""}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${toneClass[cat.tone]}`}><r.icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{r.name}</span><span className="mt-0.5 block text-xs font-normal text-muted-foreground">{r.description}</span></span>
                <CornerDownLeft className={`h-4 w-4 shrink-0 text-muted-foreground ${i === idx ? "opacity-100" : "opacity-0"}`} />
              </Button>;
            })}
          </div>
          {matches.length > results.length && <Button variant="ghost" className="mt-2 w-full" onClick={() => { onClose(); void nav({ to: "/search", search: { q } }); }}>View all {matches.length} results</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}