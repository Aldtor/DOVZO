import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Heart, LayoutGrid, List, SearchX } from "lucide-react";
import { ToolCard } from "@/components/site/ToolCard";
import { PageHeader, meta } from "@/components/site/PageHeader";
import { categories, getCategory, searchTools, tools, toneClass, type CategoryId } from "@/lib/tools";
import { inputCls } from "@/components/tools/kit";

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
  useEffect(() => { try { setFavs(JSON.parse(localStorage.getItem("dovzo-favs") ?? "[]")); } catch { /* ignore */ } }, []);
  const toggleFav = (s: string) => { const n = favs.includes(s) ? favs.filter((x) => x !== s) : [...favs, s]; setFavs(n); localStorage.setItem("dovzo-favs", JSON.stringify(n)); };

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
    <button key={id} onClick={() => setCat(id)} className={`rounded-lg px-3 py-1.5 text-sm transition ${cat === id ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-border hover:text-foreground"}`}>{label}</button>
  );

  return (
    <>
      <PageHeader eyebrow={`${tools.length} tools`} title="All tools">Every tool is free and runs in your browser.</PageHeader>
      <div className="mx-auto max-w-6xl px-6">
        <div className="glass sticky top-20 z-30 mb-6 flex flex-col gap-3 rounded-2xl p-3 shadow-soft">
          <div className="flex flex-wrap gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter tools…" className={`${inputCls} min-w-48 flex-1`} aria-label="Filter tools" />
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={inputCls} aria-label="Sort"><option value="popular">Popular first</option><option value="az">A–Z</option><option value="new">Recently added</option></select>
            <div className="flex rounded-xl ring-1 ring-border">
              <button onClick={() => setView("grid")} aria-label="Grid view" className={`px-3 ${view === "grid" ? "text-primary" : "text-muted-foreground"}`}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setView("list")} aria-label="List view" className={`px-3 ${view === "list" ? "text-primary" : "text-muted-foreground"}`}><List className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">{chip("all", "All")}{categories.map((c) => chip(c.id, c.short))}{chip("fav", `Favorites (${favs.length})`)}</div>
        </div>

        {list.length === 0 ? (
          <div className="bento flex flex-col items-center gap-3 p-16 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground" /><h3 className="text-lg font-semibold">No tools found</h3>
            <p className="text-sm text-muted-foreground">Try a different word or clear your filters.</p>
            <button onClick={() => { setQ(""); setCat("all"); }} className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">Clear filters</button>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {list.map((t) => (
              <div key={t.slug} className="relative">
                <ToolCard tool={t} />
                <FavBtn on={favs.includes(t.slug)} onClick={() => toggleFav(t.slug)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bento divide-y divide-border">
            {list.map((t) => { const c = getCategory(t.category)!; return (
              <div key={t.slug} className="relative flex items-center gap-4 p-4">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${toneClass[c.tone]}`}><t.icon className="h-5 w-5" /></span>
                <Link to="/tools/$slug" params={{ slug: t.slug }} className="flex-1"><span className="font-medium">{t.name}</span><span className="block text-sm text-muted-foreground">{t.description}</span></Link>
                <span className="hidden text-xs text-muted-foreground sm:block">{c.short}</span>
                <button onClick={() => toggleFav(t.slug)} aria-label="Favorite"><Heart className={`h-4 w-4 ${favs.includes(t.slug) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} /></button>
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
    <button onClick={onClick} aria-label={on ? "Remove from favorites" : "Add to favorites"} className="absolute right-12 top-5 rounded-lg p-1.5 hover:bg-secondary">
      <Heart className={`h-4 w-4 ${on ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
    </button>
  );
}
