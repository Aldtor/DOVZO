import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, meta } from "@/components/site/PageHeader";

export const Route = createFileRoute("/disclaimer")({
  head: () => meta("Disclaimer — DOVZO", "Important notes about the accuracy and limits of DOVZO tools."),
  component: () => (
    <>
      <PageHeader eyebrow="Disclaimer" title="Disclaimer" />
      <div className="reading-page mx-auto grid gap-0 px-5 sm:px-6">
        <section className="bento p-6"><h2 className="text-lg font-semibold">No warranty</h2><p className="mt-2 text-muted-foreground">We work hard to make every tool accurate, but results are provided without warranty. Always keep a copy of your original files.</p></section>
        <section className="bento p-6"><h2 className="text-lg font-semibold">Security tools</h2><p className="mt-2 text-muted-foreground">Generated passwords and hashes are created with your browser's secure random generator, but you're responsible for how you store them.</p></section>
      </div>
    </>
  ),
});
