import { useEffect, useRef, useState } from "react";
import type JSZip from "jszip";
import { Button } from "@/components/ui/button";
import { waitForClip } from "@/lib/media-lifecycle";
import { File as FileIcon, Loader2, X } from "lucide-react";
import { MAX_BROWSER_BYTES, uniqueArchiveName, validateClip, validateFileBudget } from "@/lib/tool-processing";
import { Btn, DownloadBtn, ErrorNote, FileDrop, Field, Stat, baseName, canvasBlob, download, fmtBytes, inputCls } from "./kit";

export function ZipCreator() {
  const [files, setFiles] = useState<File[]>([]); const [name, setName] = useState("archive"); const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const make = async () => { setBusy(true); setErr(""); try { validateFileBudget(files); const { default: JSZip } = await import("jszip"); const z = new JSZip(); const used = new Set<string>(); files.forEach((f) => z.file(uniqueArchiveName(f.name, used), f)); download(await z.generateAsync({ type: "blob", compression: "DEFLATE" }), `${name || "archive"}.zip`); } catch (e) { setErr(e instanceof Error ? e.message : "The ZIP could not be created. Try fewer or smaller files."); } finally { setBusy(false); } };
  const total = files.reduce((s, f) => s + f.size, 0);
  return (
    <div className="space-y-4">
      <FileDrop multiple disabled={busy} onFiles={(fs) => setFiles((p) => [...p, ...fs])} label="Add files to the ZIP" />
      {err && <ErrorNote>{err}</ErrorNote>}
      <div className="space-y-2">{files.map((f, i) => <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-sm"><FileIcon className="h-4 w-4" /><span className="flex-1 truncate">{f.name}</span><span className="text-xs text-muted-foreground">{fmtBytes(f.size)}</span><Button variant="ghost" size="icon" disabled={busy} onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Remove"><X className="h-4 w-4" /></Button></div>)}</div>
      {files.length > 0 && <div className="flex flex-wrap items-end gap-3"><Field label="ZIP name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field><Btn disabled={busy} onClick={make}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Create ZIP ({files.length} files, {fmtBytes(total)})</Btn></div>}
    </div>
  );
}

export function ZipExtractor() {
  const [entries, setEntries] = useState<JSZip.JSZipObject[]>([]); const [err, setErr] = useState(""); const [zipName, setZipName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const extract = async (entry: JSZip.JSZipObject) => {
    setExtracting(true); setErr("");
    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        const chunks: Uint8Array[] = []; let bytes = 0;
        const stream = entry.internalStream("uint8array");
        stream.on("data", (chunk) => { bytes += chunk.length; if (bytes > MAX_BROWSER_BYTES) { stream.pause(); reject(new Error("This extracted file exceeds 100 MiB.")); return; } chunks.push(chunk); });
        stream.on("error", reject); stream.on("end", () => resolve(new Blob(chunks as BlobPart[]))); stream.resume();
      });
      download(blob, entry.name.split("/").pop() ?? "file");
    } catch (e) { setErr(e instanceof Error ? e.message : "The ZIP entry could not be extracted."); } finally { setExtracting(false); }
  };
  const open = async (fs: File[]) => { const f = fs[0]; if (!f) return; setEntries([]); setZipName(""); try { const { default: JSZip } = await import("jszip"); const z = await JSZip.loadAsync(f); setEntries(Object.values(z.files).filter((e) => !e.dir)); setZipName(f.name); setErr(""); } catch { setErr("That file isn't a readable ZIP archive."); } };
  return (
    <div className="space-y-4">
      <FileDrop accept=".zip,application/zip" disabled={extracting} onFiles={open} label="Drop a ZIP file" />
      {err && <ErrorNote>{err}</ErrorNote>}
      {entries.length > 0 && <p className="text-sm text-muted-foreground">{zipName} · {entries.length} files</p>}
      {zipName && !entries.length && <p role="status" className="text-sm text-muted-foreground">This ZIP contains no files.</p>}
      <div className="space-y-2">{entries.map((e) => (
        <div key={e.name} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-sm"><FileIcon className="h-4 w-4" /><span className="flex-1 truncate font-mono text-xs">{e.name}</span>
          <Btn variant="ghost" disabled={extracting} onClick={() => extract(e)} aria-label={`Download ${e.name}`}>Download</Btn></div>
      ))}</div>
    </div>
  );
}

