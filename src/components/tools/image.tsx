import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { integerInRange } from "@/lib/tool-processing";
import { Area, Btn, CopyBtn, DownloadBtn, ErrorNote, FileDrop, Field, Select, Stat, baseName, canvasBlob, download, extFor, fmtBytes, inputCls, loadImage } from "./kit";

function useImage() {
  const [file, setFile] = useState<File | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [err, setErr] = useState("");
  const [preview, setPreview] = useState("");
  useEffect(() => { if (!file) { setPreview(""); return; } const url = URL.createObjectURL(file); setPreview(url); return () => URL.revokeObjectURL(url); }, [file]);
  const pick = async (fs: File[]) => {
    const f = fs[0]; if (!f) return;
    try { setImg(await loadImage(f)); setFile(f); setErr(""); } catch (e) { setErr((e as Error).message); }
  };
  return { file, img, preview, err, pick, reset: () => { setFile(null); setImg(null); } };
}

type Draw = (img: HTMLImageElement) => HTMLCanvasElement;
function render(img: HTMLImageElement, w: number, h: number, fn?: (ctx: CanvasRenderingContext2D) => void) {
  integerInRange(w, 1, 10000, "Width"); integerInRange(h, 1, 10000, "Height");
  if (w * h > 40000000) throw new Error("The result exceeds 40 megapixels. Choose smaller dimensions.");
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas processing is unavailable in this browser.");
  if (fn) fn(ctx); else ctx.drawImage(img, 0, 0, w, h);
  return c;
}

