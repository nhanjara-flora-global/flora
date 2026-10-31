"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterState } from "@/app/actions/newsletter";
import type { Locale } from "@/lib/i18n/config";

type Copy = {
  title: string;
  body: string;
  email: string;
  submit: string;
  done: string;
  error: string;
};

/** Ô đăng ký bản tin, viền trên màu harvest, nằm trong dải quảng cáo. */
export function NewsletterSignup({ locale, copy }: { locale: Locale; copy: Copy }) {
  const [state, action, pending] = useActionState<NewsletterState, FormData>(
    subscribeNewsletter,
    { status: "idle" },
  );

  return (
    <aside className="bg-ad-bg p-4">
      <div className="mx-auto max-w-[970px]">
        <form
          action={action}
          className="flex flex-wrap items-center gap-x-6 gap-y-3.5 border-t-4 border-harvest bg-white px-6 py-5"
        >
          <input type="hidden" name="locale" value={locale} />
          <div className="flex flex-[1_1_320px] flex-col gap-1">
            <h2 className="font-serif text-xl font-bold leading-tight">{copy.title}</h2>
            <p className="text-[13px] text-ink-2">{copy.body}</p>
          </div>
          <div className="flex flex-[1_1_320px] flex-wrap items-end gap-2">
            <label className="flex flex-[1_1_200px] flex-col gap-1 text-xs text-ink-2">
              {copy.email}
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="ten@congty.vn"
                className="h-11 border border-[#8a8a8a] px-3 text-sm text-ink"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="h-11 bg-ink px-[18px] text-sm font-bold text-white disabled:opacity-60"
            >
              {copy.submit}
            </button>
          </div>
          {state.status !== "idle" && (
            <p
              role="status"
              className={`basis-full text-sm font-semibold ${
                state.status === "ok" ? "text-primary" : "text-[#b42318]"
              }`}
            >
              {state.status === "ok" ? copy.done : copy.error}
            </p>
          )}
        </form>
      </div>
    </aside>
  );
}
