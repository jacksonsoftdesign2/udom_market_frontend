// src/utils/imageUtils.js
// Detects AVIF support once, caches the result.
let avifSupported = null;

export async function supportsAVIF() {
  if (avifSupported !== null) return avifSupported;
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => { avifSupported = true; resolve(true); };
    img.onerror = () => { avifSupported = false; resolve(false); };
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKBzgADlAgIGkyCR/wAA==';
  });
}

// Pick the best src for a given image row and size
// size: 'thumb' | 'medium' | 'large'
// imageRow: object with thumb_webp, thumb_avif, medium_webp, etc.
// Falls back to image_url (large_webp) if variants not ready yet.
export function pickSrc(imageRow, size, avif) {
  if (!imageRow) return null;
  if (avif) {
    if (size === 'thumb'  && imageRow.thumb_avif)  return imageRow.thumb_avif;
    if (size === 'medium' && imageRow.medium_avif) return imageRow.medium_avif;
    if (size === 'large'  && imageRow.large_avif)  return imageRow.large_avif;
  }
  if (size === 'thumb'  && imageRow.thumb_webp)  return imageRow.thumb_webp;
  if (size === 'medium' && imageRow.medium_webp) return imageRow.medium_webp;
  if (size === 'large'  && imageRow.large_webp)  return imageRow.large_webp;
  // background job not done yet — fall back to large_webp (always available)
  return imageRow.image_url || null;
}