function ImageTool({ controls, draw, type, quality, suffix, onImage }: { controls?: (img: HTMLImageElement) => React.ReactNode; draw: Draw; type?: string; quality?: number; suffix: string; onImage?: (img: HTMLImageElement) => void }) {
  const { file, img, preview, err, pick, reset } = useImage();
  const [out, setOut] = useState<{ blob: Blob; url: string } | null>(null);
  const [processingError, setProcessingError] = useState("");
  const outputUrl = useRef("");
  useEffect(() => { if (img) onImage?.(img); }, [img, onImage]);
  useEffect(() => () => { if (outputUrl.current) URL.revokeObjectURL(outputUrl.current); }, []);
  useEffect(() => {
    setOut(null); setProcessingError("");
    if (outputUrl.current) { URL.revokeObjectURL(outputUrl.current); outputUrl.current = ""; }
    if (!img || !file) return;
    let cancel = false;
    const t = type ?? (file.type === "image/jpeg" || file.type === "image/webp" ? file.type : "image/png");
    const debounce = setTimeout(() => { void (async () => {
      try {
        const c = draw(img);
        if (t === "image/jpeg") {
          const canvas = document.createElement("canvas"); canvas.width = c.width; canvas.height = c.height;
          const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas processing is unavailable.");
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(c, 0, 0);
          done(await canvasBlob(canvas, t, quality));
        } else done(await canvasBlob(c, t, quality));
      } catch (e) { if (!cancel) setProcessingError(e instanceof Error ? e.message : "Image export failed."); }
    })(); }, 120);
    function done(b: Blob) { if (!cancel) { outputUrl.current = URL.createObjectURL(b); setOut({ blob: b, url: outputUrl.current }); } }
    return () => { cancel = true; clearTimeout(debounce); };
  }, [img, file, draw, type, quality]);
  if (!img || !file) return <div className="space-y-3"><FileDrop accept="image/*" onFiles={pick} />{err && <ErrorNote>{err}</ErrorNote>}</div>;
  return (
    <div className="space-y-5">
      {processingError && <ErrorNote>{processingError}</ErrorNote>}
      {controls && <div className="flex flex-wrap items-end gap-4">{controls(img)}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        <figure className="space-y-2"><div className="grid h-72 place-items-center overflow-hidden rounded-2xl bg-secondary grid-dots">{preview && <img src={preview} alt="Original" className="max-h-full max-w-full object-contain" />}</div><figcaption className="text-xs text-muted-foreground">Original · {img.naturalWidth}×{img.naturalHeight} · {fmtBytes(file.size)}</figcaption></figure>
        <figure className="space-y-2"><div className="grid h-72 place-items-center overflow-hidden rounded-2xl bg-secondary grid-dots">{out && <img src={out.url} alt="Result" className="max-h-full max-w-full object-contain" />}</div>
          <figcaption className="text-xs text-muted-foreground">Result · {out ? fmtBytes(out.blob.size) : "…"}{out && file.size ? ` (${Math.round((1 - out.blob.size / file.size) * 100)}% smaller)`.replace("(-", "(+").replace("smaller", out.blob.size > file.size ? "larger" : "smaller") : ""}</figcaption></figure>
      </div>
      <div className="flex gap-3">{out && <DownloadBtn onClick={() => download(out.blob, `${baseName(file.name)}-${suffix}.${extFor(out.blob.type)}`)} />}<Btn variant="ghost" onClick={reset}>Choose another</Btn></div>
    </div>
  );
}

export function ImageCompressor() {
  const [q, setQ] = useState(70); const [fmt, setFmt] = useState("image/jpeg");
  const draw = useRefFn((img) => render(img, img.naturalWidth, img.naturalHeight));
  return <ImageTool suffix="compressed" draw={draw} type={fmt} quality={q / 100} controls={() => <>
    <Field label={`Quality ${q}%`}><input type="range" min={10} max={95} value={q} onChange={(e) => setQ(+e.target.value)} /></Field>
    <Field label="Output"><Select value={fmt} onChange={setFmt} options={[["image/jpeg", "JPG"], ["image/webp", "WebP"]]} /></Field>
  </>} />;
}

function useRefFn(fn: Draw) { const r = useRef(fn); return r.current; }

export function ImageResizer() {
  const [w, setW] = useState(0); const [h, setH] = useState(0); const [lock, setLock] = useState(true);
  const [draw, setDraw] = useState<Draw>(() => (img: HTMLImageElement) => render(img, img.naturalWidth, img.naturalHeight));
  useEffect(() => { setDraw(() => (img: HTMLImageElement) => render(img, w, h)); }, [w, h]);
  const initialize = useCallback((img: HTMLImageElement) => { setW(img.naturalWidth); setH(img.naturalHeight); }, []);
  return <ImageTool suffix={`${w}x${h}`} draw={draw} onImage={initialize} controls={(img) => {
    const r = img.naturalHeight / img.naturalWidth;
    return <>
      <Field label="Width (px)"><input type="number" min={1} max={10000} value={w} onChange={(e) => { const v = +e.target.value; setW(v); if (lock) setH(Math.round(v * r)); }} className={`${inputCls} w-28`} /></Field>
      <Field label="Height (px)"><input type="number" min={1} max={10000} value={h} onChange={(e) => { const v = +e.target.value; setH(v); if (lock) setW(Math.round(v / r)); }} className={`${inputCls} w-28`} /></Field>
      <label className="flex h-10 items-center gap-2 text-sm"><input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> Keep aspect ratio</label>
    </>;
  }} />;
}

export function ImageConverter() {
  const [fmt, setFmt] = useState("image/png");
  const draw = useRefFn((img) => render(img, img.naturalWidth, img.naturalHeight));
  return <ImageTool suffix="converted" draw={draw} type={fmt} quality={0.92} controls={() => <Field label="Convert to"><Select value={fmt} onChange={setFmt} options={[["image/png", "PNG"], ["image/jpeg", "JPG"], ["image/webp", "WebP"]]} /></Field>} />;
}

export function ImageRotator() {
  const [deg, setDeg] = useState(90);
  const [draw, setDraw] = useState<Draw>(() => rot(90));
  function rot(d: number): Draw {
    return (img) => {
      const rad = (d * Math.PI) / 180, W = img.naturalWidth, H = img.naturalHeight;
      const cw = Math.round(Math.abs(W * Math.cos(rad)) + Math.abs(H * Math.sin(rad))), ch = Math.round(Math.abs(W * Math.sin(rad)) + Math.abs(H * Math.cos(rad)));
      return render(img, cw, ch, (ctx) => { ctx.translate(cw / 2, ch / 2); ctx.rotate(rad); ctx.drawImage(img, -W / 2, -H / 2); });
    };
  }
  const set = (d: number) => { setDeg(d); setDraw(() => rot(d)); };
  return <ImageTool suffix="rotated" draw={draw} controls={() => <>
    {[90, 180, 270].map((d) => <Btn key={d} variant={deg === d ? "primary" : "ghost"} onClick={() => set(d)}>{d}°</Btn>)}
    <Field label={`Custom ${deg}°`}><input type="range" min={0} max={359} value={deg} onChange={(e) => set(+e.target.value)} /></Field>
  </>} />;
}

export function ImageFlipper() {
  const [dir, setDir] = useState("h");
  const mk = (d: string): Draw => (img) => render(img, img.naturalWidth, img.naturalHeight, (ctx) => { if (d === "h") { ctx.translate(img.naturalWidth, 0); ctx.scale(-1, 1); } else { ctx.translate(0, img.naturalHeight); ctx.scale(1, -1); } ctx.drawImage(img, 0, 0); });
  const [draw, setDraw] = useState<Draw>(() => mk("h"));
  return <ImageTool suffix="flipped" draw={draw} controls={() => <Field label="Direction"><Select value={dir} onChange={(v) => { setDir(v); setDraw(() => mk(v)); }} options={[["h", "Horizontal"], ["v", "Vertical"]]} /></Field>} />;
}

export function ImageCropper() {
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [draw, setDraw] = useState<Draw>(() => (img: HTMLImageElement) => render(img, img.naturalWidth, img.naturalHeight));
  useEffect(() => { setDraw(() => (img: HTMLImageElement) => {
    integerInRange(box.x, 0, img.naturalWidth - 1, "X"); integerInRange(box.y, 0, img.naturalHeight - 1, "Y");
    if (box.x + box.w > img.naturalWidth || box.y + box.h > img.naturalHeight) throw new Error("The crop must fit inside the image.");
    return render(img, box.w, box.h, (ctx) => ctx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h));
  }); }, [box]);
  const initialize = useCallback((img: HTMLImageElement) => setBox({ x: 0, y: 0, w: img.naturalWidth, h: img.naturalHeight }), []);
  return <ImageTool suffix="cropped" draw={draw} onImage={initialize} controls={(img) => {
    const W = img.naturalWidth, H = img.naturalHeight;
    const ratio = (r: number) => { const w = Math.min(W, Math.round(H * r)), h = Math.round(w / r); setBox({ x: Math.round((W - w) / 2), y: Math.round((H - h) / 2), w, h }); };
    const num = (k: keyof typeof box, max: number) => <Field label={k.toUpperCase()}><input type="number" min={0} max={max} value={box[k]} onChange={(e) => setBox({ ...box, [k]: Math.max(0, Math.min(max, +e.target.value)) })} className={`${inputCls} w-24`} /></Field>;
    return <>{num("x", W - 1)}{num("y", H - 1)}{num("w", W - box.x)}{num("h", H - box.y)}
      {([["1:1", 1], ["4:3", 4 / 3], ["16:9", 16 / 9], ["9:16", 9 / 16]] as [string, number][]).map(([l, r]) => <Btn key={l} variant="ghost" onClick={() => ratio(r)}>{l}</Btn>)}</>;
  }} />;
}

