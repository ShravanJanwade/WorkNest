/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
     images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        port: "",
        pathname: "/**", // allow any path under ik.imagekit.io
      },
      {
        protocol: "https",
        hostname: "s3.us-east-005.backblazeb2.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
