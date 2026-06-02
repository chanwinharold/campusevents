import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ArrowLeft, Sparkles } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { ScanTracker } from "./scan-tracker";
import { DownloadButton, ShareButton } from "./client-components";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });

  if (!event || !event.isPublished) {
    return { title: "Événement non trouvé" };
  }

  return {
    title: event.title,
    description: event.shortDescription,
    openGraph: {
      title: event.title,
      description: event.shortDescription,
      images: [{ url: event.flyerImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.shortDescription,
      images: [event.flyerImageUrl],
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });

  if (!event || !event.isPublished) {
    notFound();
  }

  return (
    <>
      <ScanTracker slug={slug} />
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
          <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] bg-muted">
              <Image
                src={event.flyerImageUrl}
                alt={event.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>

            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {event.title}
                </h1>
                <p className="mt-3 text-muted-foreground text-lg">
                  {event.shortDescription}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{formatDate(event.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{event.location}</span>
                </div>
              </div>

              {event.fullDescription && (
                <p className="text-muted-foreground whitespace-pre-line">
                  {event.fullDescription}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <DownloadButton slug={slug} flyerUrl={event.flyerImageUrl} />
                <ShareButton slug={slug} title={event.title} />
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </main>

        <footer className="border-t border-border/40 py-6">
          <div className="mx-auto max-w-4xl px-4 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} CampusEvents
          </div>
        </footer>
      </div>
    </>
  );
}
