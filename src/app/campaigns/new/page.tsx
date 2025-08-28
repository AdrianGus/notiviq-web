
import { DashboardShell } from "@/components/dashboard-shell"
import { CampaignForm } from "../parts/campaign-form"

export default function NewCampaignPage() {
  return (
    <DashboardShell>
      <h1 className="mb-6 text-xl font-semibold">Nova campanha</h1>
      <CampaignForm mode="create" />
    </DashboardShell>
  )
}
