import { exitPreview } from "@/app/actions/posts";

/** Thanh báo admin đang xem trước bài chưa hiện trên website. */
export function PreviewBanner() {
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-3 bg-amber-300 px-4 py-2.5 text-sm font-medium text-amber-950 shadow-lg"
    >
      <span>Bản xem trước — bài này chưa hiện trên website.</span>
      <form action={exitPreview}>
        <button
          type="submit"
          className="rounded-md border border-amber-950/30 bg-white/70 px-3 py-1 hover:bg-white"
        >
          Thoát xem trước
        </button>
      </form>
    </div>
  );
}
