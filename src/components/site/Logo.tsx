import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="dovzo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary)" />
          <stop offset="1" stopColor="var(--cyan)" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="9" height="28" rx="3" fill="url(#dovzo-g)" />
      <path d="M14 2h4a12 12 0 0 1 0 24h-4z" fill="url(#dovzo-g)" opacity="0.55" />
      <rect x="14" y="28" width="6" height="2" rx="1" fill="url(#dovzo-g)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="DOVZO home">
      <LogoMark />
      <span className="text-lg font-bold tracking-[0.08em]">DOVZO</span>
    </Link>
  );
}
