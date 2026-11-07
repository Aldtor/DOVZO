import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { Logo } from "./Logo";
import { SearchDialog } from "./SearchDialog";

const nav = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "All Tools" },
  { to: "/categories", label: "Categories" },
  { to: "/popular", label: "Popular" },
  { to: "/new", label: "New" },
] as const;

export function Header() {
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("dovzo-theme", next ? "dark" : "light");
  };

  return (
    <>
      <header className="sticky top-3 z-40 mx-auto mt-3 w-[calc(100%-1.5rem)] max-w-6xl">
        <div className="glass flex h-14 items-center gap-4 rounded-2xl px-4 shadow-soft">
          <Logo />
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button onClick={() => setSearch(true)} className="hidden items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-1.5 text-sm text-muted-foreground sm:flex">
              <Search className="h-4 w-4" /> Search <kbd className="ml-4 text-xs">⌘K</kbd>
            </button>
            <button onClick={() => setSearch(true)} className="grid h-9 w-9 place-items-center rounded-lg sm:hidden" aria-label="Search"><Search className="h-4 w-4" /></button>
            <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-secondary" aria-label="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => setMenu(!menu)} className="grid h-9 w-9 place-items-center rounded-lg md:hidden" aria-label="Menu">
              {menu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {menu && (
          <nav className="glass mt-2 flex flex-col rounded-2xl p-2 shadow-soft md:hidden">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setMenu(false)} className="rounded-lg px-3 py-2.5 text-sm">{n.label}</Link>
            ))}
          </nav>
        )}
      </header>
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </>
  );
}
