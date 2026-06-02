import Link from "next/link"
import { ArrowRight, Plus } from "lucide-react"
import { prisma } from "@/lib/db"

async function getStats() {
  const [totalEvents, scanResult, downloadResult, recentEvents] =
    await Promise.all([
      prisma.event.count(),
      prisma.event.aggregate({ _sum: { scanCount: true } }),
      prisma.event.aggregate({ _sum: { downloadCount: true } }),
      prisma.event.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

  return {
    totalEvents,
    totalScans: scanResult._sum.scanCount ?? 0,
    totalDownloads: downloadResult._sum.downloadCount ?? 0,
    recentEvents,
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    {
      label: "Total Événements",
      value: stats.totalEvents,
      href: "/admin/events",
    },
    {
      label: "Total Scans",
      value: stats.totalScans,
      href: "/admin/events",
    },
    {
      label: "Téléchargements",
      value: stats.totalDownloads,
      href: "/admin/events",
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Vue d&apos;ensemble de vos événements
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-all"
        >
          <Plus className="h-4 w-4" />
          Nouvel événement
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-border/40 bg-card p-6 hover:shadow-sm transition-shadow"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-bold">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border/40 bg-card">
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <h2 className="font-semibold">Événements récents</h2>
          <Link
            href="/admin/events"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Voir tout
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {stats.recentEvents.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              Aucun événement pour le moment.
            </p>
            <Link
              href="/admin/events/new"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Créer votre premier événement
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Titre
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Scans
                  </th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">
                    Téléchargements
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-border/40 hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">{event.title}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(event.eventDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4">{event.scanCount}</td>
                    <td className="px-6 py-4">{event.downloadCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
