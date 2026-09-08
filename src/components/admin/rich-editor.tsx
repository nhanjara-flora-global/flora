"use client";

import {
  useCallback,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  Plate,
  PlateContent,
  useEditorSelector,
  usePlateEditor,
  type PlateEditor,
} from "platejs/react";
import { RangeApi } from "platejs";
import {
  BasicBlocksPlugin,
  BasicMarksPlugin,
  HighlightPlugin,
  HorizontalRulePlugin,
} from "@platejs/basic-nodes/react";
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontFamilyPlugin,
  FontSizePlugin,
  TextAlignPlugin,
} from "@platejs/basic-styles/react";
import { setAlign } from "@platejs/basic-styles";
import { ListPlugin } from "@platejs/list-classic/react";
import { toggleBulletedList, toggleNumberedList } from "@platejs/list-classic";
import { LinkPlugin } from "@platejs/link/react";
import { insertLink, unwrapLink } from "@platejs/link";
import { ImagePlugin } from "@platejs/media/react";
import { insertImage } from "@platejs/media";
import { TablePlugin } from "@platejs/table/react";
import {
  deleteColumn,
  deleteRow,
  deleteTable,
  insertTable,
  insertTableColumn,
  insertTableRow,
} from "@platejs/table";
import { slateToHtml } from "@/lib/admin/plate-serialize";
import { uploadPostImage } from "@/app/actions/upload";

type Props = { value: string; onChange: (html: string) => void };

const IMG_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

const PLUGINS = [
  BasicBlocksPlugin,
  BasicMarksPlugin,
  HighlightPlugin,
  HorizontalRulePlugin,
  FontColorPlugin,
  FontBackgroundColorPlugin,
  FontSizePlugin,
  FontFamilyPlugin,
  TextAlignPlugin.configure({
    inject: {
      targetPlugins: ["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"],
    },
  }),
  ListPlugin,
  LinkPlugin,
  ImagePlugin,
  TablePlugin,
];

const FONTS = [
  { label: "Mặc định", value: "" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Sans", value: "system-ui, -apple-system, 'Segoe UI', sans-serif" },
  { label: "Mono", value: "ui-monospace, 'Courier New', monospace" },
];
const SIZES = [
  { label: "Cỡ chữ", value: "" },
  { label: "Nhỏ", value: "0.875em" },
  { label: "Thường", value: "1em" },
  { label: "Lớn", value: "1.25em" },
  { label: "Rất lớn", value: "1.5em" },
];

const subscribeNoop = () => () => {};

/** Chỉ dựng Plate phía client — deserialize HTML cần DOMParser (không có ở SSR). */
export function RichEditor(props: Props) {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  if (!isClient) {
    return (
      <div className="rich-editor rich-editor--loading">
        Đang tải trình soạn thảo…
      </div>
    );
  }
  return <PlateRichEditor {...props} />;
}

function PlateRichEditor({ value, onChange }: Props) {
  const [initialHtml] = useState(() => value?.trim() || "<p></p>");
  const editor = usePlateEditor({ plugins: PLUGINS, value: initialHtml });

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const emit = useCallback(
    (v: unknown) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => onChange(slateToHtml(v)), 300);
    },
    [onChange],
  );

  return (
    <div className="rich-editor">
      <Plate editor={editor} onChange={({ value }) => emit(value)}>
        <Toolbar editor={editor} />
        <PlateContent
          className="prose-legacy rich-editor__content"
          placeholder="Dán nội dung từ Word / Google Docs vào đây — định dạng được giữ nguyên."
        />
      </Plate>
    </div>
  );
}

// ── Toolbar ────────────────────────────────────────────────────────

