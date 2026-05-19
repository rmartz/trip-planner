import { afterEach, describe, expect, it, type Mock, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import type { User } from "firebase/auth";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

vi.mock("firebase/auth");
vi.mock("@/lib/firebase/client", () => ({ getClientAuth: vi.fn() }));
vi.mock("@/services/user-profile", () => ({
  getOrCreateUserProfile: vi.fn().mockResolvedValue({ uid: "user-1" }),
}));
vi.mock("@sentry/nextjs", () => ({ setUser: vi.fn() }));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn().mockReturnValue({ clear: vi.fn() }),
}));

import { onAuthStateChanged } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";
import * as Sentry from "@sentry/nextjs";
import { AuthProvider } from "./AuthProvider";

function makeUser(uid: string): User {
  return { uid } as unknown as User;
}

function setupAuthCallback(): { triggerAuth: (user: User | null) => void } {
  let capturedCallback: ((user: User | null) => void) | undefined;
  (onAuthStateChanged as unknown as Mock).mockImplementation(
    (_auth: unknown, cb: (user: User | null) => void) => {
      capturedCallback = cb;
      return () => undefined;
    },
  );
  render(
    <AuthProvider>
      <span />
    </AuthProvider>,
  );
  return {
    triggerAuth: (user) => {
      if (capturedCallback !== undefined) capturedCallback(user);
    },
  };
}

describe("AuthProvider — Sentry user context: attaches uid when user signs in", () => {
  it("calls setUser with uid when a user logs in", () => {
    const { triggerAuth } = setupAuthCallback();
    triggerAuth(makeUser("uid-abc"));
    expect(vi.mocked(Sentry.setUser)).toHaveBeenCalledWith({ id: "uid-abc" });
  });
});

describe("AuthProvider — Sentry user context: clears context on logout", () => {
  it("calls setUser(null) when user signs out", () => {
    const { triggerAuth } = setupAuthCallback();
    triggerAuth(null);
    expect(vi.mocked(Sentry.setUser)).toHaveBeenCalledWith(null);
  });
});

describe("AuthProvider — query cache: clears on sign-out", () => {
  it("calls queryClient.clear() when user signs out", () => {
    const mockClear = vi.fn();
    vi.mocked(useQueryClient).mockReturnValue({
      clear: mockClear,
    } as unknown as ReturnType<typeof useQueryClient>);

    const { triggerAuth } = setupAuthCallback();
    triggerAuth(null);

    expect(mockClear).toHaveBeenCalledOnce();
  });

  it("does not call queryClient.clear() when user signs in", () => {
    const mockClear = vi.fn();
    vi.mocked(useQueryClient).mockReturnValue({
      clear: mockClear,
    } as unknown as ReturnType<typeof useQueryClient>);

    const { triggerAuth } = setupAuthCallback();
    triggerAuth(makeUser("uid-xyz"));

    expect(mockClear).not.toHaveBeenCalled();
  });
});
