import { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { File as FileIcon, Loader2, X } from "lucide-react";
import { Btn, DownloadBtn, ErrorNote, FileDrop, Field, Stat, baseName, download, fmtBytes, inputCls } from "./kit";

export function ZipCreator() {
  const [files, setFiles] = useState<File[]>([]); const [name, setName] = useState("archive"); const [busy, setBusy] = useState(false);
  const make = async () => { setBusy(true); const z = new JSZip(); files.forEach((f) => z.file(f.name, f)); download(await z.generateAsync({ type: "blob", compression: "DEFLATE" }), `${name || "archive"}.zip`); setBusy(false); };
  const total = files.reduce((s, f) => s + f.size, 0);
  return (
    <div className="space-y-4">
      <FileDrop multiple onFiles={(fs) => setFiles((p) => [...p, ...fs])} label="Add files to the ZIP" />
      <div className="space-y-2">{files.map((f, i) => <div key={i} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-sm"><FileIcon className="h-4 w-4" /><span className="flex-1 truncate">{f.name}</span><span className="text-xs text-muted-foreground">{fmtBytes(f.size)}</span><button onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Remove"><X className="h-4 w-4" /></button></div>)}</div>
      {files.length > 0 && <div className="flex flex-wrap items-end gap-3"><Field label="ZIP name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field><Btn disabled={busy} onClick={make}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Create ZIP ({files.length} files, {fmtBytes(total)})</Btn></div>}
    </div>
  );
}

export function ZipExtractor() {
  const [entries, setEntries] = useState<JSZip.JSZipObject[]>([]); const [err, setErr] = useState(""); const [zipName, setZipName] = useState("");
  const open = async (fs: File[]) => { const f = fs[0]; if (!f) return; try { const z = await JSZip.loadAsync(f); setEntries(Object.values(z.files).filter((e) => !e.dir)); setZipName(f.name); setErr(""); } catch { setErr("That file isn't a readable ZIP archive."); } };
  return (
    <div className="space-y-4">
      <FileDrop accept=".zip,application/zip" onFiles={open} label="Drop a ZIP file" />
      {err && <ErrorNote>{err}</ErrorNote>}
      {entries.length > 0 && <p className="text-sm text-muted-foreground">{zipName} · {entries.length} files</p>}
      <div className="space-y-2">{entries.map((e) => (
        <div key={e.name} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-sm"><FileIcon className="h-4 w-4" /><span className="flex-1 truncate font-mono text-xs">{e.name}</span>
          <Btn variant="ghost" onClick={async () => download(await e.async("blob"), e.name.split("/").pop()!)}>Download</Btn></div>
      ))}</div>
    </div>
  );
}

export function FileInformationViewer() {
  const [f, setF] = useState<File | null>(null); const [sha, setSha] = useState("");
  const pick = async (fs: File[]) => { const x = fs[0]; if (!x) return; setF(x); setSha(""); const h = await crypto.subtle.digest("SHA-256", await x.arrayBuffer()); setSha([...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, "0")).join("")); };
  return (
    <div className="space-y-4">
      <FileDrop onFiles={pick} />
      {f && <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="Name" value={<span className="break-all text-sm">{f.name}</span>} />
        <Stat label="Size" value={`${fmtBytes(f.size)}`} />
        <Stat label="Bytes" value={f.size.toLocaleString()} />
        <Stat label="MIME type" value={<span className="text-sm">{f.type || "unknown"}</span>} />
        <Stat label="Extension" value={f.name.includes(".") ? f.name.split(".").pop()!.toUpperCase() : "—"} />
        <Stat label="Last modified" value={<span className="text-sm">{new Date(f.lastModified).toLocaleString()}</span>} />
        <div className="col-span-full"><Stat label="SHA-256" value={<code className="break-all font-mono text-xs">{sha || "Calculating…"}</code>} /></div>
      </div>}
    </div>
  );
}

function encodeWav(buf: AudioBuffer, start: number, end: number) {
  const sr = buf.sampleRate, ch = buf.numberOfChannels, s = Math.floor(start * sr), e = Math.floor(end * sr), len = e - s;
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
      <Field label={`Start ${a.toFixed(1)}s`}><input type="range" min={0} max={dur} step={0.1} value={a} onChange={(e) => setA(Math.min(+e.target.value, b - 0.1))} /></Field>
      <Field label={`End ${b.toFixed(1)}s`}><input type="range" min={0} max={dur} step={0.1} value={b} onChange={(e) => setB(Math.max(+e.target.value, a + 0.1))} /></Field>
    </div>
  );
}

