"use client"

import { Button } from "@/components/ui/button"

export function SnippetViewer({ snippet }: { snippet: string }) {
  return (
    <div className="rounded-lg border bg-white p-3">
      <pre className="max-h-[420px] overflow-auto text-xs leading-relaxed">
        <code>{snippet}</code>
      </pre>
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(snippet)
          }}
        >
          Copiar snippet
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const blob = new Blob([snippet], { type: "text/plain;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = "notiviq-snippet.html"
            a.click()
            URL.revokeObjectURL(url)
          }}
        >
          Baixar .html
        </Button>
      </div>
    </div>
  )
}
