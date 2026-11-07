import "jszip";

// JSZip documents this browser streaming API but omits it from its entry type.
declare module "jszip" {
  interface JSZipObject {
    internalStream(type: "uint8array"): JSZipStreamHelper<Uint8Array>;
  }
}