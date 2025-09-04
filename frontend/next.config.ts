import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',            // enables `next export` → ./out
  images: { unoptimized: true }, // makes <Image> work when exported
  basePath: '/ui'
};

export default nextConfig;
