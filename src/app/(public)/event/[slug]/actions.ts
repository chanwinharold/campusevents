"use server";

import { prisma } from "@/lib/db";

export async function incrementScanCount(slug: string) {
  try {
    await prisma.event.update({
      where: { slug },
      data: { scanCount: { increment: 1 } },
    });
  } catch (error) {
    console.error("Failed to increment scan count:", error);
  }
}

export async function incrementDownloadCount(slug: string) {
  try {
    await prisma.event.update({
      where: { slug },
      data: { downloadCount: { increment: 1 } },
    });
  } catch (error) {
    console.error("Failed to increment download count:", error);
  }
}
