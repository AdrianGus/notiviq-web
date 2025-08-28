import { DashboardShell } from "@/components/dashboard-shell"
import DnsGuide from "./parts/dns-guite"

function getApiHost(): string {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  try {
    return base ? new URL(base).host : "SEU-API-HOST"
  } catch {
    return "SEU-API-HOST"
  }
}

export default async function SettingsPage() {
  const apiHost = getApiHost()

  return (
    <DashboardShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-neutral-600">
          Guia para vincular um subdomínio seu ao Service Worker padrão do NotivIQ.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-5">
          <h2 className="mb-2 text-lg font-semibold">Por que configurar DNS?</h2>
          <p className="text-sm text-neutral-700">
            O Service Worker que recebe Web Push precisa estar no domínio que solicita a permissão do navegador.
            Para facilitar, você pode criar um{" "}
            <strong>subdomínio</strong> (ex.: <code>push.seudominio.com</code>)
            apontando para o nosso backend. Assim, hospedamos um Service Worker padrão no seu subdomínio.
          </p>

          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-700">
            <li>
              Você registra a permissão a partir de uma página no subdomínio (ex.:{" "}
              <code>https://push.seudominio.com/register</code>), e esse subdomínio instala o Service Worker
              <code> /sw.js</code>, controlando o escopo <code>/</code>.
            </li>
            <li>
              A página principal do seu site pode abrir esse subdomínio em um <em>iframe</em> para gerenciar a permissão,
              como fazem provedores grandes (ex.: subdomínio dedicado de Web Push).
            </li>
            <li>
              As notificações exibirão o subdomínio configurado como origem.
            </li>
          </ul>
        </section>

        <DnsGuide apiHost={apiHost} />
      </div>
    </DashboardShell>
  )
}