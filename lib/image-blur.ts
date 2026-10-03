// Shared `blurDataURL` for next/image. A ~2:3 SVG shimmer tinted to match
// the ivory/bone product-card background so cards show *something* while
// the real photograph is still coming over the wire. Keeping it inline
// (not a per-image blurhash) means no build-time image analysis — every
// <Image> can opt in with one import.

const SHIMMER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 15">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F2E6D2"/>
      <stop offset="50%" stop-color="#EBD9BE"/>
      <stop offset="100%" stop-color="#F2E6D2"/>
    </linearGradient>
  </defs>
  <rect width="10" height="15" fill="url(#g)"/>
</svg>`;

export const PRODUCT_BLUR_DATA_URL = `data:image/svg+xml;base64,${
  typeof window === 'undefined'
    ? Buffer.from(SHIMMER_SVG).toString('base64')
    : btoa(SHIMMER_SVG)
}`;
