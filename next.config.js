const nextConfig = {
    reactCompiler: true,

      images: {
        remotePatterns: [
          { protocol: 'http', hostname: '127.0.0.1', port: '8000' },
          { protocol: 'http', hostname: '192.168.88.234', port: '8000' },
        ],
        // Prefer AVIF → WebP for up to 50% smaller images
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // Cache optimised images for 30 days
        minimumCacheTTL: 2592000,
        // Disallow SVG MIME type to avoid XSS
        dangerouslyAllowSVG: false,
      },
};

export default nextConfig;
