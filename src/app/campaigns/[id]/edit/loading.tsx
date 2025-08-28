import { DashboardShell } from "@/components/dashboard-shell"
import { TableSkeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <DashboardShell>
      <h1 className="mb-6 text-xl font-semibold">Editar campanha</h1>
      <TableSkeleton />
    </DashboardShell>
  )
}