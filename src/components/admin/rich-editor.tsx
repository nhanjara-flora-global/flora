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

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
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
    ],
    content: initialHtml,
    editorProps: {
      attributes: { class: "prose-legacy rich-editor__content" },
      handlePaste: (_view, event) => {
        const imgs = [...(event.clipboardData?.files ?? [])].filter((f) =>
          f.type.startsWith("image/"),
        );
        if (imgs.length === 0) return false;
        event.preventDefault();
        imgs.forEach(uploadAndInsert);
        return true;
      },
      handleDrop: (_view, event) => {
        const dt = (event as DragEvent).dataTransfer;
        const imgs = [...(dt?.files ?? [])].filter((f) =>
          f.type.startsWith("image/"),
        );
        if (imgs.length === 0) return false;
        event.preventDefault();
        imgs.forEach(uploadAndInsert);
        return true;
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  const s = useEditorState({
    editor,
    selector: ({ editor }) =>
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
        : null,
  });

  const changeCase = useCallback(
    (mode: "upper" | "lower") => {
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
    [editor],
  );

  const setLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const url = window.prompt("Dán URL liên kết:");
    if (!url) return;
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const insertImageUrl = useCallback(() => {
    setImgMenu(false);
    if (!editor) return;
    const url = window.prompt("Dán URL ảnh (https://…):");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  const onPickFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) uploadAndInsert(file);
    },
    [uploadAndInsert],
  );

  if (!editor || !s) {
    return (
      <div className="rich-editor rich-editor--loading">Đang tải trình soạn thảo…</div>
    );
  }

  return (
    <div className="rich-editor">
      <div className="rich-editor__toolbar">
        <Btn
          label="B"
          title="Đậm (Ctrl+B)"
          active={s.bold}
          style={{ fontWeight: 800 }}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <Btn
          label="I"
          title="Nghiêng (Ctrl+I)"
          active={s.italic}
          style={{ fontStyle: "italic" }}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <Btn
          label="U"
          title="Gạch chân (Ctrl+U)"
          active={s.underline}
          style={{ textDecoration: "underline" }}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <Btn
          label="S"
          title="Gạch ngang"
          active={s.strike}
          style={{ textDecoration: "line-through" }}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        <span className="rich-editor__sep" />

        <Btn
          label="H2"
          title="Tiêu đề mục"
          active={s.h2}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <Btn
          label="H3"
          title="Tiêu đề phụ"
          active={s.h3}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
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
          active={s.bullet}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Btn
          label="1."
          title="Danh sách đánh số"
          active={s.ordered}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <Btn
          label="❝"
          title="Trích dẫn"
          active={s.quote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <Btn
          label="🔗"
          title={s.link ? "Bỏ liên kết" : "Chèn liên kết"}
          active={s.link}
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
          disabled={!s.canUndo}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <Btn
          label="↷"
          title="Làm lại"
          disabled={!s.canRedo}
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
