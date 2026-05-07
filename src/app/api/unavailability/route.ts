import { type NextRequest, NextResponse } from "next/server";
import {
  getUnavailableRanges,
  createUnavailableRange,
} from "@/services/unavailable-ranges";
import { X_USER_ID_HEADER } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const uid = request.headers.get(X_USER_ID_HEADER);
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

export async function POST(request: NextRequest) {
  const uid = request.headers.get(X_USER_ID_HEADER);
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

  const start = new Date(body.startDate);
  const end = new Date(body.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
  }

  if (start > end) {
    return NextResponse.json(
      { error: "startDate must be before or equal to endDate" },
      { status: 400 },
    );
  }

  const range = await createUnavailableRange(uid, {
    startDate: start,
    endDate: end,
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
