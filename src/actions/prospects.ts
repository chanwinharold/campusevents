"use server";

import { prisma } from "@/lib/db";
import { prospectSchema } from "@/lib/validations";
import type { ActionResponse, ProspectData } from "@/types";
import { revalidatePath } from "next/cache";

export async function createProspect(
  eventId: string,
  formData: FormData,
): Promise<
  ActionResponse<{ prospect: ProspectData; isNew: boolean }>
> {
  try {
    const raw = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
    };

    const validated = prospectSchema.safeParse(raw);
    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      return { success: false, error: Object.values(errors).flat().join(", ") };
    }

    const { firstName, lastName, phoneNumber } = validated.data;

    const existing = await prisma.prospect.findUnique({
      where: { phoneNumber_eventId: { phoneNumber, eventId } },
    });

    if (existing) {
      return {
        success: true,
        data: { prospect: existing as ProspectData, isNew: false },
      };
    }

    const prospect = await prisma.prospect.create({
      data: { firstName, lastName, phoneNumber, eventId },
    });

    revalidatePath("/admin/prospects");

    return {
      success: true,
      data: { prospect: prospect as ProspectData, isNew: true },
    };
  } catch (error) {
    console.error("Failed to create prospect:", error);
    return { success: false, error: "Erreur lors de l'enregistrement" };
  }
}

export async function getProspects(
  search?: string,
  eventFilter?: string,
): Promise<ActionResponse<ProspectData[]>> {
  try {
    const where: Record<string, unknown> = {};

    if (eventFilter) {
      where.eventId = eventFilter;
    }

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

    return { success: true, data: prospects as unknown as ProspectData[] };
  } catch (error) {
    console.error("Failed to fetch prospects:", error);
    return { success: false, error: "Erreur lors du chargement" };
  }
}

export async function exportProspectsCSV(): Promise<
  ActionResponse<string>
> {
  try {
    const prospects = await prisma.prospect.findMany({
      include: {
        event: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const header = "Prénom;Nom;Téléphone;Événement;Date";
    const rows = prospects.map(
      (p) =>
        `${p.firstName};${p.lastName};${p.phoneNumber};${p.event.title};${p.createdAt.toISOString()}`,
    );

    return { success: true, data: [header, ...rows].join("\n") };
  } catch (error) {
    console.error("Failed to export prospects CSV:", error);
    return { success: false, error: "Erreur lors de l'export" };
  }
}
