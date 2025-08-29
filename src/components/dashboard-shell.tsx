"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { Megaphone, BellRing, Cog, Home } from "lucide-react"

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  match: (pathname?: string | null) => boolean
}

const NAV: NavItem[] = [
  {
    href: "/",
    label: "Página Inicial",
    icon: Home,
    // ativa só na raiz
    match: (p) => p === "/",
  },
  {
    href: "/campaigns",
    label: "Campanhas",
    icon: Megaphone,
    match: (p) => !!p?.startsWith("/campaigns"),
  },
  {
    href: "/subscriptions",
    label: "Inscrições",
    icon: BellRing,
    match: (p) => !!p?.startsWith("/subscriptions"),
  },
  {
    href: "/settings",
    label: "Configurações",
    icon: Cog,
    match: (p) => !!p?.startsWith("/settings"),
  },
]

function NavLink({ item, pathname }: { item: NavItem; pathname?: string | null }) {
  const Icon = item.icon
  const active = item.match(pathname)

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
        "outline-none ring-0 focus-visible:ring-2 focus-visible:ring-black/20 select-none",
        active
          ? "bg-black text-white shadow-sm"
          : "text-neutral-700 hover:bg-neutral-900 hover:text-white"
      )}
    >
      {/* Indicador sutil à esquerda quando ativo */}
      <span
        className={cn(
          "absolute left-0 top-1/2 h-5 -translate-y-1/2 rounded-r-full transition-all",
          active ? "w-1 bg-white/90" : "w-0"
        )}
      />
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-transform duration-200",
          active ? "scale-110" : "group-hover:scale-110"
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  )
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Sidebar fixa */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r bg-neutral-100/70 backdrop-blur-sm">
        {/* Branding / topo */}
        <div className="flex h-16 items-center border-b px-4">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-black to-neutral-700 text-white">
              <span className="text-[13px] font-bold">NQ</span>
            </div>
            <div className="leading-tight">
              <div className="text-base font-bold tracking-tight">NotivIQ</div>
              <div className="text-[11px] text-neutral-500">Web Push Dashboard</div>
            </div>
          </div>
        </div>

        {/* Seção de navegação */}
        <div className="flex h-[calc(100dvh-64px)] flex-col">
          <div className="px-3 pt-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
            Geral
          </div>

          <nav className="px-2">
            <div className="space-y-2">
              {NAV.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </div>
          </nav>

          {/* Rodapé opcional do menu */}
          <div className="mt-auto p-3 text-[11px] text-neutral-500/80">
            <span className="rounded-full bg-white/70 px-2 py-1 ring-1 ring-black/5">
              v1
            </span>
          </div>
        </div>
      </aside>

      {/* Conteúdo deslocado pela largura da sidebar */}
      <div className="ml-64 grid min-h-dvh grid-rows-[64px_1fr]">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-end gap-3 border-b bg-white/80 px-4 backdrop-blur">
          <UserButton afterSignOutUrl="/" />
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
