import Link from "next/link";
import { Plus, QrCode, ExternalLink, MoreHorizontal } from "lucide-react";
import { prisma } from "@/lib/db";
import { DeleteEventButton } from "./delete-button";

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Événements</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos événements et leurs QR codes
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

      {events.length === 0 ? (
        <div className="rounded-xl border border-border/40 bg-card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold">Aucun événement</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez votre premier événement pour commencer.
          </p>
          <Link
            href="/admin/events/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Créer un événement
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                    Événement
                  </th>
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                    Lieu
                  </th>
                  <th className="px-6 py-3.5 text-center font-medium text-muted-foreground">
                    Scans
                  </th>
                  <th className="px-6 py-3.5 text-center font-medium text-muted-foreground">
                    Téléch.
                  </th>
                  <th className="px-6 py-3.5 text-center font-medium text-muted-foreground">
                    QR Code
                  </th>
                  <th className="px-6 py-3.5 text-right font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(event.eventDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-[160px] truncate">
                      {event.location}
                    </td>
                    <td className="px-6 py-4 text-center">{event.scanCount}</td>
                    <td className="px-6 py-4 text-center">
                      {event.downloadCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {event.qrCodeUrl ? (
                        <Link
                          href={event.qrCodeUrl}
                          download={`qrcode-${event.slug}.png`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <QrCode className="h-4 w-4" />
                          Télécharger
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={event.publicUrl || `/event/${event.slug}`}
                          target="_blank"
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Link>
                        <DeleteEventButton id={event.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
