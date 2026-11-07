import { useRef, useState, type ReactNode } from "react";
import { Check, Copy, Download, Upload, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function download(data: Blob | string, filename: string) {
  const url = typeof data === "string" ? data : URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  if (typeof data !== "string") setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const fmtBytes = (n: number) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`;

export function FileDrop({ accept, multiple, onFiles, label }: { accept?: string; multiple?: boolean; onFiles: (f: File[]) => void; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label ?? (multiple ? "Choose files" : "Choose a file")}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ref.current?.click(); } }}
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(Array.from(e.dataTransfer.files)); }}
      className={`flex min-h-60 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border border-dashed px-5 py-8 text-center transition-colors sm:min-h-72 ${over ? "border-primary bg-accent" : "border-border bg-secondary/30 hover:border-primary/60 hover:bg-accent/30"}`}
    >
      <span className="grid h-12 w-12 place-items-center rounded-lg border border-border bg-card text-primary"><Upload className="h-5 w-5" /></span>
      <div>
        <p className="font-medium">{label ?? (multiple ? "Drop files here or click to choose" : "Drop a file here or click to choose")}</p>
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 shrink-0" />Files stay on your device</p>
      </div>
      <input ref={ref} type="file" hidden accept={accept} multiple={multiple}
        onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
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
  return (
    <Btn variant="ghost" disabled={!text} onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); }}>
      {ok ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}{ok ? "Copied" : "Copy"}
    </Btn>
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
  return <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{children}</p>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return <div className="min-w-0 rounded-lg border border-border bg-secondary/40 p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 break-words text-xl font-semibold tabular-nums">{value}</div></div>;
}

export function loadImage(file: File | string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("This file could not be read as an image."));
    img.src = typeof file === "string" ? file : URL.createObjectURL(file);
  });
}

export function canvasBlob(c: HTMLCanvasElement, type = "image/png", q?: number): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Export failed"))), type, q));
}

export const extFor = (type: string) => ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }[type] ?? "png");
export const baseName = (n: string) => n.replace(/\.[^.]+$/, "");
