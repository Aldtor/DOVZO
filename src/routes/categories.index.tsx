import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, meta } from "@/components/site/PageHeader";
import { categories, toneClass, toolsIn } from "@/lib/tools";

export const Route = createFileRoute("/categories/")({
  head: () => meta("Tool categories — DOVZO", "Image, PDF, text, developer, generator and file & media tools, organised by category."),
  component: () => (
    <>
      <PageHeader eyebrow="Categories" title="Find tools by category">Six groups of focused, free utilities.</PageHeader>
      <div className="mx-auto grid max-w-6xl gap-4 px-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.id} to="/categories/$category" params={{ category: c.id }} className="bento bento-hover flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between"><span className={`grid h-12 w-12 place-items-center rounded-xl ${toneClass[c.tone]}`}><c.icon className="h-6 w-6" /></span><span className="text-sm text-muted-foreground">{toolsIn(c.id).length} tools</span></div>
            <div><h2 className="text-lg font-semibold">{c.name}</h2><p className="mt-1 text-sm text-muted-foreground">{c.description}</p></div>
            <div className="flex flex-wrap gap-1.5">{toolsIn(c.id).slice(0, 4).map((t) => <span key={t.slug} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{t.name}</span>)}</div>
          </Link>
        ))}
      </div>
    </>
  ),
});
