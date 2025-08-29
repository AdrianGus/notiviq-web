"use client"

import * as React from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

type Props = {
  apiBase: string
  vapidPublicKey: string
  campaign: { id: string; accountId: string; title?: string }
}

export default function TestInlineSubscribe({ apiBase, vapidPublicKey, campaign }: Props) {
  const { show } = useToast()
  const btnRef = React.useRef<HTMLButtonElement | null>(null)

  const swUrl = `/sw.js?api=${encodeURIComponent(apiBase)}`
  const scriptUrl = `${apiBase.replace(/\/$/, "")}/subscribe.v1.js`

  const [permission, setPermission] = React.useState<NotificationPermission | "unsupported">("default")
  const [hasSW, setHasSW] = React.useState<boolean>(false)
  const [hasPush, setHasPush] = React.useState<boolean>(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    if (!("Notification" in window)) setPermission("unsupported")
    else setPermission(Notification.permission)
    setHasSW(!!("serviceWorker" in navigator))
    setHasPush(!!("PushManager" in window))
  }, [])

  // injeta data-* no botão sempre que props mudarem
  React.useEffect(() => {
    const el = btnRef.current
    if (!el) return
    el.setAttribute("data-api", apiBase)
    el.setAttribute("data-vapid", vapidPublicKey)
    el.setAttribute("data-sw", swUrl)
    el.setAttribute("data-account-id", campaign.accountId)
    el.setAttribute("data-campaign-id", campaign.id)
    // opcional: pk se usar por conta
    if (process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
      el.setAttribute("data-publishable-key", process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
    }
  }, [apiBase, vapidPublicKey, swUrl, campaign])

  async function refreshPermission() {
    if (!("Notification" in window)) return setPermission("unsupported")
    setPermission(Notification.permission)
  }

  async function unsubscribe() {
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      const sub = await reg?.pushManager.getSubscription()
      if (!sub) {
        show({ title: "Nenhuma inscrição", description: "Este navegador não está inscrito." })
        return
      }
      const ok = await sub.unsubscribe()
      show({
        title: ok ? "Inscrição cancelada" : "Não foi possível cancelar",
        description: ok ? "A inscrição de push foi removida." : "Tente novamente.",
      })
    } catch (err: any) {
      show({ variant: "destructive", title: "Erro ao cancelar", description: err?.message || "Falha ao desinscrever." })
    }
  }

  return (
    <>
      {/* Carrega o script de subscribe da API */}
      <Script src={scriptUrl} strategy="afterInteractive" />

      <div className="space-y-4">
        <div className="text-sm">
          Campanha: <strong>{campaign.title || campaign.id}</strong>
        </div>

        <div className="flex items-center gap-2">
          {/* Este botão é “assumido” pelo subscribe.v1.js via [data-notiviq-subscribe] */}
          <button
            ref={btnRef}
            type="button"
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
            data-notiviq-subscribe
          >
            Permitir notificações
          </button>

          <Button type="button" variant="secondary" onClick={unsubscribe}>
            Cancelar inscrição
          </Button>
        </div>

        {/* Status rápido */}
        <div className="rounded-lg border p-3 text-sm">
          <div className="mb-1">
            <span className="text-neutral-500">Permissão: </span>
            <strong>{permission}</strong>
            <Button variant="default" className="ml-2 h-7 px-2 text-xs" onClick={refreshPermission}>
              Atualizar
            </Button>
          </div>
          <div className="text-neutral-500">
            SW: <strong className={hasSW ? "text-emerald-700" : "text-red-700"}>{hasSW ? "disponível" : "indisponível"}</strong>
            {" • "}
            Push: <strong className={hasPush ? "text-emerald-700" : "text-red-700"}>{hasPush ? "disponível" : "indisponível"}</strong>
          </div>
          <div className="mt-2 text-xs text-neutral-500">
            SW URL: <code className="rounded bg-neutral-50 px-1">{swUrl}</code>
          </div>
        </div>
      </div>
    </>
  )
}
