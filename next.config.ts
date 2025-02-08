import type { NextConfig } from "next";

const path = require("path");

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure that all imports of 'yjs' resolve to the same instance
      config.resolve.alias["yjs"] = path.resolve(__dirname, "node_modules/yjs");
    }
    return config;
  },
  images: {
    domains: [
      "via.placeholder.com",
      "api.dicebear.com",
      "robohash.org",
      "res.cloudinary.com", // 👈 Aggiunto dominio Cloudinary
    ],
  },
  /* Altre configurazioni Next.js */
};

export default nextConfig;
