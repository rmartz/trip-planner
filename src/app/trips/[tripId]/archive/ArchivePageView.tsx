"use client";

import { Button } from "@/components/ui/button";
import type { Leg } from "@/lib/types/trip";
import { ARCHIVE_PAGE_COPY } from "./ArchivePageView.copy";

export interface ArchivePageViewProps {
  archivedLegs: Leg[];
  onRestore: (legId: string) => void;
  onDeleteForever: (legId: string) => void;
}

export function ArchivePageView({
  archivedLegs,
  onRestore,
  onDeleteForever,
}: ArchivePageViewProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex flex-col gap-0.5 border-b px-4 py-3">
        <h1 className="text-lg font-semibold">{ARCHIVE_PAGE_COPY.heading}</h1>
        <p className="font-mono text-xs text-muted-foreground">
          {ARCHIVE_PAGE_COPY.subtext}
        </p>
      </header>

      <main className="flex flex-col gap-4 p-4 flex-1">
        {archivedLegs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {ARCHIVE_PAGE_COPY.emptyState}
          </p>
        ) : (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold">
              {ARCHIVE_PAGE_COPY.removedLegsHeading(archivedLegs.length)}
            </h2>
            {archivedLegs.map((leg) => (
              <div
                key={leg.legId}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3"
              >
                <span className="font-bold text-sm">{leg.name}</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onRestore(leg.legId);
                    }}
                  >
                    {ARCHIVE_PAGE_COPY.restoreButton}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      onDeleteForever(leg.legId);
                    }}
                  >
                    {ARCHIVE_PAGE_COPY.deleteForeverButton}
                  </Button>
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
