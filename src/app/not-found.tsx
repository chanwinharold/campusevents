import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Sparkles className="h-12 w-12 text-primary mb-4" />
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">
        Page non trouvée
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-all"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
