import { DashboardShell } from "@/components/dashboard-shell"
import { Table, THead, TRow, TH, TD } from "@/components/ui/table"
import { apiFetch } from "@/lib/api"
import type { Subscription } from "@/types/subscription"
import type { Paginated, Campaign } from "@/types/campaign"
import Link from "next/link"
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

export const dynamic = "force-dynamic"

type Search = {
  page?: string
  size?: string
  campaignId?: string
  tags?: string
  locale?: string
  q?: string
}

async function getSubscriptions(sp: Search): Promise<Paginated<Subscription>> {
  const params = new URLSearchParams()
  const page = Number(sp.page || 1)
  const size = Number(sp.size || 12)
  params.set("page", String(page))
  params.set("size", String(size))
  if (sp.campaignId && sp.campaignId !== "__all__") {
    params.set("campaignId", sp.campaignId)
  }
  if (sp.tags) params.set("tags", sp.tags)
  if (sp.locale) params.set("locale", sp.locale)
  if (sp.q) params.set("q", sp.q)

  const res = await apiFetch(`/subscriptions?${params.toString()}`)
  return res.json()
}

async function getCampaignNameMap(subs: Subscription[]): Promise<Record<string, string>> {
  const ids = Array.from(new Set(subs.map(s => s.campaignId).filter(Boolean))) as string[]
  if (ids.length === 0) return {}

  const entries = await Promise.all(ids.map(async (id) => {
    try {
      const r = await apiFetch(`/campaigns/${id}`)
      if (!r.ok) return [id, "(não encontrada)"] as const
      const c: Campaign = await r.json()
      return [id, c.title] as const
    } catch {
      return [id, "(não encontrada)"] as const
    }
  }))

  return Object.fromEntries(entries)
}

async function getCampaignOptions(): Promise<Campaign[]> {
  const r = await apiFetch(`/campaigns?page=1&size=100`)
  const data: Paginated<Campaign> = await r.json()
  return data.items || []
}

function hostFromUrl(url?: string) {
  try {
    return url ? new URL(url).host : "-"
  } catch {
    return "-"
  }
}

function shortUA(ua?: string) {
  if (!ua) return "-"
  const s = ua.toLowerCase()
  if (s.includes("edg/")) return "Edge"
  if (s.includes("chrome/") && !s.includes("chromium")) return "Chrome"
  if (s.includes("firefox/")) return "Firefox"
  if (s.includes("safari/") && !s.includes("chrome")) return "Safari"
  if (s.includes("android")) return "Android"
  if (s.includes("iphone") || s.includes("ios")) return "iOS"
  return ua.split(" ").slice(0, 2).join(" ")
}

function buildQuery(next: Partial<Search>, current: Search) {
  const params = new URLSearchParams()
  const merged: Search = { ...current, ...next }
  if (merged.page) params.set("page", merged.page)
  if (merged.size) params.set("size", merged.size)
  if (merged.campaignId && merged.campaignId !== "__all__") {
    params.set("campaignId", merged.campaignId)
  }
  if (merged.tags) params.set("tags", merged.tags)
  if (merged.locale) params.set("locale", merged.locale)
  if (merged.q) params.set("q", merged.q)
  return params.toString()
}

export default async function SubscriptionsPage({ searchParams }: { searchParams: Search }) {
  const sp = {
    page: searchParams.page || "1",
    size: searchParams.size || "12",
    campaignId: searchParams.campaignId && searchParams.campaignId !== ""
      ? searchParams.campaignId
      : "__all__",
    tags: searchParams.tags || "",
    locale: searchParams.locale || "",
    q: searchParams.q || ""
  }

  const [data, campaigns] = await Promise.all([
    getSubscriptions(sp),
    getCampaignOptions()
  ])
  const { items, page, size, total, totalPages } = data
  const nameMap = await getCampaignNameMap(items)

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Inscrições</h1>
        <p className="text-sm text-neutral-600">Dispositivos/usuários inscritos para receber Web Push.</p>
      </div>

      {/* Filtros */}
      <form className="mb-4 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 md:grid-cols-6" method="get">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Campanha</label>
          <Select name="campaignId" defaultValue={sp.campaignId}>
            <SelectTrigger />
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {campaigns.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-1">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Locale</label>
          <input
            name="locale"
            defaultValue={sp.locale}
            placeholder="ex.: pt, pt-BR"
            className="h-10 w-full rounded-md border px-3 text-sm outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Tags</label>
          <input
            name="tags"
            defaultValue={sp.tags}
            placeholder="tag1, tag2"
            className="h-10 w-full rounded-md border px-3 text-sm outline-none"
          />
        </div>

        <div className="md:col-span-1">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Resultados por página</label>
          <select
            name="size"
            defaultValue={sp.size}
            className="h-10 w-full rounded-md border px-3 text-sm outline-none"
          >
            <option value="10">10</option>
            <option value="12">12</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="md:col-span-4">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Buscar</label>
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="endpoint, navegador..."
            className="h-10 w-full rounded-md border px-3 text-sm outline-none"
          />
        </div>

        <div className="md:col-span-2 flex items-end justify-end gap-2">
          <input type="hidden" name="page" value="1" />
          <button className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800">Aplicar</button>
          <Link
            href="/subscriptions"
            className="rounded-md border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Limpar
          </Link>
        </div>
      </form>

      {(!items || items.length === 0) ? (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="mb-2 text-sm text-neutral-600">Nenhuma inscrição encontrada.</p>
          <p className="text-xs text-neutral-500">Ajuste os filtros ou aguarde novas inscrições.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white">
          <Table>
            <THead>
              <TRow>
                <TH>Endpoint</TH>
                <TH>Navegador</TH>
                <TH>Locale</TH>
                <TH>Tags</TH>
                <TH>Campanha</TH>
                <TH>Visto por último</TH>
                <TH>Criado em</TH>
              </TRow>
            </THead>
            <tbody>
              {items.map((s) => (
                <TRow key={s.id} >
                  <TD className="font-mono">
                    <Link href={`/subscriptions/${s.id}`} className="underline hover:text-black">
                      {hostFromUrl(s.endpoint)}
                    </Link>
                  </TD>
                  <TD>{shortUA(s.userAgent)}</TD>
                  <TD>{s.locale || "-"}</TD>
                  <TD>{(s.tags && s.tags.length) ? s.tags.join(", ") : "-"}</TD>
                  <TD>
                    {s.campaignId && (nameMap[s.campaignId] && nameMap[s.campaignId] !== "(não encontrada)")
                      ? (
                        <Link
                          className="underline hover:text-black"
                          href={`/campaigns/${s.campaignId}/edit`}
                        >
                          {nameMap[s.campaignId]}
                        </Link>
                      )
                      : (s.campaignId ? nameMap[s.campaignId] || s.campaignId : "-")}
                  </TD>
                  <TD>{s.lastSeenAt ? new Date(s.lastSeenAt).toLocaleString("pt-BR") : "-"}</TD>
                  <TD>{s.createdAt ? new Date(s.createdAt).toLocaleString("pt-BR") : "-"}</TD>
                </TRow>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Paginação */}
      <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
        <div>
          Página <strong>{page}</strong> de <strong>{totalPages}</strong> — {total} inscrições
        </div>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={`/subscriptions?${buildQuery({ page: String(page - 1) }, sp)}`}
              className="rounded-md border px-3 py-1 hover:bg-neutral-50"
            >
              Anterior
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`/subscriptions?${buildQuery({ page: String(page + 1) }, sp)}`}
              className="rounded-md border px-3 py-1 hover:bg-neutral-50"
            >
              Próxima
            </Link>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
