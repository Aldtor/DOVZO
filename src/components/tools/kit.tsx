import { useRef, useState, type ReactNode } from "react";
import { Check, Copy, Download, UploadCloud } from "lucide-react";

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
      onClick={() => ref.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(Array.from(e.dataTransfer.files)); }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition ${over ? "border-primary bg-accent" : "border-border bg-secondary/50 hover:border-primary/50"}`}
    >
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><UploadCloud className="h-6 w-6" /></span>
      <div>
        <p className="font-medium">{label ?? (multiple ? "Drop files here or click to choose" : "Drop a file here or click to choose")}</p>
        <p className="mt-1 text-xs text-muted-foreground">Processed on your device — nothing is uploaded.</p>
      </div>
      <input ref={ref} type="file" hidden accept={accept} multiple={multiple}
        onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
    </div>
  );
}

export function Btn({ children, variant = "primary", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" }) {
  const cls = variant === "primary"
    ? "bg-primary text-primary-foreground hover:opacity-90"
    : "border border-border bg-card hover:bg-secondary";
  return <button {...p} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${cls} ${p.className ?? ""}`}>{children}</button>;
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
      className={`w-full resize-y rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 ${mono ? "font-mono" : ""}`} />
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium text-muted-foreground">{label}</span>{children}</label>;
}

export const inputCls = "h-10 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{children}</p>;
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return <div className="rounded-xl bg-secondary p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-0.5 text-lg font-semibold">{value}</div></div>;
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
