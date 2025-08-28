"use client";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type NotificationAction = { title: string; url?: string };

type Props = {
  value: NotificationAction[];
  onChange: (next: NotificationAction[]) => void;
  maxActions?: number; // ex.: 2
  minActions?: number; // mínimo de linhas (default = 1)
};

export default function ActionsEditor({
  value,
  onChange,
  maxActions,
  minActions = 1,
}: Props) {
  const length = value?.length || 0;

  const canAdd = useMemo(
    () => (typeof maxActions === "number" ? length < maxActions : true),
    [length, maxActions]
  );
  const canRemove = useMemo(() => length > minActions, [length, minActions]);

  function addRow() {
    if (!canAdd) return;
    onChange([...(value || []), { title: "", url: "" }]);
  }

  function removeRow(idx: number) {
    if (!canRemove) return;
    const next = [...(value || [])];
    next.splice(idx, 1);
    onChange(next);
  }

  function updateField(idx: number, field: keyof NotificationAction, v: string) {
    const next = [...(value || [])];
    next[idx] = { ...next[idx], [field]: v };
    onChange(next);
  }

  return (
    <div className="space-y-3" id="actions-editor">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-base font-semibold">Ações da notificação</Label>
        <Button
          type="button"
          variant="secondary"
          onClick={addRow}
          disabled={!canAdd}
          className="h-8 px-3 text-sm"
        >
          + Adicionar ação
        </Button>
      </div>

      <div className="space-y-2">
        {(value || []).map((row, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 gap-3 overflow-hidden rounded-xl border p-3 md:grid-cols-12 md:p-4"
          >
            <div className="md:col-span-5">
              <Label htmlFor={`title-${idx}`}>Título do botão</Label>
              <Input
                id={`title-${idx}`}
                placeholder='ex: "Ver oferta"'
                value={row.title}
                onChange={(e) => updateField(idx, "title", e.target.value)}
              />
            </div>

            <div className="md:col-span-5">
              <Label htmlFor={`url-${idx}`}>URL</Label>
              <Input
                id={`url-${idx}`}
                type="url"
                placeholder="https://exemplo.com"
                value={row.url || ""}
                onChange={(e) => updateField(idx, "url", e.target.value)}
              />
            </div>

            <div className="flex items-end md:col-span-2 md:justify-end">
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeRow(idx)}
                disabled={!canRemove}
                className="w-full whitespace-nowrap md:w-auto h-8 px-3 text-sm"
              >
                Remover
              </Button>
            </div>
          </div>
        ))}

        <div className="text-xs opacity-70">
          {typeof maxActions === "number"
            ? `* Entre ${minActions} e ${maxActions} ações.`
            : `* Mínimo de ${minActions} ação(ões).`}
        </div>
      </div>
    </div>
  );
}