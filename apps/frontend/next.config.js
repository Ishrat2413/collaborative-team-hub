/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
  async rewrites() {
    // Only add the external API rewrite when NEXT_PUBLIC_API_URL is explicitly set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (
      apiUrl &&
      (apiUrl.startsWith("/") ||
        apiUrl.startsWith("http://") ||
        apiUrl.startsWith("https://"))
    ) {
      return [
        {
          source: "/api/:path*",
          destination: `${apiUrl.replace(/\/$/, "")}/api/:path*`,
        },
      ];
    }

    // No external API configured — do not create an invalid rewrite.
    // Next will serve API routes locally or the hosting platform will handle routing.
    return [];
  },
};

export default nextConfig;