export function ImageToBase64() {
  const [url, setUrl] = useState(""); const [name, setName] = useState("");
  const pick = async (fs: File[]) => { const f = fs[0]; if (!f) return; await loadImage(f); const result = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => reject(new Error("The image could not be read.")); r.onabort = () => reject(new Error("Reading cancelled.")); r.readAsDataURL(f); }); setName(f.name); setUrl(result); };
  if (!url) return <FileDrop accept="image/*" onFiles={pick} />;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4"><img src={url} alt={name} className="h-20 w-20 rounded-xl object-cover ring-1 ring-border" /><div className="text-sm"><div className="font-medium">{name}</div><div className="text-muted-foreground">{url.length.toLocaleString()} characters</div></div></div>
      <Area value={url} readOnly mono rows={8} />
      <div className="flex gap-3"><CopyBtn text={url} /><CopyBtn text={`<img src="${url}" />`} /><Btn variant="ghost" onClick={() => setUrl("")}>Choose another</Btn></div>
    </div>
  );
}

export function Base64ToImage() {
  const [v, setV] = useState(""); const [ok, setOk] = useState<boolean | null>(null);
  const src = v.trim().startsWith("data:") ? v.trim() : v.trim() ? `data:image/png;base64,${v.trim()}` : "";
  return (
    <div className="space-y-4">
      <Area value={v} onChange={(x) => { setV(x); setOk(null); }} mono rows={6} placeholder="data:image/png;base64,… or raw Base64" />
      {ok === false && <ErrorNote>This Base64 string isn't a readable image.</ErrorNote>}
      {src && <div className="grid h-64 place-items-center rounded-2xl bg-secondary grid-dots"><img src={src} alt="Decoded" onLoad={() => setOk(true)} onError={() => setOk(false)} className="max-h-full max-w-full" /></div>}
      {ok && <DownloadBtn onClick={() => download(src, `image.${src.match(/image\/(\w+)/)?.[1] ?? "png"}`)} />}
    </div>
  );
}

export function ImageColorPicker() {
  const { img, err, pick, reset } = useImage();
  const ref = useRef<HTMLCanvasElement>(null);
  const [col, setCol] = useState<string | null>(null);
  const [hist, setHist] = useState<string[]>([]);
  const [point, setPoint] = useState({ x: 0, y: 0 });
  useEffect(() => { if (img && ref.current) { const c = ref.current; c.width = img.naturalWidth; c.height = img.naturalHeight; c.getContext("2d")?.drawImage(img, 0, 0); } }, [img]);
  if (!img) return <div className="space-y-3"><FileDrop accept="image/*" onFiles={pick} />{err && <ErrorNote>{err}</ErrorNote>}</div>;
  const at = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = ref.current;
    if (!c) return "#000000";
    const r = c.getBoundingClientRect(), ctx = c.getContext("2d");
    if (!ctx) return "#000000";
    const [R, G, B] = ctx.getImageData(Math.min(c.width - 1, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * c.width))), Math.min(c.height - 1, Math.max(0, Math.floor(((e.clientY - r.top) / r.height) * c.height))), 1, 1).data;
    return "#" + [R, G, B].map((x) => x.toString(16).padStart(2, "0")).join("");
  };
  const rgb = (h: string) => `rgb(${parseInt(h.slice(1, 3), 16)}, ${parseInt(h.slice(3, 5), 16)}, ${parseInt(h.slice(5, 7), 16)})`;
  return (
    <div className="grid gap-5 md:grid-cols-[1fr_240px]">
      <canvas ref={ref} role="button" tabIndex={0} aria-label="Pick image color; arrow keys move the sample, Enter saves it" onKeyDown={(e) => {
        const directions: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
        const d = directions[e.key]; const c = ref.current; if (!c || (!d && e.key !== "Enter" && e.key !== " ")) return;
        e.preventDefault(); const p = d ? { x: Math.max(0, Math.min(c.width - 1, point.x + d[0])), y: Math.max(0, Math.min(c.height - 1, point.y + d[1])) } : point;
        setPoint(p); const data = c.getContext("2d")?.getImageData(p.x, p.y, 1, 1).data; if (!data) return;
        const color = "#" + [...data].slice(0, 3).map((v) => v.toString(16).padStart(2, "0")).join(""); setCol(color); if (!d) setHist((h) => [color, ...h.filter((x) => x !== color)].slice(0, 10));
      }} onMouseMove={(e) => setCol(at(e))} onClick={(e) => { const c = at(e); setCol(c); setHist((h) => [c, ...h.filter((x) => x !== c)].slice(0, 10)); }} className="h-auto max-w-full cursor-crosshair rounded-lg" />
      <div className="space-y-3">
        <div className="h-24 rounded-2xl ring-1 ring-border" style={{ background: col ?? "transparent" }} />
        {col && <><div className="font-mono text-sm uppercase">{col}</div><div className="font-mono text-xs text-muted-foreground">{rgb(col)}</div><CopyBtn text={col} /></>}
        <p className="text-xs text-muted-foreground">Click to save a color.</p>
        <div className="flex flex-wrap gap-2">{hist.map((h) => <Button key={h} title={h} aria-label={`Select ${h}`} variant="ghost" onClick={() => setCol(h)} className="h-8 w-8 rounded-lg ring-1 ring-border" style={{ background: h }} />)}</div>
        <Btn variant="ghost" onClick={() => { setCol(null); setHist([]); reset(); }}>Choose another</Btn>
      </div>
    </div>
  );
}

