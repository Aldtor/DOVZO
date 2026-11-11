import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PageHeader, meta } from "@/components/site/PageHeader";
import { ToolCard } from "@/components/site/ToolCard";
import { searchTools } from "@/lib/tools";
import { inputCls } from "@/components/tools/kit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  head: () => meta("Search tools — DOVZO", "Search all 50 DOVZO tools by name, category or task."),
  component: SearchPage,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const results = searchTools(q);
  return (
    <>
      <PageHeader eyebrow="50 tools" title="Find your next useful tool.">
        Search by name, format or the task you want to complete.
      </PageHeader>
      <section className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="relative mx-auto mb-6 max-w-xl">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            aria-label="Search all tools"
            className={`${inputCls} w-full pl-10`}
            value={q}
            placeholder="Search by name or task…"
            onChange={(e) => void navigate({ search: { q: e.target.value }, replace: true })}
          />
        </div>
        {q.trim() ? (
          <>
            <p role="status" className="mb-4 text-sm text-muted-foreground">
              {results.length} matching tools
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {results.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
            {!results.length && (
              <div className="bento p-10 text-center">
                <h2 className="text-lg font-semibold">No matching tools</h2>
                <p className="my-3 text-sm text-muted-foreground">
                  Try a broader phrase such as image, PDF or text.
                </p>
                <Button variant="outline" onClick={() => void navigate({ search: {} })}>
                  Clear search
                </Button>
              </div>
            )}
          </>
        ) : (
          <Button asChild variant="outline">
            <Link to="/tools">Browse all tools</Link>
          </Button>
        )}
      </section>
    </>
  );
}
