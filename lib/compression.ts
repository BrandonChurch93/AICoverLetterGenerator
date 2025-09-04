import LZString from "lz-string";

/**
 * Compress text for efficient storage and transmission
 */
export function compressText(text: string): string {
  if (!text) return "";
  return LZString.compressToUTF16(text);
}

/**
 * Decompress text
 */
export function decompressText(compressed: string): string {
  if (!compressed) return "";
  return LZString.decompressFromUTF16(compressed) || compressed;
}

/**
 * Calculate compression ratio
 */
export function getCompressionRatio(
  original: string,
  compressed: string
): number {
  if (!original || !compressed) return 0;
  return Math.round((1 - compressed.length / original.length) * 100);
}
