import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, meta } from "@/components/site/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => meta("About DOVZO", "Why DOVZO exists: free, private, no-fuss online tools for everyone."),
  component: () => (
    <>
      <PageHeader eyebrow="About" title="About DOVZO" />
      <div className="reading-page mx-auto grid gap-0 px-5 sm:px-6">
        <section className="bento p-6"><h2 className="text-lg font-semibold">Our mission</h2><p className="mt-2 text-muted-foreground">Make useful digital utilities accessible to everybody through one fast, beautiful, reliable website.</p></section>
        <section className="bento p-6"><h2 className="text-lg font-semibold">How it's free</h2><p className="mt-2 text-muted-foreground">DOVZO is supported by advertising only. There are no subscriptions, credits or paid plans — and there never will be.</p></section>
        <section className="bento p-6"><h2 className="text-lg font-semibold">Private by design</h2><p className="mt-2 text-muted-foreground">Tools run in your browser using built-in web technology. Your files are not uploaded to our servers.</p></section>
      </div>
    </>
  ),
});
