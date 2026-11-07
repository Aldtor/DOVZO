import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { PDFDocument } from "pdf-lib";
import { ArrowDown, ArrowUp, FileText, Loader2, X } from "lucide-react";

import { Btn, DownloadBtn, ErrorNote, FileDrop, Field, Select, baseName, canvasBlob, download, fmtBytes, inputCls } from "./kit";

const toBlob = (b: Uint8Array) => new Blob([b as BlobPart], { type: "application/pdf" });
async function loadPdf(f: File) {
  try { const { PDFDocument } = await import("pdf-lib"); return await PDFDocument.load(await f.arrayBuffer()); }
  catch { throw new Error(`"${f.name}" couldn't be opened. It may be encrypted or damaged.`); }
}

function useBusy() {
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const run = async (fn: () => Promise<void>) => { setBusy(true); setErr(""); try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };
  return { busy, err, run, setErr };
}

function FileRow({ f, onUp, onDown, onRemove, disabled }: { disabled?: boolean; f: File; onUp?: () => void; onDown?: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-sm">
      <FileText className="h-4 w-4 text-destructive" /><span className="flex-1 truncate">{f.name}</span><span className="text-xs text-muted-foreground">{fmtBytes(f.size)}</span>
      {onUp && <Button variant="ghost" size="icon" disabled={disabled} onClick={onUp} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>}
      {onDown && <Button variant="ghost" size="icon" disabled={disabled} onClick={onDown} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>}
      <Button variant="ghost" size="icon" disabled={disabled} onClick={onRemove} aria-label="Remove"><X className="h-4 w-4" /></Button>
    </div>
  );
}

const move = <T,>(a: T[], i: number, d: number) => { const b = [...a]; [b[i], b[i + d]] = [b[i + d], b[i]]; return b; };

export function PdfMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const { busy, err, run } = useBusy();
  const merge = () => run(async () => {
    const { PDFDocument } = await import("pdf-lib"); const out = await PDFDocument.create();
    for (const f of files) { const d = await loadPdf(f); (await out.copyPages(d, d.getPageIndices())).forEach((p) => out.addPage(p)); }
    download(toBlob(await out.save()), "merged.pdf");
  });
  return (
    <div className="space-y-4">
      <FileDrop accept="application/pdf" disabled={busy} multiple onFiles={(fs) => setFiles((p) => [...p, ...fs])} label="Add PDFs to merge" />
      <div className="space-y-2">{files.map((f, i) => <FileRow key={i + f.name} f={f} disabled={busy} onUp={i ? () => setFiles(move(files, i, -1)) : undefined} onDown={i < files.length - 1 ? () => setFiles(move(files, i, 1)) : undefined} onRemove={() => setFiles(files.filter((_, j) => j !== i))} />)}</div>
      {err && <ErrorNote>{err}</ErrorNote>}
      <Btn disabled={files.length < 2 || busy} onClick={merge}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Merge {files.length} PDFs</Btn>
    </div>
  );
}

function SinglePdf({ children }: { children: (f: File, doc: PDFDocument, reset: () => void) => React.ReactNode }) {
  const [f, setF] = useState<File | null>(null); const [doc, setDoc] = useState<PDFDocument | null>(null); const [err, setErr] = useState("");
  if (!f || !doc) return <div className="space-y-3"><FileDrop accept="application/pdf" onFiles={async (fs) => { if (!fs[0]) return; try { setDoc(await loadPdf(fs[0])); setF(fs[0]); setErr(""); } catch (e) { setErr((e as Error).message); } }} />{err && <ErrorNote>{err}</ErrorNote>}</div>;
  return <div className="space-y-4"><div className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-sm"><FileText className="h-4 w-4 text-destructive" /><span className="flex-1 truncate">{f.name}</span><span className="text-xs text-muted-foreground">{doc.getPageCount()} pages · {fmtBytes(f.size)}</span></div>{children(f, doc, () => { setF(null); setDoc(null); })}</div>;
}

export function parseRanges(s: string, max: number): number[] {
  if (!s.trim()) throw new Error("Enter at least one page or range.");
  const out: number[] = [];
  for (const part of s.split(",").map((x) => x.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/); if (!m) throw new Error(`"${part}" isn't a valid page or range.`);
    const a = +m[1], b = m[2] ? +m[2] : a;
    if (a < 1 || b > max || a > b) throw new Error(`Pages must be between 1 and ${max}.`);
    for (let i = a; i <= b; i++) out.push(i - 1);
  }
  if (!out.length) throw new Error("Enter at least one page or range.");
  return out;
}

async function pick(doc: PDFDocument, idx: number[]) { const { PDFDocument } = await import("pdf-lib"); const out = await PDFDocument.create(); (await out.copyPages(doc, idx)).forEach((p) => out.addPage(p)); return out.save(); }

