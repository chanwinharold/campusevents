"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Download, Phone, Calendar, User } from "lucide-react";
import type { ProspectData } from "@/types";
import { exportProspectsCSV } from "@/actions/prospects";
import { formatDateShort } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  prospects: ProspectData[];
  events: { id: string; title: string }[];
}

export function ProspectsList({ prospects, events }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [eventFilter, setEventFilter] = useState(
    searchParams.get("event") || "",
  );
  const [exporting, setExporting] = useState(false);

  function applyFilters() {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (eventFilter) params.set("event", eventFilter);
    router.push(`/admin/prospects?${params.toString()}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") applyFilters();
  }

  async function handleExport() {
    setExporting(true);
    try {
      const result = await exportProspectsCSV();
      if (result.success && result.data) {
        const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `prospects-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Export CSV téléchargé");
      } else {
        toast.error(result.error || "Erreur lors de l'export");
      }
    } catch {
      toast.error("Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher par nom ou téléphone..."
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={eventFilter}
          onChange={(e) => {
            setEventFilter(e.target.value);
            const params = new URLSearchParams();
            if (search) params.set("search", search);
            if (e.target.value) params.set("event", e.target.value);
            router.push(`/admin/prospects?${params.toString()}`);
          }}
          className="rounded-lg border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Tous les événements</option>
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.title}
            </option>
          ))}
        </select>
        <button
          onClick={applyFilters}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-all"
        >
          Filtrer
        </button>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-5 py-2.5 text-sm font-medium hover:bg-muted transition-all disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? "Export..." : "CSV"}
        </button>
      </div>

      {prospects.length === 0 ? (
        <div className="rounded-xl border border-border/40 bg-card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-semibold">Aucun prospect</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Les visiteurs qui remplissent le formulaire apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 bg-muted/30">
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                    Prénom
                  </th>
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                    Nom
                  </th>
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                    Téléphone
                  </th>
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                    Événement
                  </th>
                  <th className="px-6 py-3.5 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {prospects.map((prospect) => (
                  <tr
                    key={prospect.id}
                    className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{prospect.firstName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {prospect.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{prospect.phoneNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-muted-foreground">
                      {prospect.event?.title || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {formatDateShort(prospect.createdAt)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
