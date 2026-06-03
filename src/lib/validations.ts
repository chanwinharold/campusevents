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

export const prospectSchema = z.object({
  firstName: z
    .string()
    .min(2, "Veuillez renseigner votre prénom")
    .max(100, "Le prénom est trop long"),
  lastName: z
    .string()
    .min(2, "Veuillez renseigner votre nom")
    .max(100, "Le nom est trop long"),
  phoneNumber: z
    .string()
    .transform((val) => val.replace(/[\s\-.]/g, ""))
    .refine(
      (val) => /^(?:(?:\+|00)33|0)[1-9]\d{8}$/.test(val),
      "Veuillez saisir un numéro valide",
    ),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
export type ProspectFormData = z.infer<typeof prospectSchema>;