function Toolbar({ editor }: { editor: PlateEditor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imgMenu, setImgMenu] = useState(false);

  const s = useEditorSelector((e) => {
    const m = (e.api.marks() ?? {}) as Record<string, unknown>;
    const block = e.api.block()?.[0] as
      | { type?: string; align?: string }
      | undefined;
    return {
      bold: !!m.bold,
      italic: !!m.italic,
      underline: !!m.underline,
      strikethrough: !!m.strikethrough,
      subscript: !!m.subscript,
      superscript: !!m.superscript,
      highlight: !!m.highlight,
      color: (m.color as string) || "#000000",
      backgroundColor: (m.backgroundColor as string) || "#ffff00",
      fontFamily: (m.fontFamily as string) || "",
      fontSize: (m.fontSize as string) || "",
      blockType: block?.type || "p",
      align: block?.align || "left",
    };
  }, []);

  const focus = () => editor.tf.focus();
  const mark = (key: string, opts?: { remove?: string }) => {
    editor.tf.toggleMark(key, opts);
    focus();
  };
  const setMarkValue = (key: string, val: string) => {
    if (val) editor.tf.addMark(key, val);
    else editor.tf.removeMark(key);
    focus();
  };
  const block = (type: string) => {
    editor.tf.toggleBlock(type);
    focus();
  };

  const uploadAndInsert = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadPostImage(fd);
        if (!res.ok) {
          alert(res.error);
          return;
        }
        insertImage(editor, res.url);
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  const changeCase = (mode: "upper" | "lower") => {
    const sel = editor.selection;
    if (!sel || RangeApi.isCollapsed(sel)) return;
    const entries = [
      ...editor.api.nodes<{ text: string }>({
        at: sel,
        match: (n) => editor.api.isText(n),
      }),
    ];
    editor.tf.withoutNormalizing(() => {
      for (const [, path] of entries) {
        const nodeRange = editor.api.range(path);
        if (!nodeRange) continue;
        const range = RangeApi.intersection(sel, nodeRange);
        if (!range) continue;
        const text = editor.api.string(range);
        const next =
          mode === "upper"
            ? text.toLocaleUpperCase("vi")
            : text.toLocaleLowerCase("vi");
        if (next !== text) editor.tf.insertText(next, { at: range });
      }
    });
    focus();
  };

  const link = () => {
    if (editor.api.some({ match: { type: "a" } })) {
      unwrapLink(editor);
      focus();
      return;
    }
    const url = window.prompt("Dán URL liên kết:");
    if (!url) return;
    insertLink(editor, { url });
    focus();
  };

  return (
    <div className="rich-editor__toolbar">
      <Btn label="B" title="Đậm" active={s.bold} style={{ fontWeight: 800 }} onClick={() => mark("bold")} />
      <Btn label="I" title="Nghiêng" active={s.italic} style={{ fontStyle: "italic" }} onClick={() => mark("italic")} />
      <Btn label="U" title="Gạch chân" active={s.underline} style={{ textDecoration: "underline" }} onClick={() => mark("underline")} />
      <Btn label="S" title="Gạch ngang" active={s.strikethrough} style={{ textDecoration: "line-through" }} onClick={() => mark("strikethrough")} />
      <Btn label="x²" title="Chỉ số trên" active={s.superscript} onClick={() => mark("superscript", { remove: "subscript" })} />
      <Btn label="x₂" title="Chỉ số dưới" active={s.subscript} onClick={() => mark("subscript", { remove: "superscript" })} />

      <span className="rich-editor__sep" />

      <Btn label="H2" title="Tiêu đề mục" active={s.blockType === "h2"} onClick={() => block("h2")} />
      <Btn label="H3" title="Tiêu đề phụ" active={s.blockType === "h3"} onClick={() => block("h3")} />
      <Btn label="¶" title="Đoạn thường" onClick={() => block("p")} />
      <Btn label="•—" title="Danh sách chấm" active={s.blockType === "li"} onClick={() => { toggleBulletedList(editor); focus(); }} />
      <Btn label="1." title="Danh sách số" onClick={() => { toggleNumberedList(editor); focus(); }} />
      <Btn label="❝" title="Trích dẫn" active={s.blockType === "blockquote"} onClick={() => block("blockquote")} />
      <Btn label="🔗" title="Liên kết" onClick={link} />

      <span className="rich-editor__sep" />

      <label className="rich-editor__color" title="Màu chữ">
        <span aria-hidden>A</span>
        <input type="color" value={s.color} onChange={(e) => setMarkValue("color", e.target.value)} />
      </label>
      <Btn label="✕" title="Xoá màu chữ" onClick={() => setMarkValue("color", "")} />
      <Btn label="🖍" title="Bút dạ (vàng)" active={s.highlight} onClick={() => mark("highlight")} />

      <span className="rich-editor__sep" />

      <Btn label="⯇" title="Canh trái" active={s.align === "left"} onClick={() => { setAlign(editor, "left"); focus(); }} />
      <Btn label="≡" title="Canh giữa" active={s.align === "center"} onClick={() => { setAlign(editor, "center"); focus(); }} />
      <Btn label="⯈" title="Canh phải" active={s.align === "right"} onClick={() => { setAlign(editor, "right"); focus(); }} />

      <span className="rich-editor__sep" />

      <select className="rich-editor__select" title="Font chữ" value={s.fontFamily} onChange={(e) => setMarkValue("fontFamily", e.target.value)}>
        {FONTS.map((f) => (
          <option key={f.label} value={f.value}>{f.label}</option>
        ))}
      </select>
      <select className="rich-editor__select" title="Cỡ chữ" value={s.fontSize} onChange={(e) => setMarkValue("fontSize", e.target.value)}>
        {SIZES.map((z) => (
          <option key={z.label} value={z.value}>{z.label}</option>
        ))}
      </select>

      <span className="rich-editor__sep" />

      <Btn label="IN HOA" title="Bôi đen rồi bấm" onClick={() => changeCase("upper")} />
      <Btn label="thường" title="Bôi đen rồi bấm" onClick={() => changeCase("lower")} />

      <span className="rich-editor__sep" />

      <Btn label="⊞ Bảng" title="Chèn bảng 2×2" onClick={() => { insertTable(editor, { colCount: 2, rowCount: 2 }); focus(); }} />
      <Btn label="+hàng" title="Thêm hàng" onClick={() => { insertTableRow(editor); focus(); }} />
      <Btn label="+cột" title="Thêm cột" onClick={() => { insertTableColumn(editor); focus(); }} />
      <Btn label="−hàng" title="Xoá hàng" onClick={() => { deleteRow(editor); focus(); }} />
      <Btn label="−cột" title="Xoá cột" onClick={() => { deleteColumn(editor); focus(); }} />
      <Btn label="⌫bảng" title="Xoá bảng" onClick={() => { deleteTable(editor); focus(); }} />

      <span className="rich-editor__sep" />

      <div className="rich-editor__menu">
        <Btn label="🖼 Ảnh" title="Chèn ảnh" active={imgMenu} disabled={uploading} onClick={() => setImgMenu((v) => !v)} />
        {imgMenu && (
          <div className="rich-editor__menu-pop">
            <button type="button" className="rich-editor__menu-item" onClick={() => { setImgMenu(false); fileRef.current?.click(); }}>
              Tải ảnh lên…
            </button>
            <button
              type="button"
              className="rich-editor__menu-item"
              onClick={() => {
                setImgMenu(false);
                const url = window.prompt("Dán URL ảnh (https://…):");
                if (url) insertImage(editor, url);
              }}
            >
              Dán URL ảnh ngoài…
            </button>
          </div>
        )}
      </div>

      {uploading && <span className="rich-editor__uploading">Đang tải ảnh…</span>}

      <input
        ref={fileRef}
        type="file"
        accept={IMG_ACCEPT}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) uploadAndInsert(f);
        }}
      />
    </div>
  );
}

function Btn({
  label,
  title,
  active,
  disabled,
  style,
  onClick,
}: {
  label: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  style?: CSSProperties;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={!!active}
      disabled={disabled}
      style={style}
      className="rich-editor__btn"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
