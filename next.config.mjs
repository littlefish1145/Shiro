import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import NextBundleAnalyzer from '@next/bundle-analyzer'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import { config } from 'dotenv'

process.title = 'Shiro (NextJS)'

const env = config().parsed || {}
const isProd = process.env.NODE_ENV === 'production'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let commitHash = ''
let commitUrl = ''
const repoInfo = getRepoInfo()

if (repoInfo) {
  commitHash = repoInfo.hash
  commitUrl = repoInfo.url
}

/** @type {import('next').NextConfig} */
let nextConfig = {
  // 关键配置：解决序列化错误
  serverComponentsExternalPackages: [
    '@aws-sdk/client-s3',
    '@upstash/redis',
    'better-auth',
    'crossbell',
    'mongoose',
    '@prisma/client',
    'drizzle-orm',
    'js-yaml',
    'katex',
    'mermaid',
    'openai',
    'pngjs',
    'rss',
    'socket.io-client',
    'unified',
    'xss'
  ],

  env: {
    COMMIT_HASH: commitHash,
    COMMIT_URL: commitUrl,
  },
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  output: 'standalone',
  assetPrefix: isProd ? env.ASSETPREFIX || undefined : undefined,
  
  compiler: {
    // 移除生产环境的data属性，减小包体积
    reactRemoveProperties: isProd ? { 
      properties: ['^data-id$', '^data-(\\w+)-id$'] 
    } : false,
  },
  
  experimental: {
    serverMinification: true,
    webpackBuildWorker: true,
    optimizePackageImports: [
      'dayjs',
      'lodash',
      'jotai',
      'clsx',
      'chroma-js',
      'fuse.js'
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox; style-src 'unsafe-inline';",
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ],
      }
    ]
  },

  async rewrites() {
    return {
      beforeFiles: [
        { source: '/atom.xml', destination: '/feed' },
        { source: '/feed.xml', destination: '/feed' },
        { source: '/sitemap.xml', destination: '/sitemap' },
      ],
    }
  },

  webpack: (config, { isServer }) => {
    config.resolve.alias['jotai'] = path.resolve(
      __dirname,
      'node_modules/jotai',
    )

    // 只在服务端外部化这些包
    if (isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      })
    }

    config.plugins.push(
      codeInspectorPlugin({ bundler: 'webpack', hotKeys: ['metaKey'] }),
    )

    // 优化moment.js的打包（如果存在）
    config.plugins.push(new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/
    }))

    return config
  },
}

// 生产环境禁用源码映射以减小体积
if (isProd) {
  nextConfig.compiler = {
    ...nextConfig.compiler,
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  }
}

if (process.env.ANALYZE === 'true') {
  nextConfig = NextBundleAnalyzer({
    enabled: true,
  })(nextConfig)
}

export default nextConfig

function getRepoInfo() {
  if (process.env.VERCEL) {
    const { VERCEL_GIT_PROVIDER, VERCEL_GIT_REPO_SLUG, VERCEL_GIT_REPO_OWNER } =
      process.env

    switch (VERCEL_GIT_PROVIDER) {
      case 'github': {
        return {
          hash: process.env.VERCEL_GIT_COMMIT_SHA,
          url: `https://github.com/${VERCEL_GIT_REPO_OWNER}/${VERCEL_GIT_REPO_SLUG}/commit/${process.env.VERCEL_GIT_COMMIT_SHA}`,
        }
      }
    }
  } else {
    return getRepoInfoFromGit()
  }
}

function getRepoInfoFromGit() {
  try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD')
      .toString()
      .trim()
    const remoteName = execSync(`git config branch.${currentBranch}.remote`)
      .toString()
      .trim()
    let remoteUrl = execSync(`git remote get-url ${remoteName}`)
      .toString()
      .trim()

    const hash = execSync('git rev-parse HEAD').toString().trim()
    
    if (remoteUrl.startsWith('git@')) {
      remoteUrl = remoteUrl
        .replace(':', '/')
        .replace('git@', 'https://')
        .replace('.git', '')
    } else if (remoteUrl.endsWith('.git')) {
      remoteUrl = remoteUrl.slice(0, -4)
    }

    let webUrl
    if (remoteUrl.includes('github.com')) {
      webUrl = `${remoteUrl}/commit/${hash}`
    } else if (remoteUrl.includes('gitlab.com')) {
      webUrl = `${remoteUrl}/-/commit/${hash}`
    } else if (remoteUrl.includes('bitbucket.org')) {
      webUrl = `${remoteUrl}/commits/${hash}`
    } else {
      webUrl = `${remoteUrl}/commits/${hash}`
    }

    return { hash, url: webUrl }
  } catch (error) {
    console.error('Error fetching repo info:', error?.stderr?.toString())
    return null
  }
}
