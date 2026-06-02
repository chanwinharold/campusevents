import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import type { EventData } from "@/types"
import EditEventForm from "./edit-form"

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params
  const event = await prisma.event.findUnique({ where: { id } })

  if (!event) {
    notFound()
  }

  return <EditEventForm event={event as EventData} />
}
