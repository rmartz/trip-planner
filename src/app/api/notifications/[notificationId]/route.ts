import { type NextRequest, NextResponse } from "next/server";
import { markNotificationRead } from "@/services/notifications";
import { X_USER_ID_HEADER } from "@/lib/constants";

interface RouteContext {
  params: Promise<{ notificationId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notificationId } = await params;
  await markNotificationRead(uid, notificationId);
  return NextResponse.json({ ok: true });
}
