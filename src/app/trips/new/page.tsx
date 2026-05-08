"use client";

import { useRouter } from "next/navigation";
import { useCreateTrip } from "@/hooks/use-create-trip";
import { AppShell } from "@/components/nav/AppShell";
import { CreateTripPageView } from "./CreateTripPageView";
import { CREATE_TRIP_PAGE_COPY } from "./copy";

export default function CreateTripPage() {
  const router = useRouter();
  const { mutate, isPending } = useCreateTrip();

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: CREATE_TRIP_PAGE_COPY.pageTitle,
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
