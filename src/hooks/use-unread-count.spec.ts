import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";

type SnapshotListener = (snapshot: { val: () => unknown }) => void;

const mockRef = vi.fn<(db: unknown, path: string) => { __ref: true }>(() => ({
  __ref: true,
}));
const mockUnsubscribe = vi.fn();
const mockOnValue = vi.fn<(ref: unknown, cb: SnapshotListener) => () => void>(
  () => mockUnsubscribe,
);

vi.mock("firebase/database", () => ({
  onValue: (ref: unknown, cb: SnapshotListener) => mockOnValue(ref, cb),
  ref: (db: unknown, path: string) => mockRef(db, path),
}));

vi.mock("@/lib/firebase/client", () => ({
  getClientDatabase: vi.fn(() => ({ __db: true })),
}));

import { useUnreadCount } from "./use-unread-count";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function captureListener() {
  let listener: SnapshotListener | undefined;
  mockOnValue.mockImplementation((_ref, cb) => {
    listener = cb;
    return mockUnsubscribe;
  });
  return () => listener;
}

describe("useUnreadCount — subscribes to the RTDB unreadCount path", () => {
  it("returns 0 before any snapshot arrives", () => {
    captureListener();
    const { result } = renderHook(() => useUnreadCount("uid-1"));
    expect(result.current).toBe(0);
  });

  it("builds the ref from the uid's unreadCount path", () => {
    captureListener();
    renderHook(() => useUnreadCount("uid-7"));
    expect(mockRef).toHaveBeenCalledWith(
      expect.anything(),
      "users/uid-7/unreadCount",
    );
  });

  it("reflects the live value pushed through the snapshot listener", () => {
    const getListener = captureListener();
    const { result } = renderHook(() => useUnreadCount("uid-1"));
    act(() => {
      getListener()?.({ val: () => 5 });
    });
    expect(result.current).toBe(5);
  });

  it("clamps a negative snapshot value to 0", () => {
    const getListener = captureListener();
    const { result } = renderHook(() => useUnreadCount("uid-1"));
    act(() => {
      getListener()?.({ val: () => -4 });
    });
    expect(result.current).toBe(0);
  });
});

describe("useUnreadCount — disabled when uid is undefined", () => {
  it("does not subscribe and returns 0", () => {
    captureListener();
    const { result } = renderHook(() => useUnreadCount(undefined));
    expect(mockOnValue).not.toHaveBeenCalled();
    expect(result.current).toBe(0);
  });
});

describe("useUnreadCount — cleans up the subscription on unmount", () => {
  it("invokes the unsubscribe returned by onValue", () => {
    captureListener();
    const { unmount } = renderHook(() => useUnreadCount("uid-1"));
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
