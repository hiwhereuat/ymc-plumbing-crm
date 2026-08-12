import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'respect-shut-sending-ghz.trycloudflare.com',
  ],
  devIndicators: false,
};

export default nextConfig;
