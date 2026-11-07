import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { generatePassword, integerInRange } from "@/lib/tool-processing";
import { Area, Btn, CopyBtn, DownloadBtn, ErrorNote, Field, Select, download, inputCls } from "./kit";

export function QrCodeGenerator() {
  const [text, setText] = useState("https://dovzo.com");
  const [size, setSize] = useState(320);
  const [fg, setFg] = useState("#171a2b");
  const [bg, setBg] = useState("#ffffff");
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    setUrl(""); setError("");
    if (!text) return;
    const timer = setTimeout(() => { void import("qrcode").then(({ default: QRCode }) => QRCode.toDataURL(text, { width: size, margin: 2, color: { dark: fg, light: bg } })).then((result) => { if (!cancelled) setUrl(result); }).catch(() => { if (!cancelled) setError("This content is too large for a QR code. Shorten it and try again."); }); }, 150);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [text, size, fg, bg]);
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <Field label="Content (URL, text, Wi‑Fi string…)"><Area value={text} onChange={setText} rows={4} /></Field>
        <div className="flex flex-wrap gap-3">
          <Field label={`Size ${size}px`}><input type="range" min={128} max={1024} step={32} value={size} onChange={(e) => setSize(+e.target.value)} /></Field>
          <Field label="Foreground"><input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-10 w-16 rounded-lg" /></Field>
          <Field label="Background"><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-10 w-16 rounded-lg" /></Field>
        </div>
        {url && <DownloadBtn onClick={() => download(url, "dovzo-qr.png")}>Download PNG</DownloadBtn>}
        {error && <ErrorNote>{error}</ErrorNote>}
      </div>
      <div className="grid h-64 w-64 place-items-center rounded-2xl bg-secondary p-4">{url ? <img src={url} alt="QR code preview" className="max-h-full" /> : <span className="text-sm text-muted-foreground">Enter content</span>}</div>
    </div>
  );
}

export function BarcodeGenerator() {
  const [text, setText] = useState("DOVZO-2026");
  const [fmt, setFmt] = useState("CODE128");
  const [err, setErr] = useState("");
  const ref = useRef<SVGSVGElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false; setReady(false); setErr("");
    void import("jsbarcode").then(({ default: JsBarcode }) => {
      if (cancelled || !ref.current) return;
      if (!text.trim()) throw new Error("Enter a value.");
      JsBarcode(ref.current, text, { format: fmt, displayValue: true, margin: 10 }); setReady(true);
    }).catch(() => { if (!cancelled) setErr(`"${text}" isn't valid for ${fmt}.`); });
    return () => { cancelled = true; };
  }, [text, fmt]);
  const save = () => { if (!ref.current || err) return; const svg = new XMLSerializer().serializeToString(ref.current); download(new Blob([svg], { type: "image/svg+xml" }), "barcode.svg"); };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Field label="Value"><input value={text} onChange={(e) => setText(e.target.value)} className={inputCls} /></Field>
        <Field label="Format"><Select value={fmt} onChange={setFmt} options={[["CODE128", "CODE128"], ["CODE39", "CODE39"], ["EAN13", "EAN-13"], ["EAN8", "EAN-8"], ["UPC", "UPC-A"], ["ITF14", "ITF-14"]]} /></Field>
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
      <div className="overflow-x-auto rounded-2xl bg-card p-4 ring-1 ring-border"><svg ref={ref} role="img" aria-label="Barcode preview" className={ready ? "" : "invisible"} /></div>
      {ready && <DownloadBtn onClick={save}>Download SVG</DownloadBtn>}
    </div>
  );
}

