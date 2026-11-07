import { useMemo, useState } from "react";
import { Area, Btn, CopyBtn, Field, Select, Stat, inputCls } from "./kit";

function InOut({ fn, controls, placeholder = "Paste or type text…" }: { fn: (s: string) => string; controls?: React.ReactNode; placeholder?: string }) {
  const [v, setV] = useState("");
  const out = useMemo(() => fn(v), [v, fn]);
  return (
    <div className="space-y-4">
      {controls && <div className="flex flex-wrap items-end gap-3">{controls}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <Area value={v} onChange={setV} placeholder={placeholder} rows={12} />
        <div className="space-y-2">
          <Area value={out} readOnly rows={12} placeholder="Result appears here" />
          <CopyBtn text={out} />
        </div>
      </div>
    </div>
  );
}

export function WordCounter() {
  const [v, setV] = useState("");
  const words = v.trim() ? v.trim().split(/\s+/).length : 0;
  const sentences = v.split(/[.!?]+/).filter((s) => s.trim()).length;
  const paras = v.split(/\n\s*\n/).filter((s) => s.trim()).length;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Words" value={words} />
        <Stat label="Characters" value={v.length} />
        <Stat label="No spaces" value={v.replace(/\s/g, "").length} />
        <Stat label="Sentences" value={sentences} />
        <Stat label="Paragraphs" value={paras} />
        <Stat label="Reading time" value={`${Math.max(words ? 1 : 0, Math.round(words / 230))} min`} />
      </div>
      <Area value={v} onChange={setV} placeholder="Start typing or paste text…" rows={14} />
    </div>
  );
}

