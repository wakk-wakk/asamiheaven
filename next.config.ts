import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/services/japanese-nuru-massage',
        destination: '/services/nuru-massage',
        permanent: true,
      },
      {
        source: '/services/japanese-nuru-massage/:path*',
        destination: '/services/nuru-massage/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