export function PasswordGenerator() {
  const [len, setLen] = useState(16);
  const [opt, setOpt] = useState({ upper: true, lower: true, digits: true, symbols: true });
  const [pw, setPw] = useState("");
  const gen = () => {
    const sets = [opt.upper && "ABCDEFGHJKLMNPQRSTUVWXYZ", opt.lower && "abcdefghijkmnopqrstuvwxyz", opt.digits && "23456789", opt.symbols && "!@#$%^&*()-_=+[]{};:,.?"].filter(Boolean) as string[];
    setPw(generatePassword(len, sets));
  };
  useEffect(gen, [len, opt]);
  const pool = [opt.upper && "ABCDEFGHJKLMNPQRSTUVWXYZ", opt.lower && "abcdefghijkmnopqrstuvwxyz", opt.digits && "23456789", opt.symbols && "!@#$%^&*()-_=+[]{};:,.?"].filter(Boolean).join("").length;
  const bits = pool ? Math.round(len * Math.log2(pool)) : 0;
  const strength = bits < 50 ? ["Weak", "bg-destructive"] : bits < 80 ? ["Good", "bg-warning"] : ["Strong", "bg-success"];
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 rounded-2xl bg-secondary p-4"><code className="flex-1 break-all font-mono text-lg">{pw || "Select at least one character set"}</code><Btn variant="ghost" onClick={gen} aria-label="Regenerate"><RefreshCw className="h-4 w-4" /></Btn><CopyBtn text={pw} /></div>
      <div className="flex items-center gap-3 text-sm"><div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary"><div className={`h-full ${strength[1]}`} style={{ width: `${Math.min(100, bits / 1.28)}%` }} /></div>{strength[0]} · {bits} bits</div>
      <Field label={`Length: ${len}`}><input type="range" min={4} max={64} value={len} onChange={(e) => setLen(+e.target.value)} /></Field>
      <div className="flex flex-wrap gap-4 text-sm">{(Object.keys(opt) as (keyof typeof opt)[]).map((k) => (
        <label key={k} className="flex items-center gap-2 capitalize"><input type="checkbox" checked={opt[k]} onChange={(e) => setOpt({ ...opt, [k]: e.target.checked })} />{k}</label>
      ))}</div>
    </div>
  );
}

export function RandomNumberGenerator() {
  const [min, setMin] = useState(1); const [max, setMax] = useState(100); const [n, setN] = useState(1); const [unique, setUnique] = useState(false);
  const [out, setOut] = useState<number[]>([]); const [err, setErr] = useState("");
  const gen = () => {
    setOut([]);
    try { integerInRange(min, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, "Minimum"); integerInRange(max, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, "Maximum"); integerInRange(n, 1, 1000, "Count"); if (!Number.isSafeInteger(max - min + 1)) throw new Error("Choose a smaller range."); }
    catch (e) { return setErr((e as Error).message); }
    if (min > max) return setErr("Minimum must be less than maximum.");
    if (unique && n > max - min + 1) return setErr("Not enough unique numbers in that range.");
    setErr(""); const s = new Set<number>(); const r: number[] = [];
    while (r.length < n) { const x = min + Math.floor(Math.random() * (max - min + 1)); if (unique && s.has(x)) continue; s.add(x); r.push(x); }
    setOut(r);
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Min"><input type="number" value={min} onChange={(e) => setMin(+e.target.value)} className={`${inputCls} w-28`} /></Field>
        <Field label="Max"><input type="number" value={max} onChange={(e) => setMax(+e.target.value)} className={`${inputCls} w-28`} /></Field>
        <Field label="Count"><input type="number" min={1} max={1000} value={n} onChange={(e) => setN(Math.max(1, Math.min(1000, +e.target.value)))} className={`${inputCls} w-24`} /></Field>
        <label className="flex h-10 items-center gap-2 text-sm"><input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} /> No repeats</label>
        <Btn onClick={gen}>Generate</Btn>
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
      {out.length > 0 && <div className="rounded-2xl bg-secondary p-6 text-center font-mono text-3xl font-semibold break-all">{out.join(", ")}</div>}
      {out.length > 0 && <CopyBtn text={out.join(", ")} />}
    </div>
  );
}

