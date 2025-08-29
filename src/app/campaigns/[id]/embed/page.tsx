import { DashboardShell } from "@/components/dashboard-shell"
import { apiFetch } from "@/lib/api"
import type { Campaign } from "@/types/campaign"
import { SnippetViewer } from "./snippet-viwer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import TestInlineSubscribe from "./test-inline.client"

async function getCampaign(id: string): Promise<Campaign> {
  const res = await apiFetch(`/campaigns/${id}`, { cache: "no-store" })
  return res.json()
}

export default async function EmbedPage({ params }: { params: { id: string } }) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""

  if (!apiBase) {
    return (
      <DashboardShell>
        <div className="rounded-lg border bg-white p-6">
          <h1 className="text-xl font-semibold mb-2">Instalar campanha</h1>
          <p className="text-sm text-red-600">
            Defina <code>NEXT_PUBLIC_API_BASE_URL</code> no frontend para gerar o snippet.
          </p>
        </div>
      </DashboardShell>
    )
  }

  // campanha
  const campaign = await getCampaign(params.id)

  // VAPID
  const vapidRes = await fetch(`${apiBase.replace(/\/$/, "")}/vapid`, { cache: "no-store" })
  if (!vapidRes.ok) throw new Error("Falha ao obter VAPID_PUBLIC_KEY")
  const { publicKey } = await vapidRes.json()

  const snippet = `<!-- NotivIQ – botão de inscrição -->
<script src="${apiBase}/subscribe.v1.js" defer></script>

<button
  data-notiviq-subscribe
  data-account-id="${campaign.accountId}"
  data-publishable-key="${process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ""}"
  data-vapid="${publicKey}"
  data-api="${apiBase}"
  data-sw="/sw.js"
  data-campaign-id="${campaign.id}"
>
  Permitir notificações
</button>`

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Instalar campanha</h1>
        <Link href={`/campaigns/${params.id}/edit`}>
          <Button variant="secondary">Voltar para edição</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Esquerda: snippet para copiar */}
        <section className="rounded-xl border bg-white p-5">
          <p className="mb-2 text-sm text-neutral-600">
            Copie e cole o snippet abaixo na sua landing page.
          </p>
          <SnippetViewer snippet={snippet} />
        </section>

        {/* Direita: teste inline no próprio app */}
        <section className="rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold">Teste agora (neste navegador)</h2>
          <p className="mb-4 text-sm text-neutral-600">
            Este bloco usa o mesmo script <code>subscribe.v1.js</code> da API, registra o
            <code> /sw.js</code> local e tenta inscrever este navegador na campanha.
          </p>

          <TestInlineSubscribe
            apiBase={apiBase}
            vapidPublicKey={publicKey}
            campaign={{ id: campaign.id, accountId: campaign.accountId, title: campaign.title }}
          />
        </section>
      </div>
    </DashboardShell>
  )
}
