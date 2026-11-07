import { useMemo, useState } from "react";
import { Area, Btn, CopyBtn, ErrorNote, Field, Select, inputCls } from "./kit";

function parseJson(s: string): { v?: unknown; err?: string } {
  if (!s.trim()) return {};
  try { return { v: JSON.parse(s) }; } catch (e) { return { err: (e as Error).message }; }
}

export function JsonFormatter() {
  const [v, setV] = useState("");
  const [ind, setInd] = useState("2");
  const r = parseJson(v);
  const out = r.v !== undefined ? JSON.stringify(r.v, null, ind === "tab" ? "\t" : +ind) : "";
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
      {r.v !== undefined && <p className="rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">Valid JSON · {Array.isArray(r.v) ? `array of ${r.v.length}` : typeof r.v === "object" && r.v ? `object with ${Object.keys(r.v).length} keys` : typeof r.v}</p>}
    </div>
  );
}

export function JsonMinifier() {
  const [v, setV] = useState("");
  const r = parseJson(v);
  const out = r.v !== undefined ? JSON.stringify(r.v) : "";
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

const b64enc = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s)));
const b64dec = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "")), (c) => c.charCodeAt(0)));

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
  const run = async (s: string) => {
    setV(s);
    if (!s) return setHashes([]);
    const data = new TextEncoder().encode(s);
    const out: [string, string][] = [];
    for (const a of ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]) {
      const buf = await crypto.subtle.digest(a, data);
      out.push([a, [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("")]);
    }
    setHashes(out);
  };
  return (
    <div className="space-y-4">
      <Area value={v} onChange={run} rows={6} placeholder="Text to hash" />
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
      if (parts.length < 2) throw 0;
      const h = JSON.parse(b64dec(parts[0])); const p = JSON.parse(b64dec(parts[1]));
      header = JSON.stringify(h, null, 2); payload = JSON.stringify(p, null, 2);
      if (p.exp) exp = `${new Date(p.exp * 1000).toLocaleString()} ${p.exp * 1000 < Date.now() ? "(expired)" : ""}`;
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
  const res = useMemo(() => {
    try {
      const re = new RegExp(pat, flags.includes("g") ? flags : flags + "g");
      const ms = [...text.matchAll(re)].filter((m) => m[0] !== "");
      const nodes: React.ReactNode[] = []; let last = 0;
      ms.forEach((m, i) => { nodes.push(text.slice(last, m.index)); nodes.push(<mark key={i} className="rounded bg-primary/25 text-foreground">{m[0]}</mark>); last = m.index! + m[0].length; });
      nodes.push(text.slice(last));
      return { ms, nodes };
    } catch (e) { return { err: (e as Error).message }; }
  }, [pat, flags, text]);
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Field label="Pattern"><input value={pat} onChange={(e) => setPat(e.target.value)} className={`${inputCls} w-full font-mono`} /></Field>
        <Field label="Flags"><input value={flags} onChange={(e) => setFlags(e.target.value.replace(/[^gimsuy]/g, ""))} className={`${inputCls} w-20 font-mono`} /></Field>
      </div>
      <Area value={text} onChange={setText} rows={6} />
      {"err" in res ? <ErrorNote>{res.err}</ErrorNote> : <>
        <div className="whitespace-pre-wrap rounded-xl bg-secondary p-3 text-sm">{res.nodes}</div>
        <p className="text-sm text-muted-foreground">{res.ms!.length} match(es)</p>
      </>}
    </div>
  );
}
