"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useClientApi } from "@/lib/client-api"
import { useToast } from "@/components/ui/use-toast"
import {
  Campaign,
  CampaignScheduleModeEnum,
  CampaignStatusEnum,
  intervalLabels,
  scheduleModeLabels,
  statusLabels,
} from "@/types/campaign"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import ActionsEditor, { NotificationAction } from "@/components/actions-editor"
import TagsInput from "@/components/tags-input"
import CloudinaryImageUpload from "@/components/cloudinary-image-upload"
import RichTextEditor from "@/components/rich-text-editor"
import DateTimeInput from "@/components/date-time-input"

/* ---------- Utils ---------- */
function toLocalDatetimeInputValue(dateLike?: string | Date | null): string {
  if (!dateLike) return ""
  const d = new Date(dateLike)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
function isValidUrl(u?: string): boolean { if (!u) return false; try { new URL(u); return true } catch { return false } }
function isImageUrl(u?: string): boolean { return !!u && isValidUrl(u) && /\.(png|jpe?g|gif|webp|svg)$/i.test(u) }
function hostFromFirstAction(actions: NotificationAction[]): string | null { const url = actions?.[0]?.url; try { return url ? new URL(url).host : null } catch { return null } }

/** Sanitização leve para renderizar HTML do editor na prévia */
function sanitizeHtmlLight(html?: string): string {
  if (!html) return ""
  let out = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/\sstyle='[^']*'/gi, "")
  return out
}

/* ---------- Ícone do Chrome ---------- */
function ChromeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="#F4F4F4" />
      <path d="M44 16H24l-8-8h16a22 22 0 0 1 12 8z" fill="#EA4335" />
      <path d="M24 44c7.7 0 14.4-4.1 18-10L30 20H16l8 24z" fill="#34A853" />
      <path d="M10 14 24 40 14 24H4a22 22 0 0 1 6-10z" fill="#FBBC05" />
      <circle cx="24" cy="24" r="8.5" fill="#4285F4" />
      <circle cx="24" cy="24" r="4.5" fill="#E8F0FE" />
    </svg>
  )
}

