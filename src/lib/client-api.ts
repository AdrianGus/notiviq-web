"use client"
import { useAuth } from "@clerk/nextjs"

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
const BASE = RAW_BASE.replace(/\/$/, "")

function buildUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`
  return `${BASE}${p}`
}

export function useClientApi() {
  const { getToken } = useAuth()

  async function getJwt(): Promise<string | null> {
    const tryTemplates: (string | undefined)[] = [undefined, "notiviq-api", "default"]
    for (const t of tryTemplates) {
      try {
        const token = await getToken(t ? { template: t } : undefined)
        if (token) return token
      } catch (err: any) {
        const msg = String(err?.message || "")
        if (err?.status === 404 || msg.includes("Not Found")) continue
        if (process.env.NODE_ENV === "development") {
          console.error("[clientApi:getToken]", err)
        }
      }
    }
    return null
  }

  async function call(path: string, init: RequestInit = {}) {
    const token = await getJwt()

    const headers = new Headers(init.headers || {})
    if (!(init.body instanceof FormData)) {
      // só força JSON se não for upload
      headers.set("Content-Type", "application/json")
    }
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    const url = buildUrl(path)
    const res = await fetch(url, {
      ...init,
      headers,
      credentials: "include",
    })

    // 🔑 Diferente de antes: agora não lança erro automático.
    // Quem chamar decide se quer verificar res.ok ou não.
    return res
  }

  return { call }
}
