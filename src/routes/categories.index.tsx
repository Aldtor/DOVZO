import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageHeader, meta } from "@/components/site/PageHeader";
import { categories, toneClass, toolsIn } from "@/lib/tools";

export const Route = createFileRoute("/categories/")({
  head: () =>
    meta(
      "Tool categories — DOVZO",
      "Image, PDF, text, developer, generator and file & media tools, organised by category.",
    ),
  component: () => (
    <>
      <PageHeader eyebrow="SIX COLLECTIONS. ONE TOOLKIT." title="What are you working on?">
        Start with a category. Find the right tool for your next task.
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-5 px-5 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <section key={c.id} className="bento overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <span
                  className={`grid h-12 w-12 place-items-center rounded-xl ${toneClass[c.tone]}`}
                >
                  <c.icon className="h-6 w-6" />
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  {toolsIn(c.id).length} tools
                </span>
              </div>
              <h2 className="mt-5 text-xl font-semibold">
                <Link
                  to="/categories/$category"
                  params={{ category: c.id }}
                  className="hover:text-primary"
                >
                  {c.name}
                </Link>
              </h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                {c.description}
              </p>
              <div className="mt-5 space-y-1 border-t border-border pt-3">
                {toolsIn(c.id)
                  .slice(0, 3)
                  .map((t) => (
                    <Link
                      key={t.slug}
                      to="/tools/$slug"
                      params={{ slug: t.slug }}
                      className="flex items-center justify-between rounded-md py-2 text-sm hover:text-primary"
                    >
                      {t.name}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ))}
              </div>
            </div>
            <Link
              to="/categories/$category"
              params={{ category: c.id }}
              className="flex items-center justify-between border-t border-border bg-secondary/40 px-6 py-4 text-sm font-semibold text-primary"
            >
              All {c.short.toLowerCase()} tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ))}
      </div>
    </>
  ),
});
