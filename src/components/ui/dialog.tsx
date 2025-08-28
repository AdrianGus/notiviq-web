"use client"
import * as React from "react"
import { Button } from "./button"

export function ConfirmDialog({
  open,
  title,
  description,
  onConfirm,
  onCancel
}: {
  open: boolean;
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-2 text-base font-semibold text-left">{title}</h2>
        {description && <p className="mb-4 text-sm text-left text-neutral-600">{description}</p>}
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel} className="bg-neutral-200 text-black hover:bg-neutral-300">
            Cancelar
          </Button>
          <Button onClick={onConfirm}>Confirmar</Button>
        </div>
      </div>
    </div>
  )
}