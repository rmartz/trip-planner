import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./page";
import { HOME_PAGE_COPY } from "./copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock("next/navigation");
vi.mock("@/components/auth/AuthProvider");

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/components/auth/AuthProvider";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("Home", () => {
  it("renders the page heading", () => {
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      back: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    vi.mocked(useAuthContext).mockReturnValue({
      user: null,
      profile: undefined,
      loading: false,
    });

    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );
    renderWithProviders(<Home />);
    expect(screen.getByText(HOME_PAGE_COPY.title)).toBeDefined();
  });
});
