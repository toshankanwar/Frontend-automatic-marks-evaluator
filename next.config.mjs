/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static-assets.toshankanwar.in",
      },
    ],
  },  
};

export default nextConfig;
