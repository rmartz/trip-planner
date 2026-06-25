import { type NextRequest, NextResponse } from "next/server";
import { getNotificationsForUser } from "@/services/notifications";
import { X_USER_ID_HEADER } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getNotificationsForUser(uid);
  return NextResponse.json(
    notifications.map((notification) => ({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
    })),
  );
}