export function PdfSplitter() {
  const { busy, err, run } = useBusy();
  return <SinglePdf>{(f, doc) => <>
    <p className="text-sm text-muted-foreground">Each page becomes its own PDF, bundled in a ZIP.</p>
    {err && <ErrorNote>{err}</ErrorNote>}
    <Btn disabled={busy} onClick={() => run(async () => { const { default: JSZip } = await import("jszip"); const z = new JSZip(); for (const i of doc.getPageIndices()) z.file(`${baseName(f.name)}-page-${i + 1}.pdf`, await pick(doc, [i])); download(await z.generateAsync({ type: "blob" }), `${baseName(f.name)}-split.zip`); })}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Split into {doc.getPageCount()} files</Btn>
  </>}</SinglePdf>;
}

export function PdfPageExtractor() {
  const [r, setR] = useState("1"); const { busy, err, run } = useBusy();
  return <SinglePdf>{(f, doc) => <>
    <Field label="Pages (e.g. 1-3, 5, 8)"><input value={r} onChange={(e) => setR(e.target.value)} className={inputCls} /></Field>
    {err && <ErrorNote>{err}</ErrorNote>}
    <Btn disabled={busy} onClick={() => run(async () => download(toBlob(await pick(doc, parseRanges(r, doc.getPageCount()))), `${baseName(f.name)}-extract.pdf`))}>Extract pages</Btn>
  </>}</SinglePdf>;
}

export function PdfPageReorder() {
  const [order, setOrder] = useState<number[] | null>(null); const { busy, err, run } = useBusy();
  return <SinglePdf>{(f, doc) => {
    const indices = doc.getPageIndices();
    const o = order && order.length === indices.length && order.every((p) => indices.includes(p)) ? order : indices;
    return <>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{o.map((p, i) => (
        <div key={p} className="bento flex flex-col items-center gap-2 p-2 text-sm"><span className="text-lg font-semibold">{p + 1}</span>
          <div className="flex flex-wrap justify-center gap-1"><Button variant="ghost" size="icon" disabled={!i} onClick={() => setOrder(move(o, i, -1))} aria-label="Earlier" className="disabled:opacity-30"><ArrowUp className="h-4 w-4 -rotate-90" /></Button><Button variant="ghost" size="icon" disabled={i === o.length - 1} onClick={() => setOrder(move(o, i, 1))} aria-label="Later" className="disabled:opacity-30"><ArrowDown className="h-4 w-4 -rotate-90" /></Button></div></div>
      ))}</div>
      {err && <ErrorNote>{err}</ErrorNote>}
      <Btn disabled={busy} onClick={() => run(async () => download(toBlob(await pick(doc, o)), `${baseName(f.name)}-reordered.pdf`))}>Save new order</Btn>
    </>;
  }}</SinglePdf>;
}

export function PdfRotator() {
  const [deg, setDeg] = useState("90"); const { busy, err, run } = useBusy();
  return <SinglePdf>{(f) => <>
    <Field label="Rotate all pages"><Select value={deg} onChange={setDeg} options={[["90", "90° clockwise"], ["180", "180°"], ["270", "90° counter‑clockwise"]]} /></Field>
    {err && <ErrorNote>{err}</ErrorNote>}
    <Btn disabled={busy} onClick={() => run(async () => { const { degrees } = await import("pdf-lib"); const d = await loadPdf(f); d.getPages().forEach((p) => p.setRotation(degrees((p.getRotation().angle + +deg) % 360))); download(toBlob(await d.save()), `${baseName(f.name)}-rotated.pdf`); })}>Rotate & download</Btn>
  </>}</SinglePdf>;
}

export function PdfCompressor() {
  const [res, setRes] = useState<{ blob: Blob; before: number } | null>(null); const { busy, err, run } = useBusy();
  return <SinglePdf>{(f, doc) => <>
    <p className="text-sm text-muted-foreground">Rebuilds the file structure with compressed object streams and strips metadata. Savings depend on the PDF — image-heavy files may shrink very little.</p>
    {err && <ErrorNote>{err}</ErrorNote>}
    <Btn disabled={busy} onClick={() => run(async () => { doc.setTitle(""); doc.setAuthor(""); doc.setSubject(""); doc.setKeywords([]); doc.setProducer(""); doc.setCreator(""); setRes({ blob: toBlob(await doc.save({ useObjectStreams: true })), before: f.size }); })}>Compress</Btn>
    {res && <div className="flex items-center gap-4 text-sm"><span>{fmtBytes(res.before)} → <b>{fmtBytes(res.blob.size)}</b> ({res.blob.size < res.before ? `${Math.round((1 - res.blob.size / res.before) * 100)}% smaller` : "no reduction possible"})</span><DownloadBtn onClick={() => download(res.blob, `${baseName(f.name)}-compressed.pdf`)} /></div>}
  </>}</SinglePdf>;
}

