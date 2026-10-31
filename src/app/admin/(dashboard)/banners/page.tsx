import type { Metadata } from "next";
import { SlotListPage } from "@/components/admin/site-admin";

export const metadata: Metadata = { title: "Banner" };

export default function AdminBannersPage() {
  return <SlotListPage kind="banner" />;
}
