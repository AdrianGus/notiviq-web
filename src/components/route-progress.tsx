// src/components/route-progress.tsx
"use client"

import * as React from "react"
import { usePathname, useSearchParams } from "next/navigation"

export default function RouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // visuais
  const [active, setActive] = React.useState(false)
  const [fading, setFading] = React.useState(false)
  const [progress, setProgress] = React.useState(0) // 0..1

  // controles
  const hydratedRef = React.useRef(false)
  const rafRef = React.useRef<number | null>(null)
  const startTsRef = React.useRef<number>(0)
  const finishingRef = React.useRef(false)
  const pendingRef = React.useRef(0)

  // timers
  const guardTimerRef = React.useRef<number | null>(null)
  const to100TimerRef = React.useRef<number | null>(null)
  const fadeTimerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    hydratedRef.current = true
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (guardTimerRef.current) clearTimeout(guardTimerRef.current)
      if (to100TimerRef.current) clearTimeout(to100TimerRef.current)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  const stopRaf = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const clearTimers = () => {
    if (guardTimerRef.current) { clearTimeout(guardTimerRef.current); guardTimerRef.current = null }
    if (to100TimerRef.current) { clearTimeout(to100TimerRef.current); to100TimerRef.current = null }
    if (fadeTimerRef.current) { clearTimeout(fadeTimerRef.current); fadeTimerRef.current = null }
  }

  const start = React.useCallback(() => {
    if (!hydratedRef.current) return
    pendingRef.current += 1

    // se já está ativa e não está no fade, não reinicia
    if (active && !fading) return

    setFading(false)
    setProgress(0)
    setActive(true)
    finishingRef.current = false
    startTsRef.current = Date.now()
    stopRaf()
    clearTimers()

    // anima via RAF até ~0.9, acelerando no começo
    const tick = () => {
      if (finishingRef.current) return
      setProgress((p) => Math.min(0.9, p + Math.max(0.025, (0.9 - p) * 0.14)))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    // failsafe: se em 1.8s a rota não mudou, concluímos mesmo assim
    guardTimerRef.current = window.setTimeout(() => {
      finish(true) // força finalizar
    }, 1800)
  }, [active, fading])

  const finish = React.useCallback((force = false) => {
    // várias navegações encadeadas: só finaliza quando a última terminar
    pendingRef.current = Math.max(0, pendingRef.current - 1)
    if (!force && pendingRef.current > 0) return

    finishingRef.current = true
    stopRaf()
    if (guardTimerRef.current) { clearTimeout(guardTimerRef.current); guardTimerRef.current = null }

    const minVisible = 250
    const elapsed = Date.now() - (startTsRef.current || Date.now())
    const wait = Math.max(0, minVisible - elapsed)

    to100TimerRef.current = window.setTimeout(() => {
      setProgress(1) // empurra para 100%
      // após a transição de escala (~220ms), faz o fade-out
      to100TimerRef.current = window.setTimeout(() => {
        setFading(true)
        fadeTimerRef.current = window.setTimeout(() => {
          setActive(false)
          setFading(false)
          setProgress(0)
          finishingRef.current = false
          startTsRef.current = 0
        }, 300) // duração do fade (CSS abaixo)
      }, 220) // duração da transição do transform (CSS abaixo)
    }, wait)
  }, [])

  // Início: clique em links internos
  React.useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null
      const a = t?.closest?.("a") as HTMLAnchorElement | null
      if (!a) return

      // ignorar modificadores/botão não primário/targets/externos
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      if (a.target && a.target !== "_self") return
      if (a.hasAttribute("download")) return

      try {
        const url = new URL(a.href, window.location.href)
        if (url.origin !== window.location.origin) return
        // evita disparar se o link é para a mesma rota + busca atual
        const samePath = url.pathname === window.location.pathname
        const sameQuery = url.search === window.location.search
        if (samePath && sameQuery) return
        start()
      } catch { }
    }
    window.addEventListener("pointerdown", onPointerDown, true)
    return () => window.removeEventListener("pointerdown", onPointerDown, true)
  }, [start])

  // Início: envio de formulários GET (ex.: filtros)
  React.useEffect(() => {
    const onSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement
      if (!form) return
      const method = (form.getAttribute("method") || "get").toLowerCase()
      if (method !== "get") return
      start()
    }
    window.addEventListener("submit", onSubmit, true)
    return () => window.removeEventListener("submit", onSubmit, true)
  }, [start])

  // Início: navegação via back/forward
  React.useEffect(() => {
    const onPop = () => start()
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [start])

  // Fim: quando a rota ou os search params mudarem de fato
  React.useEffect(() => {
    if (!active) return
    const cleanup = finish()
    return cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams])

  // UI
  const scale = active ? progress : 0
  const opacity = active ? (fading ? 0 : 1) : 0

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5"
      aria-hidden="true"
      style={{ contain: "layout style", willChange: "transform, opacity" }}
    >
      <div
        className="h-full w-full origin-left rounded-full bg-gradient-to-r from-black via-neutral-800 to-black"
        style={{
          transform: `scaleX(${scale})`,
          opacity,
          transition: fading
            ? "transform 220ms ease-out, opacity 300ms ease-out"
            : "transform 200ms ease-out, opacity 300ms ease-out",
        }}
      />
    </div>
  )
}
