import {
  Minimize2, Scaling, Crop, Repeat, RotateCw, FlipHorizontal, FileCode2, ImageDown, Pipette, Info,
  Combine, Scissors, FileArchive, RotateCcw, ArrowDownUp, FileOutput, Images, FileImage,
  Hash, CaseSensitive, ListX, Undo2, ArrowDownAZ, GitCompare, Pilcrow, Link2,
  Braces, BadgeCheck, Shrink, Lock, Unlock, Fingerprint, ShieldCheck, KeyRound, Regex, Globe,
  QrCode, Barcode, Asterisk, Dices, Palette, Blend, Square,
  FolderArchive, FolderOpen, FileSearch, AudioLines, Film, Clapperboard, Camera,
  Image as ImageIcon, FileText, Type, Code2, Sparkles, HardDrive, type LucideIcon,
} from "lucide-react";

export type CategoryId = "image" | "pdf" | "text" | "developer" | "generators" | "file-media";

export interface Category {
  id: CategoryId;
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
  tone: "primary" | "info" | "cyan" | "success" | "warning" | "destructive";
}

export const categories: Category[] = [
  { id: "image", name: "Image Tools", short: "Image", description: "Compress, resize, crop and convert images right in your browser.", icon: ImageIcon, tone: "primary" },
  { id: "pdf", name: "PDF Tools", short: "PDF", description: "Merge, split, rotate and rearrange PDF documents privately.", icon: FileText, tone: "destructive" },
  { id: "text", name: "Text Tools", short: "Text", description: "Count, clean, sort and compare text in a click.", icon: Type, tone: "info" },
  { id: "developer", name: "Developer Tools", short: "Developer", description: "Format JSON, decode tokens, hash strings and test regex.", icon: Code2, tone: "success" },
  { id: "generators", name: "Generators", short: "Generators", description: "QR codes, barcodes, passwords, colors and CSS snippets.", icon: Sparkles, tone: "warning" },
  { id: "file-media", name: "File & Media Tools", short: "File & Media", description: "Zip files, inspect files and trim audio or video.", icon: HardDrive, tone: "cyan" },
];

export interface Tool {
  slug: string;
  name: string;
  category: CategoryId;
  description: string;
  icon: LucideIcon;
  formats?: string;
  keywords: string[];
  popular?: boolean;
  added: string; // ISO date
}

const t = (slug: string, name: string, category: CategoryId, description: string, icon: LucideIcon, keywords: string, extra: Partial<Tool> = {}): Tool => ({
  slug, name, category, description, icon, keywords: keywords.split(" "), added: "2026-01-10", ...extra,
});

