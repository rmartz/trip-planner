import { TripList } from "@/components/trips/TripList";
import { HOME_PAGE_COPY } from "./copy";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">
        {HOME_PAGE_COPY.title}
      </h1>
      <TripList />
    </main>
  );
}
