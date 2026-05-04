import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase/admin";
import {
  getUnavailableRanges,
  createUnavailableRange,
} from "@/services/unavailable-ranges";

async function getUid(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return undefined;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
    return decoded.uid;
  } catch {
    return undefined;
  }
}

export async function GET() {
  const uid = await getUid();
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ranges = await getUnavailableRanges(uid);
  return NextResponse.json(
    ranges.map((r) => ({
      ...r,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
    })),
  );
}

export async function POST(request: Request) {
  const uid = await getUid();
  if (!uid)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    startDate: unknown;
    endDate: unknown;
    note?: unknown;
  };

  if (typeof body.startDate !== "string" || typeof body.endDate !== "string") {
    return NextResponse.json(
      { error: "startDate and endDate are required" },
      { status: 400 },
    );
  }

  const range = await createUnavailableRange(uid, {
    startDate: new Date(body.startDate),
    endDate: new Date(body.endDate),
    note: typeof body.note === "string" ? body.note : undefined,
  });

  return NextResponse.json(
    {
      ...range,
      startDate: range.startDate.toISOString(),
      endDate: range.endDate.toISOString(),
    },
    { status: 201 },
  );
}
