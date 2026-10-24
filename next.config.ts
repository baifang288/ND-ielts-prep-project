import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds a plain static site (GitHub Pages). There is no server
// in that mode, so the AI route is left out and the app uses its non-AI fallbacks.
const isStatic = process.env.STATIC_EXPORT === "1";
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isStatic
    ? { output: "export", trailingSlash: true, basePath, images: { unoptimized: true } }
    : {
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
      }),
  env: { NEXT_PUBLIC_STATIC_EXPORT: isStatic ? "1" : "" },
};

export default nextConfig;