export function ImagesToPdf() {
  const [files, setFiles] = useState<File[]>([]); const { busy, err, run } = useBusy();
  const make = () => run(async () => {
    const { PDFDocument } = await import("pdf-lib"); const out = await PDFDocument.create();
    for (const f of files) {
      const bytes = await f.arrayBuffer();
      const signature = new Uint8Array(bytes); const img = signature[0] === 137 && signature[1] === 80 ? await out.embedPng(bytes) : signature[0] === 255 && signature[1] === 216 ? await out.embedJpg(bytes) : null;
      if (!img) throw new Error(`${f.name}: only JPG and PNG are supported.`);
      out.addPage([img.width, img.height]).drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    download(toBlob(await out.save()), "images.pdf");
  });
  return (
    <div className="space-y-4">
      <FileDrop accept="image/png,image/jpeg" disabled={busy} multiple onFiles={(fs) => setFiles((p) => [...p, ...fs])} label="Add JPG or PNG images" />
      <div className="space-y-2">{files.map((f, i) => <FileRow key={i + f.name} f={f} disabled={busy} onUp={i ? () => setFiles(move(files, i, -1)) : undefined} onDown={i < files.length - 1 ? () => setFiles(move(files, i, 1)) : undefined} onRemove={() => setFiles(files.filter((_, j) => j !== i))} />)}</div>
      {err && <ErrorNote>{err}</ErrorNote>}
      <Btn disabled={!files.length || busy} onClick={make}>Create PDF</Btn>
    </div>
  );
}

export function PdfToImages() {
  const [f, setF] = useState<File | null>(null);
  const [pages, setPages] = useState<{ url: string; blob: Blob }[]>([]);
  const urls = useRef<string[]>([]);
  const cancel = useRef<(() => void) | undefined>(undefined);
  const generation = useRef(0);
  useEffect(() => () => { generation.current++; cancel.current?.(); urls.current.forEach((url) => URL.revokeObjectURL(url)); }, []);
  const [scale, setScale] = useState("2");
  const { busy, err, run } = useBusy();
  const convert = (file: File) => run(async () => {
    const id = ++generation.current;
    urls.current.forEach((url) => URL.revokeObjectURL(url)); urls.current = [];
    setF(file); setPages([]);
    const pdfjs = await import("pdfjs-dist");
    const worker = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
    if (id !== generation.current) return;
    pdfjs.GlobalWorkerOptions.workerSrc = worker;
    const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
    cancel.current = () => { void task.destroy(); };
    const out: { url: string; blob: Blob }[] = [];
    try {
      const doc = await task.promise;
      for (let i = 1; i <= doc.numPages && id === generation.current; i++) {
        const page = await doc.getPage(i); const vp = page.getViewport({ scale: +scale });
        if (vp.width * vp.height > 40000000) throw new Error("This page exceeds 40 megapixels. Choose a lower resolution.");
        const c = document.createElement("canvas"); c.width = vp.width; c.height = vp.height;
        try {
          const ctx = c.getContext("2d"); if (!ctx) throw new Error("Canvas processing is unavailable.");
          await page.render({ canvas: c, canvasContext: ctx, viewport: vp }).promise;
          const blob = await canvasBlob(c);
          if (id !== generation.current) break;
          const url = URL.createObjectURL(blob); urls.current.push(url); out.push({ url, blob }); setPages([...out]);
        } finally { page.cleanup(); c.width = 0; c.height = 0; }
      }
    } finally { cancel.current = undefined; await task.destroy(); }
  });
  const zipAll = () => run(async () => { if (!f) return; const { default: JSZip } = await import("jszip"); const z = new JSZip(); pages.forEach((p, i) => z.file(`page-${i + 1}.png`, p.blob)); download(await z.generateAsync({ type: "blob" }), `${baseName(f.name)}-images.zip`); });
  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3"><Field label="Resolution"><Select value={scale} onChange={setScale} options={[["1", "Standard (72 dpi)"], ["2", "High (144 dpi)"], ["3", "Print (216 dpi)"]]} /></Field></div>
      <FileDrop accept="application/pdf" disabled={busy} onFiles={async (fs) => { if (fs[0]) await convert(fs[0]); }} />
      {err && <ErrorNote>{err}</ErrorNote>}
      {busy && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Rendering page {pages.length + 1}…</p>}
      {pages.length > 0 && !busy && <DownloadBtn onClick={zipAll}>Download all ({pages.length}) as ZIP</DownloadBtn>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{pages.map((p, i) => <Button variant="ghost" size="icon" key={i} onClick={() => download(p.url, `page-${i + 1}.png`)} aria-label={`Download page ${i + 1}`} className="bento bento-hover h-auto w-full flex-col overflow-hidden p-2 text-xs"><img src={p.url} alt={`Page ${i + 1}`} className="w-full rounded-lg" /><span className="mt-1 block">Page {i + 1}</span></Button>)}</div>
    </div>
  );
}
