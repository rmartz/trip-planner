import { type NextRequest, NextResponse } from "next/server";
import { markAllNotificationsRead } from "@/services/notifications";
import { X_USER_ID_HEADER } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await markAllNotificationsRead(uid);
  return NextResponse.json({ ok: true });
}