export function AudioTrimmer() {
  const [f, setF] = useState<File | null>(null); const [buf, setBuf] = useState<AudioBuffer | null>(null); const [a, setA] = useState(0); const [b, setB] = useState(0); const [err, setErr] = useState("");
  const pick = async (fs: File[]) => { const x = fs[0]; if (!x) return; try { const ctx = new AudioContext(); const d = await ctx.decodeAudioData(await x.arrayBuffer()); setBuf(d); setF(x); setA(0); setB(d.duration); setErr(""); } catch { setErr("Your browser can't decode this audio file."); } };
  return (
    <div className="space-y-4">
      {!buf && <FileDrop accept="audio/*" onFiles={pick} />}
      {err && <ErrorNote>{err}</ErrorNote>}
      {buf && f && <>
        <audio controls src={URL.createObjectURL(f)} className="w-full" />
        <RangeControls dur={buf.duration} a={a} b={b} setA={setA} setB={setB} />
        <p className="text-sm text-muted-foreground">Clip length {(b - a).toFixed(1)}s · exported as WAV</p>
        <div className="flex gap-3"><DownloadBtn onClick={() => download(encodeWav(buf, a, b), `${baseName(f.name)}-trimmed.wav`)}>Download WAV</DownloadBtn><Btn variant="ghost" onClick={() => { setBuf(null); setF(null); }}>Choose another</Btn></div>
      </>}
    </div>
  );
}

function useVideo() {
  const [url, setUrl] = useState(""); const [name, setName] = useState(""); const [dur, setDur] = useState(0);
  const ref = useRef<HTMLVideoElement>(null);
  const pick = (fs: File[]) => { const x = fs[0]; if (!x) return; setUrl(URL.createObjectURL(x)); setName(x.name); };
  return { url, name, dur, setDur, ref, pick, reset: () => setUrl("") };
}
const seek = (v: HTMLVideoElement, t: number) => new Promise<void>((r) => { v.onseeked = () => r(); v.currentTime = t; });

export function VideoFrameExtractor() {
  const v = useVideo(); const [frames, setFrames] = useState<{ t: number; url: string }[]>([]);
  const grab = () => { const el = v.ref.current!; const c = document.createElement("canvas"); c.width = el.videoWidth; c.height = el.videoHeight; c.getContext("2d")!.drawImage(el, 0, 0); setFrames((f) => [...f, { t: el.currentTime, url: c.toDataURL("image/png") }]); };
  if (!v.url) return <FileDrop accept="video/*" onFiles={v.pick} />;
  return (
    <div className="space-y-4">
      <video ref={v.ref} src={v.url} controls className="max-h-96 w-full rounded-2xl bg-foreground" />
      <div className="flex gap-3"><Btn onClick={grab}>Capture current frame</Btn><Btn variant="ghost" onClick={v.reset}>Choose another</Btn></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{frames.map((f, i) => <button key={i} onClick={() => download(f.url, `${baseName(v.name)}-${f.t.toFixed(2)}s.png`)} className="bento bento-hover p-2 text-xs"><img src={f.url} alt={`Frame at ${f.t.toFixed(2)}s`} className="w-full rounded-lg" />{f.t.toFixed(2)}s · Download</button>)}</div>
    </div>
  );
}

