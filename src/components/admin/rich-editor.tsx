"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type Editor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extensions";
import { uploadPostImage } from "@/app/actions/upload";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

/** Chuỗi thô (bài cũ) → HTML, giống textToHtml phía server. */
function toInitialHtml(value: string): string {
  const t = (value || "").trim();
  if (!t) return "";
  if (t.startsWith("<")) return t;
  return t
    .split(/\n{2,}/)
    .map((p) => `<p>${p.trim().replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

const IMG_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

// Khai báo extension một lần ở cấp module — mảng phải ổn định qua các lần render,
// nếu tạo mới mỗi render thì useEditor liên tục gọi setOptions.
const EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    codeBlock: false,
    link: {
      openOnClick: false,
      defaultProtocol: "https",
      HTMLAttributes: { rel: "noopener nofollow", target: "_blank" },
    },
  }),
  Image.configure({ HTMLAttributes: { loading: "lazy" } }),
  Placeholder.configure({
    placeholder:
      "Dán nội dung từ Word / Google Docs vào đây — định dạng được giữ nguyên. Hoặc gõ trực tiếp rồi bôi đen để định dạng.",
  }),
];

type Flags = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  h2: boolean;
  h3: boolean;
  bullet: boolean;
  ordered: boolean;
  quote: boolean;
  link: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

const NO_FLAGS: Flags = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  h2: false,
  h3: false,
  bullet: false,
  ordered: false,
  quote: false,
  link: false,
  canUndo: false,
  canRedo: false,
};

export function RichEditor({ value, onChange }: Props) {
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imgMenu, setImgMenu] = useState(false);

  // Nội dung ban đầu chỉ tính một lần; sau đó editor tự quản lý, form nhận qua onChange.
  const [initialHtml] = useState(() => toInitialHtml(value));

  const uploadAndInsert = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadPostImage(fd);
      if (!res.ok) {
        alert(res.error);
        return;
      }
      editorRef.current
        ?.chain()
        .focus()
        .setImage({ src: res.url, alt: file.name.replace(/\.[a-z0-9]+$/i, "") })
        .run();
    } finally {
      setUploading(false);
    }
  }, []);

  // editorProps phải ổn định qua các lần render (xem chú thích EXTENSIONS).
  const [editorProps] = useState(() => ({
    attributes: { class: "prose-legacy rich-editor__content" },
    handlePaste: (_view: unknown, event: ClipboardEvent) => {
      const imgs = [...(event.clipboardData?.files ?? [])].filter((f) =>
        f.type.startsWith("image/"),
      );
      if (imgs.length === 0) return false;
      event.preventDefault();
      imgs.forEach(uploadAndInsert);
      return true;
    },
    handleDrop: (_view: unknown, event: DragEvent) => {
      const imgs = [...(event.dataTransfer?.files ?? [])].filter((f) =>
        f.type.startsWith("image/"),
      );
      if (imgs.length === 0) return false;
      event.preventDefault();
      imgs.forEach(uploadAndInsert);
      return true;
    },
  }));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: EXTENSIONS,
    content: initialHtml,
    editorProps,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Chỉ để ép re-render toolbar khi selection / nội dung đổi. Có thể là null cho
  // tới transaction đầu tiên — khi đó dùng NO_FLAGS (toolbar mặc định không bật).
  const flags =
    useEditorState({
      editor,
      selector: ({ editor }): Flags =>
        editor
          ? {
              bold: editor.isActive("bold"),
              italic: editor.isActive("italic"),
              underline: editor.isActive("underline"),
              strike: editor.isActive("strike"),
              h2: editor.isActive("heading", { level: 2 }),
              h3: editor.isActive("heading", { level: 3 }),
              bullet: editor.isActive("bulletList"),
              ordered: editor.isActive("orderedList"),
              quote: editor.isActive("blockquote"),
              link: editor.isActive("link"),
              canUndo: editor.can().undo(),
              canRedo: editor.can().redo(),
            }
          : NO_FLAGS,
    }) ?? NO_FLAGS;

  const changeCase = useCallback(
    (mode: "upper" | "lower") => {
      const editor = editorRef.current;
      if (!editor) return;
      editor
        .chain()
        .focus()
        .command(({ tr, state, dispatch }) => {
          const { from, to, empty } = state.selection;
          if (empty) return false;
          const edits: { from: number; to: number; text: string }[] = [];
          state.doc.nodesBetween(from, to, (node, pos) => {
            if (!node.isText || !node.text) return;
            const start = Math.max(pos, from);
            const end = Math.min(pos + node.text.length, to);
            if (end <= start) return;
            const slice = node.text.slice(start - pos, end - pos);
            const next =
              mode === "upper"
                ? slice.toLocaleUpperCase("vi")
                : slice.toLocaleLowerCase("vi");
            if (next !== slice) edits.push({ from: start, to: end, text: next });
          });
          if (edits.length === 0) return false;
          if (dispatch) {
            for (let i = edits.length - 1; i >= 0; i--) {
              tr.insertText(edits[i].text, edits[i].from, edits[i].to);
            }
          }
          return true;
        })
        .run();
    },
    [],
  );

  const setLink = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const url = window.prompt("Dán URL liên kết:");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, []);

  const insertImageUrl = useCallback(() => {
    setImgMenu(false);
    const editor = editorRef.current;
    if (!editor) return;
    const url = window.prompt("Dán URL ảnh (https://…):");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, []);

  const onPickFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) uploadAndInsert(file);
    },
    [uploadAndInsert],
  );

  if (!editor) {
    return (
      <div className="rich-editor rich-editor--loading">
        Đang tải trình soạn thảo…
      </div>
    );
  }

  return (
    <div className="rich-editor">
      <div className="rich-editor__toolbar">
        <Btn
          label="B"
          title="Đậm (Ctrl+B)"
          active={flags.bold}
          style={{ fontWeight: 800 }}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <Btn
          label="I"
          title="Nghiêng (Ctrl+I)"
          active={flags.italic}
          style={{ fontStyle: "italic" }}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <Btn
          label="U"
          title="Gạch chân (Ctrl+U)"
          active={flags.underline}
          style={{ textDecoration: "underline" }}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <Btn
          label="S"
          title="Gạch ngang"
          active={flags.strike}
          style={{ textDecoration: "line-through" }}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        <span className="rich-editor__sep" />

        <Btn
          label="H2"
          title="Tiêu đề mục"
          active={flags.h2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <Btn
          label="H3"
          title="Tiêu đề phụ"
          active={flags.h3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <Btn
          label="¶"
          title="Đoạn văn thường"
          onClick={() => editor.chain().focus().setParagraph().run()}
        />

        <span className="rich-editor__sep" />

        <Btn
          label="•—"
          title="Danh sách gạch đầu dòng"
          active={flags.bullet}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Btn
          label="1."
          title="Danh sách đánh số"
          active={flags.ordered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <Btn
          label="❝"
          title="Trích dẫn"
          active={flags.quote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <Btn
          label="🔗"
          title={flags.link ? "Bỏ liên kết" : "Chèn liên kết"}
          active={flags.link}
          onClick={setLink}
        />

        <span className="rich-editor__sep" />

        <Btn
          label="AA"
          title="IN HOA đoạn đang bôi đen"
          onClick={() => changeCase("upper")}
        />
        <Btn
          label="aa"
          title="in thường đoạn đang bôi đen"
          onClick={() => changeCase("lower")}
        />

        <span className="rich-editor__sep" />

        <div className="rich-editor__menu">
          <Btn
            label="🖼 Ảnh"
            title="Chèn ảnh"
            active={imgMenu}
            disabled={uploading}
            onClick={() => setImgMenu((v) => !v)}
          />
          {imgMenu && (
            <div className="rich-editor__menu-pop">
              <button
                type="button"
                className="rich-editor__menu-item"
                onClick={() => {
                  setImgMenu(false);
                  fileInputRef.current?.click();
                }}
              >
                Tải ảnh lên…
              </button>
              <button
                type="button"
                className="rich-editor__menu-item"
                onClick={insertImageUrl}
              >
                Dán URL ảnh ngoài…
              </button>
            </div>
          )}
        </div>

        <span className="rich-editor__sep" />

        <Btn
          label="↶"
          title="Hoàn tác"
          disabled={!flags.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <Btn
          label="↷"
          title="Làm lại"
          disabled={!flags.canRedo}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>

      <EditorContent editor={editor} />

      {uploading && (
        <p className="rich-editor__status">Đang tải ảnh lên Supabase…</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={IMG_ACCEPT}
        hidden
        onChange={onPickFile}
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
  style?: React.CSSProperties;
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
      onClick={onClick}
    >
      {label}
    </button>
  );
}
