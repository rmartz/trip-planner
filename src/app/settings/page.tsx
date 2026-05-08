"use client";

import { useRouter } from "next/navigation";
import { UnavailableRangeManager } from "@/components/unavailability/UnavailableRangeManager";
import { AppShell } from "@/components/nav/AppShell";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: "Settings",
        onBack: () => {
          router.back();
        },
      }}
    >
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <UnavailableRangeManager />
      </main>
    </AppShell>
  );
}
