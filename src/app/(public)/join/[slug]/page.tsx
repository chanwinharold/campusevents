import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Calendar, MapPin } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { JoinForm } from "./join-form";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function JoinPage({ params }: Props) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });

  if (!event || !event.isPublished) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-primary"
          >
            <Sparkles className="h-5 w-5" />
            CampusEvents
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3">
            <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
              <div className="relative w-full aspect-[4/3] bg-muted">
                <Image
                  src={event.flyerImageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </div>
              <div className="p-5 space-y-3">
                <h1 className="text-xl font-bold tracking-tight">
                  {event.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{formatDate(event.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded-xl border border-border/40 bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-1">
                Accédez au flyer
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Renseignez vos informations pour télécharger le flyer de
                l&apos;événement.
              </p>
              <JoinForm eventId={event.id} slug={slug} />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 py-6">
        <div className="mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} CampusEvents
        </div>
      </footer>
    </div>
  );
}
