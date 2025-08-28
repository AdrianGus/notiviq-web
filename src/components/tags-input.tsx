"use client";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  placeholder?: string;
  // Opcional:
  maxTags?: number;
  toLowerCase?: boolean; // normalizar tags minúsculas
  unique?: boolean; // evitar duplicadas
};

export default function TagsInput({
  value,
  onChange,
  label = "Tags",
  placeholder = "Digite e pressione espaço…",
  maxTags,
  toLowerCase = true,
  unique = true,
}: Props) {
  const [buffer, setBuffer] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Evita espaços consecutivos
    setBuffer((b) => b.replace(/\s+/g, " "));
  }, [buffer]);

  function sanitize(tag: string) {
    let t = tag.trim();
    if (toLowerCase) t = t.toLowerCase();
    return t.replace(/\s+/g, "-"); // transforma espaços internos em hífen
  }

  function addFromBuffer() {
    if (!buffer.trim()) return;
    const candidate = sanitize(buffer);
    setBuffer("");

    if (!candidate) return;
    if (maxTags && value.length >= maxTags) return;
    if (unique && value.includes(candidate)) return;

    onChange([...value, candidate]);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ([" ", "Enter", ","].includes(e.key)) {
      e.preventDefault();
      addFromBuffer();
    } else if (e.key === "Backspace" && !buffer) {
      // backspace com input vazio remove última tag
      e.preventDefault();
      if (value.length > 0) {
        const next = [...value];
        next.pop();
        onChange(next);
      }
    }
  }

  function handleBlur() {
    addFromBuffer();
  }

  function onPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    if (!text) return;

    const parts = text
      .split(/[\s,]+/) // separa por espaços e vírgulas
      .map(sanitize)
      .filter(Boolean);

    let next = [...value];
    for (const p of parts) {
      if (maxTags && next.length >= maxTags) break;
      if (unique && next.includes(p)) continue;
      next.push(p);
    }
    onChange(next);
  }

  function removeAt(i: number) {
    const next = [...value];
    next.splice(i, 1);
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {value.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
          >
            {tag}
            <Button
              type="button"
              variant="secondary"
              className="h-6 px-2 sm text-xs"
              onClick={() => removeAt(i)}
              aria-label={`Remover ${tag}`}
            >
              ×
            </Button>
          </span>
        ))}
      </div>

      {/* Input */}
      <Input
        ref={inputRef}
        value={buffer}
        onChange={(e) => setBuffer(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onPaste={onPaste}
        placeholder={placeholder}
      />

      {maxTags ? (
        <p className="text-xs opacity-70">
          {value.length}/{maxTags} tags
        </p>
      ) : null}
    </div>
  );
}