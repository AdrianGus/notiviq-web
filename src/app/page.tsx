import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Suspense } from "react"
import { apiFetch } from "@/lib/api"
import HomeDateRangeControls from "@/components/analytics/date-range-controls"
import SubscriptionsArea from "@/components/charts/subscription-area"
import NotificationsStacked from "@/components/charts/notifications-stacked"
import TopCampaignsBar from "@/components/charts/top-campaigns-bar"
import { Skeleton } from "@/components/ui/skeleton"

/* Utils */
function toISODate(d: Date) {
  return d.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" })
}
function startOfDayLocal(d: Date) { const s = new Date(d); s.setHours(0, 0, 0, 0); return s }
function addDays(d: Date, n: number) { const x = new Date(d); x.setDate(x.getDate() + n); return x }
function enumerateDays(fromISO: string, toISO: string) {
  const out: string[] = []
  let cur = startOfDayLocal(new Date(fromISO + "T00:00:00"))
  const end = startOfDayLocal(new Date(toISO + "T00:00:00"))
  while (cur <= end) { out.push(toISODate(cur)); cur = addDays(cur, 1) }
  return out
}
function toLocalYYYYMMDD(dateLike?: string | Date | null) {
  if (!dateLike) return undefined
  const d = new Date(dateLike); if (isNaN(d.getTime())) return undefined
  return d.toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" })
}

/* Tipos do backend */
type Subscription = { id: string; status: string; createdAt: string; campaignId?: string | null }
type Notification = {
  id: string
  campaignId: string
  shownAt?: string
  clickedAt?: string
  closedAt?: string
  failedAt?: string
  createdAt?: string
}
type Campaign = { id: string; title: string }
type Paginated<T> = { items: T[]; total: number; page: number; size: number; totalPages: number }

async function getData(fromISO: string, toISO: string) {
  const [subsRes, notiRes, campsRes] = await Promise.all([
    apiFetch(`/subscriptions?page=1&size=1000`, { cache: "no-store" }),
    apiFetch(`/notifications?page=1&size=2000`, { cache: "no-store" }),
    apiFetch(`/campaigns?page=1&size=1000`, { cache: "no-store" }),
  ])

  const subs = (subsRes.ok ? (await subsRes.json() as Paginated<Subscription>).items : []) ?? []
  const notifications = (notiRes.ok ? (await notiRes.json() as Paginated<Notification>).items : []) ?? []
  const campaigns = (campsRes.ok ? (await campsRes.json() as Paginated<Campaign>).items : []) ?? []

  const campaignTitleById = new Map<string, string>()
  for (const c of campaigns) campaignTitleById.set(c.id, c.title)

  const days = enumerateDays(fromISO, toISO)

  // Subs por dia
  const subsByDay = new Map<string, number>(days.map(d => [d, 0]))
  for (const s of subs) {
    const day = toLocalYYYYMMDD(s.createdAt)
    if (day && subsByDay.has(day)) subsByDay.set(day, (subsByDay.get(day) || 0) + 1)
  }
  const subscriptionsSeries = days.map(d => ({ date: d, value: subsByDay.get(d) || 0 }))

  // Eventos por dia (inclui 'failed')
  const evByDay = new Map<string, { shown: number; click: number; close: number; failed: number }>(
    days.map(d => [d, { shown: 0, click: 0, close: 0, failed: 0 }])
  )

  let failedTotal = 0

  for (const n of notifications) {
    const shownDay = toLocalYYYYMMDD(n.shownAt)
    if (shownDay && evByDay.has(shownDay)) evByDay.get(shownDay)!.shown++

    const clickedDay = toLocalYYYYMMDD(n.clickedAt)
    if (clickedDay && evByDay.has(clickedDay)) evByDay.get(clickedDay)!.click++

    const closedDay = toLocalYYYYMMDD(n.closedAt)
    if (closedDay && evByDay.has(closedDay)) evByDay.get(closedDay)!.close++

    const failedDay = toLocalYYYYMMDD(n.failedAt)
    if (failedDay && evByDay.has(failedDay)) { evByDay.get(failedDay)!.failed++; failedTotal++ }
  }

  const notificationsSeries = days.map(d => ({ date: d, ...(evByDay.get(d)!) }))

  // Top campanhas por cliques
  const clicksByCampaign = new Map<string, number>()
  for (const n of notifications) {
    const clickedDay = toLocalYYYYMMDD(n.clickedAt)
    if (!clickedDay || !days.includes(clickedDay)) continue
    const cid = n.campaignId || "—"
    clicksByCampaign.set(cid, (clicksByCampaign.get(cid) || 0) + 1)
  }
  const topCampaigns = Array.from(clicksByCampaign.entries())
    .map(([id, clicks]) => ({ campaignId: id, name: campaignTitleById.get(id) || id, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)

  return { subscriptionsSeries, notificationsSeries, topCampaigns, failedTotal }
}

export default async function HomePage({ searchParams }: { searchParams: { from?: string; to?: string } }) {
  const today = new Date()
  const fourteenAgo = addDays(today, -13)
  const defaultFrom = toISODate(fourteenAgo)
  const defaultTo = toISODate(today)

  const from = (searchParams?.from as string) || defaultFrom
  const to = (searchParams?.to as string) || defaultTo

  const data = await getData(from, to)

  return (
    <DashboardShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Página inicial</h1>
          <p className="text-sm text-muted-foreground">Relatórios gerais do período selecionado.</p>
        </div>
        <HomeDateRangeControls initialFrom={from} initialTo={to} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Inscrições por dia</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <SubscriptionsArea data={data.subscriptionsSeries} />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Notificações — exibidas × cliques × fechadas × falhas</CardTitle>
            <span className="text-sm text-muted-foreground">Falhas no período: <b>{data.failedTotal}</b></span>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <NotificationsStacked data={data.notificationsSeries} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top campanhas por cliques</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <TopCampaignsBar data={data.topCampaigns} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
