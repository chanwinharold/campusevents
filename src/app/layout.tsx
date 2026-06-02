import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
})

export const metadata: Metadata = {
  title: {
    default: "CampusEvents - Gestion d'Événements",
    template: "%s | CampusEvents",
  },
  description:
    "Plateforme de gestion d'événements avec génération automatique de QR codes pour vos rassemblements.",
  keywords: ["événements", "QR code", "flyer", "gestion d'événements"],
  authors: [{ name: "CampusEvents" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "CampusEvents",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
        {children}
      </body>
    </html>
  )
}
