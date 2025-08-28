"use client"

import * as React from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react"

type Props = {
  label?: React.ReactNode
  value?: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ label, value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // StarterKit já inclui bold, italic, list, etc.
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      Placeholder.configure({
        placeholder: "Digite sua mensagem…",
      }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[260px]",
      },
    },
  })

  // Botões da toolbar
  const toggleBold = () => editor?.chain().focus().toggleBold().run()
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run()
  const toggleBullet = () => editor?.chain().focus().toggleBulletList().run()
  const toggleOrdered = () => editor?.chain().focus().toggleOrderedList().run()
  const promptLink = () => {
    const url = window.prompt("Informe a URL do link:")
    if (!url) return
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  if (!editor) return null

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {/* Card (toolbar + editor) */}
      <div className="rounded-lg border bg-white shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 rounded-t-lg border-b bg-neutral-50 p-2">
          <Button
            type="button"
            variant="outline"
            title="Negrito"
            onClick={toggleBold}
            className={`h-9 ${editor.isActive("bold") ? "border-black" : ""}`}
          >
            <Bold className="mr-2 h-4 w-4" />
            Negrito
          </Button>

          <Button
            type="button"
            variant="outline"
            title="Itálico"
            onClick={toggleItalic}
            className={`h-9 ${editor.isActive("italic") ? "border-black" : ""}`}
          >
            <Italic className="mr-2 h-4 w-4" />
            Itálico
          </Button>

          <div className="mx-1 hidden h-6 w-px bg-neutral-200 sm:block" />

          <Button
            type="button"
            variant="outline"
            title="Lista com marcadores"
            onClick={toggleBullet}
            className={`h-9 ${editor.isActive("bulletList") ? "border-black" : ""}`}
          >
            <List className="mr-2 h-4 w-4" />
            Lista
          </Button>

          <Button
            type="button"
            variant="outline"
            title="Lista numerada"
            onClick={toggleOrdered}
            className={`h-9 ${editor.isActive("orderedList") ? "border-black" : ""}`}
          >
            <ListOrdered className="mr-2 h-4 w-4" />
            Numerada
          </Button>

          <div className="mx-1 hidden h-6 w-px bg-neutral-200 sm:block" />

          <Button
            type="button"
            variant="outline"
            title="Inserir link"
            onClick={promptLink}
            className="h-9"
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            Link
          </Button>
        </div>

        {/* Editor */}
        <div className="relative p-3">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}
