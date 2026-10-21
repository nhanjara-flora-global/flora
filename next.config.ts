import type { NextConfig } from "next";
import legacy from "./src/lib/data/wp-content.json";

const postSlugs = Object.keys((legacy as { posts: Record<string, unknown> }).posts);
const serviceSlugs = Object.keys((legacy as { services: Record<string, unknown> }).services);

// /services was split into /solutions (capability pages) and /ecosystem (VOAC
// consortium/farm-network pages) — see document/REEDIT.txt. This list must
// match the "ecosystem" cluster in src/lib/services/service-theme.ts; it's
// duplicated (not imported) because that module reaches other app code via
// the "@/…" alias, which next.config.ts's own transpile step can't resolve.
const ecosystemSlugs = [
  "voac-dich-vu-cot-loi-cua-voac",
  "voac-dich-vu-ho-tro-cua-voac",
  "voac-mo-hinh-nong-trai-khong-hoa-chat-voac",
  "voac-doi-tac-nong-trai-huu-co-voac",
];
const newServicePath = (slug: string) =>
  `${ecosystemSlugs.includes(slug) ? "/ecosystem" : "/solutions"}/${slug}`;

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
  images: {
    // Next 16 only serves whitelisted qualities; 95 is for the sharp hero photo.
    qualities: [75, 95],
    ...(supabaseHost && {
      remotePatterns: [
        {
          protocol: "https",
          hostname: supabaseHost,
          pathname: "/storage/v1/object/public/**",
        },
      ],
    }),
  },
  async redirects() {
    return [
      { source: "/blog", destination: "/knowledge", permanent: true },
      { source: "/blog/:slug", destination: "/knowledge/:slug", permanent: true },
      { source: "/dich-vu", destination: "/solutions", permanent: true },
      // Ecosystem slugs first (specific), then the catch-all to /solutions —
      // redirects match in order, so the specific rules must win first.
      ...ecosystemSlugs.map((slug) => ({
        source: `/dich-vu/${slug}`,
        destination: `/ecosystem/${slug}`,
        permanent: true,
      })),
      { source: "/dich-vu/:slug", destination: "/solutions/:slug", permanent: true },
      { source: "/category/blog", destination: "/knowledge", permanent: true },
      { source: "/category/blog/:category", destination: "/knowledge/category/:category", permanent: true },
      // Old news category slugs (renamed to topic-based groups) — these must
      // stay ahead of the generic /news/* → /knowledge/* retirement rules
      // below so they land on the real category in one hop.
      { source: "/news/category/news", destination: "/knowledge/category/thi-truong-xu-huong", permanent: true },
      { source: "/news/category/press", destination: "/knowledge/category/goc-nhin-flora", permanent: true },
      { source: "/news/category/market-information", destination: "/knowledge/category/thi-truong-xu-huong", permanent: true },
      { source: "/:lang(en|vi|zh|ko|hi|si)/news/category/news", destination: "/:lang/knowledge/category/thi-truong-xu-huong", permanent: true },
      { source: "/:lang(en|vi|zh|ko|hi|si)/news/category/press", destination: "/:lang/knowledge/category/goc-nhin-flora", permanent: true },
      { source: "/:lang(en|vi|zh|ko|hi|si)/news/category/market-information", destination: "/:lang/knowledge/category/thi-truong-xu-huong", permanent: true },
      { source: "/category/services", destination: "/solutions", permanent: true },
      { source: "/gioi-thieu", destination: "/about-us", permanent: true },

      // /news retired in favour of /knowledge.
      { source: "/news", destination: "/knowledge", permanent: true },
      { source: "/:lang(en|vi|zh|ko|hi|si)/news", destination: "/:lang/knowledge", permanent: true },
      { source: "/news/category/:category", destination: "/knowledge/category/:category", permanent: true },
      {
        source: "/:lang(en|vi|zh|ko|hi|si)/news/category/:category",
        destination: "/:lang/knowledge/category/:category",
        permanent: true,
      },
      { source: "/news/:slug", destination: "/knowledge/:slug", permanent: true },
      {
        source: "/:lang(en|vi|zh|ko|hi|si)/news/:slug",
        destination: "/:lang/knowledge/:slug",
        permanent: true,
      },

      // /services retired in favour of /solutions + /ecosystem.
      { source: "/services", destination: "/solutions", permanent: true },
      { source: "/:lang(en|vi|zh|ko|hi|si)/services", destination: "/:lang/solutions", permanent: true },
      ...ecosystemSlugs.map((slug) => ({
        source: `/services/${slug}`,
        destination: `/ecosystem/${slug}`,
        permanent: true,
      })),
      ...ecosystemSlugs.map((slug) => ({
        source: `/:lang(en|vi|zh|ko|hi|si)/services/${slug}`,
        destination: `/:lang/ecosystem/${slug}`,
        permanent: true,
      })),
      { source: "/services/:slug", destination: "/solutions/:slug", permanent: true },
      {
        source: "/:lang(en|vi|zh|ko|hi|si)/services/:slug",
        destination: "/:lang/solutions/:slug",
        permanent: true,
      },

      // /products?category=X retired in favour of /products/X.
      {
        source: "/products",
        has: [{ type: "query", key: "category", value: "(?<category>.*)" }],
        destination: "/products/:category",
        permanent: true,
      },
      {
        source: "/:lang(en|vi|zh|ko|hi|si)/products",
        has: [{ type: "query", key: "category", value: "(?<category>.*)" }],
        destination: "/:lang/products/:category",
        permanent: true,
      },

      // WordPress served posts and service pages at the site root.
      ...postSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: `/knowledge/${slug}`,
        permanent: true,
      })),
      ...serviceSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: newServicePath(slug),
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
