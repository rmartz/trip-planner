import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { VoteRow } from "./VoteRow";
import { VOTE_ROW_COPY } from "./VoteRow.copy";
import { InterestVote } from "@/lib/types/interest-vote";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Criterion 1 — renders three buttons (Yes, Maybe, No) inline", () => {
  it("renders Yes button", () => {
    render(
      <VoteRow
        value={undefined}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText(VOTE_ROW_COPY.yesLabel)).toBeDefined();
  });

  it("renders Maybe button", () => {
    render(
      <VoteRow
        value={undefined}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText(VOTE_ROW_COPY.maybeLabel)).toBeDefined();
  });

  it("renders No button", () => {
    render(
      <VoteRow
        value={undefined}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText(VOTE_ROW_COPY.noLabel)).toBeDefined();
  });
});

describe("Criterion 2 — selected button has solid variant; unselected buttons have outline variant", () => {
  it("Yes button has solid aria-pressed=true when value is yes", () => {
    render(
      <VoteRow
        value={InterestVote.Yes}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={vi.fn()}
      />,
    );

    const yesBtn = screen.getByText(VOTE_ROW_COPY.yesLabel).closest("button");
    expect(yesBtn?.getAttribute("aria-pressed")).toBe("true");
  });

  it("Maybe button has aria-pressed=false when value is yes", () => {
    render(
      <VoteRow
        value={InterestVote.Yes}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={vi.fn()}
      />,
    );

    const maybeBtn = screen
      .getByText(VOTE_ROW_COPY.maybeLabel)
      .closest("button");
    expect(maybeBtn?.getAttribute("aria-pressed")).toBe("false");
  });

  it("No button has aria-pressed=false when value is yes", () => {
    render(
      <VoteRow
        value={InterestVote.Yes}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={vi.fn()}
      />,
    );

    const noBtn = screen.getByText(VOTE_ROW_COPY.noLabel).closest("button");
    expect(noBtn?.getAttribute("aria-pressed")).toBe("false");
  });

  it("Maybe button has aria-pressed=true when value is maybe", () => {
    render(
      <VoteRow
        value={InterestVote.Maybe}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={vi.fn()}
      />,
    );

    const maybeBtn = screen
      .getByText(VOTE_ROW_COPY.maybeLabel)
      .closest("button");
    expect(maybeBtn?.getAttribute("aria-pressed")).toBe("true");
  });

  it("No button has aria-pressed=true when value is no", () => {
    render(
      <VoteRow
        value={InterestVote.No}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={vi.fn()}
      />,
    );

    const noBtn = screen.getByText(VOTE_ROW_COPY.noLabel).closest("button");
    expect(noBtn?.getAttribute("aria-pressed")).toBe("true");
  });

  it("all buttons have aria-pressed=false when value is undefined", () => {
    render(
      <VoteRow
        value={undefined}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={vi.fn()}
      />,
    );

    const yesBtn = screen.getByText(VOTE_ROW_COPY.yesLabel).closest("button");
    const maybeBtn = screen
      .getByText(VOTE_ROW_COPY.maybeLabel)
      .closest("button");
    const noBtn = screen.getByText(VOTE_ROW_COPY.noLabel).closest("button");
    expect(yesBtn?.getAttribute("aria-pressed")).toBe("false");
    expect(maybeBtn?.getAttribute("aria-pressed")).toBe("false");
    expect(noBtn?.getAttribute("aria-pressed")).toBe("false");
  });
});

describe("Criterion 3 — current user vote passed in via value prop", () => {
  it("calls onChange with yes when Yes button is clicked", () => {
    const onChange = vi.fn();
    render(
      <VoteRow
        value={undefined}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText(VOTE_ROW_COPY.yesLabel));

    expect(onChange).toHaveBeenCalledWith("yes");
  });

  it("calls onChange with maybe when Maybe button is clicked", () => {
    const onChange = vi.fn();
    render(
      <VoteRow
        value={undefined}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText(VOTE_ROW_COPY.maybeLabel));

    expect(onChange).toHaveBeenCalledWith("maybe");
  });

  it("calls onChange with no when No button is clicked", () => {
    const onChange = vi.fn();
    render(
      <VoteRow
        value={undefined}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByText(VOTE_ROW_COPY.noLabel));

    expect(onChange).toHaveBeenCalledWith("no");
  });
});

describe("Criterion 4 — aggregate vote counts display above vote row as Y N · M N · N N", () => {
  it("displays aggregate count text with correct format", () => {
    render(
      <VoteRow
        value={undefined}
        counts={{ yes: 5, maybe: 2, no: 1 }}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(VOTE_ROW_COPY.aggregateCounts(5, 2, 1)),
    ).toBeDefined();
  });

  it("displays zero counts correctly", () => {
    render(
      <VoteRow
        value={undefined}
        counts={{ yes: 0, maybe: 0, no: 0 }}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByText(VOTE_ROW_COPY.aggregateCounts(0, 0, 0)),
    ).toBeDefined();
  });
});
