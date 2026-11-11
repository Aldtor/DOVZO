import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { SearchDialog } from "./SearchDialog";
import { categories } from "@/lib/tools";
import { savePreference } from "@/lib/browser-storage";

const nav = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "Toolkit" },
  { to: "/categories", label: "Categories" },
  { to: "/popular", label: "Popular" },
] as const;

export function Header() {
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
      if (e.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    savePreference("dovzo-theme", next ? "dark" : "light");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:px-6">
          <Logo />
          <nav aria-label="Main navigation" className="ml-6 hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => setSearch(true)}
              className="hidden h-9 items-center gap-2 border border-border bg-card/60 px-3 text-sm text-muted-foreground sm:flex"
            >
              <Search className="h-4 w-4" /> Search{" "}
              <kbd className="ml-5 font-mono text-[10px]">⌘K</kbd>
            </Button>
            <Button
              variant="ghost"
              onClick={() => setSearch(true)}
              className="grid h-9 w-9 place-items-center rounded-lg sm:hidden"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={toggle}
              className="grid h-9 w-9 place-items-center rounded-lg hover:bg-secondary"
              title={dark ? "Switch to light theme" : "Switch to dark theme"}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setMenu(!menu)}
              className="grid h-9 w-9 place-items-center rounded-lg md:hidden"
              aria-label="Menu"
              aria-expanded={menu}
              aria-controls="mobile-navigation"
            >
              {menu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {menu && (
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="mx-5 mb-3 flex flex-col gap-1 border-t border-border pt-3 md:hidden"
          >
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMenu(false)}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{ className: "bg-secondary text-foreground" }}
                className="rounded-lg px-3 py-2.5 text-sm"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
        <nav
          aria-label="Tool collections"
          className="collection-nav border-t border-border/60 bg-card/80"
        >
          <div className="mx-auto flex max-w-6xl gap-5 overflow-x-auto px-5 sm:px-6">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/categories/$category"
                params={{ category: c.id }}
                className="flex shrink-0 items-center gap-2 border-b-2 border-transparent py-3 text-xs font-medium text-muted-foreground hover:text-primary"
                activeProps={{ className: "border-primary text-primary" }}
              >
                <c.icon className="h-3.5 w-3.5" />
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </>
  );
}
