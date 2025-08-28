"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestSubscribePage() {
  const [log, setLog] = useState<string[]>([])

  // hook para capturar eventos do SDK
  useEffect(() => {
    function handler(e: Event) {
      const detail = (e as CustomEvent).detail
      setLog((prev) => [
        `[${new Date().toLocaleTimeString()}] ${JSON.stringify(detail)}`,
        ...prev,
      ])
    }

    document.addEventListener("notiviq:subscribed", handler as EventListener)
    return () => {
      document.removeEventListener("notiviq:subscribed", handler as EventListener)
    }
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Teste de Subscrição</h1>
      <p className="text-sm text-neutral-600">
        Esta página serve para validar o fluxo de inscrição. Clique no botão abaixo
        e veja os logs em tempo real.
      </p>

      <script src="http://localhost:3000/subscribe.v1.js" defer></script>

      <button
        data-notiviq-subscribe
        data-account-id="d2f38447-cfeb-4732-8e80-956c4026ce8b"
        data-publishable-key="/* pk_publica_da_sua_conta */"
        data-vapid="BFEvVkOhokMgP2OVVnlSyN24KCVAF_hbjio8WGW6RhFyH9x-es7zV9NKPGqdECh_haupR65a80o_XSHo8xyPGSw"
        data-api="http://localhost:3000"
        data-sw="/sw.js"
        data-campaign-id="bce73d13-1476-4184-876f-84bf09cdcd8c"
      >
        Permitir notificações
      </button>

      <div className="rounded-lg border bg-white p-3 text-xs max-h-64 overflow-auto">
        {log.length === 0 ? (
          <p className="text-neutral-500">Nenhum evento ainda...</p>
        ) : (
          <ul className="space-y-1">
            {log.map((l, i) => (
              <li key={i} className="font-mono">{l}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
