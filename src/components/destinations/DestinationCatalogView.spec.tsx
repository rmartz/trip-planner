import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DESTINATION_CATALOG_COPY } from "./DestinationCatalog.copy";
import type { Destination } from "@/lib/types/destination";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

import { DestinationCatalogView } from "./DestinationCatalogView";

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

describe("Criterion 1 — page shows list of user's saved destinations with name", () => {
  it("renders destination name in populated state", () => {
    render(
      <DestinationCatalogView
        destinations={[makeDestination({ name: "Tokyo" })]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(screen.getByText("Tokyo")).toBeDefined();
  });

  it("renders saved count", () => {
    render(
      <DestinationCatalogView
        destinations={[
          makeDestination(),
          makeDestination({ destinationId: "dest-2", name: "Rome" }),
        ]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(
      screen.getByText(DESTINATION_CATALOG_COPY.savedCount(2)),
    ).toBeDefined();
  });

  it("renders loading state", () => {
    render(
      <DestinationCatalogView
        destinations={[]}
        isLoading={true}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(
      screen.getByText(DESTINATION_CATALOG_COPY.loadingText),
    ).toBeDefined();
  });

  it("renders error state", () => {
    render(
      <DestinationCatalogView
        destinations={[]}
        isLoading={false}
        isError={true}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(screen.getByText(DESTINATION_CATALOG_COPY.errorText)).toBeDefined();
  });

  it("renders empty state heading when no destinations", () => {
    render(
      <DestinationCatalogView
        destinations={[]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(
      screen.getByText(DESTINATION_CATALOG_COPY.emptyStateHeading),
    ).toBeDefined();
  });
});

describe("Criterion 2 — each destination card shows name, location/activity sub-line, and image placeholder", () => {
  it("renders the image placeholder label", () => {
    render(
      <DestinationCatalogView
        destinations={[
          makeDestination({ name: "Paris", seasonality: "spring" }),
        ]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(
      screen.getByText(DESTINATION_CATALOG_COPY.imagePlaceholderLabel),
    ).toBeDefined();
  });

  it("renders seasonality tag when present", () => {
    render(
      <DestinationCatalogView
        destinations={[
          makeDestination({ name: "Paris", seasonality: "best in spring" }),
        ]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(screen.getByText("best in spring")).toBeDefined();
  });
});

describe("Criterion 3 — search input filters the destination list by name", () => {
  it("renders the search input", () => {
    render(
      <DestinationCatalogView
        destinations={[]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(
      screen.getByPlaceholderText(DESTINATION_CATALOG_COPY.searchPlaceholder),
    ).toBeDefined();
  });

  it("calls onSearchChange when user types in search input", () => {
    const onSearchChange = vi.fn();
    render(
      <DestinationCatalogView
        destinations={[]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={onSearchChange}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText(DESTINATION_CATALOG_COPY.searchPlaceholder),
      { target: { value: "Paris" } },
    );

    expect(onSearchChange).toHaveBeenCalledWith("Paris");
  });
});

describe("Criterion 4 — '+ Add' button triggers create destination flow", () => {
  it("renders the add button", () => {
    render(
      <DestinationCatalogView
        destinations={[]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(screen.getByText(DESTINATION_CATALOG_COPY.addButton)).toBeDefined();
  });

  it("calls onAdd when add button is clicked", () => {
    const onAdd = vi.fn();
    render(
      <DestinationCatalogView
        destinations={[]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={onAdd}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(DESTINATION_CATALOG_COPY.addButton));

    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});

describe("Criterion 5 — each card has an edit action", () => {
  it("renders an edit button for each destination card", () => {
    render(
      <DestinationCatalogView
        destinations={[
          makeDestination({ destinationId: "dest-x", name: "Berlin" }),
        ]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(screen.getByText(DESTINATION_CATALOG_COPY.editButton)).toBeDefined();
  });

  it("calls onEdit with the destination when edit is clicked", () => {
    const onEdit = vi.fn();
    const dest = makeDestination({ destinationId: "dest-x", name: "Berlin" });
    render(
      <DestinationCatalogView
        destinations={[dest]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={onEdit}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(DESTINATION_CATALOG_COPY.editButton));

    expect(onEdit).toHaveBeenCalledWith(dest);
  });
});

describe("Criterion 6 — each card has Share and Attach… action pills", () => {
  it("renders Share pill on each destination card", () => {
    render(
      <DestinationCatalogView
        destinations={[makeDestination({ name: "Lisbon" })]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(
      screen.getByText(DESTINATION_CATALOG_COPY.shareButton),
    ).toBeDefined();
  });

  it("renders Attach… pill on each destination card", () => {
    render(
      <DestinationCatalogView
        destinations={[makeDestination({ name: "Lisbon" })]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={vi.fn()}
      />,
    );

    expect(
      screen.getByText(DESTINATION_CATALOG_COPY.attachButton),
    ).toBeDefined();
  });

  it("calls onShare with destination when Share is clicked", () => {
    const onShare = vi.fn();
    const dest = makeDestination({ name: "Lisbon" });
    render(
      <DestinationCatalogView
        destinations={[dest]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={onShare}
        onAttach={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText(DESTINATION_CATALOG_COPY.shareButton));

    expect(onShare).toHaveBeenCalledWith(dest);
  });

  it("calls onAttach with destination when Attach… is clicked", () => {
    const onAttach = vi.fn();
    const dest = makeDestination({ name: "Lisbon" });
    render(
      <DestinationCatalogView
        destinations={[dest]}
        isLoading={false}
        isError={false}
        searchQuery=""
        onSearchChange={vi.fn()}
        onAdd={vi.fn()}
        onEdit={vi.fn()}
        onShare={vi.fn()}
        onAttach={onAttach}
      />,
    );

    fireEvent.click(screen.getByText(DESTINATION_CATALOG_COPY.attachButton));

    expect(onAttach).toHaveBeenCalledWith(dest);
  });
});
