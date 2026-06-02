"use client"

import { useState } from "react"
import { Download, Share2, Check } from "lucide-react"
import { incrementDownloadCount } from "./actions"

export function DownloadButton({ slug, flyerUrl }: { slug: string; flyerUrl: string }) {
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = async () => {
    try {
      const response = await fetch(flyerUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `flyer-${slug}.${blob.type.split("/")[1] || "jpg"}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setDownloaded(true)
      await incrementDownloadCount(slug)
      setTimeout(() => setDownloaded(false), 2000)
    } catch (error) {
      console.error("Download failed:", error)
      window.open(flyerUrl, "_blank")
      await incrementDownloadCount(slug)
    }
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-all w-full sm:w-auto justify-center"
    >
      {downloaded ? (
        <>
          <Check className="h-4 w-4" />
          Téléchargé
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Télécharger le flyer
        </>
      )}
    </button>
  )
}

export function ShareButton({ slug, title }: { slug: string; title: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${process.env.NEXT_PUBLIC_APP_URL || typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/event/${slug}`

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        console.error("Failed to copy")
      }
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-sm font-medium hover:bg-muted transition-colors w-full sm:w-auto justify-center"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          Lien copié
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          Partager
        </>
      )}
    </button>
  )
}
