/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Custom loader — Cloudinary-hosted admin uploads are served via
    // Cloudinary's own on-the-fly transformations (f_auto,q_auto,w_*)
    // instead of being pulled through Next's /_next/image optimiser.
    // Local /public assets still fall through to the default loader.
    loader: 'custom',
    loaderFile: './lib/image-loader.ts',
    // Product images live on Cloudinary once uploaded from the admin
    // panel. Whitelisted here so Next <Image> accepts the src when the
    // optimiser is turned back on (currently unoptimized:true bypasses).
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
    // Cache each optimised variant for a year. Cloudinary urls are
    // content-addressed and local webp assets are versioned by the build,
    // so repeat visits should hit the on-disk cache instead of re-running
    // the optimiser. Default was 60s, which forced a re-fetch per visit.
    minimumCacheTTL: 31536000,
    // Trimmed from Next's defaults — a saree card never renders at 3840px
    // and the extra variants slow the first `/_next/image?...` request
    // because the optimiser generates them lazily on demand.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
