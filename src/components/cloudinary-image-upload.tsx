"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

declare global {
  interface Window {
    cloudinary: any
    __cloudinaryReady?: boolean
  }
}

type Props = {
  label?: React.ReactNode
  value?: string
  onChange: (url: string | null) => void
  helpText?: React.ReactNode
  className?: string
  folder?: string
}

function isHttpUrl(u?: string) {
  if (!u) return false
  try {
    const x = new URL(u)
    return x.protocol === "http:" || x.protocol === "https:"
  } catch {
    return false
  }
}

export default function CloudinaryImageUpload({
  label,
  value,
  onChange,
  helpText,
  className,
  folder = "notiviq",
}: Props) {
  const [ready, setReady] = React.useState<boolean>(
    typeof window !== "undefined" && !!window.cloudinary
  )
  const [uploading, setUploading] = React.useState(false)
  const [imgOk, setImgOk] = React.useState(true)

  // Espera o script global (carregado no layout)
  React.useEffect(() => {
    if (ready) return
    let alive = true
    const tick = () => {
      if (!alive) return
      if (typeof window !== "undefined" && (window.cloudinary || window.__cloudinaryReady)) {
        setReady(true)
      } else {
        setTimeout(tick, 50)
      }
    }
    tick()
    return () => {
      alive = false
    }
  }, [ready])

  React.useEffect(() => {
    setImgOk(true)
  }, [value])

  const openWidget = React.useCallback(() => {
    if (!ready) return
    setUploading(true)
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        multiple: false,
        folder,
        clientAllowedFormats: ["png", "jpg", "jpeg", "gif", "webp", "svg"],
        maxFileSize: 5_000_000,
        resourceType: "image",
        theme: "minimal",
      },
      (error: any, result: any) => {
        if (error) {
          setUploading(false)
          return
        }
        if (result?.event === "success") {
          const url = result.info?.secure_url as string
          onChange(url || null)
          setUploading(false)
          widget.close()
        }
        if (result?.event === "close" || result?.event === "abort") {
          setUploading(false)
        }
      }
    )
    widget.open()
  }, [ready, onChange, folder])

  const showImg = !!value && isHttpUrl(value) && imgOk

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}

      <div className="flex w-full max-w-full items-center gap-3 overflow-hidden rounded-xl border border-dashed bg-white p-3">
        {/* Preview quadrado fixo */}
        <div className="h-16 w-16 flex-none overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-inset ring-neutral-200">
          {showImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={value}
              src={value}
              alt="Prévia"
              className="block h-full w-full object-cover"
              onError={() => setImgOk(false)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-neutral-400">
              <ImageIcon className="h-5 w-5" />
              <span className="mt-0.5 text-[10px]">Prévia</span>
            </div>
          )}
        </div>

        {/* Texto + botões */}
        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-neutral-800">
              {showImg ? "Imagem selecionada" : "Nenhuma imagem"}
            </div>
            {helpText && (
              <p className="truncate text-xs text-neutral-500">{helpText}</p>
            )}
          </div>

          <div className="flex shrink-0 gap-2">
            <Button
              type="button"
              onClick={openWidget}
              disabled={!ready || uploading}
              className="h-9"
            >
              <Upload className="mr-2 h-4 w-4" />
              {showImg ? "Trocar" : ready ? "Upload" : "Carregando…"}
            </Button>
            {showImg && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => onChange(null)}
                className="h-9"
              >
                <X className="mr-2 h-4 w-4" />
                Remover
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
