import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHeader } from "@/components/site/PageHeader";
import { ToolCard } from "@/components/site/ToolCard";
import { getCategory, toolsIn } from "@/lib/tools";

export const Route = createFileRoute("/categories/$category")({
  loader: ({ params }) => {
    const c = getCategory(params.category);
    if (!c) throw notFound();
    return { id: c.id };
  },
  head: ({ loaderData }) => {
    const c = loaderData ? getCategory(loaderData.id) : undefined;
    if (!c) return { meta: [{ title: "Category not found — DOVZO" }, { name: "robots", content: "noindex" }] };
    const title = `Free ${c.name} online — DOVZO`;
    return { meta: [{ title }, { name: "description", content: c.description }, { property: "og:title", content: title }, { property: "og:description", content: c.description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { id } = Route.useLoaderData();
  const c = getCategory(id)!;
  const list = toolsIn(c.id);
  return (
    <>
      <PageHeader eyebrow={`${list.length} tools`} title={c.name}>{c.description}</PageHeader>
      <div className="mx-auto grid max-w-6xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4">{list.map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
    </>
  );
}
