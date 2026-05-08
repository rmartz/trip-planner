import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./page";
import { TRIP_DASHBOARD_COPY } from "@/components/trips/TripDashboardView.copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock("@/hooks/use-trips");

import { useTrips } from "@/hooks/use-trips";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("Home", () => {
  it("renders the Quick Access section", () => {
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    } as unknown as ReturnType<typeof useTrips>);

    renderWithProviders(<Home />);
    expect(
      screen.getByText(TRIP_DASHBOARD_COPY.quickAccessHeading),
    ).toBeDefined();
  });

  it("renders the app title in the header", () => {
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    } as unknown as ReturnType<typeof useTrips>);

    renderWithProviders(<Home />);
    expect(screen.getByText(TRIP_DASHBOARD_COPY.appTitle)).toBeDefined();
  });
});
