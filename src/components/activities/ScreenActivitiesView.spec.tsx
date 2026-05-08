import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ScreenActivitiesView } from "./ScreenActivitiesView";
import { SCREEN_ACTIVITIES_COPY } from "./ScreenActivities.copy";
import type { Activity } from "@/lib/types/activity";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function makeActivity(overrides: Partial<Activity> = {}): Activity {
  return {
    activityId: "act-1",
    stopId: "stop-1",
    tripId: "trip-1",
    name: "Hiking",
    estimatedDurationMinutes: 120,
    ...overrides,
  };
}

describe("ScreenActivitiesView — renders heading", () => {
  it("displays the Activities heading", () => {
    render(
      <ScreenActivitiesView
        activities={[]}
        canPropose={true}
        onPropose={vi.fn()}
      />,
    );

    expect(screen.getByText(SCREEN_ACTIVITIES_COPY.heading)).toBeDefined();
  });
});

describe("ScreenActivitiesView — propose button visibility", () => {
  it("shows the propose button when canPropose is true", () => {
    render(
      <ScreenActivitiesView
        activities={[]}
        canPropose={true}
        onPropose={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: SCREEN_ACTIVITIES_COPY.proposeButton,
      }),
    ).toBeDefined();
  });

  it("does not show the propose button when canPropose is false", () => {
    render(
      <ScreenActivitiesView
        activities={[]}
        canPropose={false}
        onPropose={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: SCREEN_ACTIVITIES_COPY.proposeButton,
      }),
    ).toBeNull();
  });

  it("calls onPropose when the propose button is clicked", () => {
    const onPropose = vi.fn();
    render(
      <ScreenActivitiesView
        activities={[]}
        canPropose={true}
        onPropose={onPropose}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: SCREEN_ACTIVITIES_COPY.proposeButton,
      }),
    );

    expect(onPropose).toHaveBeenCalledOnce();
  });
});

describe("ScreenActivitiesView — empty state", () => {
  it("renders the empty state text when there are no activities", () => {
    render(
      <ScreenActivitiesView
        activities={[]}
        canPropose={true}
        onPropose={vi.fn()}
      />,
    );

    expect(
      screen.getByText(SCREEN_ACTIVITIES_COPY.emptyStateText),
    ).toBeDefined();
  });

  it("does not render the empty state text when there are activities", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity()]}
        canPropose={true}
        onPropose={vi.fn()}
      />,
    );

    expect(
      screen.queryByText(SCREEN_ACTIVITIES_COPY.emptyStateText),
    ).toBeNull();
  });
});

describe("ScreenActivitiesView — activity list", () => {
  it("renders the activity name in the list", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity({ name: "Kayaking" })]}
        canPropose={true}
        onPropose={vi.fn()}
      />,
    );

    expect(screen.getByText("Kayaking")).toBeDefined();
  });

  it("renders zero vote counts for a new activity", () => {
    render(
      <ScreenActivitiesView
        activities={[makeActivity()]}
        canPropose={true}
        onPropose={vi.fn()}
      />,
    );

    expect(
      screen.getByText(SCREEN_ACTIVITIES_COPY.votesFormat(0, 0, 0)),
    ).toBeDefined();
  });

  it("renders multiple activities", () => {
    render(
      <ScreenActivitiesView
        activities={[
          makeActivity({ activityId: "act-1", name: "Hiking" }),
          makeActivity({ activityId: "act-2", name: "Swimming" }),
        ]}
        canPropose={true}
        onPropose={vi.fn()}
      />,
    );

    expect(screen.getByText("Hiking")).toBeDefined();
    expect(screen.getByText("Swimming")).toBeDefined();
  });
});

describe("ProposeActivityFormView — renders form fields", () => {
  it("renders the form title", async () => {
    const { ProposeActivityFormView } =
      await import("./ProposeActivityFormView");

    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByText(SCREEN_ACTIVITIES_COPY.proposalFormTitle),
    ).toBeDefined();
  });

  it("renders the name field", async () => {
    const { ProposeActivityFormView } =
      await import("./ProposeActivityFormView");

    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.nameLabel),
    ).toBeDefined();
  });

  it("renders the description field", async () => {
    const { ProposeActivityFormView } =
      await import("./ProposeActivityFormView");

    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.descriptionLabel),
    ).toBeDefined();
  });

  it("renders the duration field", async () => {
    const { ProposeActivityFormView } =
      await import("./ProposeActivityFormView");

    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.durationLabel),
    ).toBeDefined();
  });

  it("renders the submit button", async () => {
    const { ProposeActivityFormView } =
      await import("./ProposeActivityFormView");

    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.submitButton }),
    ).toBeDefined();
  });

  it("renders the cancel button", async () => {
    const { ProposeActivityFormView } =
      await import("./ProposeActivityFormView");

    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.cancelButton }),
    ).toBeDefined();
  });
});

describe("ProposeActivityFormView — validation: name required", () => {
  it("shows the name required error when submitted without a name", async () => {
    const { ProposeActivityFormView } =
      await import("./ProposeActivityFormView");

    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.submitButton }),
    );

    expect(screen.getByText(SCREEN_ACTIVITIES_COPY.nameRequired)).toBeDefined();
  });

  it("does not call onSubmit when name is empty", async () => {
    const { ProposeActivityFormView } =
      await import("./ProposeActivityFormView");
    const onSubmit = vi.fn();

    render(<ProposeActivityFormView onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.submitButton }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ProposeActivityFormView — submits activity data on valid input", () => {
  it("calls onSubmit with the name and duration when form is filled and submitted", async () => {
    const { ProposeActivityFormView } =
      await import("./ProposeActivityFormView");
    const onSubmit = vi.fn();

    render(<ProposeActivityFormView onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(SCREEN_ACTIVITIES_COPY.nameLabel), {
      target: { value: "Rock Climbing" },
    });
    fireEvent.change(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.durationLabel),
      { target: { value: "90" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.submitButton }),
    );

    expect(onSubmit).toHaveBeenCalledOnce();
    const firstCall = onSubmit.mock.calls[0];
    expect(firstCall).toBeDefined();
    const submitted = firstCall![0] as {
      name: string;
      estimatedDurationMinutes: number;
    };
    expect(submitted.name).toBe("Rock Climbing");
    expect(submitted.estimatedDurationMinutes).toBe(90);
  });

  it("calls onCancel when the cancel button is clicked", async () => {
    const { ProposeActivityFormView } =
      await import("./ProposeActivityFormView");
    const onCancel = vi.fn();

    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={onCancel} />);

    fireEvent.click(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.cancelButton }),
    );

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
