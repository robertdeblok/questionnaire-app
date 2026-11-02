/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [{ source: '/questionnaire/:path*', destination: '/:path*', permanent: true }]
  },
}

module.exports = nextConfig
