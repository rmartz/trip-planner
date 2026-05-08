import { TripList } from "@/components/trips/TripList";
import { AppShell } from "@/components/nav/AppShell";
import { HOME_PAGE_COPY } from "./copy";

export default function Home() {
  return (
    <AppShell header={{ variant: "home", title: HOME_PAGE_COPY.title }}>
      <main className="mx-auto w-full max-w-2xl px-4 py-8">
        <TripList />
      </main>
    </AppShell>
  );
}
