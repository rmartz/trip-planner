import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const createCustomToken = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({ createCustomToken }),
}));

import { POST } from "./route";

const SYNTHETIC_TOKEN = "custom-token-xyz";

function makeRequest(uid: unknown) {
  return new NextRequest("http://localhost/api/debug/impersonate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid }),
  });
}

beforeEach(() => {
  vi.stubEnv("VERCEL_ENV", "preview");
  createCustomToken.mockResolvedValue(SYNTHETIC_TOKEN);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("POST /api/debug/impersonate is unavailable in production", () => {
  it("returns 404 when VERCEL_ENV is production", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const response = await POST(makeRequest("synthetic:planner"));
    expect(response.status).toBe(404);
    expect(createCustomToken).not.toHaveBeenCalled();
  });
});

describe("POST /api/debug/impersonate rejects ineligible uids", () => {
  it("returns 403 for a uid without the synthetic prefix", async () => {
    const response = await POST(makeRequest("aRealFirebaseUid000000000001"));
    expect(response.status).toBe(403);
    expect(createCustomToken).not.toHaveBeenCalled();
  });

  it("returns 403 for a synthetic-prefixed uid not in the allowlist", async () => {
    const response = await POST(makeRequest("synthetic:intruder"));
    expect(response.status).toBe(403);
    expect(createCustomToken).not.toHaveBeenCalled();
  });

  it("returns 400 when uid is missing", async () => {
    const response = await POST(makeRequest(undefined));
    expect(response.status).toBe(400);
    expect(createCustomToken).not.toHaveBeenCalled();
  });
});

describe("POST /api/debug/impersonate mints a synthetic custom token", () => {
  it("returns the minted token for an eligible uid", async () => {
    const response = await POST(makeRequest("synthetic:planner"));
    expect(response.status).toBe(200);
    const data = (await response.json()) as { customToken: string };
    expect(data.customToken).toBe(SYNTHETIC_TOKEN);
  });

  it("mints with the synthetic claim", async () => {
    await POST(makeRequest("synthetic:guest"));
    expect(createCustomToken).toHaveBeenCalledWith("synthetic:guest", {
      synthetic: true,
    });
  });
});