export const tools: Tool[] = [
  t("image-compressor", "Image Compressor", "image", "Shrink JPG, PNG and WebP file sizes with adjustable quality.", Minimize2, "compress reduce smaller optimize jpg png webp", { popular: true, formats: "JPG, PNG, WebP" }),
  t("image-resizer", "Image Resizer", "image", "Change image dimensions by pixels while keeping aspect ratio.", Scaling, "resize scale dimensions width height", { popular: true, formats: "JPG, PNG, WebP, GIF" }),
  t("image-cropper", "Image Cropper", "image", "Crop images to an exact region or aspect ratio.", Crop, "crop cut trim aspect", { formats: "JPG, PNG, WebP" }),
  t("image-converter", "Image Converter", "image", "Convert between JPG, PNG and WebP formats.", Repeat, "convert format jpg png webp", { popular: true, formats: "JPG, PNG, WebP, GIF, BMP" }),
  t("image-rotator", "Image Rotator", "image", "Rotate images by 90°, 180° or any custom angle.", RotateCw, "rotate turn angle", { formats: "JPG, PNG, WebP" }),
  t("image-flipper", "Image Flipper", "image", "Mirror images horizontally or vertically.", FlipHorizontal, "flip mirror horizontal vertical", { formats: "JPG, PNG, WebP" }),
  t("image-to-base64", "Image to Base64", "image", "Encode any image as a Base64 data URL.", FileCode2, "base64 data url encode embed", { formats: "Any image" }),
  t("base64-to-image", "Base64 to Image", "image", "Decode a Base64 string back into a downloadable image.", ImageDown, "base64 decode data url"),
  t("image-color-picker", "Image Color Picker", "image", "Click anywhere on an image to grab HEX and RGB colors.", Pipette, "color picker eyedropper hex rgb", { formats: "JPG, PNG, WebP", added: "2026-03-02" }),
  t("image-metadata-viewer", "Image Metadata Viewer", "image", "See dimensions, type, size and basic file details.", Info, "metadata exif info details", { added: "2026-03-02" }),

  t("pdf-merger", "PDF Merger", "pdf", "Combine multiple PDFs into a single document.", Combine, "merge combine join pdf", { popular: true, formats: "PDF" }),
  t("pdf-splitter", "PDF Splitter", "pdf", "Split a PDF into separate single-page files.", Scissors, "split separate pages pdf", { popular: true, formats: "PDF" }),
  t("pdf-compressor", "PDF Compressor", "pdf", "Re-save PDFs with object streams to reduce size.", FileArchive, "compress reduce pdf size", { formats: "PDF" }),
  t("pdf-rotator", "PDF Rotator", "pdf", "Rotate every page of a PDF document.", RotateCcw, "rotate pdf pages", { formats: "PDF" }),
  t("pdf-page-reorder", "PDF Page Reorder", "pdf", "Rearrange PDF pages into a new order.", ArrowDownUp, "reorder rearrange order pages pdf", { formats: "PDF" }),
  t("pdf-page-extractor", "PDF Page Extractor", "pdf", "Pull selected pages out into a new PDF.", FileOutput, "extract pages select pdf", { formats: "PDF" }),
  t("pdf-to-images", "PDF to Images", "pdf", "Turn PDF pages into PNG images.", Images, "pdf to png jpg images", { formats: "PDF", added: "2026-04-18" }),
  t("images-to-pdf", "Images to PDF", "pdf", "Combine JPG and PNG images into one PDF.", FileImage, "images to pdf jpg png", { popular: true, formats: "JPG, PNG" }),

  t("word-counter", "Word Counter", "text", "Count words, characters, sentences and reading time.", Hash, "word count characters sentences", { popular: true }),
  t("case-converter", "Case Converter", "text", "UPPER, lower, Title, camelCase, snake_case and more.", CaseSensitive, "case upper lower title camel snake"),
  t("duplicate-line-remover", "Duplicate Line Remover", "text", "Remove repeated lines from any list.", ListX, "duplicate lines remove unique"),
  t("text-reverser", "Text Reverser", "text", "Reverse characters, words or lines.", Undo2, "reverse backwards"),
  t("text-sorter", "Text Sorter", "text", "Sort lines alphabetically, numerically or by length.", ArrowDownAZ, "sort alphabetical lines"),
  t("text-diff-checker", "Text Diff Checker", "text", "Compare two texts line by line.", GitCompare, "diff compare difference", { added: "2026-04-18" }),
  t("lorem-ipsum-generator", "Lorem Ipsum Generator", "text", "Generate placeholder paragraphs, sentences or words.", Pilcrow, "lorem ipsum placeholder dummy text"),
  t("slug-generator", "Slug Generator", "text", "Turn titles into clean URL slugs.", Link2, "slug url seo permalink"),

  t("json-formatter", "JSON Formatter", "developer", "Pretty-print JSON with your chosen indentation.", Braces, "json format pretty beautify", { popular: true }),
  t("json-validator", "JSON Validator", "developer", "Check JSON syntax and pinpoint errors.", BadgeCheck, "json validate lint check"),
  t("json-minifier", "JSON Minifier", "developer", "Strip whitespace to compact JSON.", Shrink, "json minify compact"),
  t("base64-encoder", "Base64 Encoder", "developer", "Encode text to Base64 (UTF-8 safe).", Lock, "base64 encode"),
  t("base64-decoder", "Base64 Decoder", "developer", "Decode Base64 back to readable text.", Unlock, "base64 decode"),
  t("uuid-generator", "UUID Generator", "developer", "Generate random v4 UUIDs in bulk.", Fingerprint, "uuid guid random id"),
  t("hash-generator", "Hash Generator", "developer", "SHA-1, SHA-256, SHA-384 and SHA-512 hashes.", ShieldCheck, "hash sha256 sha1 checksum"),
  t("jwt-decoder", "JWT Decoder", "developer", "Inspect the header and payload of a JWT.", KeyRound, "jwt token decode", { added: "2026-03-02" }),
  t("regex-tester", "Regex Tester", "developer", "Test regular expressions with live highlighting.", Regex, "regex regular expression test match"),
  t("url-encoder-decoder", "URL Encoder/Decoder", "developer", "Percent-encode or decode URLs and query strings.", Globe, "url encode decode percent"),

  t("qr-code-generator", "QR Code Generator", "generators", "Create QR codes for links, text and Wi‑Fi.", QrCode, "qr code generator link", { popular: true }),
  t("barcode-generator", "Barcode Generator", "generators", "Make CODE128, EAN-13, UPC and more barcodes.", Barcode, "barcode ean upc code128"),
  t("password-generator", "Password Generator", "generators", "Strong random passwords with custom rules.", Asterisk, "password strong random secure", { popular: true }),
  t("random-number-generator", "Random Number Generator", "generators", "Pick random numbers within any range.", Dices, "random number dice"),
  t("random-color-generator", "Random Color Generator", "generators", "Generate random colors and palettes.", Palette, "random color palette hex"),
  t("css-gradient-generator", "CSS Gradient Generator", "generators", "Design linear gradients and copy the CSS.", Blend, "css gradient linear", { added: "2026-04-18" }),
  t("css-box-shadow-generator", "CSS Box Shadow Generator", "generators", "Tweak box shadows visually and copy CSS.", Square, "css box shadow", { added: "2026-04-18" }),

  t("zip-creator", "ZIP Creator", "file-media", "Bundle multiple files into a ZIP archive.", FolderArchive, "zip compress archive create"),
  t("zip-extractor", "ZIP Extractor", "file-media", "Open ZIP archives and download individual files.", FolderOpen, "unzip extract archive", { formats: "ZIP" }),
  t("file-information-viewer", "File Information Viewer", "file-media", "Name, size, type and SHA-256 of any file.", FileSearch, "file info size type checksum"),
  t("audio-trimmer", "Audio Trimmer", "file-media", "Cut a section of an audio file and save as WAV.", AudioLines, "audio trim cut mp3 wav", { formats: "MP3, WAV, OGG, M4A", added: "2026-05-01" }),
  t("video-trimmer", "Video Trimmer", "file-media", "Cut a clip from a video file.", Film, "video trim cut mp4", { formats: "MP4, WebM", added: "2026-05-01" }),
  t("video-to-gif", "Video to GIF", "file-media", "Convert short video clips into GIFs.", Clapperboard, "video gif convert", { formats: "MP4, WebM", added: "2026-05-01" }),
  t("video-frame-extractor", "Video Frame Extractor", "file-media", "Grab still frames from a video as PNG.", Camera, "video frame screenshot still", { formats: "MP4, WebM", added: "2026-05-01" }),
];

export const getTool = (slug: string) => tools.find((x) => x.slug === slug);
export const getCategory = (id: string) => categories.find((c) => c.id === id);
export const toolsIn = (id: CategoryId) => tools.filter((x) => x.category === id);
export const popularTools = tools.filter((x) => x.popular);
export const recentTools = [...tools].sort((a, b) => b.added.localeCompare(a.added)).slice(0, 8);
export const relatedTools = (tool: Tool) => tools.filter((x) => x.category === tool.category && x.slug !== tool.slug).slice(0, 4);

export function searchTools(q: string) {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  return tools
    .map((x) => {
      const cat = getCategory(x.category)!.name.toLowerCase();
      let score = 0;
      if (x.name.toLowerCase().startsWith(s)) score += 10;
      if (x.name.toLowerCase().includes(s)) score += 5;
      if (x.keywords.some((k) => k.startsWith(s))) score += 3;
      if (x.description.toLowerCase().includes(s)) score += 2;
      if (cat.includes(s)) score += 1;
      return { x, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.x);
}

export const toneClass: Record<Category["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/12 text-info",
  cyan: "bg-cyan/15 text-cyan",
  success: "bg-success/12 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};
