import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Heart, LayoutGrid, List, SearchX } from "lucide-react";
import { ToolCard } from "@/components/site/ToolCard";
import { PageHeader, meta } from "@/components/site/PageHeader";
import { categories, getCategory, searchTools, tools, toneClass, type CategoryId } from "@/lib/tools";
import { inputCls } from "@/components/tools/kit";
import { Button } from "@/components/ui/button";
import { readFavorites, savePreference } from "@/lib/browser-storage";

export const Route = createFileRoute("/tools/")({
  head: () => meta("All 50 free tools — DOVZO", "Browse every DOVZO tool: image, PDF, text, developer, generators and file & media utilities."),
  component: AllTools,
});

function AllTools() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<CategoryId | "all" | "fav">("all");
  const [sort, setSort] = useState("popular");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [favs, setFavs] = useState<string[]>([]);
  useEffect(() => { setFavs(readFavorites()); }, []);
  const toggleFav = (s: string) => { const n = favs.includes(s) ? favs.filter((x) => x !== s) : [...favs, s]; setFavs(n); savePreference("dovzo-favs", JSON.stringify(n)); };

  const list = useMemo(() => {
    let l = q ? searchTools(q) : [...tools];
    if (cat === "fav") l = l.filter((t) => favs.includes(t.slug));
    else if (cat !== "all") l = l.filter((t) => t.category === cat);
    if (!q) {
      if (sort === "az") l.sort((a, b) => a.name.localeCompare(b.name));
      if (sort === "new") l.sort((a, b) => b.added.localeCompare(a.added));
      if (sort === "popular") l.sort((a, b) => Number(!!b.popular) - Number(!!a.popular));
    }
    return l;
  }, [q, cat, sort, favs]);

  const chip = (id: typeof cat, label: string) => (
    <Button key={id} variant={cat === id ? "secondary" : "ghost"} size="sm" aria-pressed={cat === id} onClick={() => setCat(id)} className={`shrink-0 ${cat === id ? "text-primary" : "text-muted-foreground"}`}>{label}</Button>
  );

  return (
    <>
      <PageHeader eyebrow={`${tools.length} tools`} title="All tools">Every tool is free and runs in your browser.</PageHeader>
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex flex-col gap-3 border-y border-border py-4 md:sticky md:top-16 md:z-30 md:bg-background/95 md:backdrop-blur-xl">
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter tools…" className={`${inputCls} min-w-48 flex-1`} aria-label="Filter tools" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputCls} aria-label="Sort"><option value="popular">Popular first</option><option value="az">A–Z</option><option value="new">Recently added</option></select>
            <div className="flex gap-1 rounded-lg border border-border p-0.5">
              <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setView("grid")} aria-label="Grid view" aria-pressed={view === "grid"} title="Grid view" className="h-9 w-9"><LayoutGrid className="h-4 w-4" /></Button>
              <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setView("list")} aria-label="List view" aria-pressed={view === "list"} title="List view" className="h-9 w-9"><List className="h-4 w-4" /></Button>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 md:flex-wrap">{chip("all", "All")}{categories.map((c) => chip(c.id, c.short))}{chip("fav", `Favorites (${favs.length})`)}</div>
        </div>

        {list.length === 0 ? (
          <div className="bento flex flex-col items-center gap-3 p-16 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground" /><h3 className="text-lg font-semibold">No tools found</h3>
            <p className="text-sm text-muted-foreground">Try a different word or clear your filters.</p>
            <Button onClick={() => { setQ(""); setCat("all"); }}>Clear filters</Button>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((t) => (
               <div key={t.slug} className="relative h-full">
                <ToolCard tool={t} />
                <FavBtn on={favs.includes(t.slug)} onClick={() => toggleFav(t.slug)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bento divide-y divide-border">
            {list.map((t) => { const c = getCategory(t.category); if (!c) return null; return (
              <div key={t.slug} className="relative flex items-center gap-4 p-4">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneClass[c.tone]}`}><t.icon className="h-5 w-5" /></span>
                <Link to="/tools/$slug" params={{ slug: t.slug }} className="min-w-0 flex-1"><span className="font-medium">{t.name}</span><span className="block text-sm leading-6 text-muted-foreground">{t.description}</span></Link>
                <span className="hidden text-xs text-muted-foreground sm:block">{c.short}</span>
                <Button variant="ghost" size="icon" onClick={() => toggleFav(t.slug)} aria-label="Favorite" aria-pressed={favs.includes(t.slug)}><Heart className={`h-4 w-4 ${favs.includes(t.slug) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} /></Button>
              </div>
            ); })}
          </div>
        )}
      </div>
    </>
  );
}

function FavBtn({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} aria-label={on ? "Remove from favorites" : "Add to favorites"} aria-pressed={on} title={on ? "Remove from favorites" : "Add to favorites"} className="absolute right-9 top-3.5 h-9 w-9">
      <Heart className={`h-4 w-4 ${on ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
    </Button>
  );
}
