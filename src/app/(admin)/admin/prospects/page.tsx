import { prisma } from "@/lib/db";
import { ProspectsList } from "./prospects-list";

interface Props {
  searchParams: Promise<{ search?: string; event?: string }>;
}

export default async function ProspectsPage({ searchParams }: Props) {
  const { search, event: eventFilter } = await searchParams;

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  const where: Record<string, unknown> = {};
  if (eventFilter) where.eventId = eventFilter;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { phoneNumber: { contains: search } },
    ];
  }

  const prospects = await prisma.prospect.findMany({
    where,
    include: {
      event: { select: { id: true, title: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const count = prospects.length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Prospects</h1>
          <p className="text-muted-foreground mt-1">
            {count} prospect{count !== 1 ? "s" : ""} inscrit
            {count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <ProspectsList
        prospects={prospects.map((p) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          phoneNumber: p.phoneNumber,
          eventId: p.eventId,
          event: { id: p.event.id, title: p.event.title, slug: p.event.slug },
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }))}
        events={events}
      />
    </div>
  );
}
