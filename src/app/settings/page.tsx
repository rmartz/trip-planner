"use client";

import { useRouter } from "next/navigation";
import { UnavailableRangeManager } from "@/components/unavailability/UnavailableRangeManager";
import { AppShell } from "@/components/nav/AppShell";
import { SETTINGS_PAGE_COPY } from "./settings.copy";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <AppShell
      header={{
        variant: "drilled",
        title: SETTINGS_PAGE_COPY.title,
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
