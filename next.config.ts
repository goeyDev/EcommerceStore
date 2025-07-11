import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // serverActions: {
  //   bodySizeLimit: "10mb", // or '2mb', '5mb', etc.
  // },
  images: {
    domains: ["firebasestorage.googleapis.com"],
  },
};

export default nextConfig;
