import { DashboardShell } from "@/components/dashboard-shell"
import { apiFetch } from "@/lib/api"
import type { Campaign } from "@/types/campaign"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import TestInlineSubscribe from "./test-inline.client"
import { SnippetViewer } from "./snippet-viwer" // mantenho seu import como está

/** Helpers */
function cleanBase(url: string) {
  return String(url || "").replace(/\/$/, "")
}
function makeSlugFromAccountId(id: string) {
  // gera slug curto e estável a partir do accountId (só letras/números, 8 chars)
  const s = (id || "").toLowerCase().replace(/[^a-z0-9]/g, "")
  return s.slice(0, 8) || "acc"
}
function buildIframeOrigin(accountId: string) {
  const base = process.env.NEXT_PUBLIC_WILDCARD_BASE || ".notiviq.com.br" // exemplo: ".notiviq.com.br"
  const slug = makeSlugFromAccountId(accountId)
  const host = base.startsWith(".") ? `${slug}${base}` : `${slug}.${base}`
  return `https://${host}`
}

async function getCampaign(id: string): Promise<Campaign> {
  const res = await apiFetch(`/campaigns/${id}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Falha ao carregar campanha")
  return res.json()
}

export default async function EmbedPage({ params }: { params: { id: string } }) {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""

  if (!apiBase) {
    return (
      <DashboardShell>
        <div className="rounded-lg border bg-white p-6">
          <h1 className="text-xl font-semibold mb-2">Instalar campanha</h1>
          <p className="text-sm text-red-600">
            Defina <code>NEXT_PUBLIC_API_BASE_URL</code> no frontend para gerar o snippet.
          </p>
        </div>
      </DashboardShell>
    )
  }

  const api = cleanBase(apiBase)
  const campaign = await getCampaign(params.id)

  // VAPID
  const vapidRes = await fetch(`${api}/vapid`, { cache: "no-store" })
  if (!vapidRes.ok) throw new Error("Falha ao obter VAPID_PUBLIC_KEY")
  const { publicKey } = await vapidRes.json()

  // IFRAME origin (wildcard no seu domínio)
  const iframeOrigin = buildIframeOrigin(campaign.accountId)

  /** Snippet recomendado — IFRAME (zero config) */
  const snippetIframe = `<!-- NotivIQ – botão de inscrição (recomendado: IFRAME, zero configuração) -->
<script src="${api}/subscribe.v1.js" defer></script>

<button
  data-notiviq-subscribe
  data-account-id="${campaign.accountId}"
  data-campaign-id="${campaign.id}"
  data-api="${api}"
  data-vapid="${publicKey}"
  data-iframe-origin="${iframeOrigin}"
>
  Permitir notificações
</button>`

  /** Snippet alternativo — DIRETO (se conseguir servir /sw.js no mesmo domínio da landing) */
  const snippetDireto = `<!-- NotivIQ – botão de inscrição (direto: requer /sw.js no mesmo domínio da sua landing) -->
<script src="${api}/subscribe.v1.js" defer></script>

<button
  data-notiviq-subscribe
  data-account-id="${campaign.accountId}"
  data-campaign-id="${campaign.id}"
  data-api="${api}"
  data-vapid="${publicKey}"
  data-sw="/sw.js"
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Esquerda: snippets para copiar */}
        <section className="rounded-xl border bg-white p-5 space-y-6">
          <div>
            <h2 className="mb-2 text-lg font-semibold">Snippet recomendado (IFRAME)</h2>
            <p className="mb-2 text-sm text-neutral-600">
              Copie e cole na sua landing page. Não requer proxy nem DNS no seu domínio.
            </p>
            <SnippetViewer snippet={snippetIframe} />
            <p className="mt-2 text-xs text-neutral-500">
              Origem do iframe: <code>{iframeOrigin}</code>
            </p>
          </div>

          <div className="pt-4 border-t">
            <h2 className="mb-2 text-lg font-semibold">Alternativa (direto com /sw.js)</h2>
            <p className="mb-2 text-sm text-neutral-600">
              Use apenas se você conseguir servir <code>/sw.js</code> no mesmo domínio da sua landing.
            </p>
            <SnippetViewer snippet={snippetDireto} />
          </div>
        </section>

        {/* Direita: teste inline (usa IFRAME) */}
        <section className="rounded-xl border bg-white p-5">
          <h2 className="mb-3 text-lg font-semibold">Teste agora (neste navegador)</h2>
          <p className="mb-4 text-sm text-neutral-600">
            Este teste usa o modo <strong>IFRAME</strong>, com o mesmo script <code>subscribe.v1.js</code> e o origin{" "}
            <code>{iframeOrigin}</code>.
          </p>

          <TestInlineSubscribe
            mode="iframe"
            apiBase={api}
            iframeOrigin={iframeOrigin}
            vapidPublicKey={publicKey}
            campaign={{ id: campaign.id, accountId: campaign.accountId, title: (campaign as any).title }}
          />
        </section>
      </div>
    </DashboardShell>
  )
}
