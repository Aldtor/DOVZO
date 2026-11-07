import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, meta } from "@/components/site/PageHeader";

export const Route = createFileRoute("/privacy")({
  head: () => meta("Privacy Policy — DOVZO", "How DOVZO handles your data: files stay on your device."),
  component: () => (
    <>
      <PageHeader eyebrow="Privacy" title="Privacy Policy" />
      <div className="mx-auto grid max-w-3xl gap-4 px-6">
        <section className="bento p-6"><h2 className="text-lg font-semibold">Your files</h2><p className="mt-2 text-muted-foreground">Files you open in DOVZO tools are processed locally in your browser and are never uploaded to our servers.</p></section>
        <section className="bento p-6"><h2 className="text-lg font-semibold">Preferences</h2><p className="mt-2 text-muted-foreground">We store your theme choice and favorite tools in your browser's local storage. You can clear them anytime.</p></section>
        <section className="bento p-6"><h2 className="text-lg font-semibold">Advertising</h2><p className="mt-2 text-muted-foreground">Ads may be served by third-party networks that use cookies according to their own policies.</p></section>
      </div>
    </>
  ),
});
