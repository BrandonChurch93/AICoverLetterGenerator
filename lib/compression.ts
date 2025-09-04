import LZString from "lz-string";

/**
 * Compress text using LZ-string compression
 * Reduces data size for network transfer and storage
 */
export function compressText(text: string): string {
  if (!text) return "";

  try {
    // Use UTF16 compression for better compatibility with JSON
    const compressed = LZString.compressToUTF16(text);

    // Only use compressed version if it's actually smaller
    if (compressed && compressed.length < text.length) {
      return compressed;
    }

    return text;
  } catch (error) {
    console.error("Compression error:", error);
    return text; // Return original on error
  }
}

/**
 * Decompress text compressed with LZ-string
 */
export function decompressText(compressed: string): string {
  if (!compressed) return "";

  try {
    // Try to decompress
    const decompressed = LZString.decompressFromUTF16(compressed);

    // If decompression fails, it might be uncompressed text
    if (!decompressed) {
      return compressed;
    }

    return decompressed;
  } catch (error) {
    console.error("Decompression error:", error);
    return compressed; // Return original on error
  }
}

/**
 * Compress data for sessionStorage
 * Helps stay within browser storage limits
 */
export function compressForStorage(data: any): string {
  try {
    const jsonString = JSON.stringify(data);
    return LZString.compressToUTF16(jsonString);
  } catch (error) {
    console.error("Storage compression error:", error);
    return "";
  }
}

/**
 * Decompress data from sessionStorage
 */
export function decompressFromStorage(compressed: string): any {
  if (!compressed) return null;

  try {
    const decompressed = LZString.decompressFromUTF16(compressed);
    if (!decompressed) return null;

    return JSON.parse(decompressed);
  } catch (error) {
    console.error("Storage decompression error:", error);
    return null;
  }
}

/**
 * Calculate compression ratio
 * Useful for debugging and optimization
 */
export function getCompressionRatio(
  original: string,
  compressed: string
): number {
  if (!original || !compressed) return 0;

  const ratio = ((original.length - compressed.length) / original.length) * 100;
  return Math.round(ratio * 100) / 100; // Round to 2 decimal places
}

/**
 * Estimate storage size in bytes
 * Helps track sessionStorage usage
 */
export function getStorageSize(data: any): number {
  try {
    const jsonString = JSON.stringify(data);
    // JavaScript strings are UTF-16, so 2 bytes per character
    return jsonString.length * 2;
  } catch (error) {
    return 0;
  }
}

/**
 * Check if compression is beneficial
 * Returns true if compressed version is smaller
 */
export function shouldCompress(text: string): boolean {
  if (!text || text.length < 100) return false; // Don't compress small strings

  const compressed = compressText(text);
  return compressed.length < text.length;
}
