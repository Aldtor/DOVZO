import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Search, SearchX, ShieldCheck, Zap, Monitor } from "lucide-react";
import { useMemo, useState } from "react";
import { ToolCard } from "@/components/site/ToolCard";
import { SearchDialog } from "@/components/site/SearchDialog";
import { meta } from "@/components/site/PageHeader";
import { categories, searchTools, tools, type CategoryId } from "@/lib/tools";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () =>
    meta(
      "DOVZO — Free online tools for your everyday work",
      "All the image, PDF, text, developer and media tools you need. Free to use, no signup, and files stay on your device.",
    ),
  component: Home,
});

const faqs = [
  [
    "Are all the tools free?",
    "Yes. All 50 tools are free to use, without a subscription, credits or an account.",
  ],
  [
    "Do my files leave my device?",
    "No. Selected files are processed in your browser, without uploading them to DOVZO. Save the result using your browser's download controls.",
  ],
  [
    "Which files can I use?",
    "Each tool lists the formats it supports. File selections have a 100 MiB limit, images have dimension limits, and GIF clips are limited to 15 seconds. Video and audio support depends on your browser's codecs.",
  ],
  [
    "Does it work on phones and tablets?",
    "Most tools work in modern mobile browsers. Video recording depends on browser support, and large files are easier to process on a computer.",
  ],
];

function Home() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [search, setSearch] = useState(false);
  const visible = useMemo(() => {
    const results = q.trim() ? searchTools(q) : tools;
    return category === "all" ? results : results.filter((t) => t.category === category);
  }, [q, category]);
  return (
    <>
      <section className="catalog-hero mx-auto max-w-6xl px-5 pb-8 pt-10 text-center sm:px-6 md:pt-14">
        <p className="eyebrow justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> FREE TOOLS. EVERYDAY
          POSSIBILITIES.
        </p>
        <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Every tool you need.
          <br className="sm:hidden" /> <span className="text-primary">All in one place.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          Work with images, organize PDFs, create something new.
          <br className="hidden sm:block" /> Simple online tools that get straight to the point.
        </p>
        <div className="mx-auto mt-6 flex max-w-xl items-center gap-3 rounded-xl border border-border bg-card px-4 shadow-soft focus-within:border-primary">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            aria-label="Find a tool by name or task"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tools, e.g. compress image or merge PDF"
            className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-xs font-semibold text-primary">
              Clear
            </button>
          )}
          <button
            aria-label="Find a tool"
            onClick={() => setSearch(true)}
            className="hidden rounded-md border border-border px-2 py-1 font-mono text-xs text-muted-foreground sm:block"
          >
            ⌘ K
          </button>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {["50 free tools", "No sign-up", "Files stay on your device"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-success" />
              {t}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14 sm:px-6" aria-label="All tools">
        <div className="catalog-tabs sticky z-20 -mx-1 mb-5 overflow-x-auto bg-background/95 px-1 py-3 backdrop-blur-xl">
          <div className="flex min-w-max justify-start gap-2 md:justify-center">
            <button
              onClick={() => setCategory("all")}
              aria-pressed={category === "all"}
              className="category-filter"
            >
              All tools <span>{tools.length}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
                className="category-filter"
              >
                <c.icon className="h-4 w-4" />
                {c.short}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <p role="status">
            {visible.length} tools
            {category !== "all"
              ? ` · ${categories.find((c) => c.id === category)?.name}`
              : " for work, study and everything in between"}
          </p>
          <Link to="/tools" className="shrink-0 hover:text-primary">
            Your favorites →
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
        {!visible.length && (
          <div className="bento flex flex-col items-center gap-3 px-6 py-16 text-center">
            <SearchX className="h-8 w-8 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No matching tools</h2>
            <p className="text-sm text-muted-foreground">
              Try another search or browse all categories.
            </p>
            <Button
              onClick={() => {
                setQ("");
                setCategory("all");
              }}
            >
              Show all tools
            </Button>
          </div>
        )}
      </section>

      <section className="border-y border-border bg-card py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-semibold">Good tools. Fewer complications.</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Everything you need to finish the task, without getting in your way.
            </p>
          </div>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              [
                ShieldCheck,
                "Private by design",
                "Your selected files stay in your browser. You decide what to save and where to save it.",
              ],
              [
                Zap,
                "Open it. Use it. Done.",
                "No installation or registration. Choose a tool and start with your own files or text.",
              ],
              [
                Monitor,
                "A familiar workspace",
                "Clear controls, helpful messages and a consistent experience on desktop and mobile.",
              ],
            ].map(([I, title, body]) => {
              const Icon = I as typeof ShieldCheck;
              return (
                <div key={String(title)} className="text-center">
                  <Icon className="mx-auto h-8 w-8 text-primary" />
                  <h3 className="mt-4 font-semibold">{String(title)}</h3>
                  <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
                    {String(body)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-6 md:grid-cols-[.7fr_1fr] md:py-16">
        <div>
          <p className="eyebrow">HELP & ANSWERS</p>
          <h2 className="mt-3 text-3xl font-semibold">
            A few things
            <br />
            worth knowing.
          </h2>
          <Link to="/about" className="text-link mt-5">
            Get to know DOVZO <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <Accordion type="single" collapsible>
          {faqs.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left">{q}</AccordionTrigger>
              <AccordionContent className="leading-7 text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </>
  );
}
