import { DashboardShell } from "@/components/dashboard-shell"

export default function Loading() {
  return (
    <DashboardShell>
      <div className="mb-4">
        <div className="mb-1 h-6 w-40 animate-pulse rounded bg-neutral-200" />
        <div className="h-4 w-80 animate-pulse rounded bg-neutral-200" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-4">
            <div className="mb-2 h-3 w-24 animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-40 animate-pulse rounded bg-neutral-100" />
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-3 border-b">
        <div className="h-8 w-24 rounded bg-neutral-200" />
        <div className="h-8 w-28 rounded bg-neutral-200" />
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="h-8 w-80 animate-pulse rounded bg-neutral-100" />
        <div className="mt-3 h-40 w-full animate-pulse rounded bg-neutral-50" />
      </div>
    </DashboardShell>
  )
}
