import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Ensure Turbopack resolves modules from the correct project directory
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Additional Next.js options can be added here
};

export default nextConfig;
