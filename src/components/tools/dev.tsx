import { useEffect, useRef, useState } from "react";
import { encodeBase64, decodeBase64 } from "@/lib/tool-processing";
import { Area, Btn, CopyBtn, ErrorNote, Field, Select, inputCls } from "./kit";

function parseJson(s: string): { ok: boolean; v?: unknown; err?: string } {
  if (!s.trim()) return { ok: false };
  try { return { ok: true, v: JSON.parse(s) }; } catch (e) { return { ok: false, err: (e as Error).message }; }
}

export function JsonFormatter() {
  const [v, setV] = useState("");
  const [ind, setInd] = useState("2");
  const r = parseJson(v);
  const out = r.ok ? JSON.stringify(r.v, null, ind === "tab" ? "\t" : +ind) : "";
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3"><Field label="Indent"><Select value={ind} onChange={setInd} options={[["2", "2 spaces"], ["4", "4 spaces"], ["tab", "Tab"]]} /></Field><CopyBtn text={out} /></div>
      {r.err && <ErrorNote>{r.err}</ErrorNote>}
      <div className="grid gap-4 md:grid-cols-2">
        <Area value={v} onChange={setV} mono rows={16} placeholder='{"hello":"world"}' />
        <Area value={out} readOnly mono rows={16} />
      </div>
    </div>
  );
}

export function JsonValidator() {
  const [v, setV] = useState("");
  const r = parseJson(v);
  return (
    <div className="space-y-4">
      <Area value={v} onChange={setV} mono rows={14} placeholder="Paste JSON to validate" />
      {r.err && <ErrorNote>Invalid JSON — {r.err}</ErrorNote>}
      {r.ok && <p className="rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">Valid JSON · {Array.isArray(r.v) ? `array of ${r.v.length}` : typeof r.v === "object" && r.v ? `object with ${Object.keys(r.v).length} keys` : typeof r.v}</p>}
    </div>
  );
}

export function JsonMinifier() {
  const [v, setV] = useState("");
  const r = parseJson(v);
  const out = r.ok ? JSON.stringify(r.v) : "";
  return (
    <div className="space-y-4">
      {r.err && <ErrorNote>{r.err}</ErrorNote>}
      <div className="grid gap-4 md:grid-cols-2">
        <Area value={v} onChange={setV} mono rows={14} placeholder="Paste JSON" />
        <div className="space-y-2"><Area value={out} readOnly mono rows={14} />
          <div className="flex items-center gap-3"><CopyBtn text={out} />{out && <span className="text-xs text-muted-foreground">{v.length} → {out.length} chars</span>}</div></div>
      </div>
    </div>
  );
}

const b64enc = encodeBase64;
const b64dec = decodeBase64;

function Transform({ fn, placeholder }: { fn: (s: string) => string; placeholder: string }) {
  const [v, setV] = useState("");
  let out = "", err = "";
  try { out = v ? fn(v) : ""; } catch { err = "Input isn't valid for this conversion."; }
  return (
    <div className="space-y-4">
      {err && <ErrorNote>{err}</ErrorNote>}
      <div className="grid gap-4 md:grid-cols-2">
        <Area value={v} onChange={setV} mono rows={12} placeholder={placeholder} />
        <div className="space-y-2"><Area value={out} readOnly mono rows={12} /><CopyBtn text={out} /></div>
      </div>
    </div>
  );
}
export const Base64Encoder = () => <Transform fn={b64enc} placeholder="Text to encode" />;
export const Base64Decoder = () => <Transform fn={b64dec} placeholder="Base64 to decode" />;

export function UrlEncoderDecoder() {
  const [mode, setMode] = useState("enc");
  return (
    <div className="space-y-4">
      <Field label="Mode"><Select value={mode} onChange={setMode} options={[["enc", "Encode"], ["dec", "Decode"]]} /></Field>
      <Transform key={mode} fn={mode === "enc" ? encodeURIComponent : decodeURIComponent} placeholder={mode === "enc" ? "https://example.com/?q=hello world" : "hello%20world"} />
    </div>
  );
}

export function UuidGenerator() {
  const [n, setN] = useState(5);
  const [upper, setUpper] = useState(false);
  const [list, setList] = useState<string[]>(() => []);
  const gen = () => setList(Array.from({ length: n }, () => (upper ? crypto.randomUUID().toUpperCase() : crypto.randomUUID())));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="How many"><input type="number" min={1} max={500} value={n} onChange={(e) => setN(Math.max(1, Math.min(500, +e.target.value)))} className={`${inputCls} w-24`} /></Field>
        <label className="flex h-10 items-center gap-2 text-sm"><input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} /> Uppercase</label>
        <Btn onClick={gen}>Generate</Btn><CopyBtn text={list.join("\n")} />
      </div>
      <Area value={list.join("\n")} readOnly mono rows={12} placeholder="Click Generate" />
    </div>
  );
}

