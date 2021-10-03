export function deflate (
  data: Uint8Array | ArrayBuffer | string,
  options?: {
    level?: number
    windowBits?: number
    memLevel?: number
    strategy?: number
    dictionary?: string | ArrayBuffer | Uint8Array
    raw?: boolean
  }
): Uint8Array