const rndHex = () => "#" + [0, 0, 0].map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("");
export function RandomColorGenerator() {
  const [cols, setCols] = useState<string[]>([]);
  const [error, setError] = useState(""); const [copied, setCopied] = useState("");
  useEffect(() => setCols(Array.from({ length: 5 }, rndHex)), []);
  const rgb = (h: string) => `rgb(${parseInt(h.slice(1, 3), 16)}, ${parseInt(h.slice(3, 5), 16)}, ${parseInt(h.slice(5, 7), 16)})`;
  return (
    <div className="space-y-4">
      <Btn onClick={() => setCols(Array.from({ length: 5 }, rndHex))}><RefreshCw className="h-4 w-4" /> New palette</Btn>
      <div className="grid gap-3 sm:grid-cols-5">{cols.map((c, i) => (
        <Button variant="ghost" key={i} onClick={async () => { try { await navigator.clipboard.writeText(c); setCopied(c); setError(""); } catch { setError("Copy failed. Select and copy the HEX value manually."); } }} className="block h-auto overflow-hidden rounded-lg p-0 ring-1 ring-border text-left" title="Copy HEX code" aria-label={`Copy ${c}`}>
          <div className="h-32" style={{ background: c }} />
          <div className="p-3"><div className="font-mono text-sm font-semibold uppercase">{c}</div><div className="text-xs text-muted-foreground">{rgb(c)}</div></div>
        </Button>
      ))}</div>
      {copied && <p role="status" className="text-xs text-muted-foreground">Copied {copied}</p>}
      {error && <ErrorNote>{error}</ErrorNote>}
    </div>
  );
}

export function CssGradientGenerator() {
  const [a, setA] = useState("#625cf5"); const [b, setB] = useState("#52bad0"); const [ang, setAng] = useState(135);
  const css = `background: linear-gradient(${ang}deg, ${a}, ${b});`;
  return (
    <div className="space-y-4">
      <div className="h-48 rounded-2xl ring-1 ring-border" style={{ background: `linear-gradient(${ang}deg, ${a}, ${b})` }} />
      <div className="flex flex-wrap items-end gap-4">
        <Field label="Start"><input type="color" value={a} onChange={(e) => setA(e.target.value)} className="h-10 w-16 rounded-lg" /></Field>
        <Field label="End"><input type="color" value={b} onChange={(e) => setB(e.target.value)} className="h-10 w-16 rounded-lg" /></Field>
        <Field label={`Angle ${ang}°`}><input type="range" min={0} max={360} value={ang} onChange={(e) => setAng(+e.target.value)} /></Field>
      </div>
      <div className="flex items-center gap-3"><code className="flex-1 rounded-xl bg-secondary p-3 font-mono text-sm">{css}</code><CopyBtn text={css} /></div>
    </div>
  );
}

export function CssBoxShadowGenerator() {
  const [s, setS] = useState({ x: 0, y: 12, blur: 32, spread: -8, alpha: 18 });
  const [color, setColor] = useState("#191f41"); const [inset, setInset] = useState(false);
  const hex = Math.round((s.alpha / 100) * 255).toString(16).padStart(2, "0");
  const val = `${inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${color}${hex}`;
  const css = `box-shadow: ${val};`;
  const sliders: [keyof typeof s, number, number][] = [["x", -50, 50], ["y", -50, 50], ["blur", 0, 100], ["spread", -50, 50], ["alpha", 0, 100]];
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-3">
        {sliders.map(([k, lo, hi]) => <Field key={k} label={`${k} ${s[k]}`}><input type="range" min={lo} max={hi} value={s[k]} onChange={(e) => setS({ ...s, [k]: +e.target.value })} /></Field>)}
        <div className="flex gap-4"><Field label="Color"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 rounded-lg" /></Field>
          <label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} /> Inset</label></div>
      </div>
      <div className="space-y-4">
        <div className="grid h-56 place-items-center rounded-2xl bg-secondary"><div className="h-28 w-28 rounded-2xl bg-card" style={{ boxShadow: val }} /></div>
        <div className="flex items-center gap-3"><code className="flex-1 rounded-xl bg-secondary p-3 font-mono text-xs">{css}</code><CopyBtn text={css} /></div>
      </div>
    </div>
  );
}
