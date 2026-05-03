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
    // Guard against CI systems exporting the literal string "undefined" or "null"
    let apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl || apiUrl === "undefined" || apiUrl === "null") {
      return [];
    }

    apiUrl = apiUrl.trim();
    if (
      apiUrl.startsWith("/") ||
      apiUrl.startsWith("http://") ||
      apiUrl.startsWith("https://")
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

// Use CommonJS export for maximum compatibility in CI environments
module.exports = nextConfig;
