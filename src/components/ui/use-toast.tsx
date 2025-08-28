"use client"
import * as React from "react"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react"

type Variant = "default" | "destructive" | "success" | "warning" | "info"

export type Toast = {
  id: number
  title?: string
  description?: string
  variant?: Variant
}
type ToastContext = {
  toasts: Toast[]
  show: (t: Omit<Toast, "id">) => void
  dismiss: (id: number) => void
}

const Ctx = React.createContext<ToastContext | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const show = React.useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random()
    setToasts((arr) => [...arr, { id, ...t }])
    // auto-dismiss em 4s
    setTimeout(() => {
      setToasts((arr) => arr.filter((x) => x.id !== id))
    }, 4000)
  }, [])

  const dismiss = (id: number) =>
    setToasts((arr) => arr.filter((x) => x.id !== id))

  return (
    <Ctx.Provider value={{ toasts, show, dismiss }}>
      {children}
      <ToastViewport toasts={toasts} onClose={dismiss} />
    </Ctx.Provider>
  )
}

export function useToast() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

/* ---------------- Presentation ---------------- */

const resolveVariant = (v?: Variant): Exclude<Variant, "default"> => {
  // "default" vira "success" para manter compat com seus toasts atuais
  if (!v || v === "default") return "success"
  return v
}

const ICONS = {
  success: CheckCircle2,
  destructive: XCircle,
  warning: AlertTriangle,
  info: Info,
} as const

const STYLE = {
  success: {
    card: "border-green-200 bg-green-50 text-green-900",
    iconWrap: "bg-green-100 text-green-700",
  },
  destructive: {
    card: "border-red-200 bg-red-50 text-red-900",
    iconWrap: "bg-red-100 text-red-700",
  },
  warning: {
    card: "border-amber-200 bg-amber-50 text-amber-900",
    iconWrap: "bg-amber-100 text-amber-700",
  },
  info: {
    card: "border-sky-200 bg-sky-50 text-sky-900",
    iconWrap: "bg-sky-100 text-sky-700",
  },
} as const

function ToastViewport({
  toasts,
  onClose,
}: {
  toasts: Toast[]
  onClose: (id: number) => void
}) {
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[min(92vw,380px)] flex-col gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => {
        const v = resolveVariant(t.variant)
        const Icon = ICONS[v]
        const s = STYLE[v]
        return (
          <div
            key={t.id}
            role="alert"
            className={[
              "pointer-events-auto relative overflow-hidden rounded-md border p-3 pr-9 shadow-lg ring-1 ring-black/5",
              "animate-in fade-in-0 slide-in-from-bottom-4 duration-200",
              s.card,
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full",
                  s.iconWrap,
                ].join(" ")}
                aria-hidden="true"
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                {t.title && (
                  <div className="text-sm font-semibold">{t.title}</div>
                )}
                {t.description && (
                  <div className="mt-0.5 text-sm/5 opacity-90">
                    {t.description}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onClose(t.id)}
              className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/10"
              aria-label="Fechar"
              title="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
