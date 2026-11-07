import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { ToolCard } from "@/components/site/ToolCard";
import { getCategory, getTool, relatedTools, toneClass } from "@/lib/tools";
import { toolComponents } from "@/components/tools/registry";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/tools/$slug")({
  loader: ({ params }) => {
    const tool = getTool(params.slug);
    if (!tool) throw notFound();
    return { slug: tool.slug };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? getTool(loaderData.slug) : undefined;
    if (!t) return { meta: [{ title: "Tool not found — DOVZO" }, { name: "robots", content: "noindex" }] };
    const title = `${t.name} — Free online, no signup | DOVZO`;
    return { meta: [
      { title }, { name: "description", content: t.description },
      { property: "og:title", content: title }, { property: "og:description", content: t.description },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    ] };
  },
  component: ToolPage,
});

function ToolPage() {
  const { slug } = Route.useLoaderData();
  const tool = getTool(slug)!;
  const cat = getCategory(tool.category)!;
  const Comp = toolComponents[slug];
  const noun = tool.name.toLowerCase();
  const fileBased = ["image", "pdf", "file-media"].includes(tool.category) && !["base64-to-image"].includes(slug);

  const faq = [
    [`Is the ${noun} free?`, "Yes — completely free with no limits, sign-ups or watermarks."],
    ["Are my files uploaded?", "No. Everything happens in your browser. Your data never leaves your device."],
    ["Does it work on my phone?", "Yes. It works in any modern mobile browser."],
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 pt-8">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-foreground">Home</Link><ChevronRight className="h-3.5 w-3.5" />
        <Link to="/categories/$category" params={{ category: cat.id }} className="hover:text-foreground">{cat.name}</Link><ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{tool.name}</span>
      </nav>

      <header className="mt-6 flex flex-wrap items-start gap-4">
        <span className={`grid h-14 w-14 place-items-center rounded-2xl ${toneClass[cat.tone]}`}><tool.icon className="h-7 w-7" /></span>
        <div className="flex-1">
          <h1 className="text-3xl font-bold md:text-4xl">{tool.name}</h1>
          <p className="mt-1 text-muted-foreground">{tool.description}</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success"><ShieldCheck className="h-4 w-4" /> Free · runs on your device</span>
      </header>

      <div className="bento mt-8 p-5 md:p-8"><Comp /></div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <div className="bento p-6 md:col-span-2">
          <h2 className="text-lg font-semibold">How to use</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>{fileBased ? "Drop your file into the box above, or click to choose it." : "Enter or paste your input above."}</li>
            <li>Adjust the options until the result looks right.</li>
            <li>{fileBased ? "Download the result — it's created right on your device." : "Copy the result with one click."}</li>
          </ol>
        </div>
        <div className="bento p-6">
          <h2 className="text-lg font-semibold">Supported formats</h2>
          <p className="mt-3 text-sm text-muted-foreground">{tool.formats ?? (fileBased ? "Most common files" : "Plain text input")}</p>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">FAQ</h2>
        <Accordion type="single" collapsible className="bento px-6">
          {faq.map(([q, a]) => <AccordionItem key={q} value={q}><AccordionTrigger className="text-left">{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-xl font-semibold">Related tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{relatedTools(tool).map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
      </section>
    </div>
  );
}
