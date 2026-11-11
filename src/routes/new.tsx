import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, meta } from "@/components/site/PageHeader";
import { ToolCard } from "@/components/site/ToolCard";
import { recentTools } from "@/lib/tools";

export const Route = createFileRoute("/new")({
  head: () => meta("New tools — DOVZO", "The latest free tools added to DOVZO."),
  component: () => (
    <>
      <PageHeader eyebrow="Recently added" title="More ways to get things done.">
        Explore the latest additions to your toolkit.
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {recentTools.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </>
  ),
});
