"use client";

import { useState } from "react";
import { use } from "react";
import { TripRole } from "@/lib/types/trip";
import type { Stop } from "@/lib/types/trip";
import { useStops } from "@/hooks/use-stops";
import { useCreateStop } from "@/hooks/use-create-stop";
import { useUpdateStop } from "@/hooks/use-update-stop";
import { useReorderStops } from "@/hooks/use-reorder-stops";
import { TripStructurePageView } from "./TripStructurePageView";
import { AddStopFormView } from "./AddStopFormView";

interface TripStructurePageProps {
  params: Promise<{ tripId: string }>;
}

export default function TripStructurePage({ params }: TripStructurePageProps) {
  const { tripId } = use(params);
  const { data } = useStops(tripId);
  const stops = data?.stops ?? [];
  const isPlanner = data?.role === TripRole.Planner;

  const createStop = useCreateStop(tripId);
  const updateStop = useUpdateStop(tripId);
  const reorderStops = useReorderStops(tripId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | undefined>();

  return (
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
  );
}
