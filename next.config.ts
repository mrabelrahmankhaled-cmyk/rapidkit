import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/tools/image/background-remover",
        destination: "/tools/image",
        permanent: true,
      },
      {
        source: "/blog/remove-background-from-image-without-uploading",
        destination: "/blog",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
