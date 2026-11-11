import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Check, Search, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { ToolCard } from "@/components/site/ToolCard";
import { SearchDialog } from "@/components/site/SearchDialog";
import { meta } from "@/components/site/PageHeader";
import { categories, getTool, popularTools, toneClass, toolsIn } from "@/lib/tools";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () =>
    meta(
      "DOVZO — Your everyday toolkit",
      "50 free tools for images, PDFs, text, code and media. Work privately in your browser. No signup.",
    ),
  component: Home,
});

const shortcuts = ["image-compressor", "pdf-merger", "qr-code-generator", "zip-creator"];
const faqs = [
  [
    "Is every tool really free?",
    "Yes. All 50 tools are free, with no subscriptions, credits or sign-up requirements.",
  ],
  [
    "Where do my files go?",
    "Your selected files are processed locally in your browser. DOVZO does not upload them to a server. Downloaded results are saved wherever your browser normally saves files.",
  ],
  [
    "Can I use DOVZO on my phone?",
    "Yes, most tools work in modern mobile browsers. Video recording and supported codecs depend on your browser. Large files work best on a computer.",
  ],
  [
    "What are the file limits?",
    "File selections are limited to 100 MiB. Image processing has dimension limits, and GIF clips are limited to 15 seconds. Each workspace explains its supported formats and processing options.",
  ],
];

function Home() {
  const [search, setSearch] = useState(false);
  return (
    <>
      <section className="discovery-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-20">
          <div>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> THE EVERYDAY TOOLKIT
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.06] tracking-tight sm:text-6xl">
              Less busywork.
              <br />
              <span className="text-primary">More possibilities.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
              Make room for what matters. 50 thoughtfully simple tools for your images, documents,
              ideas and everyday work.
            </p>
            <button
              onClick={() => setSearch(true)}
              className="hero-search mt-8 flex w-full max-w-lg items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-soft"
              aria-label="Find a tool"
            >
              <Search className="h-5 w-5 shrink-0 text-primary" />
              <span className="flex-1 text-sm text-muted-foreground">
                What would you like to do?
              </span>
              <span className="rounded-lg bg-primary p-2 text-primary-foreground">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
              <span>Try:</span>
              {[
                ["pdf-merger", "Merge PDFs"],
                ["image-resizer", "Resize an image"],
                ["json-formatter", "Format JSON"],
              ].map(([slug, label]) => (
                <Link
                  key={slug}
                  to="/tools/$slug"
                  params={{ slug }}
                  className="underline decoration-border underline-offset-4 hover:text-primary"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
              {["Always free", "No account needed", "Files stay with you"].map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" />
                  {text}
                </span>
              ))}
            </div>
          </div>
          <div className="starter-panel rounded-3xl border border-border bg-card p-5 shadow-lift sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                A little help, every day
              </span>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">One task. A simpler way.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick a starting point and make it yours.
            </p>
            <div className="mt-6 space-y-2">
              {shortcuts.map((slug) => {
                const t = getTool(slug)!;
                const cat = categories.find((c) => c.id === t.category)!;
                return (
                  <Link
                    key={slug}
                    to="/tools/$slug"
                    params={{ slug }}
                    className="starter-link group flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors hover:border-border hover:bg-secondary/50"
                  >
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${toneClass[cat.tone]}`}
                    >
                      <t.icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{t.name}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                        {t.description}
                      </span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 flex items-center gap-2 border-t border-border pt-5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" />
              Your workspace is your browser.
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-10 sm:px-6" aria-label="Browse by category">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Find your kind of tool</h2>
          <span className="text-xs text-muted-foreground">6 collections · 50 tools</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to="/categories/$category"
              params={{ category: c.id }}
              className="category-tile bento bento-hover flex flex-col gap-4 p-4"
            >
              <c.icon className="h-5 w-5 text-primary" />
              <span>
                <span className="block text-sm font-semibold">{c.short}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {toolsIn(c.id).length} tools
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-6 md:py-20">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">THE DAILY ESSENTIALS</p>
            <h2 className="text-3xl font-semibold">Small tasks, sorted.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A few favorites to keep your day moving.
            </p>
          </div>
          <Link to="/tools" className="text-link">
            Explore all 50 tools <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {popularTools.slice(0, 8).map((t) => (
            <ToolCard key={t.slug} tool={t} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="privacy-panel grid gap-8 rounded-3xl border border-border bg-card p-7 md:grid-cols-[1fr_1.1fr] md:p-10">
          <div>
            <span className="mb-5 inline-flex rounded-xl bg-success/10 p-3 text-success">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <h2 className="text-3xl font-semibold">
              Your files.
              <br />
              Your device. Your business.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
              No upload queue. No account to create. Your browser does the work, and you stay in
              control of the result.
            </p>
            <Link to="/privacy" className="text-link mt-5">
              How we protect your privacy <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ol className="divide-y divide-border">
            {[
              ["Choose your tool", "Find the right workspace for your file, text or idea."],
              ["Make it your own", "Add your input and adjust the available settings."],
              [
                "Take the result with you",
                "Download, copy or inspect your output right in the workspace.",
              ],
            ].map(([title, description], i) => (
              <li key={title} className="flex gap-4 py-6 first:pt-0 last:pb-0">
                <span className="pt-1 font-mono text-xs text-primary">0{i + 1}</span>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-6 md:grid-cols-[.7fr_1fr] md:py-20">
        <div>
          <p className="eyebrow mb-3">GOOD TO KNOW</p>
          <h2 className="text-3xl font-semibold">
            Simple tools.
            <br />
            Straight answers.
          </h2>
          <p className="mt-4 text-sm text-muted-foreground">A few things before you get started.</p>
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

      <section className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="directory-cta flex flex-col items-start justify-between gap-6 rounded-3xl bg-primary p-8 text-primary-foreground sm:flex-row sm:items-center md:p-10">
          <div>
            <Zap className="mb-4 h-6 w-6" />
            <h2 className="text-2xl font-semibold">A lighter way to get things done.</h2>
            <p className="mt-2 text-sm opacity-85">Your next useful tool is one click away.</p>
          </div>
          <Link
            to="/tools"
            className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-card px-5 py-3 text-sm font-semibold text-foreground"
          >
            Open the toolkit <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </>
  );
}
