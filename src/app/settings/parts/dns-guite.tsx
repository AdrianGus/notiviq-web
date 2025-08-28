"use client"

import * as React from "react"
import { Copy } from "lucide-react"

export default function DnsGuide({ apiHost }: { apiHost: string }) {
  const [subdomain, setSubdomain] = React.useState("push.seudominio.com")
  const [checking, setChecking] = React.useState(false)
  const [status, setStatus] = React.useState<null | { ok: boolean; msg: string }>(null)

  const targetHost = apiHost || "SEU-API-HOST"   // para o CNAME
  const swUrl = `https://${subdomain}/sw.js`
  const registerUrl = `https://${subdomain}/register`

  async function check() {
    setChecking(true)
    setStatus(null)
    try {
      // tenta buscar o script do SW
      const res = await fetch(swUrl, { method: "GET", mode: "no-cors" })
      // no-cors pode retornar "opaque" — se não lançar erro de rede já é um bom indicativo
      setStatus({ ok: true, msg: "Conseguimos acessar a URL do Service Worker (pode aparecer como 'opaque' em no-cors, mas a origem respondeu)." })
    } catch (e: any) {
      setStatus({ ok: false, msg: e?.message || "Não foi possível acessar a URL do Service Worker." })
    } finally {
      setChecking(false)
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <section className="rounded-xl border bg-white p-5">
      <h2 className="mb-2 text-lg font-semibold">Passo a passo (DNS + teste)</h2>

      <ol className="list-decimal space-y-4 pl-5 text-sm text-neutral-700">
        <li>
          <div className="mb-2 font-medium">Escolha seu subdomínio</div>
          <input
            className="h-10 w-full rounded-md border px-3 text-sm outline-none"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            placeholder="push.seudominio.com"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Dica: use algo como <code>push.suaempresa.com.br</code> ou <code>notificacoes.suaempresa.com.br</code>.
          </p>
        </li>

        <li>
          <div className="mb-2 font-medium">Crie um registro DNS</div>
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-3 py-2 text-left">Tipo</th>
                  <th className="px-3 py-2 text-left">Nome</th>
                  <th className="px-3 py-2 text-left">Aponta para</th>
                  <th className="px-3 py-2 text-left">TTL</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2">CNAME</td>
                  <td className="px-3 py-2">{subdomain}</td>
                  <td className="px-3 py-2">{targetHost}</td>
                  <td className="px-3 py-2">auto</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => copy(`CNAME ${subdomain} ${targetHost}`)}
                      className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-neutral-50"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copiar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Se você usa Cloudflare/Akamai/etc., deixe o CNAME como <em>DNS only</em> (sem proxy) enquanto testa.
          </p>
        </li>

        <li>
          <div className="mb-2 font-medium">Teste de publicação</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div>
              <div className="text-xs text-neutral-500">URL do Service Worker</div>
              <div className="flex items-center gap-2">
                <code className="truncate rounded-md border bg-neutral-50 px-2 py-1">{swUrl}</code>
                <button
                  type="button"
                  onClick={() => window.open(swUrl, "_blank", "noopener,noreferrer")}
                  className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-50"
                >
                  Abrir
                </button>
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Página de registro</div>
              <div className="flex items-center gap-2">
                <code className="truncate rounded-md border bg-neutral-50 px-2 py-1">{registerUrl}</code>
                <button
                  type="button"
                  onClick={() => window.open(registerUrl, "_blank", "noopener,noreferrer")}
                  className="rounded-md border px-2 py-1 text-xs hover:bg-neutral-50"
                >
                  Abrir
                </button>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={check}
              disabled={checking}
              className="rounded-md bg-black px-3 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-60"
            >
              {checking ? "Verificando…" : "Verificar publicação do SW"}
            </button>
            {status && (
              <div className={`mt-2 text-sm ${status.ok ? "text-emerald-700" : "text-red-700"}`}>
                {status.msg}
              </div>
            )}
          </div>
        </li>

        <li>
          <div className="mb-2 font-medium">Como registrar</div>
          <p className="text-sm">
            No seu site, abra um <code>iframe</code> apontando para <code>{registerUrl}</code> (pode ser oculto).
            Essa página, hospedada no subdomínio, registra o Service Worker <code>/sw.js</code> com escopo <code>/</code>.
          </p>
          <pre className="mt-2 overflow-auto rounded-md border bg-neutral-50 p-3 text-xs">
            {`<iframe src="${registerUrl}" style="display:none" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin"></iframe>`}
          </pre>
        </li>
      </ol>

      <div className="mt-4 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
        <strong>Certificado TLS:</strong> para o subdomínio responder em HTTPS, emita um certificado (ex.: via Cloudflare/Let's Encrypt) para <code>{subdomain}</code>.
      </div>
    </section>
  )
}