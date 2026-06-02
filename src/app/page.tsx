import Link from "next/link";
import { ArrowRight, QrCode, ImageDown, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold text-primary"
          >
            <Sparkles className="h-6 w-6" />
            CampusEvents
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/admin/login"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <Sparkles className="h-4 w-4" />
              Gestion d&apos;événements simplifiée
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-balance">
              Créez, partagez, <span className="text-primary">connectez</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground text-balance max-w-xl mx-auto">
              Générez des QR codes uniques pour vos événements. Vos invités
              scannent et accèdent instantanément aux informations.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-all"
              >
                Dashboard Admin
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border/40 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-border/40 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">QR Code unique</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Chaque événement reçoit un QR code unique généré
                  automatiquement.
                </p>
              </div>
              <div className="rounded-xl border border-border/40 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ImageDown className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">Flyer intégré</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upload simple du flyer. Les visiteurs le voient et le
                  téléchargent.
                </p>
              </div>
              <div className="rounded-xl border border-border/40 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-semibold">Parcours sans friction</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Scan → Voir → Télécharger. Aucune inscription nécessaire.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CampusEvents. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