export function FileInformationViewer() {
  const [f, setF] = useState<File | null>(null); const [sha, setSha] = useState("");
  const request = useRef(0); const [err, setErr] = useState("");
  const pick = async (fs: File[]) => { const x = fs[0]; if (!x) return; const id = ++request.current; setF(x); setSha(""); setErr(""); try { const h = await crypto.subtle.digest("SHA-256", await x.arrayBuffer()); if (id === request.current) setSha([...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("")); } catch { if (id === request.current) setErr("The checksum could not be calculated."); } };
  return (
    <div className="space-y-4">
      <FileDrop onFiles={pick} />
      {err && <ErrorNote>{err}</ErrorNote>}
      {f && <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Name" value={<span className="break-all text-sm">{f.name}</span>} />
        <Stat label="Size" value={`${fmtBytes(f.size)}`} />
        <Stat label="Bytes" value={f.size.toLocaleString()} />
        <Stat label="MIME type" value={<span className="text-sm">{f.type || "unknown"}</span>} />
        <Stat label="Extension" value={f.name.includes(".") ? f.name.split(".").pop()?.toUpperCase() : "—"} />
        <Stat label="Last modified" value={<span className="text-sm">{new Date(f.lastModified).toLocaleString()}</span>} />
        <div className="col-span-full"><Stat label="SHA-256" value={<code className="break-all font-mono text-xs">{sha || (err ? "Unavailable" : "Calculating…")}</code>} /></div>
      </div>}
    </div>
  );
}

function encodeWav(buf: AudioBuffer, start: number, end: number) {
  validateClip(start, end, buf.duration);
  const sr = buf.sampleRate, ch = buf.numberOfChannels, s = Math.floor(start * sr), e = Math.floor(end * sr), len = e - s;
  validateFileBudget([{ size: 44 + len * ch * 2 }]);
  const out = new DataView(new ArrayBuffer(44 + len * ch * 2));
  const w = (o: number, str: string) => [...str].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); out.setUint32(4, 36 + len * ch * 2, true); w(8, "WAVEfmt "); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, ch, true);
  out.setUint32(24, sr, true); out.setUint32(28, sr * ch * 2, true); out.setUint16(32, ch * 2, true); out.setUint16(34, 16, true); w(36, "data"); out.setUint32(40, len * ch * 2, true);
  const data = Array.from({ length: ch }, (_, c) => buf.getChannelData(c));
  let o = 44;
  for (let i = s; i < e; i++) for (let c = 0; c < ch; c++) { const v = Math.max(-1, Math.min(1, data[c][i])); out.setInt16(o, v < 0 ? v * 0x8000 : v * 0x7fff, true); o += 2; }
  return new Blob([out], { type: "audio/wav" });
}

function RangeControls({ dur, a, b, setA, setB }: { dur: number; a: number; b: number; setA: (n: number) => void; setB: (n: number) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={`Start ${a.toFixed(1)}s`}><input type="range" min={0} max={dur} step={0.01} value={a} onChange={(e) => setA(Math.max(0, Math.min(+e.target.value, b - Math.min(0.01, dur / 2))))} /></Field>
      <Field label={`End ${b.toFixed(1)}s`}><input type="range" min={0} max={dur} step={0.01} value={b} onChange={(e) => setB(Math.min(dur, Math.max(+e.target.value, a + Math.min(0.01, dur / 2))))} /></Field>
    </div>
  );
}

