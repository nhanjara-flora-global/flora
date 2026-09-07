"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: "home" | "orders" | "products" | "posts" | "mail" };

const ITEMS: Item[] = [
  { href: "/admin", label: "Tổng quan", icon: "home" },
  { href: "/admin/orders", label: "Đơn hàng", icon: "orders" },
  { href: "/admin/products", label: "Sản phẩm", icon: "products" },
  { href: "/admin/posts", label: "Bài viết", icon: "posts" },
  { href: "/admin/contacts", label: "Liên hệ", icon: "mail" },
];

const PATHS: Record<Item["icon"], string> = {
  home: "M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5",
  orders: "M4 6h16M4 12h16M4 18h10",
  products: "M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9ZM12 12l8-4.5M12 12v9M12 12 4 7.5",
  posts: "M5 4h11l3 3v13H5V4ZM8 10h8M8 14h8M8 18h5",
  mail: "M3 6h18v12H3V6Zm0 0 9 7 9-7",
};

function Icon({ name }: { name: Item["icon"] }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-[18px] shrink-0"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

/** `/admin` must only light up on the dashboard itself, not on every child route. */
function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminNav({ orientation }: { orientation: "sidebar" | "bar" }) {
  const pathname = usePathname();

  if (orientation === "bar") {
    return (
      <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
        {ITEMS.map((item) => {
          const on = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                on ? "bg-white text-[var(--brand)]" : "bg-white/10 text-white/80 hover:bg-white/20"
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {ITEMS.map((item) => {
        const on = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={`flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium transition ${
              on ? "bg-white text-[var(--brand)]" : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon name={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
