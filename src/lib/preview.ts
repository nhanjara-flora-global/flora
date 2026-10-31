import { draftMode } from "next/headers";
import { isAdminAuthed } from "@/lib/admin/auth";

/** Admin đang xem trước bài chưa đăng (Draft Mode bật qua /admin/preview?id=…). */
export async function isPreview(): Promise<boolean> {
  return (await draftMode()).isEnabled && (await isAdminAuthed());
}
