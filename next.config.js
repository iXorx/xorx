import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined || process.env.__NEXT_PRIVATE_ORIGIN || 'http://localhost:3000'

const githubPagesBasePath = process.env.NEXT_PUBLIC_GITHUB_PAGES_BASE_PATH || ''
const githubPagesAssetPrefix = process.env.NEXT_PUBLIC_GITHUB_PAGES_ASSET_PREFIX || ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Support the Next.js "output: 'export'" static export mode when
  // `NEXT_OUTPUT_EXPORT` is set to `1`. This replaces the legacy
  // `next export` CLI which was removed in newer Next.js releases.
  output: process.env.NEXT_OUTPUT_EXPORT === '1' ? 'export' : undefined,
  // These options stay blank during normal dev/production builds and only
  // kick in when exporting for GitHub Pages.
  basePath: githubPagesBasePath || undefined,
  assetPrefix: githubPagesAssetPrefix || undefined,
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
