declare module "gifenc" {
  export function GIFEncoder(): { writeFrame(i: Uint8Array, w: number, h: number, o?: { palette?: number[][]; delay?: number }): void; finish(): void; bytes(): Uint8Array };
  export function quantize(d: Uint8ClampedArray, n: number): number[][];
  export function applyPalette(d: Uint8ClampedArray, p: number[][]): Uint8Array;
}
