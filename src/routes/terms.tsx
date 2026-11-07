import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, meta } from "@/components/site/PageHeader";

export const Route = createFileRoute("/terms")({
  head: () => meta("Terms of Use — DOVZO", "The terms for using DOVZO's free online tools."),
  component: () => (
    <>
      <PageHeader eyebrow="Terms" title="Terms of Use" />
      <div className="reading-page mx-auto grid gap-0 px-5 sm:px-6">
        <section className="bento p-6"><h2 className="text-lg font-semibold">Use of the service</h2><p className="mt-2 text-muted-foreground">DOVZO is provided free of charge, as is. You're responsible for the files you process and how you use the results.</p></section>
        <section className="bento p-6"><h2 className="text-lg font-semibold">Acceptable use</h2><p className="mt-2 text-muted-foreground">Don't use DOVZO to break the law or infringe on others' rights.</p></section>
        <section className="bento p-6"><h2 className="text-lg font-semibold">Changes</h2><p className="mt-2 text-muted-foreground">We may update tools and these terms over time.</p></section>
      </div>
    </>
  ),
});
