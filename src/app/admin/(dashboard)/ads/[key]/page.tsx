import type { Metadata } from "next";
import { SlotEditPage } from "@/components/admin/site-admin";

export const metadata: Metadata = { title: "Sửa quảng cáo" };

export default async function AdminAdEditPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return <SlotEditPage kind="ad" slotKey={key} />;
}
