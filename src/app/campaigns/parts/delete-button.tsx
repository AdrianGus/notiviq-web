
"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { useClientApi } from "@/lib/client-api"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "@/components/ui/dialog"

export function DeleteCampaignButton({ id, title }:{ id:string; title:string }){
  const { call } = useClientApi()
  const { show } = useToast()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  async function onConfirm(){
    try{
      setLoading(true)
      await call(`/campaigns/${id}`, { method:"DELETE" })
      show({ title: "Campanha excluída", description: `"${title}" foi removida com sucesso.` })
      setOpen(false)
      router.refresh()
    }catch(e:any){
      show({ variant:"destructive", title:"Erro ao excluir", description: e?.message || "Tente novamente." })
    }finally{
      setLoading(false)
    }
  }

  return (
    <>
      <button className="text-sm text-red-600 underline" onClick={()=> setOpen(true)} disabled={loading}>Excluir</button>
      <ConfirmDialog
        open={open}
        title="Confirmar exclusão"
        description={`Deseja excluir a campanha "${title}"? Essa ação não pode ser desfeita.`}
        onConfirm={onConfirm}
        onCancel={()=> setOpen(false)}
      />
    </>
  )
}
