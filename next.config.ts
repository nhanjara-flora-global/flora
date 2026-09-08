import type { NextConfig } from "next";
import legacy from "./src/lib/data/wp-content.json";

const postSlugs = Object.keys((legacy as { posts: Record<string, unknown> }).posts);
const serviceSlugs = Object.keys((legacy as { services: Record<string, unknown> }).services);

// Cho phép next/image tải ảnh bìa từ Supabase Storage (bucket post-images).
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  experimental: {
    // Ảnh tải lên qua server action đi kèm multipart — mặc định 1MB không đủ.
    // Giới hạn thật của ảnh là 8MB (kiểm trong uploadPostImage); chừa dư cho phần bao multipart.
    serverActions: { bodySizeLimit: "12mb" },
  },
  images: supabaseHost
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
  async redirects() {
    return [
      { source: "/blog", destination: "/news", permanent: true },
      { source: "/blog/:slug", destination: "/news/:slug", permanent: true },
      { source: "/dich-vu", destination: "/services", permanent: true },
      { source: "/dich-vu/:slug", destination: "/services/:slug", permanent: true },
      { source: "/category/blog", destination: "/news", permanent: true },
      { source: "/category/blog/:category", destination: "/news/category/:category", permanent: true },
      // Old news category slugs (renamed to topic-based groups)
      { source: "/news/category/news", destination: "/news/category/thi-truong-xu-huong", permanent: true },
      { source: "/news/category/press", destination: "/news/category/goc-nhin-flora", permanent: true },
      { source: "/news/category/market-information", destination: "/news/category/thi-truong-xu-huong", permanent: true },
      { source: "/:lang(en|vi|zh|ko|hi|si)/news/category/news", destination: "/:lang/news/category/thi-truong-xu-huong", permanent: true },
      { source: "/:lang(en|vi|zh|ko|hi|si)/news/category/press", destination: "/:lang/news/category/goc-nhin-flora", permanent: true },
      { source: "/:lang(en|vi|zh|ko|hi|si)/news/category/market-information", destination: "/:lang/news/category/thi-truong-xu-huong", permanent: true },
      { source: "/category/services", destination: "/services", permanent: true },
      { source: "/gioi-thieu", destination: "/about-us", permanent: true },
      // WordPress served posts and service pages at the site root.
      ...postSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: `/news/${slug}`,
        permanent: true,
      })),
      ...serviceSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: `/services/${slug}`,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
