"use client";

import { useState, useCallback } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import { TripRole } from "@/lib/types/trip";
import type { Stop, Leg } from "@/lib/types/trip";
import { useStops } from "@/hooks/use-stops";
import { useLegs } from "@/hooks/use-legs";
import { useCreateStop } from "@/hooks/use-create-stop";
import { useUpdateStop } from "@/hooks/use-update-stop";
import { useReorderStops } from "@/hooks/use-reorder-stops";
import { TripStructurePageView } from "./TripStructurePageView";
import { AddStopFormView } from "./AddStopFormView";
import { RemoveLegConfirmModalView } from "@/components/trips/RemoveLegConfirmModalView";
import { AppShell } from "@/components/nav/AppShell";
import { TRIP_STRUCTURE_COPY } from "./copy";

interface TripStructurePageProps {
  params: Promise<{ tripId: string }>;
}

interface RemoveLegState {
  leg: Leg;
  affectedGuestUids: string[];
  isRemoving: boolean;
}

export default function TripStructurePage({ params }: TripStructurePageProps) {
  const { tripId } = use(params);
  const router = useRouter();
  const { data: stopsData } = useStops(tripId);
  const stops = stopsData?.stops ?? [];
  const isPlanner = stopsData?.role === TripRole.Planner;

  const { data: legsData, refetch: refetchLegs } = useLegs(tripId);
  const legs = legsData?.legs ?? [];

  const createStop = useCreateStop(tripId);
  const updateStop = useUpdateStop(tripId);
  const reorderStops = useReorderStops(tripId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStop, setEditingStop] = useState<Stop | undefined>();
  const [removeLegState, setRemoveLegState] = useState<
    RemoveLegState | undefined
  >();

  const handleRemoveLegClick = useCallback(
    async (leg: Leg) => {
      const res = await fetch(
        `/api/trips/${tripId}/legs/${leg.legId}/affected-guests`,
      );
      const data = res.ok
        ? ((await res.json()) as { affectedGuestUids: string[] })
        : { affectedGuestUids: [] };
      setRemoveLegState({
        leg,
        affectedGuestUids: data.affectedGuestUids,
        isRemoving: false,
      });
    },
    [tripId],
  );

  const handleRemoveLegConfirm = useCallback(async () => {
    if (!removeLegState) return;
    setRemoveLegState({ ...removeLegState, isRemoving: true });
    await fetch(`/api/trips/${tripId}/legs/${removeLegState.leg.legId}`, {
      method: "DELETE",
    });
    setRemoveLegState(undefined);
    await refetchLegs();
  }, [removeLegState, tripId, refetchLegs]);

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

        {removeLegState && (
          <div className="p-4">
            <RemoveLegConfirmModalView
              legName={removeLegState.leg.name}
              affectedGuestUids={removeLegState.affectedGuestUids}
              isRemoving={removeLegState.isRemoving}
              onConfirm={() => {
                void handleRemoveLegConfirm();
              }}
              onCancel={() => {
                setRemoveLegState(undefined);
              }}
            />
          </div>
        )}

        <TripStructurePageView
          stops={stops}
          legs={legs}
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
          onRemoveLeg={(leg) => {
            void handleRemoveLegClick(leg);
          }}
        />
      </div>
    </AppShell>
  );
}
