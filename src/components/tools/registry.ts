import type { ComponentType } from "react";
import * as I from "./image";
import * as P from "./pdf";
import * as T from "./text";
import * as D from "./dev";
import * as G from "./generators";
import * as M from "./media";

export const toolComponents: Record<string, ComponentType> = {
  "image-compressor": I.ImageCompressor, "image-resizer": I.ImageResizer, "image-cropper": I.ImageCropper,
  "image-converter": I.ImageConverter, "image-rotator": I.ImageRotator, "image-flipper": I.ImageFlipper,
  "image-to-base64": I.ImageToBase64, "base64-to-image": I.Base64ToImage, "image-color-picker": I.ImageColorPicker,
  "image-metadata-viewer": I.ImageMetadataViewer,
  "pdf-merger": P.PdfMerger, "pdf-splitter": P.PdfSplitter, "pdf-compressor": P.PdfCompressor, "pdf-rotator": P.PdfRotator,
  "pdf-page-reorder": P.PdfPageReorder, "pdf-page-extractor": P.PdfPageExtractor, "pdf-to-images": P.PdfToImages, "images-to-pdf": P.ImagesToPdf,
  "word-counter": T.WordCounter, "case-converter": T.CaseConverter, "duplicate-line-remover": T.DuplicateLineRemover,
  "text-reverser": T.TextReverser, "text-sorter": T.TextSorter, "text-diff-checker": T.TextDiffChecker,
  "lorem-ipsum-generator": T.LoremIpsumGenerator, "slug-generator": T.SlugGenerator,
  "json-formatter": D.JsonFormatter, "json-validator": D.JsonValidator, "json-minifier": D.JsonMinifier,
  "base64-encoder": D.Base64Encoder, "base64-decoder": D.Base64Decoder, "uuid-generator": D.UuidGenerator,
  "hash-generator": D.HashGenerator, "jwt-decoder": D.JwtDecoder, "regex-tester": D.RegexTester, "url-encoder-decoder": D.UrlEncoderDecoder,
  "qr-code-generator": G.QrCodeGenerator, "barcode-generator": G.BarcodeGenerator, "password-generator": G.PasswordGenerator,
  "random-number-generator": G.RandomNumberGenerator, "random-color-generator": G.RandomColorGenerator,
  "css-gradient-generator": G.CssGradientGenerator, "css-box-shadow-generator": G.CssBoxShadowGenerator,
  "zip-creator": M.ZipCreator, "zip-extractor": M.ZipExtractor, "file-information-viewer": M.FileInformationViewer,
  "audio-trimmer": M.AudioTrimmer, "video-trimmer": M.VideoTrimmer, "video-to-gif": M.VideoToGif, "video-frame-extractor": M.VideoFrameExtractor,
};