export function AudioTrimmer() {
  const [f, setF] = useState<File | null>(null); const [buf, setBuf] = useState<AudioBuffer | null>(null); const [a, setA] = useState(0); const [b, setB] = useState(0); const [err, setErr] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => { if (!f) return; const src = URL.createObjectURL(f); setUrl(src); return () => URL.revokeObjectURL(src); }, [f]);
  const pick = async (fs: File[]) => { const x = fs[0]; if (!x) return; let ctx: AudioContext | undefined; try { ctx = new AudioContext(); const d = await ctx.decodeAudioData(await x.arrayBuffer()); if (!d.length) throw new Error("Empty audio."); setBuf(d); setF(x); setA(0); setB(d.duration); setErr(""); } catch { setErr("Your browser can't decode this audio file."); } finally { if (ctx) await ctx.close(); } };
  return (
    <div className="space-y-4">
      {!buf && <FileDrop accept="audio/*" onFiles={pick} />}
      {err && <ErrorNote>{err}</ErrorNote>}
      {buf && f && <>
        <audio controls src={url} className="w-full" />
        <RangeControls dur={buf.duration} a={a} b={b} setA={setA} setB={setB} />
        <p className="text-sm text-muted-foreground">Clip length {(b - a).toFixed(1)}s · exported as WAV</p>
        <div className="flex gap-3"><DownloadBtn onClick={() => { try { download(encodeWav(buf, a, b), `${baseName(f.name)}-trimmed.wav`); } catch (e) { setErr((e as Error).message); } }}>Download WAV</DownloadBtn><Btn variant="ghost" onClick={() => { setBuf(null); setF(null); setErr(""); }}>Choose another</Btn></div>
      </>}
    </div>
  );
}

function useVideo() {
  const [url, setUrl] = useState(""); const [name, setName] = useState(""); const [dur, setDur] = useState(0);
  const [error, setError] = useState(""); const [ready, setReady] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);
  const abort = useRef(new AbortController());
  useEffect(() => { abort.current = new AbortController(); return () => { abort.current.abort(); }; }, []);
  useEffect(() => () => { if (url) URL.revokeObjectURL(url); }, [url]);
  const pick = (fs: File[]) => { const x = fs[0]; if (!x) return; setError(""); setReady(false); setDur(0); setUrl(URL.createObjectURL(x)); setName(x.name); };
  const loaded = (el: HTMLVideoElement) => { if (!Number.isFinite(el.duration) || !el.videoWidth) { setError("This video has no readable duration or frames."); return; } setDur(el.duration); setReady(true); };
  return { url, name, dur, setDur, ref, pick, ready, error, loaded, abort, fail: () => { setReady(false); setError("Your browser cannot decode this video. Try a supported MP4 or WebM file."); }, reset: () => { setUrl(""); setDur(0); setReady(false); setError(""); } };
}
const seek = (v: HTMLVideoElement, t: number) => new Promise<void>((resolve, reject) => {
  if (v.readyState >= 2 && Math.abs(v.currentTime - t) < 0.001) { resolve(); return; }
  const cleanup = () => { clearTimeout(timer); v.removeEventListener("seeked", done); v.removeEventListener("error", fail); };
  const done = () => { cleanup(); resolve(); }; const fail = () => { cleanup(); reject(new Error("This video frame could not be decoded.")); };
  const timer = setTimeout(fail, 10000); v.addEventListener("seeked", done, { once: true }); v.addEventListener("error", fail, { once: true }); v.currentTime = t;
});

