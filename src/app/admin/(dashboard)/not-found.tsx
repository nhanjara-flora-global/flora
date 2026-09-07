import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h1 className="display-md text-[var(--ink)]">Không tìm thấy</h1>
      <p className="body-sm mt-2 text-[var(--muted)]">
        Bản ghi này không tồn tại hoặc đã bị xoá.
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-block rounded-md bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[var(--brand-2)]"
      >
        Về tổng quan
      </Link>
    </div>
  );
}
