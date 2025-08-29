"use client"

import * as React from "react"
import { Copy } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useClientApi } from "@/lib/client-api"
import { useToast } from "@/components/ui/use-toast"
import { formatApiError } from "@/lib/format-api-error"
import { useRouter } from "next/navigation"

export default function DnsGuide({
  apiHost,
  initialDomain,
}: {
  apiHost: string
  initialDomain?: string
}) {
  const { call } = useClientApi()
  const { show } = useToast()
  const router = useRouter()

  const [domain, setDomain] = React.useState(initialDomain || "")
  const [checking, setChecking] = React.useState(false)
  const [status, setStatus] = React.useState<null | { ok: boolean; msg: string }>(null)
  const [loading, setLoading] = React.useState(false)

  const subdomain = domain ? `notiviq.${domain}` : "notiviq.seudominio.com.br"
  const targetHost = apiHost || "SEU-API-HOST"
  const swUrl = `https://${subdomain}/sw.js`
  const registerUrl = `https://${subdomain}/register`

  async function check() {
    setChecking(true)
    setStatus(null)
    try {
      await fetch(swUrl, { method: "GET", mode: "no-cors" })
      setStatus({
        ok: true,
        msg: "O domínio respondeu. O Service Worker parece estar publicado corretamente.",
      })
    } catch {
      setStatus({ ok: false, msg: "Não foi possível verificar o domínio." })
    } finally {
      setChecking(false)
    }
  }

  async function saveDomain(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await call("/accounts", {
        method: "PATCH",
        body: JSON.stringify({ domain: domain.trim() }), // salva apenas o domínio raiz
      })
      if (res.ok) {
        show({
          title: "Domínio salvo",
          description: "Seu domínio foi atualizado com sucesso.",
        })
        router.refresh() // 👈 força atualização do Server Component
      } else {
        throw new Error(await res.text())
      }
    } catch (err: any) {
      show({
        variant: "destructive",
        title: "Erro ao salvar",
        description: formatApiError(err, "Não foi possível salvar o domínio."),
      })
    } finally {
      setLoading(false)
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
  }

  return (
    <section className="rounded-xl border bg-white p-5 space-y-4">
      <h2 className="text-lg font-semibold">Configuração do domínio</h2>
      <p className="text-sm text-neutral-700">
        Digite abaixo o domínio principal do seu site (ex.:{" "}
        <code>seudominio.com.br</code>). O sistema vai usar automaticamente o
        subdomínio <code>notiviq</code> para configurar as notificações.
      </p>

      <form onSubmit={saveDomain} className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700">
          Seu domínio
        </label>
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="seudominio.com.br"
        />
        <Button type="submit" loading={loading}>
          Salvar
        </Button>
      </form>

      <h3 className="mt-6 text-base font-semibold">Passo a passo DNS</h3>

      <ol className="list-decimal space-y-4 pl-5 text-sm text-neutral-700">
        <li>
          Crie um registro DNS do tipo <strong>CNAME</strong> para apontar
          <code>{subdomain}</code> para <code>{targetHost}</code>.
          <div className="mt-2 overflow-hidden rounded-lg border">
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
        </li>

        <li>
          Teste se a publicação funcionou:
          <div className="mt-2 grid gap-2">
            <code className="truncate rounded-md border bg-neutral-50 px-2 py-1">{swUrl}</code>
            <code className="truncate rounded-md border bg-neutral-50 px-2 py-1">{registerUrl}</code>
          </div>
          <div className="mt-3">
            <Button type="button" onClick={check} disabled={checking}>
              {checking ? "Verificando…" : "Verificar publicação"}
            </Button>
            {status && (
              <div
                className={`mt-2 text-sm ${status.ok ? "text-emerald-700" : "text-red-700"}`}
              >
                {status.msg}
              </div>
            )}
          </div>
        </li>
      </ol>
    </section>
  )
}
