/** @type {import('next').NextConfig} */
const nextConfig = {

  reactStrictMode: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Product images live on Cloudinary once uploaded from the admin
    // panel. Whitelisted here so Next <Image> accepts the src when the
    // optimiser is turned back on (currently unoptimized:true bypasses).
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
