import { DashboardShell } from "@/components/dashboard-shell"
import { apiFetch } from "@/lib/api"
import type { Campaign } from "@/types/campaign"
import { SnippetViewer } from "./snippet-viwer"
import Link from "next/link"
import { Button } from "@/components/ui/button"

async function getCampaign(id: string): Promise<Campaign> {
  const res = await apiFetch(`/campaigns/${id}`)
  return res.json()
}

export default async function EmbedPage({ params }: { params: { id: string } }) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL!

  // carrega campanha
  const campaign = await getCampaign(params.id)

  // pega VAPID public key
  const vapidRes = await fetch(`${apiBase}/vapid`, { cache: "no-store" })
  if (!vapidRes.ok) throw new Error("Falha ao obter VAPID_PUBLIC_KEY")
  const { publicKey } = await vapidRes.json()

  const snippet = `<!-- NotivIQ – botão de inscrição -->
<script src="${apiBase}/subscribe.v1.js" defer></script>

<button
  data-notiviq-subscribe
  data-account-id="${campaign.accountId}"
  data-publishable-key="/* pk_publica_da_sua_conta */"
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
      <p className="mb-2 text-sm text-neutral-600">
        Copie e cole o snippet abaixo na sua landing page.
      </p>
      <SnippetViewer snippet={snippet} />
    </DashboardShell>
  )
}
