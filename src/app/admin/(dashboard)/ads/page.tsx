import type { Metadata } from "next";
import { SlotListPage } from "@/components/admin/site-admin";

export const metadata: Metadata = { title: "Quảng cáo" };

export default function AdminAdsPage() {
  return <SlotListPage kind="ad" />;
}
