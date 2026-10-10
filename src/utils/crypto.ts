/**
 * Cryptographic and formatting utilities for RBP-DFS.
 * Uses native WebCrypto API for secure, verifiable, read-only hash calculations.
 */

export async function computeFileHashes(file: File): Promise<{ sha256: string; sha1: string; byteSize: number }> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Calculate SHA-256
  const hashBuffer256 = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray256 = Array.from(new Uint8Array(hashBuffer256));
  const sha256 = hashArray256.map(b => b.toString(16).padStart(2, '0')).join('');

  // Calculate SHA-1
  const hashBuffer1 = await crypto.subtle.digest('SHA-1', arrayBuffer);
  const hashArray1 = Array.from(new Uint8Array(hashBuffer1));
  const sha1 = hashArray1.map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    sha256,
    sha1,
    byteSize: file.size,
  };
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatUtcDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  } catch {
    return isoString;
  }
}

export function detectMagicHeader(buffer: Uint8Array): { mime: string; detectedName: string } {
  // Check common magic signatures
  if (buffer.length >= 16) {
    // SQLite format 3\0
    const sqliteHeader = [0x53, 0x51, 0x4c, 0x69, 0x74, 0x65, 0x20, 0x66, 0x6f, 0x72, 0x6d, 0x61, 0x74, 0x20, 0x33, 0x00];
    const isSqlite = sqliteHeader.every((b, idx) => buffer[idx] === b);
    if (isSqlite) return { mime: 'application/x-sqlite3', detectedName: 'SQLite 3 Database' };
  }

  if (buffer.length >= 8) {
    // PNG
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return { mime: 'image/png', detectedName: 'PNG Portable Network Graphics' };
    }
  }

  if (buffer.length >= 3) {
    // JPEG
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { mime: 'image/jpeg', detectedName: 'JPEG / EXIF Image' };
    }
  }

  if (buffer.length >= 4) {
    // PDF
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return { mime: 'application/pdf', detectedName: 'PDF Document' };
    }
    // ZIP / APK / JAR
    if (buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
      return { mime: 'application/zip', detectedName: 'ZIP / Android APK Package' };
    }
    // ELF
    if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
      return { mime: 'application/x-executable', detectedName: 'Linux ELF Executable' };
    }
    // Windows PE / MZ
    if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
      return { mime: 'application/x-dosexec', detectedName: 'Windows PE Executable / DLL' };
    }
  }

  return { mime: 'application/octet-stream', detectedName: 'Binary Bitstream Data' };
}
