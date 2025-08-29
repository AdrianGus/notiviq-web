import { DashboardShell } from "@/components/dashboard-shell"
import { apiFetch } from "@/lib/api"
import DnsGuide from "./parts/dns-guite"

async function getAccount() {
  try {
    const res = await apiFetch("/accounts", { cache: "no-store" })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function SettingsPage() {
  const account = await getAccount()
  const apiHost =
    account?.settings?.domain ||
    (() => {
      const base =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        ""
      try {
        return base ? new URL(base).host : "SEU-API-HOST"
      } catch {
        return "SEU-API-HOST"
      }
    })()

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-neutral-600">
          Configure o domínio do seu site para ativar o Service Worker do NotivIQ.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coluna da esquerda: DNS + formulário */}
        <DnsGuide apiHost={apiHost} initialDomain={account?.settings?.domain} />

        {/* Coluna da direita: explicação simples */}
        <section className="rounded-xl border bg-white p-5 space-y-4">
          <h2 className="mb-2 text-lg font-semibold">Por que preciso configurar isso?</h2>
          <p className="text-sm text-neutral-700">
            Para que as notificações push funcionem no seu site, o navegador precisa instalar
            um arquivo chamado <code>Service Worker</code>. Esse arquivo deve ser servido a
            partir do seu próprio domínio.
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-700">
            <li>
              Você vai usar um subdomínio automático do tipo{" "}
              <code>notiviq.seudominio.com.br</code>.
            </li>
            <li>
              Esse subdomínio será responsável por instalar o arquivo{" "}
              <code>/sw.js</code>, que habilita as notificações.
            </li>
            <li>
              Com isso, os visitantes do seu site poderão autorizar o recebimento de push
              com a origem exibida no seu próprio domínio.
            </li>
          </ul>
        </section>
      </div>
    </DashboardShell>
  )
}
