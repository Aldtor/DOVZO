import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, meta } from "@/components/site/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () =>
    meta(
      "Contact DOVZO",
      "Get in touch with the DOVZO team with feedback, bug reports or tool ideas.",
    ),
  component: () => (
    <>
      <PageHeader eyebrow="Contact" title="Let’s make DOVZO better.">
        Have feedback, a tool idea, or a question? Get in touch.
      </PageHeader>
      <div className="reading-page mx-auto grid gap-0 px-5 sm:px-6">
        <section className="bento p-6">
          <h2 className="text-lg font-semibold">Say hello</h2>
          <p className="mt-2 text-muted-foreground">
            Have a tool idea or found a bug? Email{" "}
            <a className="text-primary underline underline-offset-4" href="mailto:hello@dovzo.com">
              hello@dovzo.com
            </a>
            .
          </p>
        </section>
        <section className="bento p-6">
          <h2 className="text-lg font-semibold">Business enquiries</h2>
          <p className="mt-2 text-muted-foreground">
            For advertising and partnerships, contact{" "}
            <a
              className="text-primary underline underline-offset-4"
              href="mailto:partners@dovzo.com"
            >
              partners@dovzo.com
            </a>
            .
          </p>
        </section>
      </div>
    </>
  ),
});