export function HashGenerator() {
  const [v, setV] = useState("");
  const [hashes, setHashes] = useState<[string, string][]>([]);
  const request = useRef(0);
  const [error, setError] = useState("");
  const run = async (s: string) => {
    const id = ++request.current;
    setV(s);
    setHashes([]); setError("");
    if (!s) return setHashes([]);
    try {
    const data = new TextEncoder().encode(s);
    const out: [string, string][] = [];
    for (const a of ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]) {
      const buf = await crypto.subtle.digest(a, data);
      out.push([a, [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("")]);
    }
    if (id === request.current) setHashes(out);
    } catch { if (id === request.current) setError("Hashing is unavailable in this browser."); }
  };
  return (
    <div className="space-y-4">
      <Area value={v} onChange={run} rows={6} placeholder="Text to hash" />
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="space-y-2">{hashes.map(([a, h]) => (
        <div key={a} className="flex items-center gap-3 rounded-xl bg-secondary p-3"><span className="w-20 text-xs font-semibold">{a}</span><code className="flex-1 break-all font-mono text-xs">{h}</code><CopyBtn text={h} /></div>
      ))}</div>
    </div>
  );
}

export function JwtDecoder() {
  const [v, setV] = useState("");
  const parts = v.trim().split(".");
  let header = "", payload = "", err = "", exp = "";
  if (v.trim()) {
    try {
      if (parts.length !== 3) throw new Error("JWTs must contain three parts.");
      const h = JSON.parse(b64dec(parts[0])); const p = JSON.parse(b64dec(parts[1]));
      if (!h || typeof h !== "object" || Array.isArray(h) || !p || typeof p !== "object" || Array.isArray(p)) throw new Error("Header and payload must be objects.");
      header = JSON.stringify(h, null, 2); payload = JSON.stringify(p, null, 2);
      if (typeof p.exp === "number") exp = `${new Date(p.exp * 1000).toLocaleString()} ${p.exp * 1000 < Date.now() ? "(expired)" : ""}`;
    } catch { err = "That doesn't look like a valid JWT."; }
  }
  return (
    <div className="space-y-4">
      <Area value={v} onChange={setV} mono rows={4} placeholder="eyJhbGciOi…" />
      {err && <ErrorNote>{err}</ErrorNote>}
      {header && <>
        <p className="text-xs text-muted-foreground">Decoded locally. The signature is not verified.{exp && ` Expires: ${exp}`}</p>
        <div className="grid gap-4 md:grid-cols-2"><Field label="Header"><Area value={header} readOnly mono rows={8} /></Field><Field label="Payload"><Area value={payload} readOnly mono rows={8} /></Field></div>
      </>}
    </div>
  );
}

export function RegexTester() {
  const [pat, setPat] = useState("\\b\\w+@\\w+\\.\\w+\\b");
  const [flags, setFlags] = useState("g");
  const [text, setText] = useState("Contact hello@dovzo.com or support@example.org");
  const [res, setRes] = useState<{ matches?: { index: number; value: string }[]; error?: string }>({ matches: [] });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let worker: Worker | undefined; let timeout: ReturnType<typeof setTimeout> | undefined;
    setBusy(true); setRes({ matches: [] });
    const debounce = setTimeout(() => {
      try {
        worker = new Worker(new URL("../../lib/regex.worker.ts", import.meta.url), { type: "module" });
        worker.onmessage = (event: MessageEvent<typeof res>) => { clearTimeout(timeout); setRes(event.data); setBusy(false); worker?.terminate(); };
        worker.onerror = () => { clearTimeout(timeout); setRes({ error: "Regex processing is unavailable in this browser." }); setBusy(false); worker?.terminate(); };
        timeout = setTimeout(() => { worker?.terminate(); setRes({ error: "This expression took too long. Simplify it or shorten the input." }); setBusy(false); }, 2000);
        worker.postMessage({ pattern: pat, flags, text });
      } catch { setRes({ error: "Regex processing is unavailable in this browser." }); setBusy(false); }
    }, 150);
    return () => { clearTimeout(debounce); clearTimeout(timeout); worker?.terminate(); };
  }, [pat, flags, text]);
  const nodes: React.ReactNode[] = []; let last = 0;
  (res.matches ?? []).forEach((match, i) => { nodes.push(text.slice(last, match.index)); nodes.push(<mark key={i} className="rounded bg-primary/25 text-foreground">{match.value}</mark>); last = match.index + match.value.length; });
  nodes.push(text.slice(last));
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Field label="Pattern"><input value={pat} onChange={(e) => setPat(e.target.value)} className={`${inputCls} w-full font-mono`} /></Field>
        <Field label="Flags"><input value={flags} onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))} className={`${inputCls} w-20 font-mono`} /></Field>
      </div>
      <Area value={text} onChange={setText} rows={6} />
      {busy ? <p role="status" className="text-sm text-muted-foreground">Checking expression…</p> : res.error ? <ErrorNote>{res.error}</ErrorNote> : <>
        <div className="whitespace-pre-wrap rounded-xl bg-secondary p-3 text-sm">{nodes}</div>
        <p role="status" className="text-sm text-muted-foreground">{res.matches?.length ?? 0} match(es){res.matches?.length === 1000 ? " · first 1,000 shown" : ""}</p>
      </>}
    </div>
  );
}
