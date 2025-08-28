"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "lucide-react"

type Props = {
  id: string
  label: React.ReactNode
  required?: boolean
  valueIso: string // "YYYY-MM-DDTHH:mm"
  onChangeIso: (iso: string) => void
  placeholder?: string
  title?: string
  error?: string
  minIso?: string
  disabled?: boolean
}

/** "2025-08-20T05:31" -> "20/08/2025 05:31" */
function isoToBR(iso?: string): string {
  if (!iso) return ""
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!m) return ""
  const [, Y, M, D, h, mm] = m
  return `${D}/${M}/${Y} ${h}:${mm}`
}

/** "20/08/2025 05:31" -> "2025-08-20T05:31" (local) */
function brToIsoLocal(br?: string): string | null {
  if (!br) return null
  const m = br.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))$/)
  if (!m) return null
  let [, d, mo, y, h, mi] = m
  const dd = String(d).padStart(2, "0")
  const MM = String(mo).padStart(2, "0")
  const HH = String(h).padStart(2, "0")
  const MMm = String(mi).padStart(2, "0")

  // validação básica de faixa
  const di = parseInt(dd, 10), mon = parseInt(MM, 10), yr = parseInt(y, 10)
  const hr = parseInt(HH, 10), mn = parseInt(MMm, 10)
  if (mon < 1 || mon > 12 || di < 1 || di > 31 || hr > 23 || mn > 59) return null

  return `${yr}-${MM}-${dd}T${HH}:${MMm}`
}

export default function DateTimeInput({
  id, label, required, valueIso, onChangeIso, placeholder = "dd/mm/aaaa hh:mm",
  title = "Formato: dia/mês/ano horas:minutos", error, minIso, disabled
}: Props) {
  const [text, setText] = React.useState<string>(isoToBR(valueIso))
  const hiddenRef = React.useRef<HTMLInputElement>(null)

  // Mantém o texto em sincronia caso valueIso venha de fora
  React.useEffect(() => { setText(isoToBR(valueIso)) }, [valueIso])

  function openNativePicker() {
    const el = hiddenRef.current
    if (!el) return
    try {
      // @ts-ignore
      if (el.showPicker) el.showPicker()
      else el.focus()
    } catch {
      el.focus()
    }
  }

  function onHiddenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const iso = e.target.value // "YYYY-MM-DDTHH:mm"
    if (iso) {
      onChangeIso(iso)
      setText(isoToBR(iso))
    }
  }

  function onBlur() {
    const iso = brToIsoLocal(text)
    if (iso) {
      if (minIso && iso < minIso) {
        // mantém texto, mas não atualiza iso — validação ficará a cargo do form
        return
      }
      onChangeIso(iso)
      setText(isoToBR(iso))
    }
  }

  return (
    <div>
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-600">*</span>}
      </Label>

      <div className="relative">
        {/* Campo visível (BR) */}
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          title={title}
          disabled={disabled}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={onBlur}
          className={error ? "pr-10 border-red-500" : "pr-10"}
        />

        {/* Botão para abrir o seletor nativo */}
        <button
          type="button"
          onClick={openNativePicker}
          className="absolute inset-y-0 right-0 grid w-9 place-items-center text-neutral-500 hover:text-black"
          tabIndex={-1}
          aria-label="Abrir seletor de data e hora"
        >
          <Calendar className="h-4 w-4" />
        </button>

        {/* Input nativo oculto (sincroniza ISO/local) */}
        <input
          ref={hiddenRef}
          type="datetime-local"
          className="pointer-events-none absolute -z-10 h-0 w-0 opacity-0"
          value={valueIso || ""}
          onChange={onHiddenChange}
          min={minIso || undefined}
        />
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <p className="mt-1 text-[11px] text-neutral-500">Formato: <code>dd/mm/aaaa hh:mm</code></p>
    </div>
  )
}