export function VideoTrimmer() {
  const v = useVideo(); const [a, setA] = useState(0); const [b, setB] = useState(0); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const [supported, setSupported] = useState<boolean | null>(null);
  useEffect(() => { setSupported("MediaRecorder" in window && "captureStream" in HTMLVideoElement.prototype); }, []);
  const trim = async () => {
    const el = v.ref.current!; setBusy(true); setErr("");
    try {
      await seek(el, a);
      const stream = (el as HTMLVideoElement & { captureStream(): MediaStream }).captureStream();
      const rec = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm" });
      const chunks: Blob[] = []; rec.ondataavailable = (e) => chunks.push(e.data);
      const done = new Promise<void>((r) => (rec.onstop = () => r()));
      rec.start(); await el.play();
      await new Promise<void>((r) => { const tick = () => (el.currentTime >= b || el.ended ? r() : requestAnimationFrame(tick)); tick(); });
      el.pause(); rec.stop(); await done;
      download(new Blob(chunks, { type: "video/webm" }), `${baseName(v.name)}-trimmed.webm`);
    } catch { setErr("Recording failed in this browser. Try Chrome or Firefox."); } finally { setBusy(false); }
  };
  if (supported === false) return <ErrorNote>Your browser doesn't support in-browser video recording. Try Chrome, Edge or Firefox.</ErrorNote>;
  if (!v.url) return <FileDrop accept="video/*" onFiles={v.pick} />;
  return (
    <div className="space-y-4">
      <video ref={v.ref} src={v.url} controls onLoadedMetadata={(e) => { v.setDur(e.currentTarget.duration); setB(e.currentTarget.duration); }} className="max-h-96 w-full rounded-2xl bg-foreground" />
      {v.dur > 0 && <RangeControls dur={v.dur} a={a} b={b} setA={setA} setB={setB} />}
      <p className="text-xs text-muted-foreground">The clip is recorded in real time (a {(b - a).toFixed(1)}s clip takes {(b - a).toFixed(1)}s) and saved as WebM.</p>
      {err && <ErrorNote>{err}</ErrorNote>}
      <div className="flex gap-3"><Btn disabled={busy} onClick={trim}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy ? "Recording…" : "Trim & download"}</Btn><Btn variant="ghost" onClick={v.reset}>Choose another</Btn></div>
    </div>
  );
}

export function VideoToGif() {
  const v = useVideo(); const [a, setA] = useState(0); const [b, setB] = useState(3); const [fps, setFps] = useState(10); const [width, setWidth] = useState(480);
  const [busy, setBusy] = useState(""); const [out, setOut] = useState<string>("");
  useEffect(() => () => { if (out) URL.revokeObjectURL(out); }, [out]);
  const make = async () => {
    const el = v.ref.current!; const { GIFEncoder, quantize, applyPalette } = await import("gifenc");
    const h = Math.round((el.videoHeight / el.videoWidth) * width);
    const c = document.createElement("canvas"); c.width = width; c.height = h; const ctx = c.getContext("2d", { willReadFrequently: true })!;
    const gif = GIFEncoder(); const n = Math.max(1, Math.round((b - a) * fps));
    for (let i = 0; i < n; i++) {
      setBusy(`Frame ${i + 1}/${n}`); await seek(el, a + i / fps); ctx.drawImage(el, 0, 0, width, h);
      const data = ctx.getImageData(0, 0, width, h).data; const pal = quantize(data, 256); gif.writeFrame(applyPalette(data, pal), width, h, { palette: pal, delay: 1000 / fps });
    }
    gif.finish(); setOut(URL.createObjectURL(new Blob([gif.bytes() as BlobPart], { type: "image/gif" }))); setBusy("");
  };
  if (!v.url) return <FileDrop accept="video/*" onFiles={v.pick} />;
  return (
    <div className="space-y-4">
      <video ref={v.ref} src={v.url} controls muted onLoadedMetadata={(e) => { v.setDur(e.currentTarget.duration); setB(Math.min(3, e.currentTarget.duration)); }} className="max-h-80 w-full rounded-2xl bg-foreground" />
      {v.dur > 0 && <RangeControls dur={v.dur} a={a} b={b} setA={setA} setB={(x) => setB(Math.min(x, a + 15))} />}
      <div className="flex flex-wrap gap-4">
        <Field label={`FPS ${fps}`}><input type="range" min={5} max={20} value={fps} onChange={(e) => setFps(+e.target.value)} /></Field>
        <Field label={`Width ${width}px`}><input type="range" min={160} max={800} step={20} value={width} onChange={(e) => setWidth(+e.target.value)} /></Field>
      </div>
      <p className="text-xs text-muted-foreground">Clips are limited to 15 seconds to keep GIFs a sensible size.</p>
      <div className="flex gap-3"><Btn disabled={!!busy} onClick={make}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{busy || "Create GIF"}</Btn><Btn variant="ghost" onClick={v.reset}>Choose another</Btn></div>
      {out && <div className="space-y-3"><img src={out} alt="Generated GIF" className="rounded-2xl" /><DownloadBtn onClick={() => download(out, `${baseName(v.name)}.gif`)}>Download GIF</DownloadBtn></div>}
    </div>
  );
}
