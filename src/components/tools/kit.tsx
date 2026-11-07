import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Copy, Download, Upload, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function download(data: Blob | string, filename: string) {
  const url = typeof data === "string" ? data : URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.hidden = true;
  document.body.appendChild(a);
  try { a.click(); }
  finally { a.remove(); if (typeof data !== "string") setTimeout(() => URL.revokeObjectURL(url), 1000); }
}

export const fmtBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`;

export function acceptsFile(file: File, accept?: string) {
  return !accept || accept.split(",").some((rule) => {
    const r = rule.trim().toLowerCase();
    const extensions: Record<string, string[]> = { "image/*": ["png", "jpg", "jpeg", "webp", "gif", "bmp", "avif", "svg"], "audio/*": ["mp3", "wav", "ogg", "m4a", "aac", "flac", "opus"], "video/*": ["mp4", "webm", "mov", "m4v", "ogv"], "application/pdf": ["pdf"], "application/zip": ["zip"], "image/png": ["png"], "image/jpeg": ["jpg", "jpeg"] };
    const byName = (extensions[r] ?? []).some((ext) => file.name.toLowerCase().endsWith(`.${ext}`));
    return r.startsWith(".") ? file.name.toLowerCase().endsWith(r) : r.endsWith("/*") ? file.type.toLowerCase().startsWith(r.slice(0, -1)) || (!file.type && byName) : file.type.toLowerCase() === r || (!file.type && byName);
  });
}

export function FileDrop({ accept, multiple, onFiles, label, disabled = false }: { accept?: string; multiple?: boolean; onFiles: (f: File[]) => void | Promise<void>; label?: string; disabled?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const receiving = useRef(false);
  const locked = disabled || loading;
  const receive = async (files: File[]) => {
    if (locked || receiving.current || !files.length) return;
    if (files.some((f) => !acceptsFile(f, accept))) { setError(`Choose a supported file (${accept}).`); return; }
    setError(""); receiving.current = true; setLoading(true);
    try { await onFiles(multiple ? files : files.slice(0, 1)); }
    catch (e) { setError(e instanceof Error ? e.message : "The file could not be opened."); }
    finally { receiving.current = false; setLoading(false); }
  };
  return (
    <div className="space-y-3">
    <div
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-disabled={locked}
      aria-busy={loading}
      aria-label={label ?? (multiple ? "Choose files" : "Choose a file")}
      onKeyDown={(e) => { if (!locked && e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); ref.current?.click(); } }}
      onClick={(e) => { if (!locked && e.target !== ref.current) ref.current?.click(); }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); void receive(Array.from(e.dataTransfer.files)); }}
      className={`flex min-h-60 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-5 py-8 text-center transition-colors sm:min-h-72 ${over ? "border-primary bg-accent" : "border-border bg-secondary/30 hover:border-primary/60 hover:bg-accent/30"}`}
    >
      <span className="grid h-12 w-12 place-items-center rounded-lg border border-border bg-card text-primary"><Upload className="h-5 w-5" /></span>
      <div>
        <p className="font-medium">{loading ? "Opening files…" : label ?? (multiple ? "Drop files here or click to choose" : "Drop a file here or click to choose")}</p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 shrink-0" />Files stay on your device</p>
      </div>
      <input ref={ref} type="file" hidden accept={accept} multiple={multiple} disabled={locked}
        onChange={(e) => { void receive(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
    </div>
    {error && <ErrorNote>{error}</ErrorNote>}
    </div>
  );
}

export function Btn({ children, variant = "primary", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  return <Button {...p} variant={variant === "primary" ? "default" : "outline"}>{children}</Button>;
}

export function DownloadBtn({ onClick, children = "Download" }: { onClick: () => void; children?: ReactNode }) {
  return <Btn onClick={onClick}><Download className="h-4 w-4" />{children}</Btn>;
}

export function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => { setOk(false); setError(""); return () => clearTimeout(timer.current); }, [text]);
  return (
    <span className="inline-flex flex-col gap-1">
    <Btn variant="ghost" disabled={!text} onClick={async () => { setError(""); try { await navigator.clipboard.writeText(text); setOk(true); clearTimeout(timer.current); timer.current = setTimeout(() => setOk(false), 1200); } catch { setError("Copy failed. Select and copy the result manually."); } }}>
      {ok ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}{ok ? "Copied" : "Copy"}
    </Btn>
    {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
    </span>
  );
}

export function Area({ value, onChange, placeholder, rows = 10, readOnly, mono }: { value: string; onChange?: (v: string) => void; placeholder?: string; rows?: number; readOnly?: boolean; mono?: boolean }) {
  return (
    <textarea value={value} readOnly={readOnly} rows={rows} placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label={readOnly ? "Result" : placeholder ?? "Input"}
      className={`w-full resize-y rounded-lg border border-input bg-background p-4 text-sm leading-6 outline-none focus:ring-2 focus:ring-ring/40 ${mono ? "font-mono" : ""}`} />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-2 text-sm"><span className="text-xs font-medium text-muted-foreground">{label}</span>{children}</label>;
}

export const inputCls = "h-10 min-w-0 max-w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{children}</p>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return <div className="min-w-0 rounded-lg border border-border bg-secondary/40 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 break-words text-xl font-semibold tabular-nums">{value}</div></div>;
}

export function loadImage(file: File | string): Promise<HTMLImageElement> {
  const url = typeof file === "string" ? file : URL.createObjectURL(file);
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { if (typeof file !== "string") URL.revokeObjectURL(url); res(img); };
    img.onerror = () => { if (typeof file !== "string") URL.revokeObjectURL(url); rej(new Error("This file could not be read as an image.")); };
    img.src = url;
  });
}

export function canvasBlob(c: HTMLCanvasElement, type = "image/png", q?: number): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Export failed"))), type, q));
}

export const extFor = (type: string) => ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[type] ?? "png");
export const baseName = (n: string) => n.replace(/\.[^.]+$/, "");
