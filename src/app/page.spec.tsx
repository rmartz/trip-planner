import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./page";
import { LANDING_PAGE_COPY } from "@/components/marketing/LandingPageView.copy";
import { TRIP_DASHBOARD_COPY } from "@/components/trips/TripDashboardView.copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/hooks/use-trips");

import { headers } from "next/headers";
import { useTrips } from "@/hooks/use-trips";

function mockUserHeader(uid: string | undefined) {
  vi.mocked(headers).mockResolvedValue({
    get: () => uid ?? null,
  } as unknown as Awaited<ReturnType<typeof headers>>);
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("Home", () => {
  it("renders the landing page when no user header is present", async () => {
    mockUserHeader(undefined);

    renderWithProviders(await Home());
    expect(screen.getByText(LANDING_PAGE_COPY.headline)).toBeDefined();
  });

  it("renders the trips dashboard when a user header is present", async () => {
    mockUserHeader("user-123");
    vi.mocked(useTrips).mockReturnValue({
      isLoading: false,
      isError: false,
      data: [],
    } as unknown as ReturnType<typeof useTrips>);

    renderWithProviders(await Home());
    expect(
      screen.getByText(TRIP_DASHBOARD_COPY.quickAccessHeading),
    ).toBeDefined();
  });
});
