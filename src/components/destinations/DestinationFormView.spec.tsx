import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { DESTINATION_FORM_COPY } from "./DestinationFormView.copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

import { DestinationFormView } from "./DestinationFormView";

describe("DestinationFormView — create mode: renders form fields", () => {
  it("renders the create heading", () => {
    render(
      <DestinationFormView
        mode="create"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: DESTINATION_FORM_COPY.createHeading,
      }),
    ).toBeDefined();
  });

  it("renders name and seasonality fields", () => {
    render(
      <DestinationFormView
        mode="create"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    expect(
      screen.getByLabelText(DESTINATION_FORM_COPY.nameLabel),
    ).toBeDefined();
    expect(
      screen.getByLabelText(DESTINATION_FORM_COPY.seasonalityLabel),
    ).toBeDefined();
  });

  it("renders the submit button with create label", () => {
    render(
      <DestinationFormView
        mode="create"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: DESTINATION_FORM_COPY.submitCreateButton,
      }),
    ).toBeDefined();
  });

  it("renders the cancel button", () => {
    render(
      <DestinationFormView
        mode="create"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: DESTINATION_FORM_COPY.cancelButton }),
    ).toBeDefined();
  });
});

describe("DestinationFormView — create mode: form validation", () => {
  it("shows name required error when submitted without a name", () => {
    render(
      <DestinationFormView
        mode="create"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: DESTINATION_FORM_COPY.submitCreateButton,
      }),
    );

    expect(
      screen.getByText(DESTINATION_FORM_COPY.errorNameRequired),
    ).toBeDefined();
  });

  it("does not call onSubmit when name is empty", () => {
    const onSubmit = vi.fn();
    render(
      <DestinationFormView
        mode="create"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: DESTINATION_FORM_COPY.submitCreateButton,
      }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("calls onSubmit with name and undefined seasonality when form is valid and seasonality is blank", () => {
    const onSubmit = vi.fn();
    render(
      <DestinationFormView
        mode="create"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(DESTINATION_FORM_COPY.nameLabel), {
      target: { value: "Kyoto" },
    });
    fireEvent.click(
      screen.getByRole("button", {
        name: DESTINATION_FORM_COPY.submitCreateButton,
      }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Kyoto",
      seasonality: undefined,
    });
  });

  it("calls onSubmit with seasonality when provided", () => {
    const onSubmit = vi.fn();
    render(
      <DestinationFormView
        mode="create"
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(DESTINATION_FORM_COPY.nameLabel), {
      target: { value: "Kyoto" },
    });
    fireEvent.change(
      screen.getByLabelText(DESTINATION_FORM_COPY.seasonalityLabel),
      { target: { value: "year-round" } },
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: DESTINATION_FORM_COPY.submitCreateButton,
      }),
    );

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Kyoto",
      seasonality: "year-round",
    });
  });

  it("calls onCancel when cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <DestinationFormView
        mode="create"
        onSubmit={vi.fn()}
        onCancel={onCancel}
        isSubmitting={false}
        isError={false}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: DESTINATION_FORM_COPY.cancelButton }),
    );

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("DestinationFormView — submit error state", () => {
  it("shows the submit error message when isError is true", () => {
    render(
      <DestinationFormView
        mode="create"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={true}
      />,
    );

    expect(
      screen.getByText(DESTINATION_FORM_COPY.errorSubmitFailed),
    ).toBeDefined();
  });

  it("does not show the submit error message when isError is false", () => {
    render(
      <DestinationFormView
        mode="create"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    expect(
      screen.queryByText(DESTINATION_FORM_COPY.errorSubmitFailed),
    ).toBeNull();
  });
});

describe("DestinationFormView — edit mode: pre-fills form with existing values", () => {
  it("renders the edit heading", () => {
    render(
      <DestinationFormView
        mode="edit"
        initialName="Paris"
        initialSeasonality="spring"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    expect(screen.getByText(DESTINATION_FORM_COPY.editHeading)).toBeDefined();
  });

  it("pre-fills the name field", () => {
    render(
      <DestinationFormView
        mode="edit"
        initialName="Paris"
        initialSeasonality={undefined}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    expect(
      screen
        .getByLabelText(DESTINATION_FORM_COPY.nameLabel)
        .getAttribute("value"),
    ).toBe("Paris");
  });

  it("pre-fills the seasonality field", () => {
    render(
      <DestinationFormView
        mode="edit"
        initialName="Paris"
        initialSeasonality="best in spring"
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    expect(
      screen
        .getByLabelText(DESTINATION_FORM_COPY.seasonalityLabel)
        .getAttribute("value"),
    ).toBe("best in spring");
  });

  it("renders the submit button with edit label", () => {
    render(
      <DestinationFormView
        mode="edit"
        initialName="Paris"
        initialSeasonality={undefined}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting={false}
        isError={false}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: DESTINATION_FORM_COPY.submitEditButton,
      }),
    ).toBeDefined();
  });
});
