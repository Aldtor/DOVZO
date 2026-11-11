import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="2" y="2" width="9" height="28" rx="3" fill="var(--primary)" />
      <path d="M14 2h4a12 12 0 0 1 0 24h-4z" fill="var(--primary)" opacity="0.55" />
      <rect x="14" y="28" width="6" height="2" rx="1" fill="var(--primary)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="DOVZO home">
      <LogoMark />
      <span className="text-lg font-bold">DOVZO</span>
    </Link>
  );
}
