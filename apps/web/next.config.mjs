/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@whb/ui", "@whb/shared", "@whb/db", "@whb/config", "@whb/workers"],
  // BullMQ/ioredis are native-ish CJS server deps; keep them out of the bundle.
  // "@valkey/valkey-glide" is an optional BullMQ backend we never load (we use
  // Redis), so externalizing it avoids a spurious "module not found" build warn.
  serverExternalPackages: ["bullmq", "ioredis", "@valkey/valkey-glide"],
  webpack: (config) => {
    // BullMQ statically references its optional Valkey backend. We only use
    // Redis, so alias the missing package to an empty module to keep the build
    // output free of a misleading "module not found" warning.
    config.resolve = config.resolve ?? {};
    config.resolve.alias = { ...config.resolve.alias, "@valkey/valkey-glide": false };
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=*, microphone=*, geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;