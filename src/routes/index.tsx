import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Code2, GraduationCap, Palette, Search, ShieldCheck, Sparkles, UserX, Zap, Briefcase } from "lucide-react";
import { useState } from "react";
import { ToolCard } from "@/components/site/ToolCard";
import { meta } from "@/components/site/PageHeader";
import { categories, getTool, popularTools, recentTools, searchTools, toneClass, toolsIn } from "@/lib/tools";
import { useNavigate } from "@tanstack/react-router";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => meta("DOVZO — 50 free online tools. No fuss.", "Compress images, merge PDFs, format JSON, make QR codes and more. Free, private, no signup."),
  component: Home,
});

const faqs = [
  ["Is DOVZO free?", "Yes. Every tool is completely free. DOVZO is supported by ads only — there are no plans, credits or paywalls."],
  ["Do I need an account?", "No. Open a tool and use it straight away."],
  ["Are files uploaded to a server?", "No. Every tool runs inside your browser, so your files never leave your device."],
  ["Does DOVZO work on mobile?", "Yes. All tools work on phones and tablets, although very large files process faster on a computer."],
  ["What file formats are supported?", "Common formats like JPG, PNG, WebP, PDF, ZIP, MP3, WAV, MP4 and WebM. Each tool lists what it accepts."],
  ["Are there usage limits?", "No artificial limits. The only limit is your device's memory for very large files."],
];

