import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { InviteLinkCard } from "./InviteLinkCard";
import { INVITE_LINK_CARD_COPY } from "./InviteLinkCard.copy";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const TOKEN = "x4kPq2abc";

describe("InviteLinkCard — renders invite link", () => {
  it("displays the invite URL containing the token", () => {
    render(
      <InviteLinkCard
        inviteToken={TOKEN}
        onRegen={vi.fn()}
        isRegenerating={false}
      />,
    );
    const link = screen.getByText((content) => content.includes(TOKEN));
    expect(link).toBeDefined();
  });

  it("renders the Copy button", () => {
    render(
      <InviteLinkCard
        inviteToken={TOKEN}
        onRegen={vi.fn()}
        isRegenerating={false}
      />,
    );
    expect(screen.getByText(INVITE_LINK_CARD_COPY.copyButton)).toBeDefined();
  });

  it("renders the Regen button", () => {
    render(
      <InviteLinkCard
        inviteToken={TOKEN}
        onRegen={vi.fn()}
        isRegenerating={false}
      />,
    );
    expect(screen.getByText(INVITE_LINK_CARD_COPY.regenButton)).toBeDefined();
  });
});

describe("InviteLinkCard — regen action", () => {
  it("calls onRegen when Regen button is clicked", () => {
    const onRegen = vi.fn();
    render(
      <InviteLinkCard
        inviteToken={TOKEN}
        onRegen={onRegen}
        isRegenerating={false}
      />,
    );
    fireEvent.click(screen.getByText(INVITE_LINK_CARD_COPY.regenButton));
    expect(onRegen).toHaveBeenCalledTimes(1);
  });

  it("disables the Regen button while regenerating", () => {
    render(
      <InviteLinkCard
        inviteToken={TOKEN}
        onRegen={vi.fn()}
        isRegenerating={true}
      />,
    );
    const regenBtn = screen
      .getByText(INVITE_LINK_CARD_COPY.regenButton)
      .closest("button");
    expect(regenBtn?.disabled).toBe(true);
  });
});
