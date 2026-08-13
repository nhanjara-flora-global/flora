import type { NextConfig } from "next";
import legacy from "./src/lib/data/wp-content.json";

const postSlugs = Object.keys((legacy as { posts: Record<string, unknown> }).posts);
const serviceSlugs = Object.keys((legacy as { services: Record<string, unknown> }).services);

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/blog", destination: "/news", permanent: true },
      { source: "/blog/:slug", destination: "/news/:slug", permanent: true },
      { source: "/dich-vu", destination: "/services", permanent: true },
      { source: "/dich-vu/:slug", destination: "/services/:slug", permanent: true },
      { source: "/category/blog", destination: "/news", permanent: true },
      { source: "/category/blog/:category", destination: "/news/category/:category", permanent: true },
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
