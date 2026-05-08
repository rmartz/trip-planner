"use client";

import { useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { TripRole } from "@/lib/types/trip";
import type { Stop } from "@/lib/types/trip";
import { useStops } from "@/hooks/use-stops";
import { useCreateStop } from "@/hooks/use-create-stop";
import { useUpdateStop } from "@/hooks/use-update-stop";
import { useReorderStops } from "@/hooks/use-reorder-stops";
import { TripStructurePageView } from "./TripStructurePageView";
import { AddStopFormView } from "./AddStopFormView";
import { AppShell } from "@/components/nav/AppShell";
import { TRIP_STRUCTURE_COPY } from "./copy";

interface TripStructurePageProps {
  params: Promise<{ tripId: string }>;
}

export default function TripStructurePage({ params }: TripStructurePageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const { data } = useStops(tripId);
  const stops = data?.stops ?? [];
  const isPlanner = data?.role === TripRole.Planner;

  const createStop = useCreateStop(tripId);
  const updateStop = useUpdateStop(tripId);
  const reorderStops = useReorderStops(tripId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | undefined>();

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: TRIP_STRUCTURE_COPY.pageTitle,
        onBack: () => {
          router.back();
        },
      }}
    >
      <div>
        {showAddForm && (
          <div className="p-4">
            <AddStopFormView
              onSubmit={(input) => {
                createStop.mutate(
                  { tripId, ...input },
                  {
                    onSuccess: () => {
                      setShowAddForm(false);
                    },
                  },
                );
              }}
              onCancel={() => {
                setShowAddForm(false);
              }}
              isSubmitting={createStop.isPending}
            />
          </div>
        )}

        {editingStop && (
          <div className="p-4">
            <AddStopFormView
              onSubmit={(input) => {
                updateStop.mutate(
                  { tripId, stopId: editingStop.stopId, ...input },
                  {
                    onSuccess: () => {
                      setEditingStop(undefined);
                    },
                  },
                );
              }}
              onCancel={() => {
                setEditingStop(undefined);
              }}
              isSubmitting={updateStop.isPending}
              initialName={editingStop.name}
              initialStartDate={editingStop.startDate
                .toISOString()
                .slice(0, 10)}
              initialEndDate={editingStop.endDate.toISOString().slice(0, 10)}
            />
          </div>
        )}

        <TripStructurePageView
          stops={stops}
          isPlanner={isPlanner}
          onAddStop={() => {
            setShowAddForm(true);
          }}
          onEditStop={(stop) => {
            setEditingStop(stop);
          }}
          onReorder={(stopIds) => {
            reorderStops.mutate({ tripId, stopIds });
          }}
        />
      </div>
    </AppShell>
  );
}
