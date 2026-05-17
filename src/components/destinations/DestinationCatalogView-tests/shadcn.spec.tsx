import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { Destination } from "@/lib/types/destination";
import { DESTINATION_CATALOG_COPY } from "../DestinationCatalog.copy";
import { DestinationCatalogView } from "../DestinationCatalogView";

afterEach(cleanup);

function makeDestination(overrides: Partial<Destination> = {}): Destination {
  return {
    destinationId: "dest-1",
    uid: "user-1",
    name: "Paris",
    seasonality: "spring",
    tripIds: [],
    ...overrides,
  };
}

describe("DestinationCatalogView — interactive buttons use ShadCN Button", () => {
  it("destination action buttons render with data-slot='button'", () => {
    render(
      <DestinationCatalogView
        destinations={[makeDestination()]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onAttach={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onView={vi.fn()}
      />,
    );
    const shareButton = screen.getByRole("button", {
      name: DESTINATION_CATALOG_COPY.shareButton,
    });
    expect(shareButton.getAttribute("data-slot")).toBe("button");
  });

  it("add destination button renders with data-slot='button'", () => {
    const { container } = render(
      <DestinationCatalogView
        destinations={[]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onAttach={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onView={vi.fn()}
      />,
    );
    expect(container.querySelector('[data-slot="button"]')).not.toBeNull();
  });
});
