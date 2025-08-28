import "server-only";
import { auth } from "@clerk/nextjs/server";

const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
const BASE = RAW_BASE.replace(/\/$/, "");

function buildUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
}

async function getJwtFromClerk(): Promise<string | null> {
  const session = await auth();
  const tryTemplates: (string | undefined)[] = [undefined, "notiviq-api", "default"];
  for (const t of tryTemplates) {
    try {
      const token = await session.getToken?.(t ? { template: t } : undefined);
      if (token) return token;
    } catch (err: any) {
      // Swallow 404 "Not Found" (template inexistente) e tenta o próximo
      const msg = String(err?.message || "");
      // Outros erros: loga em dev e segue para próxima tentativa
      if (process.env.NODE_ENV === "development") {
        console.error("[apiFetch:getToken]", err);
      }
    }
  }
  return null;
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = await getJwtFromClerk();

  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const url = buildUrl(path);
  const res = await fetch(url, { ...init, headers, cache: "no-store" });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (process.env.NODE_ENV === "development") {
      console.error(`[apiFetch] ${init.method || "GET"} ${url} -> ${res.status} ${res.statusText}\n${body}`);
      console.error(`[apiFetch] Token presente? ${token ? "SIM" : "NÃO"}`);
    }
    throw new Error(body || res.statusText || `Request failed (${res.status})`);
  }
  return res;
}
