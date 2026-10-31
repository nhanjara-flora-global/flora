/** Giới hạn ô nhập ở /admin/post-categories — dùng chung cho trình soạn (client) và server action. */

export const CATEGORY_NAME_MIN = 2;
export const CATEGORY_NAME_MAX = 60;
export const CATEGORY_DESC_MAX = 300;
export const CATEGORY_SLUG_MIN = 2;
export const CATEGORY_SLUG_MAX = 60;
export const CATEGORY_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const MIGRATION_FILE = "supabase/migrations/0005_post_categories.sql";

/** Gộp khoảng trắng, bỏ đầu cuối. */
export const cleanText = (s: string | undefined) => (s ?? "").replace(/\s+/g, " ").trim();
