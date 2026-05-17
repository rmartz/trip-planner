import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { TripMember } from "@/lib/types/trip";
import type { NonAccountMember } from "@/lib/types/non-account-member";
import { MembersPageView } from "../MembersPageView";
import { MEMBERS_PAGE_COPY } from "../MembersPageView.copy";
import { TripRole } from "@/lib/types/trip";

afterEach(cleanup);

function makeTripMember(overrides: Partial<TripMember> = {}): TripMember {
  return {
    uid: "uid-1",
    tripId: "trip-1",
    role: TripRole.Guest,
    joinedAt: new Date("2025-01-01"),
    memberUids: [],
    displayName: "Test User",
    ...overrides,
  };
}

function makeNonAccountMember(
  overrides: Partial<NonAccountMember> = {},
): NonAccountMember {
  return {
    nonAccountMemberId: "na-1",
    tripId: "trip-1",
    name: "Ben",
    proxiedBy: "uid-1",
    proxiedByName: "Test Planner",
    claimToken: "token-abc",
    claimedBy: undefined,
    ...overrides,
  };
}

describe("MembersPageView — member action buttons use ShadCN Button", () => {
  it("promote and remove buttons render with data-slot='button'", () => {
    render(
      <MembersPageView
        currentUserRole={TripRole.Planner}
        accountMembers={[
          makeTripMember({ uid: "uid-1", role: TripRole.Guest }),
        ]}
        nonAccountMembers={[]}
        isLoading={false}
        isError={false}
        isRegeneratingInvite={false}
        inviteToken="token-1"
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
        onRegenInvite={vi.fn()}
      />,
    );
    const promoteButton = screen.getByRole("button", {
      name: MEMBERS_PAGE_COPY.promoteTo,
    });
    expect(promoteButton.getAttribute("data-slot")).toBe("button");
  });

  it("add non-account member button renders with data-slot='button'", () => {
    render(
      <MembersPageView
        currentUserRole={TripRole.Planner}
        accountMembers={[]}
        nonAccountMembers={[makeNonAccountMember()]}
        isLoading={false}
        isError={false}
        isRegeneratingInvite={false}
        inviteToken="token-1"
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
        onRegenInvite={vi.fn()}
      />,
    );
    const addMemberButton = screen.getByRole("button", {
      name: MEMBERS_PAGE_COPY.addMemberButton,
    });
    expect(addMemberButton.getAttribute("data-slot")).toBe("button");
  });
});