const words = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1 $2").split(/[^A-Za-z0-9]+/).filter(Boolean);
export function CaseConverter() {
  const [mode, setMode] = useState("upper");
  const fns: Record<string, (s: string) => string> = {
    upper: (s) => s.toUpperCase(),
    lower: (s) => s.toLowerCase(),
    title: (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
    sentence: (s) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase()),
    camel: (s) => s.split("\n").map((l) => words(l).map((w, i) => (i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join("")).join("\n"),
    pascal: (s) => s.split("\n").map((l) => words(l).map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join("")).join("\n"),
    snake: (s) => s.split("\n").map((l) => words(l).join("_").toLowerCase()).join("\n"),
    kebab: (s) => s.split("\n").map((l) => words(l).join("-").toLowerCase()).join("\n"),
    alternating: (s) => [...s].map((c, i) => (i % 2 ? c.toUpperCase() : c.toLowerCase())).join(""),
  };
  return <InOut fn={fns[mode]} controls={<Field label="Convert to"><Select value={mode} onChange={setMode} options={[["upper", "UPPERCASE"], ["lower", "lowercase"], ["title", "Title Case"], ["sentence", "Sentence case"], ["camel", "camelCase"], ["pascal", "PascalCase"], ["snake", "snake_case"], ["kebab", "kebab-case"], ["alternating", "aLtErNaTiNg"]]} /></Field>} />;
}

export function DuplicateLineRemover() {
  const [ci, setCi] = useState(false);
  const [trim, setTrim] = useState(true);
  const fn = useMemo(() => (s: string) => {
    const seen = new Set<string>();
    return s.split("\n").filter((l) => { let k = trim ? l.trim() : l; if (ci) k = k.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).join("\n");
  }, [ci, trim]);
  return <InOut fn={fn} placeholder="One item per line…" controls={<>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ci} onChange={(e) => setCi(e.target.checked)} /> Ignore case</label>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={trim} onChange={(e) => setTrim(e.target.checked)} /> Ignore surrounding spaces</label>
  </>} />;
}

export function TextReverser() {
  const [mode, setMode] = useState("chars");
  const fn = useMemo(() => (s: string) => mode === "chars" ? [...s].reverse().join("") : mode === "words" ? s.split(/(\s+)/).reverse().join("") : s.split("\n").reverse().join("\n"), [mode]);
  return <InOut fn={fn} controls={<Field label="Reverse"><Select value={mode} onChange={setMode} options={[["chars", "Characters"], ["words", "Word order"], ["lines", "Line order"]]} /></Field>} />;
}

export function TextSorter() {
  const [mode, setMode] = useState("az");
  const fn = useMemo(() => (s: string) => {
    const l = s.split("\n");
    const c = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
    if (mode === "az") l.sort(c.compare);
    if (mode === "za") l.sort((a, b) => c.compare(b, a));
    if (mode === "num") l.sort((a, b) => parseFloat(a) - parseFloat(b));
    if (mode === "len") l.sort((a, b) => a.length - b.length);
    if (mode === "shuffle") for (let i = l.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [l[i], l[j]] = [l[j], l[i]]; }
    return l.join("\n");
  }, [mode]);
  return <InOut fn={fn} placeholder="One item per line…" controls={<Field label="Sort"><Select value={mode} onChange={setMode} options={[["az", "A → Z"], ["za", "Z → A"], ["num", "Numeric"], ["len", "By length"], ["shuffle", "Shuffle"]]} /></Field>} />;
}

export function TextDiffChecker() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const rows = useMemo(() => {
    const A = a.split("\n"), B = b.split("\n");
    const n = A.length, m = B.length;
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    const out: { t: "=" | "-" | "+"; s: string }[] = [];
    let i = 0, j = 0;
    while (i < n && j < m) { if (A[i] === B[j]) { out.push({ t: "=", s: A[i] }); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) out.push({ t: "-", s: A[i++] }); else out.push({ t: "+", s: B[j++] }); }
    while (i < n) out.push({ t: "-", s: A[i++] });
    while (j < m) out.push({ t: "+", s: B[j++] });
    return out;
  }, [a, b]);
  const changed = rows.filter((r) => r.t !== "=").length;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Original"><Area value={a} onChange={setA} rows={10} /></Field>
        <Field label="Changed"><Area value={b} onChange={setB} rows={10} /></Field>
      </div>
      {(a || b) && (
        <div className="overflow-hidden rounded-xl border border-border font-mono text-sm">
          <div className="border-b border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">{changed} changed line(s)</div>
          {rows.map((r, i) => (
            <div key={i} className={`whitespace-pre-wrap px-3 py-0.5 ${r.t === "-" ? "bg-destructive/10 text-destructive" : r.t === "+" ? "bg-success/10 text-success" : ""}`}>{r.t === "=" ? "  " : r.t + " "}{r.s || " "}</div>
          ))}
        </div>
      )}
    </div>
  );
}

const LOREM = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum".split(" ");
export function LoremIpsumGenerator() {
  const [n, setN] = useState(3);
  const [unit, setUnit] = useState("p");
  const [out, setOut] = useState("");
  const w = () => LOREM[Math.floor(Math.random() * LOREM.length)];
  const sentence = () => { const s = Array.from({ length: 8 + Math.floor(Math.random() * 8) }, w).join(" "); return s[0].toUpperCase() + s.slice(1) + "."; };
  const gen = () => setOut(unit === "w" ? Array.from({ length: n }, w).join(" ") : unit === "s" ? Array.from({ length: n }, sentence).join(" ") : Array.from({ length: n }, () => Array.from({ length: 5 }, sentence).join(" ")).join("\n\n"));
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <Field label="Amount"><input type="number" min={1} max={100} value={n} onChange={(e) => setN(Math.max(1, Math.min(100, +e.target.value)))} className={`${inputCls} w-24`} /></Field>
        <Field label="Unit"><Select value={unit} onChange={setUnit} options={[["p", "Paragraphs"], ["s", "Sentences"], ["w", "Words"]]} /></Field>
        <Btn onClick={gen}>Generate</Btn>
        <CopyBtn text={out} />
      </div>
      <Area value={out} readOnly rows={12} placeholder="Click Generate" />
    </div>
  );
}

export const slugify = (s: string) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export function SlugGenerator() {
  return <InOut fn={(s) => s.split("\n").map(slugify).join("\n")} placeholder="My Awesome Blog Post Title!" />;
}