export function VideoFrameExtractor() {
  const v = useVideo(); const [frames, setFrames] = useState<{ t: number; url: string }[]>([]);
  const urls = useRef<string[]>([]); const [error, setError] = useState("");
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);
  const grab = async () => {
    const el = v.ref.current; if (!el || !v.ready || el.readyState < 2) return;
    const c = document.createElement("canvas"); c.width = el.videoWidth; c.height = el.videoHeight;
    try { const ctx = c.getContext("2d"); if (!ctx) throw new Error("Canvas processing unavailable."); ctx.drawImage(el, 0, 0); const t = el.currentTime; const blob = await canvasBlob(c); if (v.abort.current.signal.aborted) return; const url = URL.createObjectURL(blob); urls.current.push(url); setFrames((f) => [...f, { t, url }]); setError(""); }
    catch { setError("The frame could not be exported."); } finally { c.width = 0; c.height = 0; }
  };
  if (!v.url) return <FileDrop accept="video/*" onFiles={v.pick} />;
  return (
    <div className="space-y-4">
      <video ref={v.ref} src={v.url} controls playsInline onLoadedData={(e) => v.loaded(e.currentTarget)} onError={v.fail} className="max-h-96 w-full rounded-2xl bg-foreground" />
      {(v.error || error) && <ErrorNote>{v.error || error}</ErrorNote>}
      <div className="flex gap-3"><Btn disabled={!v.ready} onClick={grab}>Capture current frame</Btn><Btn variant="ghost" onClick={() => { urls.current.forEach((url) => URL.revokeObjectURL(url)); urls.current = []; setFrames([]); setError(""); v.reset(); }}>Choose another</Btn></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{frames.map((f, i) => <Button variant="ghost" key={i} onClick={() => download(f.url, `${baseName(v.name)}-${f.t.toFixed(2)}s.png`)} className="bento bento-hover h-auto w-full flex-col p-2 text-xs"><img src={f.url} alt={`Frame at ${f.t.toFixed(2)}s`} className="w-full rounded-lg" />{f.t.toFixed(2)}s · Download</Button>)}</div>
    </div>
  );
}

export function VideoTrimmer() {
  const v = useVideo(); const [a, setA] = useState(0); const [b, setB] = useState(0); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const active = useRef<{ recorder: MediaRecorder; stream: MediaStream } | null>(null);
  useEffect(() => () => { const job = active.current; if (job?.recorder.state !== "inactive") job?.recorder.stop(); job?.stream.getTracks().forEach((track) => track.stop()); }, []);
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => { setSupported("MediaRecorder" in window && "captureStream" in HTMLVideoElement.prototype); }, []);
  const trim = async () => {
    const el = v.ref.current; if (!el || !v.ready) return; setBusy(true); setErr("");
    let recorder: MediaRecorder | undefined; let stream: MediaStream | undefined;
    try {
      validateClip(a, b, v.dur);
      el.pause();
      await seek(el, a);
      stream = (el as HTMLVideoElement & { captureStream(): MediaStream }).captureStream();
      const mimeType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error("WebM recording is unsupported.");
      const rec = new MediaRecorder(stream, { mimeType }); recorder = rec;
      const chunks: Blob[] = []; rec.ondataavailable = (e) => chunks.push(e.data);
      const done = new Promise<void>((r) => (rec.onstop = () => r()));
      active.current = { recorder: rec, stream };
      rec.start(); await el.play();
      await waitForClip(el, b, v.abort.current.signal);
      el.pause(); rec.stop(); await done;
      const blob = new Blob(chunks, { type: "video/webm" }); if (!blob.size) throw new Error("Recording produced no video.");
      if (v.abort.current.signal.aborted) return; download(blob, `${baseName(v.name)}-trimmed.webm`);
    } catch { if (!v.abort.current.signal.aborted) setErr("Recording failed in this browser. Try Chrome or Firefox."); } finally { el.pause(); if (recorder && recorder.state !== "inactive") recorder.stop(); stream?.getTracks().forEach((track) => track.stop()); active.current = null; if (!v.abort.current.signal.aborted) setBusy(false); }
  };
  if (supported === false) return <ErrorNote>Your browser doesn't support in-browser video recording. Try Chrome, Edge or Firefox.</ErrorNote>;
  if (!v.url) return <FileDrop accept="video/*" onFiles={v.pick} />;
  return (
    <div className="space-y-4">
      <video ref={v.ref} src={v.url} controls={!busy} playsInline onLoadedData={(e) => { v.loaded(e.currentTarget); setA(0); setB(e.currentTarget.duration); }} onError={v.fail} className="max-h-96 w-full rounded-2xl bg-foreground" />
      {v.error && <ErrorNote>{v.error}</ErrorNote>}
      {v.dur > 0 && <RangeControls dur={v.dur} a={a} b={b} setA={setA} setB={setB} />}
      <p className="text-xs text-muted-foreground">The clip is recorded in real time (a {(b - a).toFixed(1)}s clip takes {(b - a).toFixed(1)}s) and saved as WebM.</p>
      {err && <ErrorNote>{err}</ErrorNote>}
      <div className="flex gap-3"><Btn disabled={busy || !v.ready} onClick={trim}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Recording…" : "Trim & download"}</Btn><Btn variant="ghost" disabled={busy} onClick={() => { setA(0); setB(0); setErr(""); v.reset(); }}>Choose another</Btn></div>
    </div>
  );
}

