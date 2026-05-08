import { describe, it, expect, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { X_USER_ID_HEADER } from "@/lib/constants";

vi.mock("@/services/unavailable-ranges", () => ({
  deleteUnavailableRange: vi.fn(),
}));

import { deleteUnavailableRange } from "@/services/unavailable-ranges";
import { DELETE } from "./route";
import { proxy } from "@/proxy";

function makeRequest(uid: string | undefined, id = "range-1"): NextRequest {
  const headers = new Headers();
  if (uid !== undefined) {
    headers.set(X_USER_ID_HEADER, uid);
  }
  return new NextRequest(`http://localhost/api/unavailability/${id}`, {
    method: "DELETE",
    headers,
  });
}

function makeParams(id = "range-1"): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("DELETE /api/unavailability/[id]", () => {
  it("returns 401 when x-user-id header is absent", async () => {
    const response = await DELETE(makeRequest(undefined), makeParams());
    expect(response.status).toBe(401);
  });

  it("returns 204 on successful deletion", async () => {
    vi.mocked(deleteUnavailableRange).mockResolvedValue(undefined);

    const response = await DELETE(
      makeRequest("uid-abc"),
      makeParams("range-42"),
    );
    expect(response.status).toBe(204);
  });

  it("calls deleteUnavailableRange with uid from x-user-id header and route param id", async () => {
    vi.mocked(deleteUnavailableRange).mockResolvedValue(undefined);

    await DELETE(makeRequest("uid-xyz"), makeParams("range-99"));
    expect(vi.mocked(deleteUnavailableRange)).toHaveBeenCalledWith(
      "uid-xyz",
      "range-99",
    );
  });

  it("rejects forged x-user-id when no session cookie is present", async () => {
    const response = await proxy(makeRequest("uid-forged", "range-1"));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/sign-in?next=%2Fapi%2Funavailability%2Frange-1",
    );
  });
});
