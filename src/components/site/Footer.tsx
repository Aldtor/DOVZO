import { Link } from "@tanstack/react-router";
import { Github, Twitter } from "lucide-react";
import { Logo } from "./Logo";
import { categories } from "@/lib/tools";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card/50">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">Free everyday utilities that run in your browser. No accounts, no paywalls.</p>
          <div className="flex gap-2 text-muted-foreground">
            <a href="#" aria-label="X (Twitter)" className="rounded-lg p-2 hover:bg-secondary"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="GitHub" className="rounded-lg p-2 hover:bg-secondary"><Github className="h-4 w-4" /></a>
          </div>
        </div>
        <FooterCol title="Explore">
          <Link to="/tools">All Tools</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/popular">Popular</Link>
          <Link to="/new">Recently Added</Link>
        </FooterCol>
        <FooterCol title="Categories">
          {categories.map((c) => (
            <Link key={c.id} to="/categories/$category" params={{ category: c.id }}>{c.name}</Link>
          ))}
        </FooterCol>
        <FooterCol title="Company">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/disclaimer">Disclaimer</Link>
        </FooterCol>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-6 py-5 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} DOVZO. Every tool is free, forever.</span>
          <span className="font-medium">Tools. No fuss.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold">{title}</h4>
      <div className="flex flex-col gap-2 text-sm text-muted-foreground [&>a:hover]:text-foreground">{children}</div>
    </div>
  );
}
