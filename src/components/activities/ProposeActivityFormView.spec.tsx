import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ProposeActivityFormView } from "./ProposeActivityFormView";
import { SCREEN_ACTIVITIES_COPY } from "./ScreenActivities.copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ProposeActivityFormView — renders form fields", () => {
  it("renders the form title", () => {
    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByText(SCREEN_ACTIVITIES_COPY.proposalFormTitle),
    ).toBeDefined();
  });

  it("renders the name field", () => {
    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.nameLabel),
    ).toBeDefined();
  });

  it("renders the description field", () => {
    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.descriptionLabel),
    ).toBeDefined();
  });

  it("renders the duration field", () => {
    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.durationLabel),
    ).toBeDefined();
  });

  it("renders the submit button", () => {
    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.submitButton }),
    ).toBeDefined();
  });

  it("renders the cancel button", () => {
    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.cancelButton }),
    ).toBeDefined();
  });
});

describe("ProposeActivityFormView — validation: name required", () => {
  it("shows the name required error when submitted without a name", () => {
    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.submitButton }),
    );

    expect(screen.getByText(SCREEN_ACTIVITIES_COPY.nameRequired)).toBeDefined();
  });

  it("does not call onSubmit when name is empty", () => {
    const onSubmit = vi.fn();

    render(<ProposeActivityFormView onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.submitButton }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ProposeActivityFormView — validation: duration required", () => {
  it("shows the duration error when duration is cleared and submitted", () => {
    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(SCREEN_ACTIVITIES_COPY.nameLabel), {
      target: { value: "Hiking" },
    });
    fireEvent.change(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.durationLabel),
      { target: { value: "" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.submitButton }),
    );

    expect(
      screen.getByText(SCREEN_ACTIVITIES_COPY.durationRequired),
    ).toBeDefined();
  });

  it("does not call onSubmit when duration is zero", () => {
    const onSubmit = vi.fn();

    render(<ProposeActivityFormView onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(SCREEN_ACTIVITIES_COPY.nameLabel), {
      target: { value: "Hiking" },
    });
    fireEvent.change(
      screen.getByLabelText(SCREEN_ACTIVITIES_COPY.durationLabel),
      { target: { value: "0" } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.submitButton }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("ProposeActivityFormView — submits activity data on valid input", () => {
  it("calls onSubmit with the name and duration when form is filled and submitted", () => {
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

  it("calls onCancel when the cancel button is clicked", () => {
    const onCancel = vi.fn();

    render(<ProposeActivityFormView onSubmit={vi.fn()} onCancel={onCancel} />);

    fireEvent.click(
      screen.getByRole("button", { name: SCREEN_ACTIVITIES_COPY.cancelButton }),
    );

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
