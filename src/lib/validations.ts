import { z } from "zod";

export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(200),
  shortDescription: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(500),
  fullDescription: z.string().max(5000).optional(),
  flyerImageUrl: z.string().url("L'URL de l'image est invalide"),
  eventDate: z.string().min(1, "La date est requise"),
  location: z
    .string()
    .min(3, "Le lieu doit contenir au moins 3 caractères")
    .max(300),
});

export const updateEventSchema = createEventSchema.partial().extend({
  isPublished: z.boolean().optional(),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
