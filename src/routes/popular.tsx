import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, meta } from "@/components/site/PageHeader";
import { ToolCard } from "@/components/site/ToolCard";
import { popularTools } from "@/lib/tools";

export const Route = createFileRoute("/popular")({
  head: () =>
    meta(
      "Most popular tools — DOVZO",
      "Popular DOVZO tools: image compression, PDF merging, QR codes and more.",
    ),
  component: () => (
    <>
      <PageHeader eyebrow="Popular" title="Your everyday essentials.">
        A selection of useful tools for common tasks.
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">
        {popularTools.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </>
  ),
});
