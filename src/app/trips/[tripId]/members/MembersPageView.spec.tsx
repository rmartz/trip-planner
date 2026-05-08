import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { TripRole } from "@/lib/types/trip";
import { MEMBERS_PAGE_COPY } from "./MembersPageView.copy";
import { MembersPageView } from "./MembersPageView";
import type { TripMember } from "@/lib/types/trip";
import type { NonAccountMember } from "@/lib/types/non-account-member";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

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

describe("MembersPageView — loading state", () => {
  it("renders loading text when isLoading is true", () => {
    render(
      <MembersPageView
        currentUserRole={TripRole.Guest}
        accountMembers={[]}
        nonAccountMembers={[]}
        isLoading={true}
        isError={false}
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    expect(screen.getByText(MEMBERS_PAGE_COPY.loadingText)).toBeDefined();
  });
});

describe("MembersPageView — error state", () => {
  it("renders error text when isError is true", () => {
    render(
      <MembersPageView
        currentUserRole={TripRole.Guest}
        accountMembers={[]}
        nonAccountMembers={[]}
        isLoading={false}
        isError={true}
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    expect(screen.getByText(MEMBERS_PAGE_COPY.errorText)).toBeDefined();
  });
});

describe("MembersPageView — account member display", () => {
  it("renders an account member's role label", () => {
    const member = makeTripMember({ uid: "uid-1", role: TripRole.Planner });
    render(
      <MembersPageView
        currentUserRole={TripRole.Planner}
        accountMembers={[member]}
        nonAccountMembers={[]}
        isLoading={false}
        isError={false}
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    expect(screen.getByText(MEMBERS_PAGE_COPY.rolePlanner)).toBeDefined();
  });

  it("renders promote and remove actions for a Guest row when current user is Planner", () => {
    const planner = makeTripMember({
      uid: "planner-uid",
      role: TripRole.Planner,
    });
    const guest = makeTripMember({ uid: "guest-uid", role: TripRole.Guest });
    render(
      <MembersPageView
        currentUserRole={TripRole.Planner}
        accountMembers={[planner, guest]}
        nonAccountMembers={[]}
        isLoading={false}
        isError={false}
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    expect(screen.getByText(MEMBERS_PAGE_COPY.promoteTo)).toBeDefined();
    expect(screen.getByText(MEMBERS_PAGE_COPY.removeGuest)).toBeDefined();
  });

  it("does not render promote/remove actions when current user is Guest", () => {
    const member = makeTripMember({ uid: "uid-1", role: TripRole.Guest });
    render(
      <MembersPageView
        currentUserRole={TripRole.Guest}
        accountMembers={[member]}
        nonAccountMembers={[]}
        isLoading={false}
        isError={false}
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    expect(screen.queryByText(MEMBERS_PAGE_COPY.promoteTo)).toBeNull();
    expect(screen.queryByText(MEMBERS_PAGE_COPY.removeGuest)).toBeNull();
  });

  it("calls onPromote with the member uid when promote is clicked", () => {
    const onPromote = vi.fn();
    const planner = makeTripMember({
      uid: "planner-uid",
      role: TripRole.Planner,
    });
    const guest = makeTripMember({ uid: "guest-uid", role: TripRole.Guest });
    render(
      <MembersPageView
        currentUserRole={TripRole.Planner}
        accountMembers={[planner, guest]}
        nonAccountMembers={[]}
        isLoading={false}
        isError={false}
        onPromote={onPromote}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText(MEMBERS_PAGE_COPY.promoteTo));
    expect(onPromote).toHaveBeenCalledWith("guest-uid");
  });

  it("calls onRemove with the member uid when remove is clicked", () => {
    const onRemove = vi.fn();
    const planner = makeTripMember({
      uid: "planner-uid",
      role: TripRole.Planner,
    });
    const guest = makeTripMember({ uid: "guest-uid", role: TripRole.Guest });
    render(
      <MembersPageView
        currentUserRole={TripRole.Planner}
        accountMembers={[planner, guest]}
        nonAccountMembers={[]}
        isLoading={false}
        isError={false}
        onPromote={vi.fn()}
        onRemove={onRemove}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText(MEMBERS_PAGE_COPY.removeGuest));
    expect(onRemove).toHaveBeenCalledWith("guest-uid");
  });
});

describe("MembersPageView — non-account member display", () => {
  it("renders a non-account member's name", () => {
    const nonAccount = makeNonAccountMember({ name: "Alex" });
    render(
      <MembersPageView
        currentUserRole={TripRole.Guest}
        accountMembers={[]}
        nonAccountMembers={[nonAccount]}
        isLoading={false}
        isError={false}
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    expect(screen.getByText("Alex")).toBeDefined();
  });

  it("renders claim pending status for an unclaimed non-account member", () => {
    const nonAccount = makeNonAccountMember({ claimedBy: undefined });
    render(
      <MembersPageView
        currentUserRole={TripRole.Guest}
        accountMembers={[]}
        nonAccountMembers={[nonAccount]}
        isLoading={false}
        isError={false}
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    expect(screen.getByText(MEMBERS_PAGE_COPY.claimPending)).toBeDefined();
  });

  it("renders claim link button for Planner on a non-account member row", () => {
    const nonAccount = makeNonAccountMember();
    render(
      <MembersPageView
        currentUserRole={TripRole.Planner}
        accountMembers={[]}
        nonAccountMembers={[nonAccount]}
        isLoading={false}
        isError={false}
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    expect(screen.getByText(MEMBERS_PAGE_COPY.claimLinkLabel)).toBeDefined();
  });
});

describe("MembersPageView — add non-account member form", () => {
  it("renders add member button for Planner", () => {
    render(
      <MembersPageView
        currentUserRole={TripRole.Planner}
        accountMembers={[]}
        nonAccountMembers={[]}
        isLoading={false}
        isError={false}
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    expect(screen.getByText(MEMBERS_PAGE_COPY.addMemberButton)).toBeDefined();
  });

  it("does not render add member button for Guest", () => {
    render(
      <MembersPageView
        currentUserRole={TripRole.Guest}
        accountMembers={[]}
        nonAccountMembers={[]}
        isLoading={false}
        isError={false}
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={vi.fn()}
      />,
    );
    expect(screen.queryByText(MEMBERS_PAGE_COPY.addMemberButton)).toBeNull();
  });

  it("calls onAddNonAccountMember with the entered name when form is submitted", () => {
    const onAdd = vi.fn();
    render(
      <MembersPageView
        currentUserRole={TripRole.Planner}
        accountMembers={[]}
        nonAccountMembers={[]}
        isLoading={false}
        isError={false}
        onPromote={vi.fn()}
        onRemove={vi.fn()}
        onAddNonAccountMember={onAdd}
      />,
    );

    const input = screen.getByPlaceholderText(
      MEMBERS_PAGE_COPY.addMemberPlaceholder,
    );
    fireEvent.change(input, { target: { value: "Charlie" } });
    fireEvent.click(screen.getByText(MEMBERS_PAGE_COPY.addMemberSubmit));

    expect(onAdd).toHaveBeenCalledWith("Charlie");
  });
});
