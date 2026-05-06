import { UnavailableRangeManager } from "@/components/unavailability/UnavailableRangeManager";

export default function SettingsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Settings</h1>
      <UnavailableRangeManager />
    </main>
  );
}
