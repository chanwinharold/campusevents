"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { deleteEvent } from "@/actions/events"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function DeleteEventButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return

    setLoading(true)
    const result = await deleteEvent(id)

    if (result.success) {
      toast.success("Événement supprimé")
      router.refresh()
    } else {
      toast.error(result.error || "Erreur lors de la suppression")
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
