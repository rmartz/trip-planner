import { type NextRequest, NextResponse } from "next/server";
import { deleteUnavailableRange } from "@/services/unavailable-ranges";
import { X_USER_ID_HEADER } from "@/lib/constants";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const uid = request.headers.get(X_USER_ID_HEADER);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteUnavailableRange(uid, id);
  return new NextResponse(null, { status: 204 });
}