/* ---------- Body da notificação com HTML ---------- */
function NotificationBody({ html }: { html?: string }) {
  const safe = sanitizeHtmlLight(html)
  return (
    <div
      className="
        prose prose-sm max-w-none text-xs text-neutral-700
        prose-p:my-1 prose-ul:my-1 prose-ol:my-1
        prose-img:rounded-md prose-img:border prose-img:max-h-48 prose-img:object-cover
        prose-a:underline prose-a:text-sky-700
      "
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}

/* ---------- Card Android-like ---------- */
function AndroidNotificationCard({
  title,
  bodyHtml,
  icon,
  image,
  actions,
  status,
}: {
  title?: string
  bodyHtml?: string
  icon?: string
  image?: string   // <-- NOVO
  actions: NotificationAction[]
  status?: string
}) {
  const validIcon = isImageUrl(icon)
  const host = hostFromFirstAction(actions) || "seusite.com"
  const showImage = isImageUrl(image) // <-- NOVO

  return (
    <div className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow">
      {/* header */}
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <ChromeIcon className="h-5 w-5 shrink-0" />
        <div className="truncate text-xs font-medium text-neutral-800">{host}</div>
        <div className="ml-auto text-[10px] text-neutral-500">Agora</div>
        <div className="ml-2 h-6 w-6 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
          {validIcon ? (
            <img src={icon} alt="Ícone do site" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px]">🖼️</div>
          )}
        </div>
      </div>

      {/* content */}
      <div className="space-y-2 p-3">
        <div className="text-sm font-semibold text-neutral-900">
          {title || "Título da notificação"}
        </div>

        {/* corpo com HTML sanitizado */}
        {bodyHtml ? (
          <NotificationBody html={bodyHtml} />
        ) : (
          <div className="text-xs text-neutral-700">Conteúdo da mensagem pré-visualizada…</div>
        )}

        {/* imagem opcional — QUADRADA */}
        {showImage && (
          <div
            className="w-full overflow-hidden rounded-md border"
            style={{ aspectRatio: "1 / 1" }}
          >
            <img
              src={image}
              alt="Imagem da notificação"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* ações */}
        {actions?.length > 0 && (
          <div className="flex justify-end gap-2 pt-1">
            {actions.slice(0, 2).map((a, i) => (
              <button
                key={i}
                type="button"
                onClick={(ev) => {
                  ev.preventDefault()
                  if (isValidUrl(a.url)) window.open(a.url, "_blank", "noopener,noreferrer")
                }}
                className="cursor-pointer rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 hover:bg-sky-50"
                title={a.url}
              >
                {(a.title || "Abrir").toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AndroidPhonePreview(props: {
  title?: string
  bodyHtml?: string
  icon?: string
  image?: string
  actions: NotificationAction[]
  status?: string
}) {
  return (
    <div className="mx-auto w-[360px]">
      {/* moldura do aparelho */}
      <div className="relative rounded-[36px] border border-black/20 bg-black p-2 shadow-2xl">
        {/* tela */}
        <div className="relative h-[720px] w-[336px] overflow-hidden rounded-[28px] bg-neutral-950">
          {/* papel de parede */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-sky-600 to-indigo-700 opacity-80" />
          {/* status bar */}
          <div className="absolute inset-x-0 top-0 z-10 flex h-10 items-center px-4 text-xs text-white/90">
            <span className="font-medium">12:45</span>
            <span className="ml-auto">🔋 📶 📡</span>
          </div>
          {/* notificação */}
          <div className="absolute inset-x-3 top-12 z-10">
            <AndroidNotificationCard {...props} />
          </div>
          {/* home pill */}
          <div className="absolute inset-x-0 bottom-2 z-10 flex justify-center">
            <div className="h-1.5 w-24 rounded-full bg-white/70" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- Form ---------- */
export function CampaignForm({ initial, mode }: { initial?: Partial<Campaign>; mode: "create" | "edit" }) {
  const { call } = useClientApi()
  const { show } = useToast()
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  // schedule
  const [scheduleMode, setScheduleMode] = React.useState<string>(initial?.schedule?.mode ?? CampaignScheduleModeEnum.ONE_TIME)
  const [scheduleStartAt, setScheduleStartAt] = React.useState<string>(toLocalDatetimeInputValue(initial?.schedule?.startAt as any))
  const [scheduleInterval, setScheduleInterval] = React.useState<string>(initial?.schedule?.interval ?? "")
  const [scheduleEndAt, setScheduleEndAt] = React.useState<string>(toLocalDatetimeInputValue(initial?.schedule?.endAt as any))

  // campos principais (controlados p/ prévia)
  const [status, setStatus] = React.useState<string>(initial?.status ?? CampaignStatusEnum.DRAFT)
  const [title, setTitle] = React.useState<string>(initial?.title ?? "")
  const [body, setBody] = React.useState<string>(initial?.body ?? "") // HTML do RTE
  const [icon, setIcon] = React.useState<string>(initial?.icon ?? "")
  const [image, setImage] = React.useState<string>(initial?.image ?? "")

  // actions (≥1)
  const [actions, setActions] = React.useState<NotificationAction[]>(
    () => (initial?.actions as any[])?.map(a => ({ title: a?.title ?? "", url: a?.url ?? "" })) ?? [{ title: "", url: "" }]
  )

  // tags
  const [tags, setTags] = React.useState<string[]>(() => initial?.target?.tags ?? [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = "Informe o título da campanha."
    if (!body.trim()) newErrors.body = "Informe a mensagem da notificação."
    if (!isImageUrl(icon)) newErrors.icon = "Informe uma URL de imagem válida (png, jpg, jpeg, gif, webp, svg)."
    if (image && !isImageUrl(image)) {
      newErrors.image = "Se preencher, informe uma URL de imagem válida (png, jpg, jpeg, gif, webp, svg)."
    }
    if (!status) newErrors.status = "Selecione um status."
    if (!scheduleMode) newErrors.scheduleMode = "Selecione o modo de agendamento."
    if (!scheduleStartAt) newErrors.scheduleStartAt = "Informe a data/hora de início."
    if (scheduleMode === "RECURRING" && !scheduleInterval) newErrors.scheduleInterval = "Selecione um intervalo para campanhas recorrentes."
    if (scheduleEndAt && scheduleStartAt) {
      const start = new Date(scheduleStartAt).getTime(); const end = new Date(scheduleEndAt).getTime()
      if (!(end > start)) newErrors.scheduleEndAt = "A data/hora de término deve ser posterior ao início."
    }

    const cleanedActions = (actions || [])
      .map(a => ({ title: (a.title || "").trim(), url: (a.url || "").trim() }))
      .filter(a => a.title && isValidUrl(a.url))
    if (cleanedActions.length === 0) newErrors.actions = "Inclua pelo menos 1 ação com Título e URL válidos."

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      show({ variant: "destructive", title: "Campos obrigatórios", description: "Corrija os campos destacados e tente novamente." })
      document.querySelector(`[data-field="${Object.keys(newErrors)[0]}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    const payload: any = {
      status,
      title: title.trim(),
      body: body.trim(), // HTML do RTE
      icon: icon.trim(),
      image: image ? image.trim() : undefined,
      actions: cleanedActions,
      ...(tags?.length ? { target: { tags } } : {}),
      schedule: {
        mode: scheduleMode,
        startAt: new Date(scheduleStartAt).toISOString(),
        ...(scheduleMode === "RECURRING" && scheduleInterval ? { interval: scheduleInterval } : {}),
        ...(scheduleEndAt ? { endAt: new Date(scheduleEndAt).toISOString() } : {}),
      },
    }

    try {
      setLoading(true)
      if (mode === "create") {
        const response = await call(`/campaigns`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        // extrai JSON da resposta
        const data = await response.json();
        const id = data?.id; // ou data?._id dependendo de como sua API retorna

        show({ title: "Campanha criada", description: "Sua campanha foi criada com sucesso." });

        if (id) {
          router.push(`/campaigns/${id}/embed`);
        } else {
          // fallback se não vier id
          router.push(`/campaigns`);
        }
        router.refresh();
      } else {
        const id = initial?.id as string;
        const response = await call(`/campaigns/${id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        const data = await response.json();

        show({ title: "Campanha atualizada", description: "Alterações salvas com sucesso." });
        router.push(`/campaigns/${id}/embed`);
        router.refresh();
      }
    } catch (e: any) {
      show({ variant: "destructive", title: "Erro", description: e?.message || "Não foi possível concluir a ação." })
    } finally { setLoading(false) }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      {/* FORM */}
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        {/* Título */}
        <div data-field="title">
          <Label htmlFor="title">Título <span className="text-red-600">*</span></Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        {/* Ícone / Imagem com upload */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div data-field="icon">
            <CloudinaryImageUpload
              label={<>Ícone (somente imagem) <span className="text-red-600">*</span></>}
              value={icon || ""}
              onChange={(url) => setIcon(url || "")}
              helpText="Formatos: png, jpg, jpeg, gif, webp, svg."
              folder="notiviq-icons"
              className="w-full"
            />
            {errors.icon && <p className="mt-1 text-xs text-red-600">{errors.icon}</p>}
          </div>

          <div data-field="image">
            <CloudinaryImageUpload
              label={<>Ícone (somente imagem) <span className="text-red-600">*</span></>}
              value={image || ""}
              onChange={(url) => setImage(url || "")}
              helpText="Formatos: png, jpg, jpeg, gif, webp, svg. (opcional)"
              folder="notiviq-images"
              className="w-full"
            />
          </div>
        </div>

        {/* Mensagem (RTE) */}
        <div data-field="body">
          <RichTextEditor
            label={<>Mensagem <span className="text-red-600">*</span></>}
            value={body}
            onChange={setBody}
          />
          {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
        </div>

        {/* Ações */}
        <div data-field="actions">
          <ActionsEditor value={actions} onChange={setActions} minActions={1} maxActions={2} />
          {errors.actions && <p className="mt-1 text-xs text-red-600">{errors.actions}</p>}
        </div>

        {/* Tags */}
        <TagsInput
          value={tags}
          onChange={setTags}
          label="Tags (pressione espaço para separar)"
          placeholder="Ex.: clientes, vip, teste …"
          maxTags={20}
          toLowerCase
          unique
        />

        {/* Agendamento */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {/* Modo */}
          <div data-field="scheduleMode">
            <Label>Modo <span className="text-red-600">*</span></Label>
            <Select value={scheduleMode} onValueChange={setScheduleMode}>
              <SelectTrigger className={`h-10 w-full ${errors.scheduleMode ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Selecione o modo" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(scheduleModeLabels).map((k) => (
                  <SelectItem key={k} value={k}>{scheduleModeLabels[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.scheduleMode && <p className="mt-1 text-xs text-red-600">{errors.scheduleMode}</p>}
          </div>

          {/* Início */}
          <div data-field="scheduleStartAt">
            <DateTimeInput
              id="scheduleStartAt"
              label={<>Início</>}
              required
              valueIso={scheduleStartAt}
              onChangeIso={setScheduleStartAt}
              error={errors.scheduleStartAt}
            />
          </div>

          {/* Fim (opcional) */}
          <div data-field="scheduleEndAt">
            <DateTimeInput
              id="scheduleEndAt"
              label={<>Fim (opcional)</>}
              valueIso={scheduleEndAt}
              onChangeIso={setScheduleEndAt}
              minIso={scheduleStartAt || undefined}
              error={errors.scheduleEndAt}
            />
          </div>

          {/* Intervalo */}
          <div data-field="scheduleInterval">
            <Label>Intervalo {scheduleMode === "RECURRING" && <span className="text-red-600">*</span>}</Label>
            <Select
              value={scheduleInterval}
              onValueChange={setScheduleInterval}
              disabled={scheduleMode !== "RECURRING"}
            >
              <SelectTrigger className={`h-10 w-full ${errors.scheduleInterval ? "border-red-500" : ""}`}>
                <SelectValue placeholder={scheduleMode === "RECURRING" ? "Selecione o intervalo" : "—"} />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(intervalLabels).map((k) => (
                  <SelectItem key={k} value={k}>{intervalLabels[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.scheduleInterval && <p className="mt-1 text-xs text-red-600">{errors.scheduleInterval}</p>}
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div data-field="status">
            <Label>Status <span className="text-red-600">*</span></Label>
            <Select value={status} onValueChange={setStatus} name="status">
              <SelectTrigger className={`h-10 w-full ${errors.status ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(statusLabels).map((k) => (
                  <SelectItem key={k} value={k}>{statusLabels[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="mt-1 text-xs text-red-600">{errors.status}</p>}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit" loading={loading}>{mode === "create" ? "Criar" : "Salvar"}</Button>
        </div>
      </form>

      {/* PRÉVIA Android-like */}
      <div className="hidden lg:block">
        <div className="sticky top-4">
          <p className="mb-3 text-xs text-neutral-500">
            <strong>Pré-visualização ilustrativa</strong> — o layout real da notificação pode variar de acordo com a versão do Android, fabricante e navegador.
          </p>
          <AndroidPhonePreview
            title={title}
            bodyHtml={body}
            icon={icon}
            image={image}
            actions={(actions || []).filter(a => a.title && a.url)}
            status={status}
          />
        </div>
      </div>
    </div>
  )
}
