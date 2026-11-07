import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { categories } from "@/lib/tools";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card/50">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-10 sm:px-6 md:grid-cols-4">
        <div className="col-span-2 space-y-3 md:col-span-1">
          <Logo />
          <p className="text-sm text-muted-foreground">Free everyday utilities that run in your browser. No accounts, no paywalls.</p>
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
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-5 py-5 sm:px-6 text-xs text-muted-foreground">
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
      <div className="flex flex-col gap-2 text-sm leading-6 text-muted-foreground [&>a:hover]:text-foreground">{children}</div>
    </div>
  );
}
