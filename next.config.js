/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for CloudPanel's Node.js site type: produces .next/standalone
  // with a self-contained server.js + minimal node_modules, so the VPS does
  // not need `next start` or the full node_modules tree at runtime. Vercel
  // manages its own build/runtime format and sets VERCEL=1 during builds,
  // so this is skipped there.
  output: process.env.VERCEL ? undefined : 'standalone',

  // Research protocols / generated PDFs are read/served from the local
  // Ubuntu filesystem, not next/image's remote loader, so no remotePatterns
  // are needed. Keep image optimization local-only.
  images: {
    unoptimized: false,
  },

  // Research Protocol uploads and generated Ethical Clearance PDFs can
  // exceed the 1MB Server Action default body limit.
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
    // Silence workspace-root inference warnings when deployed under
    // /home/cloudpanel/htdocs/<site>/ alongside CloudPanel's own tooling.
    outputFileTracingRoot: __dirname,
    // pdfkit's font engine (fontkit) does an optional runtime require of
    // iconv-lite with its own fallback shim when that package isn't
    // installed. Webpack can't see that fallback and errors on the
    // require; excluding pdfkit from bundling lets Node's native require
    // resolve it directly from node_modules at runtime instead, exactly
    // as it would running outside a bundler.
    serverComponentsExternalPackages: ['pdfkit'],
  },

  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
