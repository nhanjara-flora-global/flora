"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/posts", label: "Bài viết" },
  { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/contacts", label: "Liên hệ" },
];

/** `/admin` chỉ sáng ở đúng trang tổng quan, không sáng ở mọi route con. */
function isActive(pathname: string, href: string): boolean {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export function AdminNav({ orientation }: { orientation: "sidebar" | "bar" }) {
  const pathname = usePathname();

  if (orientation === "bar") {
    return (
      <nav className="-mx-1 flex gap-1 overflow-x-auto">
        {ITEMS.map((item) => {
          const on = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${
                on
                  ? "bg-[var(--bg-soft)] text-[var(--brand)]"
                  : "text-[var(--muted)] hover:text-[var(--brand)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-0.5">
      {ITEMS.map((item) => {
        const on = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={on ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              on
                ? "bg-[var(--bg-soft)] text-[var(--brand)]"
                : "text-[var(--ink)] hover:bg-[var(--bg-soft)] hover:text-[var(--brand)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
