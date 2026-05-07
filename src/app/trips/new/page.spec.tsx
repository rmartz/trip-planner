import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { CREATE_TRIP_PAGE_COPY } from "./copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock("@/hooks/use-create-trip");
vi.mock("next/navigation");

import { useCreateTrip } from "@/hooks/use-create-trip";
import { useRouter } from "next/navigation";
import { CreateTripPageView } from "./CreateTripPageView";
import CreateTripPage from "./page";

describe("CreateTripPageView — renders form fields", () => {
  it("renders the page heading", () => {
    render(<CreateTripPageView onSubmit={vi.fn()} isSubmitting={false} />);

    expect(screen.getByText(CREATE_TRIP_PAGE_COPY.heading)).toBeDefined();
  });

  it("renders name, start date, and end date fields", () => {
    render(<CreateTripPageView onSubmit={vi.fn()} isSubmitting={false} />);

    expect(
      screen.getByLabelText(CREATE_TRIP_PAGE_COPY.nameLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(CREATE_TRIP_PAGE_COPY.startDateLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(CREATE_TRIP_PAGE_COPY.endDateLabel),
    ).toBeDefined();
  });

  it("renders the submit button", () => {
    render(<CreateTripPageView onSubmit={vi.fn()} isSubmitting={false} />);

    expect(
      screen.getByRole("button", { name: CREATE_TRIP_PAGE_COPY.submitButton }),
    ).toBeDefined();
  });
});

describe("CreateTripPageView — form validation: name required", () => {
  it("shows name required error when submitted without a name", () => {
    render(<CreateTripPageView onSubmit={vi.fn()} isSubmitting={false} />);

    fireEvent.click(
      screen.getByRole("button", { name: CREATE_TRIP_PAGE_COPY.submitButton }),
    );

    expect(
      screen.getByText(CREATE_TRIP_PAGE_COPY.errorNameRequired),
    ).toBeDefined();
  });

  it("does not call onSubmit when name is empty", () => {
    const onSubmit = vi.fn();
    render(<CreateTripPageView onSubmit={onSubmit} isSubmitting={false} />);

    fireEvent.click(
      screen.getByRole("button", { name: CREATE_TRIP_PAGE_COPY.submitButton }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("CreateTripPageView — form validation: end date before start date", () => {
  it("shows date order error when end date is before start date", () => {
    render(<CreateTripPageView onSubmit={vi.fn()} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText(CREATE_TRIP_PAGE_COPY.nameLabel), {
      target: { value: "My Trip" },
    });
    fireEvent.change(
      screen.getByLabelText(CREATE_TRIP_PAGE_COPY.startDateLabel),
      {
        target: { value: "2025-06-10" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(CREATE_TRIP_PAGE_COPY.endDateLabel),
      {
        target: { value: "2025-06-01" },
      },
    );
    fireEvent.click(
      screen.getByRole("button", { name: CREATE_TRIP_PAGE_COPY.submitButton }),
    );

    expect(
      screen.getByText(CREATE_TRIP_PAGE_COPY.errorEndBeforeStart),
    ).toBeDefined();
  });

  it("does not call onSubmit when end date is before start date", () => {
    const onSubmit = vi.fn();
    render(<CreateTripPageView onSubmit={onSubmit} isSubmitting={false} />);

    fireEvent.change(screen.getByLabelText(CREATE_TRIP_PAGE_COPY.nameLabel), {
      target: { value: "My Trip" },
    });
    fireEvent.change(
      screen.getByLabelText(CREATE_TRIP_PAGE_COPY.startDateLabel),
      {
        target: { value: "2025-06-10" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(CREATE_TRIP_PAGE_COPY.endDateLabel),
      {
        target: { value: "2025-06-01" },
      },
    );
    fireEvent.click(
      screen.getByRole("button", { name: CREATE_TRIP_PAGE_COPY.submitButton }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("CreateTripPage — redirects to /trips/<id> on success", () => {
  it("redirects after successful trip creation", () => {
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
    } as unknown as ReturnType<typeof useRouter>);

    const mockMutate = vi.fn();
    vi.mocked(useCreateTrip).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as unknown as ReturnType<typeof useCreateTrip>);

    render(<CreateTripPage />);

    fireEvent.change(screen.getByLabelText(CREATE_TRIP_PAGE_COPY.nameLabel), {
      target: { value: "Road Trip" },
    });
    fireEvent.change(
      screen.getByLabelText(CREATE_TRIP_PAGE_COPY.startDateLabel),
      {
        target: { value: "2025-06-01" },
      },
    );
    fireEvent.change(
      screen.getByLabelText(CREATE_TRIP_PAGE_COPY.endDateLabel),
      {
        target: { value: "2025-06-08" },
      },
    );
    fireEvent.click(
      screen.getByRole("button", { name: CREATE_TRIP_PAGE_COPY.submitButton }),
    );

    expect(mockMutate).toHaveBeenCalled();

    const [, options] = mockMutate.mock.calls[0] as [
      unknown,
      { onSuccess: (tripId: string) => void },
    ];
    options.onSuccess("new-trip-id");

    expect(mockPush).toHaveBeenCalledWith("/trips/new-trip-id");
  });
});
