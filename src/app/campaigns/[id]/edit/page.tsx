import Link from "next/link"
import { DashboardShell } from "@/components/dashboard-shell"
import { apiFetch } from "@/lib/api"
import type { Campaign } from "@/types/campaign"
import { CampaignForm } from "../../parts/campaign-form"
import { Button } from "@/components/ui/button"

async function getCampaign(id: string): Promise<Campaign> {
  const res = await apiFetch(`/campaigns/${id}`)
  return res.json()
}

export default async function EditCampaignPage({ params }: { params: { id: string } }) {
  const c = await getCampaign(params.id)

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Editar campanha</h1>

        {/* Link puro para a página Embed */}
        <Link href={`/campaigns/${params.id}/embed`} className="inline-block">
          <Button variant="secondary">Instalar / Copiar botão</Button>
        </Link>
      </div>

      <CampaignForm mode="edit" initial={c} />
    </DashboardShell>
  )
}
