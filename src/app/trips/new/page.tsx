"use client";

import { useRouter } from "next/navigation";
import { useCreateTrip } from "@/hooks/use-create-trip";
import { AppShell } from "@/components/nav/AppShell";
import { CreateTripPageView } from "./CreateTripPageView";

export default function CreateTripPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateTrip();

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: "New trip",
        onBack: () => {
          router.back();
        },
      }}
    >
      <CreateTripPageView
        onSubmit={(input) => {
          mutate(input, {
            onSuccess: (tripId) => {
              router.push(`/trips/${tripId}`);
            },
          });
        }}
        isSubmitting={isPending}
      />
    </AppShell>
  );
}
