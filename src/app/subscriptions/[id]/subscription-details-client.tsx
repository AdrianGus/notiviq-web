"use client"

import * as React from "react"
import useSWR from "swr"
import Link from "next/link"
import { Table, THead, TRow, TH, TD } from "@/components/ui/table"
import { useClientApi } from "@/lib/client-api"
import type { Subscription } from "@/types/subscription"
import type { Notification } from "@/types/notification"
import { notificationStatusLabels } from "@/types/notification"
import {
  Select, SelectTrigger, SelectContent, SelectItem,
} from "@/components/ui/select"
import { useAuth } from "@clerk/nextjs"

type Paginated<T> = {
  items: T[]
  total: number
  page: number
  size: number
  totalPages: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ""

/* Utils */
function hostFromUrl(url?: string) {
  try { return url ? new URL(url).host : "-" } catch { return "-" }
}
function dt(v?: string | Date) { return v ? new Date(v).toLocaleString("pt-BR") : "-" }

function StatusBadge({ status }: { status: Notification["status"] }) {
  const map: Record<Notification["status"], string> = {
    SENT: "bg-neutral-100 text-neutral-800",
    FAILED: "bg-red-100 text-red-800",
    SHOWN: "bg-sky-100 text-sky-800",
    CLICKED: "bg-emerald-100 text-emerald-800",
    CLOSED: "bg-neutral-200 text-neutral-800",
  }
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${map[status]}`}>
      {notificationStatusLabels[status]}
    </span>
  )
}

/** Busca nomes de campanhas com token do Clerk */
async function fetchCampaignNames(
  ids: string[],
  getToken: () => Promise<string | null>
) {
  const unique = Array.from(new Set(ids.filter(Boolean)))
  if (!unique.length) return {} as Record<string, string>

  const token = await getToken()
  const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}

  const entries = await Promise.all(unique.map(async (id) => {
    try {
      const r = await fetch(`${API_BASE}/campaigns/${id}`, { headers, credentials: "include" })
      if (!r.ok) return [id, "(não encontrada)"] as const
      const c = await r.json()
      return [id, c.title as string] as const
    } catch {
      return [id, "(não encontrada)"] as const
    }
  }))

  return Object.fromEntries(entries) as Record<string, string>
}

export default function SubscriptionDetailsClient({ sub }: { sub: Subscription }) {
  const [tab, setTab] = React.useState<"overview" | "notifications">("overview")

  // título da campanha vinculada (exibir nome em vez do id) – com Clerk token
  const { getToken } = useAuth()
  const [linkedCampaignTitle, setLinkedCampaignTitle] = React.useState<string | null>(null)
  React.useEffect(() => {
    let cancelled = false
    async function load() {
      if (!sub.campaignId) { setLinkedCampaignTitle(null); return }
      try {
        const token = await getToken()
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
        const r = await fetch(`${API_BASE}/campaigns/${sub.campaignId}`, { headers, credentials: "include" })
        if (!r.ok) { if (!cancelled) setLinkedCampaignTitle("(não encontrada)"); return }
        const c = await r.json()
        if (!cancelled) setLinkedCampaignTitle(c.title || "(sem título)")
      } catch {
        if (!cancelled) setLinkedCampaignTitle("(não encontrada)")
      }
    }
    load()
    return () => { cancelled = true }
  }, [sub.campaignId, getToken])

  return (
    <>
      {/* Card com dados da inscrição */}
      <div className="mb-4 rounded-lg border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs text-neutral-500">Endpoint</div>
            <div className="font-mono text-sm">{hostFromUrl(sub.endpoint)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Locale</div>
            <div className="text-sm">{sub.locale || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Tags</div>
            <div className="text-sm">{sub.tags?.length ? sub.tags.join(", ") : "-"}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Campanha vinculada</div>
            <div className="text-sm">
              {sub.campaignId
                ? (
                  <Link href={`/campaigns/${sub.campaignId}/edit`} className="underline hover:text-black">
                    {linkedCampaignTitle ?? "…"}
                  </Link>
                )
                : "-"}
            </div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Visto por último</div>
            <div className="text-sm">{dt(sub.lastSeenAt as any)}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500">Criado em</div>
            <div className="text-sm">{dt(sub.createdAt as any)}</div>
          </div>
        </div>
      </div>

      {/* Abas client-side (sem navegação) */}
      <div className="mb-3 flex items-center gap-3 border-b">
        <button
          onClick={() => setTab("overview")}
          className={`border-b-2 px-2 py-2 text-sm ${tab === "overview" ? "border-black font-medium" : "border-transparent text-neutral-600 hover:text-black"}`}
        >
          Visão geral
        </button>
        <button
          onClick={() => setTab("notifications")}
          className={`border-b-2 px-2 py-2 text-sm ${tab === "notifications" ? "border-black font-medium" : "border-transparent text-neutral-600 hover:text-black"}`}
        >
          Notificações
        </button>
      </div>

      {tab === "overview" && (
        <div className="rounded-lg border bg-white p-6 text-sm text-neutral-700">
          <p>
            Esta inscrição está associada ao endpoint <span className="font-mono">{hostFromUrl(sub.endpoint)}</span>.
            Você pode acompanhar na aba <strong>Notificações</strong> tudo que foi enviado para este dispositivo/usuário.
          </p>
        </div>
      )}

      {tab === "notifications" && <NotificationsPanel subscriptionId={sub.id} />}
    </>
  )
}

/* ------------------------- Painel de Notificações (client) ------------------------- */
function NotificationsPanel({ subscriptionId }: { subscriptionId: string }) {
  const { call } = useClientApi()
  const { getToken } = useAuth()

  // estados dos filtros/paginação
  const [status, setStatus] = React.useState("__all__")
  const [size, setSize] = React.useState("12")
  const [page, setPage] = React.useState(1)

  // chave do SWR
  const key = React.useMemo(() => {
    const p = new URLSearchParams()
    p.set("subscriptionId", subscriptionId)
    p.set("page", String(page))
    p.set("size", size)
    if (status !== "__all__") p.set("status", status)
    return `/notifications?${p.toString()}`
  }, [subscriptionId, page, size, status])

  const fetcher = React.useCallback(async (url: string) => {
    // usa useClientApi para chamadas normais autenticadas
    const res = await call(url)
    if (!res.ok) throw new Error(await res.text())
    return res.json() as Promise<Paginated<Notification>>
  }, [call])

  const { data, isLoading, mutate } = useSWR<Paginated<Notification>>(key, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
    dedupingInterval: 2000,
  })

  // nomes das campanhas em paralelo (com token do Clerk)
  const [campaignNameMap, setCampaignNameMap] = React.useState<Record<string, string>>({})
  const lastIdsRef = React.useRef<string>("")
  React.useEffect(() => {
    const ids = (data?.items || []).map(n => n.campaignId).filter(Boolean) as string[]
    const nextKey = ids.sort().join(",")
    if (!nextKey || nextKey === lastIdsRef.current) return
    lastIdsRef.current = nextKey
    let cancelled = false
    fetchCampaignNames(ids, getToken).then(map => { if (!cancelled) setCampaignNameMap(map) })
    return () => { cancelled = true }
  }, [data?.items, getToken])

  function applyFilters(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
  }
  function clearFilters() {
    setStatus("__all__")
    setSize("12")
    setPage(1)
  }

  return (
    <>
      {/* Filtros — padrão do DS: Trigger sem <SelectValue /> */}
      <form onSubmit={applyFilters} className="mb-3 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 md:grid-cols-6">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Status</label>
          <Select defaultValue={status} onValueChange={(v) => setStatus(v)}>
            <SelectTrigger className="h-10 w-full" />
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              <SelectItem value="SENT">Enviada</SelectItem>
              <SelectItem value="FAILED">Falhou</SelectItem>
              <SelectItem value="SHOWN">Exibida</SelectItem>
              <SelectItem value="CLICKED">Clicada</SelectItem>
              <SelectItem value="CLOSED">Fechada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-1">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Resultados por página</label>
          <Select defaultValue={size} onValueChange={(v) => { setSize(v); setPage(1) }}>
            <SelectTrigger className="h-10 w-full" />
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-3 flex items-end justify-end gap-2">
          <button type="submit" className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800">
            Aplicar
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-md border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => mutate()}
            className="rounded-md border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            🔄 Atualizar
          </button>
        </div>
      </form>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border bg-white">
        {isLoading && !data ? (
          <div className="p-8 text-sm text-neutral-600">Carregando…</div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-8 text-center text-sm text-neutral-600">Nenhuma notificação encontrada.</div>
        ) : (
          <Table>
            <THead>
              <TRow>
                <TH>Status</TH>
                <TH>Campanha</TH>
                <TH>Enviada</TH>
                <TH>Exibida</TH>
                <TH>Clicada</TH>
                <TH>Ação clicada</TH>
                <TH>Fechada</TH>
              </TRow>
            </THead>
            <tbody>
              {data.items.map((n) => (
                <TRow key={n.id}>
                  <TD><StatusBadge status={n.status} /></TD>
                  <TD>
                    {n.campaignId && (campaignNameMap[n.campaignId] && campaignNameMap[n.campaignId] !== "(não encontrada)")
                      ? <Link href={`/campaigns/${n.campaignId}/edit`} className="underline hover:text-black">{campaignNameMap[n.campaignId]}</Link>
                      : (n.campaignId ? (campaignNameMap[n.campaignId] || n.campaignId) : "-")}
                  </TD>
                  <TD>{dt(n.sentAt)}</TD>
                  <TD>{dt(n.shownAt)}</TD>
                  <TD>{dt(n.clickedAt)}</TD>
                  <TD>{n.clickedAction || "-"}</TD>
                  <TD>{dt(n.closedAt)}</TD>
                </TRow>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* Paginação */}
      <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
        <div>
          Página <strong>{data?.page ?? page}</strong> de <strong>{data?.totalPages ?? 1}</strong> — {data?.total ?? 0} notificações
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={!data || data.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-md border px-3 py-1 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            disabled={!data || data.page >= data.totalPages}
            onClick={() => setPage((p) => (data ? Math.min(data.totalPages, p + 1) : p + 1))}
            className="rounded-md border px-3 py-1 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Próxima
          </button>
        </div>
      </div>
    </>
  )
}
