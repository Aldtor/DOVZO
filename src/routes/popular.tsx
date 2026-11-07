import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, meta } from "@/components/site/PageHeader";
import { ToolCard } from "@/components/site/ToolCard";
import { popularTools } from "@/lib/tools";

export const Route = createFileRoute("/popular")({
  head: () => meta("Most popular tools — DOVZO", "The DOVZO tools people use most: image compression, PDF merging, QR codes and more."),
  component: () => (
    <>
      <PageHeader eyebrow="Popular" title="Most-used tools">The tools people come back to every day.</PageHeader>
      <div className="mx-auto grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">{popularTools.map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
    </>
  ),
});
