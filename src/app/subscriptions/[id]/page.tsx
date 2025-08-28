import { DashboardShell } from "@/components/dashboard-shell"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import type { Subscription } from "@/types/subscription"
import SubscriptionDetailsClient from "./subscription-details-client"

export const dynamic = "force-dynamic"

async function getSubscription(id: string): Promise<Subscription> {
  const r = await apiFetch(`/subscriptions/${id}`)
  if (!r.ok) throw new Error("Subscription não encontrada")
  return r.json()
}

export default async function SubscriptionDetailsPage({
  params,
}: { params: { id: string } }) {
  const sub = await getSubscription(params.id)

  return (
    <DashboardShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inscrição</h1>
          <p className="text-sm text-neutral-600">Detalhes da inscrição e histórico de notificações.</p>
        </div>
        <Link href="/subscriptions" className="text-sm underline hover:text-black">
          Voltar para inscrições
        </Link>
      </div>

      <SubscriptionDetailsClient sub={sub} />
    </DashboardShell>
  )
}
