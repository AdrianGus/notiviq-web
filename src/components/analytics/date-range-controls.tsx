"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"

type Props = {
  initialFrom: string // YYYY-MM-DD
  initialTo: string   // YYYY-MM-DD
}

function toLabel(fromISO: string, toISO: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" }
  const f = new Date(fromISO + "T00:00:00").toLocaleDateString("pt-BR", opts)
  const t = new Date(toISO + "T00:00:00").toLocaleDateString("pt-BR", opts)
  return `${f} — ${t}`
}

export default function HomeDateRangeControls({ initialFrom, initialTo }: Props) {
  const [open, setOpen] = React.useState(false)
  const [from, setFrom] = React.useState(initialFrom)
  const [to, setTo] = React.useState(initialTo)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setParamRange(f: string, t: string) {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set("from", f)
    sp.set("to", t)
    router.push(`${pathname}?${sp.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="font-normal">{toLabel(from, to)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent side="bottom" align="end" sideOffset={8} className="w-auto p-3">
          {/* Calendar do shadcn com modo "range" */}
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={{ from: new Date(from + "T00:00:00"), to: new Date(to + "T00:00:00") } as any}
            onSelect={(range: any) => {
              if (!range?.from || !range?.to) return
              const f = range.from.toISOString().slice(0, 10)
              const t = range.to.toISOString().slice(0, 10)
              setFrom(f); setTo(t)
            }}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="default" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={() => { setParamRange(from, to); setOpen(false) }}>Aplicar</Button>
          </div>
        </PopoverContent>
      </Popover>
      {/* Atalhos rápidos */}
      <Button
        variant="outline"
        onClick={() => {
          const today = new Date()
          const from = new Date(today); from.setDate(today.getDate() - 6)
          setParamRange(from.toISOString().slice(0, 10), today.toISOString().slice(0, 10))
        }}
      >
        Últimos 7 dias
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          const today = new Date()
          const from = new Date(today); from.setDate(today.getDate() - 29)
          setParamRange(from.toISOString().slice(0, 10), today.toISOString().slice(0, 10))
        }}
      >
        Últimos 30 dias
      </Button>
    </div>
  )
}
