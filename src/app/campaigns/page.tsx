import { DashboardShell } from "@/components/dashboard-shell"
import { apiFetch } from "@/lib/api"
import Link from "next/link"
import { Table, THead, TRow, TH, TD } from "@/components/ui/table"
import { Campaign, intervalLabels, Paginated, statusLabels } from "@/types/campaign"
import { DeleteCampaignButton } from "./parts/delete-button"
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
  status?: string
  mode?: string
  q?: string
}

async function getCampaigns(sp: Search): Promise<Paginated<Campaign>> {
  const params = new URLSearchParams()
  const page = Number(sp.page || 1)
  const size = Number(sp.size || 12)
  params.set("page", String(page))
  params.set("size", String(size))
  if (sp.status && sp.status !== "__all__") params.set("status", sp.status)
  if (sp.mode && sp.mode !== "__all__") params.set("mode", sp.mode)
  if (sp.q) params.set("q", sp.q)

  const res = await apiFetch(`/campaigns?${params.toString()}`)
  return res.json()
}

function buildQuery(next: Partial<Search>, current: Search) {
  const params = new URLSearchParams()
  const merged: Search = { ...current, ...next }
  if (merged.page) params.set("page", merged.page)
  if (merged.size) params.set("size", merged.size)
  if (merged.status && merged.status !== "__all__") params.set("status", merged.status)
  if (merged.mode && merged.mode !== "__all__") params.set("mode", merged.mode)
  if (merged.q) params.set("q", merged.q)
  return params.toString()
}

export default async function CampaignsPage({ searchParams }: { searchParams: Search }) {
  const sp: Search = {
    page: searchParams.page || "1",
    size: searchParams.size || "12",
    status: searchParams.status || "",
    mode: searchParams.mode || "",
    q: searchParams.q || ""
  }

  const data = await getCampaigns(sp)
  const { items, page, size, total, totalPages } = data

  return (
    <DashboardShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Campanhas</h1>
        <Link
          href="/campaigns/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white transition-colors hover:bg-neutral-800"
        >
          Nova campanha
        </Link>
      </div>

      {/* Filtros */}
      <form className="mb-4 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 md:grid-cols-6" method="get">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Status</label>
          <Select name="status" defaultValue={sp.status || "__all__"}>
            <SelectTrigger />
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {Object.entries(statusLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Modo</label>
          <Select name="mode" defaultValue={sp.mode || "__all__"}>
            <SelectTrigger />
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              <SelectItem value="ONE_TIME">Única</SelectItem>
              <SelectItem value="RECURRING">Recorrente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">Buscar</label>
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="título..."
            className="h-10 w-full rounded-md border px-3 text-sm outline-none"
          />
        </div>

        {/* Botões alinhados à direita */}
        <div className="md:col-span-6 flex items-end justify-end gap-2">
          <input type="hidden" name="page" value="1" />
          <button className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800">
            Aplicar
          </button>
          <Link
            href="/campaigns"
            className="rounded-md border px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Limpar
          </Link>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border bg-white">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-xl">
              📭
            </div>
            <p className="mb-2 text-sm text-neutral-600">Nenhuma campanha encontrada</p>
          </div>
        ) : (
          <Table>
            <THead>
              <TRow>
                <TH>Título</TH>
                <TH>Status</TH>
                <TH>Modo</TH>
                <TH>Intervalo</TH>
                <TH>Agendada para</TH>
                <TH>Termina em</TH>
                <TH>Criada em</TH>
                <TH className="text-right">Ações</TH>
              </TRow>
            </THead>
            <tbody>
              {items.map((c) => (
                <TRow key={c.id}>
                  <TD className="font-medium">
                    <Link
                      href={`/campaigns/${c.id}/edit`}
                      className="cursor-pointer transition-colors hover:underline"
                    >
                      {c.title}
                    </Link>
                  </TD>
                  <TD>{statusLabels[c.status as string] ?? c.status}</TD>
                  <TD>{c.schedule?.mode === "RECURRING" ? "Recorrente" : "Única"}</TD>
                  <TD>
                    {c.schedule?.mode === "RECURRING"
                      ? (intervalLabels[c.schedule?.interval as string] ?? c.schedule?.interval ?? "-")
                      : "—"}
                  </TD>
                  <TD>{c.schedule?.startAt ? new Date(c.schedule.startAt as any).toLocaleString("pt-BR") : "-"}</TD>
                  <TD>{c.schedule?.endAt ? new Date(c.schedule.endAt as any).toLocaleString("pt-BR") : "—"}</TD>
                  <TD>{c.createdAt ? new Date(c.createdAt as any).toLocaleString("pt-BR") : "-"}</TD>
                  <TD className="text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/campaigns/${c.id}/edit`} className="text-sm underline hover:text-black">
                        Editar
                      </Link>
                      <Link href={`/campaigns/${c.id}/embed`} className="text-sm underline hover:text-black">
                        Instalar
                      </Link>
                      <DeleteCampaignButton id={c.id} title={c.title} />
                    </div>
                  </TD>
                </TRow>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {items.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
          <div>
            Página <strong>{page}</strong> de <strong>{totalPages}</strong> — {total} campanhas
          </div>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link
                href={`/campaigns?${buildQuery({ page: String(page - 1) }, sp)}`}
                className="rounded-md border px-3 py-1 hover:bg-neutral-50"
              >
                Anterior
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/campaigns?${buildQuery({ page: String(page + 1) }, sp)}`}
                className="rounded-md border px-3 py-1 hover:bg-neutral-50"
              >
                Próxima
              </Link>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
