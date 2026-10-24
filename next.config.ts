import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Microphone is needed for the Speaking module; everything else is off.
          { key: "Permissions-Policy", value: "microphone=(self), camera=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