export function ImageMetadataViewer() {
  const { file, img, preview, err, pick, reset } = useImage();
  if (!img || !file) return <div className="space-y-3"><FileDrop accept="image/*" onFiles={pick} />{err && <ErrorNote>{err}</ErrorNote>}</div>;
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
  const d = g(img.naturalWidth, img.naturalHeight);
  return (
    <div className="space-y-4">
      <div className="grid h-56 place-items-center rounded-2xl bg-secondary grid-dots">{preview && <img src={preview} alt={file.name} className="max-h-full max-w-full" />}</div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label="File name" value={<span className="break-all text-sm">{file.name}</span>} />
        <Stat label="Type" value={file.type || "unknown"} />
        <Stat label="Size" value={fmtBytes(file.size)} />
        <Stat label="Dimensions" value={`${img.naturalWidth}×${img.naturalHeight}`} />
        <Stat label="Aspect ratio" value={`${img.naturalWidth / d}:${img.naturalHeight / d}`} />
        <Stat label="Megapixels" value={((img.naturalWidth * img.naturalHeight) / 1e6).toFixed(2)} />
        <Stat label="Last modified" value={<span className="text-sm">{new Date(file.lastModified).toLocaleString()}</span>} />
      </div>
      <p className="text-xs text-muted-foreground">Camera EXIF tags (GPS, lens, etc.) are not read by this version.</p>
      <Btn variant="ghost" onClick={reset}>Choose another</Btn>
    </div>
  );
}
