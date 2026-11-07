import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { PageHeader, meta } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({ ...meta("Administration unavailable — DOVZO", "DOVZO administration is not configured. Public tools remain available."), meta: [...meta("Administration unavailable — DOVZO", "DOVZO administration is not configured. Public tools remain available.").meta, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

function Admin() {
  return <>
    <PageHeader eyebrow="Administration" title="Admin unavailable" />
    <section className="mx-auto max-w-6xl border-t border-border px-5 py-6 sm:px-6">
      <ShieldAlert className="h-8 w-8 text-muted-foreground" />
      <p className="mt-4 max-w-xl text-muted-foreground">Administration is not configured for this site. Secure sign-in and saved settings require Lovable Cloud, which is currently disabled. No administration actions are available.</p>
      <Button asChild className="mt-6"><Link to="/tools">Browse tools</Link></Button>
    </section>
  </>;
}