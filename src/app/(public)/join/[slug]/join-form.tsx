"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { createProspect } from "@/actions/prospects";
import { prospectSchema } from "@/lib/validations";
import type { ZodError } from "zod";

interface Props {
  eventId: string;
  slug: string;
}

export function JoinForm({ eventId, slug }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const raw = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phoneNumber: formData.get("phoneNumber") as string,
    };

    const result = prospectSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of (result as { error: ZodError }).error.issues) {
        const field = issue.path[0] as string;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    const res = await createProspect(eventId, formData);

    if (!res.success) {
      setErrors({ _form: res.error || "Une erreur est survenue" });
      setLoading(false);
      return;
    }

    setSuccess(true);

    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `event_access_${eventId}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax${secure}`;

    setTimeout(() => {
      router.push(`/event/${slug}`);
    }, 600);
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
          <Check className="h-6 w-6" />
        </div>
        <p className="mt-4 font-medium">Merci !</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Redirection vers l&apos;événement...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="firstName"
          className="block text-sm font-medium mb-1.5"
        >
          Prénom
        </label>
        <input
          id="firstName"
          name="firstName"
          type="text"
          required
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Jean"
        />
        {errors.firstName && (
          <p className="mt-1 text-xs text-destructive">{errors.firstName}</p>
        )}
      </div>

      <div>
        <label htmlFor="lastName" className="block text-sm font-medium mb-1.5">
          Nom
        </label>
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Dupont"
        />
        {errors.lastName && (
          <p className="mt-1 text-xs text-destructive">{errors.lastName}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium mb-1.5"
        >
          Téléphone
        </label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          required
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="06 12 34 56 78"
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-xs text-destructive">
            {errors.phoneNumber}
          </p>
        )}
      </div>

      {errors._form && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errors._form}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Inscription...
          </>
        ) : (
          "Accéder au flyer"
        )}
      </button>
    </form>
  );
}