export function VideoToGif() {
  const v = useVideo(); const [a, setA] = useState(0); const [b, setB] = useState(3); const [fps, setFps] = useState(10); const [width, setWidth] = useState(480);
  const [busy, setBusy] = useState(""); const [out, setOut] = useState<string>("");
  const [err, setErr] = useState("");
  useEffect(() => () => { if (out) URL.revokeObjectURL(out); }, [out]);
  const make = async () => {
    const el = v.ref.current; if (!el || !v.ready) return;
    setBusy("Preparing…"); setErr(""); setOut("");
    try {
    validateClip(a, b, v.dur, 15); el.pause();
    const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
    const h = Math.round((el.videoHeight / el.videoWidth) * width);
    const c = document.createElement("canvas"); c.width = width; c.height = h; const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas processing is unavailable.");
    const gif = GIFEncoder(); const n = Math.max(1, Math.round((b - a) * fps));
    for (let i = 0; i < n; i++) {
      if (v.abort.current.signal.aborted) return;
      setBusy(`Frame ${i + 1}/${n}`); await seek(el, a + i / fps); ctx.drawImage(el, 0, 0, width, h);
      const data = ctx.getImageData(0, 0, width, h).data; const pal = quantize(data, 256); gif.writeFrame(applyPalette(data, pal), width, h, { palette: pal, delay: 1000 / fps });
    }
    gif.finish(); if (v.abort.current.signal.aborted) return; c.width = 0; c.height = 0; setOut(URL.createObjectURL(new Blob([gif.bytes() as BlobPart], { type: "image/gif" })));
    } catch (e) { if (!v.abort.current.signal.aborted) setErr(e instanceof Error ? e.message : "GIF creation failed."); } finally { if (!v.abort.current.signal.aborted) setBusy(""); }
  };
  if (!v.url) return <FileDrop accept="video/*" onFiles={v.pick} />;
  return (
    <div className="space-y-4">
      <video ref={v.ref} src={v.url} controls={!busy} muted playsInline onLoadedData={(e) => { v.loaded(e.currentTarget); setA(0); setB(Math.min(3, e.currentTarget.duration)); }} onError={v.fail} className="max-h-80 w-full rounded-2xl bg-foreground" />
      {(err || v.error) && <ErrorNote>{err || v.error}</ErrorNote>}
      {v.dur > 0 && <RangeControls dur={v.dur} a={a} b={b} setA={(x) => { setA(x); setB((end) => Math.min(end, x + 15)); setOut(""); }} setB={(x) => { setB(Math.min(x, a + 15)); setOut(""); }} />}
      <div className="flex flex-wrap gap-4">
        <Field label={`FPS ${fps}`}><input type="range" min={5} max={20} value={fps} disabled={!!busy} onChange={(e) => { setFps(+e.target.value); setOut(""); }} /></Field>
        <Field label={`Width ${width}px`}><input type="range" min={160} max={800} step={20} value={width} disabled={!!busy} onChange={(e) => { setWidth(+e.target.value); setOut(""); }} /></Field>
      </div>
      <p className="text-xs text-muted-foreground">Clips are limited to 15 seconds to keep GIFs a sensible size.</p>
      <div className="flex gap-3"><Btn disabled={!!busy || !v.ready} onClick={make}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy || "Create GIF"}</Btn><Btn variant="ghost" disabled={!!busy} onClick={() => { setOut(""); setErr(""); setA(0); setB(3); v.reset(); }}>Choose another</Btn></div>
      {out && <div className="space-y-3"><img src={out} alt="Generated GIF" className="rounded-2xl" /><DownloadBtn onClick={() => download(out, `${baseName(v.name)}.gif`)}>Download GIF</DownloadBtn></div>}
    </div>
  );
}
