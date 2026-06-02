"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, X } from "lucide-react"
import Link from "next/link"
import { updateEvent } from "@/actions/events"
import { toast } from "sonner"
import type { EventData } from "@/types"

export default function EditEventForm({ event }: { event: EventData }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [flyerPreview, setFlyerPreview] = useState<string>(event.flyerImageUrl)
  const [flyerUrl, setFlyerUrl] = useState(event.flyerImageUrl)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 10 MB")
      return
    }

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Format accepté : PNG, JPG, WEBP")
      return
    }

    const preview = URL.createObjectURL(file)
    setFlyerPreview(preview)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (data.url) {
        setFlyerUrl(data.url)
        toast.success("Flyer uploadé avec succès")
      } else {
        toast.error(data.error || "Erreur lors de l'upload")
        setFlyerPreview(event.flyerImageUrl)
      }
    } catch {
      toast.error("Erreur lors de l'upload")
      setFlyerPreview(event.flyerImageUrl)
    } finally {
      setUploading(false)
    }
  }

  const removeFlyer = () => {
    setFlyerPreview("")
    setFlyerUrl("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    if (flyerUrl) {
      formData.set("flyerImageUrl", flyerUrl)
    }

    const result = await updateEvent(event.id, formData)

    if (result.success) {
      toast.success("Événement mis à jour")
      router.push("/admin/events")
      router.refresh()
    } else {
      toast.error(result.error || "Erreur lors de la mise à jour")
    }
    setLoading(false)
  }

  const eventDateLocal = new Date(event.eventDate)
    .toISOString()
    .slice(0, 16)

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux événements
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mt-4">
          Modifier l&apos;événement
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border/40 bg-card p-6 space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1.5">
              Titre
            </label>
            <input
              id="title"
              name="title"
              type="text"
              defaultValue={event.title}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor="shortDescription"
              className="block text-sm font-medium mb-1.5"
            >
              Description courte
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              rows={3}
              defaultValue={event.shortDescription}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="eventDate"
                className="block text-sm font-medium mb-1.5"
              >
                Date & heure
              </label>
              <input
                id="eventDate"
                name="eventDate"
                type="datetime-local"
                defaultValue={eventDateLocal}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium mb-1.5"
              >
                Lieu
              </label>
              <input
                id="location"
                name="location"
                type="text"
                defaultValue={event.location}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Publié
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isPublished"
                defaultChecked={event.isPublished}
                className="rounded border-input text-primary focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">
                Visible sur la page publique
              </span>
            </label>
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-card p-6">
          <label className="block text-sm font-medium mb-3">
            Flyer
          </label>

          {flyerPreview ? (
            <div className="relative rounded-lg overflow-hidden border border-border/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flyerPreview}
                alt="Flyer"
                className="w-full max-h-[300px] object-contain bg-muted"
              />
              <button
                type="button"
                onClick={removeFlyer}
                className="absolute top-2 right-2 rounded-full bg-background/80 p-1.5 text-muted-foreground hover:text-foreground backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-border/60 rounded-lg p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium">
                Cliquez pour changer le flyer
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />

          {uploading && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Upload...
            </div>
          )}
        </div>

        {event.qrCodeUrl && (
          <div className="rounded-xl border border-border/40 bg-card p-6">
            <label className="block text-sm font-medium mb-3">
              QR Code
            </label>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={event.qrCodeUrl}
                alt="QR Code"
                className="w-24 h-24 rounded-lg border border-border/40"
              />
              <div className="text-sm text-muted-foreground">
                <p>Scannez pour accéder à la page publique</p>
                <a
                  href={event.qrCodeUrl}
                  download={`qrcode-${event.slug}.png`}
                  className="inline-flex items-center gap-1 text-primary hover:underline mt-1"
                >
                  Télécharger le QR code
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Link
            href="/admin/events"
            className="flex-1 rounded-full border border-border/60 px-5 py-2.5 text-sm font-medium text-center hover:bg-muted transition-colors"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex-1 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>
    </div>
  )
}
