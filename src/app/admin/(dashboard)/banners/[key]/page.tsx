import type { Metadata } from "next";
import { SlotEditPage } from "@/components/admin/site-admin";

export const metadata: Metadata = { title: "Sửa banner" };

export default async function AdminBannerEditPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return <SlotEditPage kind="banner" slotKey={key} />;
}
