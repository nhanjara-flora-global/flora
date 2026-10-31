"use client";

import { usePathname } from "next/navigation";

/** Chỉ hiện nội dung trên trang chủ — cho ô quảng cáo nằm phía trên header. */
export function HomeOnly({ home, children }: { home: string; children: React.ReactNode }) {
  return usePathname() === home ? children : null;
}