function Home() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const hits = q ? searchTools(q).slice(0, 5) : [];
  const featured = ["image-compressor", "pdf-merger", "qr-code-generator", "json-formatter"].map((s) => getTool(s)!);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-16 md:grid-cols-[1.2fr_1fr] md:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-primary" /> 50 tools · all free</span>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] md:text-6xl">Everyday tools.<br /><span className="text-brand">No fuss.</span></h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">Compress images, merge PDFs, format JSON and make QR codes — right in your browser. Nothing to install, nothing to sign up for.</p>
            <div className="relative mt-8 max-w-lg">
              <div className="glass flex items-center gap-3 rounded-2xl px-4 shadow-lift">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && hits[0] && nav({ to: "/tools/$slug", params: { slug: hits[0].slug } })}
                  placeholder="What do you need to do?" className="h-14 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" aria-label="Search tools" />
              </div>
              {hits.length > 0 && (
                <div className="glass absolute inset-x-0 top-16 z-10 rounded-2xl p-2 shadow-lift">
                  {hits.map((h) => <Link key={h.slug} to="/tools/$slug" params={{ slug: h.slug }} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-accent"><h.icon className="h-4 w-4 text-primary" />{h.name}</Link>)}
                </div>
              )}
            </div>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-muted-foreground">
              {[[BadgeCheck, "100% Free"], [UserX, "No Signup Required"], [ShieldCheck, "Privacy First"]].map(([I, l]) => { const Icon = I as typeof BadgeCheck; return <span key={l as string} className="flex items-center gap-1.5"><Icon className="h-4 w-4 text-success" />{l as string}</span>; })}
            </div>
          </div>
          {/* Bento preview */}
          <div className="grid grid-cols-2 gap-3 self-center">
            {featured.map((t, i) => {
              const cat = categories.find((c) => c.id === t.category)!;
              return (
                <Link key={t.slug} to="/tools/$slug" params={{ slug: t.slug }} className={`bento bento-hover flex flex-col justify-between p-5 ${i === 0 ? "row-span-2 min-h-64" : "min-h-32"}`}>
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${toneClass[cat.tone]}`}><t.icon className="h-5 w-5" /></span>
                  <div><p className="font-semibold">{t.name}</p>{i === 0 && <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>}</div>
                </Link>
              );
            })}
            <div className="bento col-span-1 flex items-center gap-3 bg-brand p-5 text-primary-foreground"><Zap className="h-5 w-5" /><span className="text-sm font-medium">Runs on your device</span></div>
          </div>
        </div>
      </section>

      <Section title="Popular tools" link={{ to: "/popular", label: "See all popular" }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{popularTools.slice(0, 8).map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
      </Section>

      <Section title="Browse categories" link={{ to: "/categories", label: "All categories" }}>
        <div className="grid gap-4 md:grid-cols-3">
          {categories.map((c, i) => (
            <Link key={c.id} to="/categories/$category" params={{ category: c.id }} className={`bento bento-hover flex flex-col gap-4 p-6 ${i === 0 ? "md:row-span-2" : ""}`}>
              <div className="flex items-center justify-between"><span className={`grid h-12 w-12 place-items-center rounded-xl ${toneClass[c.tone]}`}><c.icon className="h-6 w-6" /></span><span className="text-sm text-muted-foreground">{toolsIn(c.id).length} tools</span></div>
              <div><h3 className="text-lg font-semibold">{c.name}</h3><p className="mt-1 text-sm text-muted-foreground">{c.description}</p></div>
              {i === 0 && <ul className="mt-auto space-y-2 text-sm">{toolsIn(c.id).slice(0, 6).map((t) => <li key={t.slug} className="flex items-center gap-2 text-muted-foreground"><t.icon className="h-4 w-4" />{t.name}</li>)}</ul>}
            </Link>
          ))}
        </div>
      </Section>

      <Section title="Recently added" link={{ to: "/new", label: "View new tools" }}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{recentTools.slice(0, 4).map((t) => <ToolCard key={t.slug} tool={t} />)}</div>
      </Section>

      <Section title="Tools for everyone">
        <div className="grid gap-4 md:grid-cols-4">
          {[[GraduationCap, "Students", "Word counts, PDF merges and image-to-PDF for assignments.", ["word-counter", "images-to-pdf"]], [Palette, "Creators", "Compress, crop and convert images for any platform.", ["image-compressor", "image-cropper"]], [Code2, "Developers", "JSON, Base64, JWT, regex and hashes in one place.", ["json-formatter", "jwt-decoder"]], [Briefcase, "Everyday work", "QR codes, passwords and file zipping without the fuss.", ["qr-code-generator", "zip-creator"]]].map(([I, t, d, links]) => {
            const Icon = I as typeof Code2;
            return (
              <div key={t as string} className="bento flex flex-col gap-3 p-6">
                <Icon className="h-6 w-6 text-primary" /><h3 className="font-semibold">For {(t as string).toLowerCase()}</h3><p className="text-sm text-muted-foreground">{d as string}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">{(links as string[]).map((s) => <Link key={s} to="/tools/$slug" params={{ slug: s }} className="rounded-md bg-secondary px-2 py-1 text-xs hover:bg-accent">{getTool(s)!.name}</Link>)}</div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Why DOVZO?">
        <div className="grid gap-4 md:grid-cols-4">
          {[[BadgeCheck, "Completely free", "Every tool, every feature. Ads keep the lights on."], [UserX, "No signup", "No accounts, no emails, no passwords."], [ShieldCheck, "Privacy-first", "Your files are processed on your device and never uploaded."], [Zap, "Simple & fast", "One page, one job. Open it, use it, done."]].map(([I, t, d]) => {
            const Icon = I as typeof Zap;
            return <div key={t as string} className="bento p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-5 w-5" /></span><h3 className="mt-4 font-semibold">{t as string}</h3><p className="mt-1 text-sm text-muted-foreground">{d as string}</p></div>;
          })}
        </div>
      </Section>

      <Section title="Questions">
        <Accordion type="single" collapsible className="bento px-6">
          {faqs.map(([q, a]) => <AccordionItem key={q} value={q}><AccordionTrigger className="text-left">{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </Section>

      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="relative overflow-hidden rounded-3xl bg-brand p-10 text-primary-foreground md:p-14">
          <h2 className="text-3xl font-bold md:text-4xl">50 tools. Zero sign‑ups.</h2>
          <p className="mt-3 max-w-md opacity-90">Pick a tool and get it done in seconds.</p>
          <Link to="/tools" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-card px-5 py-3 text-sm font-semibold text-foreground">Explore all tools <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}

function Section({ title, link, children }: { title: string; link?: { to: "/popular" | "/categories" | "/new"; label: string }; children: React.ReactNode }) {
  return (
    <section className="mx-auto mt-20 max-w-6xl px-6">
      <div className="mb-6 flex items-end justify-between">
        <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
        {link && <Link to={link.to} className="flex items-center gap-1 text-sm font-medium text-primary">{link.label}<ArrowRight className="h-4 w-4" /></Link>}
      </div>
      {children}
    </section>
  );
}
