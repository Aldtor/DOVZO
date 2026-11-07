import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, meta } from "@/components/site/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => meta("Contact DOVZO", "Get in touch with the DOVZO team with feedback, bug reports or tool ideas."),
  component: () => (
    <>
      <PageHeader eyebrow="Contact" title="Contact DOVZO" />
      <div className="reading-page mx-auto grid gap-0 px-5 sm:px-6">
        <section className="bento p-6"><h2 className="text-lg font-semibold">Say hello</h2><p className="mt-2 text-muted-foreground">Have a tool idea or found a bug? Email us at hello@dovzo.com — we read every message.</p></section>
        <section className="bento p-6"><h2 className="text-lg font-semibold">Business enquiries</h2><p className="mt-2 text-muted-foreground">For advertising and partnerships, contact partners@dovzo.com.</p></section>
      </div>
    </>
  ),
});
