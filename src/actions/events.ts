"use server";

import { prisma } from "@/lib/db";
import { createEventSchema, updateEventSchema } from "@/lib/validations";
import { slugify, generatePublicUrl } from "@/lib/utils";
import { auth } from "@/lib/auth";
import QRCode from "qrcode";
import type { ActionResponse, DashboardStats, EventData } from "@/types";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";

async function getAdminUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

export async function getDashboardStats(): Promise<
  ActionResponse<DashboardStats>
> {
  try {
    const [totalEvents, scanResult, downloadResult] = await Promise.all([
      prisma.event.count(),
      prisma.event.aggregate({ _sum: { scanCount: true } }),
      prisma.event.aggregate({ _sum: { downloadCount: true } }),
    ]);

    return {
      success: true,
      data: {
        totalEvents,
        totalScans: scanResult._sum.scanCount ?? 0,
        totalDownloads: downloadResult._sum.downloadCount ?? 0,
      },
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return {
      success: false,
      error: "Erreur lors du chargement des statistiques",
    };
  }
}

export async function getEvents(): Promise<ActionResponse<EventData[]>> {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: events as EventData[] };
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return {
      success: false,
      error: "Erreur lors du chargement des événements",
    };
  }
}

export async function getEventById(
  id: string,
): Promise<ActionResponse<EventData | null>> {
  try {
    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) return { success: false, error: "Événement non trouvé" };
    return { success: true, data: event as EventData };
  } catch (error) {
    console.error("Failed to fetch event:", error);
    return {
      success: false,
      error: "Erreur lors du chargement de l'événement",
    };
  }
}

export async function getEventBySlug(
  slug: string,
): Promise<ActionResponse<EventData | null>> {
  try {
    const event = await prisma.event.findUnique({ where: { slug } });
    if (!event || !event.isPublished) {
      return { success: false, error: "Événement non trouvé" };
    }
    return { success: true, data: event as EventData };
  } catch (error) {
    console.error("Failed to fetch event by slug:", error);
    return {
      success: false,
      error: "Erreur lors du chargement de l'événement",
    };
  }
}

export async function createEvent(
  formData: FormData,
): Promise<ActionResponse<EventData>> {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) return { success: false, error: "Non autorisé" };

    const rawData = {
      title: formData.get("title") as string,
      shortDescription: formData.get("shortDescription") as string,
      fullDescription: formData.get("fullDescription") as string | undefined,
      flyerImageUrl: formData.get("flyerImageUrl") as string,
      eventDate: formData.get("eventDate") as string,
      location: formData.get("location") as string,
    };

    const validated = createEventSchema.safeParse(rawData);
    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      return { success: false, error: Object.values(errors).flat().join(", ") };
    }

    const {
      title,
      shortDescription,
      fullDescription,
      flyerImageUrl,
      eventDate,
      location,
    } = validated.data;

    let slug = slugify(title);
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${slug}-${suffix}`;
    }

    const publicUrl = generatePublicUrl(slug);
    const qrCodeUrl = await QRCode.toDataURL(publicUrl, {
      width: 400,
      margin: 2,
      color: { dark: "#004749", light: "#ffffff" },
    });

    const event = await prisma.event.create({
      data: {
        slug,
        title,
        shortDescription,
        fullDescription: fullDescription || null,
        flyerImageUrl,
        eventDate: new Date(eventDate),
        location,
        qrCodeUrl,
        publicUrl,
      },
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/events");
    revalidatePath("/admin/prospects");

    return { success: true, data: event as EventData };
  } catch (error) {
    console.error("Failed to create event:", error);
    return {
      success: false,
      error: "Erreur lors de la création de l'événement",
    };
  }
}

export async function updateEvent(
  id: string,
  formData: FormData,
): Promise<ActionResponse<EventData>> {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) return { success: false, error: "Non autorisé" };

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return { success: false, error: "Événement non trouvé" };

    const rawData: Record<string, string | boolean | undefined> = {
      title: formData.get("title") as string | undefined,
      shortDescription: formData.get("shortDescription") as string | undefined,
      fullDescription: formData.get("fullDescription") as string | undefined,
      flyerImageUrl: formData.get("flyerImageUrl") as string | undefined,
      eventDate: formData.get("eventDate") as string | undefined,
      location: formData.get("location") as string | undefined,
      isPublished:
        formData.get("isPublished") === "true"
          ? true
          : formData.get("isPublished") === "false"
            ? false
            : undefined,
    };

    const cleanedData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(rawData)) {
      if (value !== undefined) cleanedData[key] = value;
    }

    const validated = updateEventSchema.safeParse(cleanedData);
    if (!validated.success) {
      const errors = validated.error.flatten().fieldErrors;
      return { success: false, error: Object.values(errors).flat().join(", ") };
    }

    const updateData: Record<string, unknown> = { ...validated.data };
    if (updateData.eventDate) {
      updateData.eventDate = new Date(updateData.eventDate as string);
    }
    if (updateData.title) {
      const newSlug = slugify(updateData.title as string);
      const slugExists = await prisma.event.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      updateData.slug = slugExists
        ? `${newSlug}-${Math.random().toString(36).substring(2, 6)}`
        : newSlug;
      updateData.publicUrl = generatePublicUrl(updateData.slug as string);
      updateData.qrCodeUrl = await QRCode.toDataURL(
        updateData.publicUrl as string,
        {
          width: 400,
          margin: 2,
          color: { dark: "#004749", light: "#ffffff" },
        },
      );
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData as Prisma.EventUpdateInput,
    });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/events");
    revalidatePath("/admin/prospects");
    revalidatePath(`/admin/events/${id}/edit`);
    revalidatePath(`/event/${event.slug}`);
    revalidatePath(`/join/${event.slug}`);

    return { success: true, data: event as EventData };
  } catch (error) {
    console.error("Failed to update event:", error);
    return {
      success: false,
      error: "Erreur lors de la mise à jour de l'événement",
    };
  }
}

export async function deleteEvent(id: string): Promise<ActionResponse<void>> {
  try {
    const adminId = await getAdminUserId();
    if (!adminId) return { success: false, error: "Non autorisé" };

    await prisma.event.delete({ where: { id } });

    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/events");
    revalidatePath("/admin/prospects");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete event:", error);
    return {
      success: false,
      error: "Erreur lors de la suppression de l'événement",
    };
  }
}

export async function incrementScanCount(
  slug: string,
): Promise<ActionResponse<void>> {
  try {
    await prisma.event.update({
      where: { slug },
      data: { scanCount: { increment: 1 } },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to increment scan count:", error);
    return { success: false, error: "Erreur lors du comptage" };
  }
}

export async function incrementDownloadCount(
  slug: string,
): Promise<ActionResponse<void>> {
  try {
    await prisma.event.update({
      where: { slug },
      data: { downloadCount: { increment: 1 } },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to increment download count:", error);
    return { success: false, error: "Erreur lors du comptage" };
  }
}
