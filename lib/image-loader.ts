// Custom next/image loader.
//
// For Cloudinary-hosted admin uploads we skip Next's own `/_next/image`
// optimiser entirely and instead ask Cloudinary to serve a pre-sized,
// auto-format, auto-quality image straight from their CDN. That avoids
// the server-side download-then-resize round-trip Next does on first
// request, which was the real reason admin-added product photos felt
// slow — Next was pulling the full-size original (4-6 MB) off Cloudinary
// before it could hand anything to the browser.
//
// Local assets (/public/**) are served as-is: with `loader: 'custom'`
// set globally in next.config.mjs, the built-in `/_next/image` endpoint
// is disabled, so a round-trip through it 404s. Brand photos live in
// /public already pre-sized and compressed, so skipping the optimiser
// is a non-issue in practice.

type LoaderArgs = { src: string; width: number; quality?: number };

const CLOUDINARY_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload)\/(.+)$/;
// A Cloudinary transform segment is a comma-separated list of
// `key_value` pairs sitting right after /upload/, e.g.
// `f_auto,q_auto,w_1920,c_limit`. We strip any pre-existing segment so
// callers that still pipe URLs through `cloudinaryUrl()` first don't
// result in stacked transforms (which Cloudinary tolerates but wastes a
// pass).
const TRANSFORM_SEGMENT_RE = /^[a-z]_[^/,]+(?:,[a-z]_[^/,]+)*$/;

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  // Inline data URLs are already the final payload — never route through
  // either optimiser (Next's /_next/image rejects data: URLs outright).
  if (src.startsWith('data:')) return src;

  const m = src.match(CLOUDINARY_RE);
  if (m) {
    const [, prefix, rest] = m;
    const slash = rest.indexOf('/');
    const head = slash >= 0 ? rest.slice(0, slash) : rest;
    const tail = slash >= 0 && TRANSFORM_SEGMENT_RE.test(head) ? rest.slice(slash + 1) : rest;
    // `c_limit` — never upscale, only shrink. `f_auto` + `q_auto` let
    // Cloudinary pick AVIF/WebP and the right quality per request.
    const q = typeof quality === 'number' ? `q_${quality}` : 'q_auto';
    return `${prefix}/f_auto,${q},w_${width},c_limit/${tail}`;
  }

  // Local public asset — serve the file directly. We can't route through
  // `/_next/image` here because `loader: 'custom'` in next.config.mjs
  // disables the built-in optimiser endpoint; a round-trip through it
  // 404s. Returning `src` lets Next's static file server deliver the
  // asset as-is. The signature of `_` arguments is kept so the loader
  // contract matches what next/image expects.
  if (src.startsWith('/') && !src.startsWith('//')) {
    void width;
    void quality;
    return src;
  }

  // Remote (non-Cloudinary) URL — pass through unchanged.
  return src;
}
