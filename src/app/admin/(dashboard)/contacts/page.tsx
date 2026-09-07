import type { Metadata } from "next";
import {
  EmptyState,
  Notice,
  PageHeader,
  Pagination,
  Panel,
  SearchForm,
} from "@/components/admin/ui";
import { isLocalMode, listContacts, parsePage } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Liên hệ" };

export default async function AdminContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = parsePage(pageParam);
  const { rows, total, pageCount } = await listContacts({ q, page });

  return (
    <>
      <PageHeader
        eyebrow="Khách hàng"
        title="Liên hệ"
        description="Tin nhắn gửi từ form liên hệ trên website."
      />

      {isLocalMode() && (
        <Notice tone="warn" title="Chế độ local — chưa lưu liên hệ">
          Form liên hệ hiện chỉ ghi log. Bật <code>DATA_SOURCE=supabase</code> để lưu và xem tại
          đây.
        </Notice>
      )}

      <div className="mb-5 flex justify-end">
        <SearchForm
          action="/admin/contacts"
          placeholder="Tên, email, SĐT, nội dung…"
          defaultValue={q}
        />
      </div>

      <Panel bleed>
        {rows.length === 0 ? (
          <EmptyState
            title="Chưa có liên hệ"
            description={q ? "Không có kết quả cho từ khoá này." : undefined}
          />
        ) : (
          <>
            <ul>
              {rows.map((contact) => (
                <li key={contact.id} className="border-b border-[var(--line)] p-5 last:border-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {formatDateTime(contact.created_at)}
                      {contact.source ? ` · ${contact.source}` : ""}
                    </p>
                  </div>
                  <p className="body-sm mt-0.5 text-[var(--muted)]">
                    <a href={`mailto:${contact.email}`} className="hover:text-[var(--brand)]">
                      {contact.email}
                    </a>
                    {contact.phone && (
                      <>
                        {" · "}
                        <a href={`tel:${contact.phone}`} className="hover:text-[var(--brand)]">
                          {contact.phone}
                        </a>
                      </>
                    )}
                  </p>
                  <p className="body-sm mt-2 whitespace-pre-line text-[var(--ink)]">
                    {contact.message}
                  </p>
                </li>
              ))}
            </ul>
            <Pagination
              basePath="/admin/contacts"
              page={page}
              pageCount={pageCount}
              total={total}
              params={{ q }}
            />
          </>
        )}
      </Panel>
    </>
  );
}
