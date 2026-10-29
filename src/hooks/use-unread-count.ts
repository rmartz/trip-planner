"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { getClientDatabase } from "@/lib/firebase/client";
import {
  getUnreadCountPath,
  parseUnreadCount,
} from "@/lib/firebase/schema/unread-count";

export function useUnreadCount(uid: string | undefined): number {
  // Tag the count with the uid it was read for, so a signed-out user (or one
  // whose subscription hasn't reported yet) never sees another user's count.
  const [latest, setLatest] = useState<{ uid: string; count: number }>();

  useEffect(() => {
    if (uid === undefined) return;

    const countRef = ref(getClientDatabase(), getUnreadCountPath(uid));
    return onValue(countRef, (snapshot) => {
      setLatest({ uid, count: parseUnreadCount(snapshot.val()) });
    });
  }, [uid]);

  return latest !== undefined && latest.uid === uid ? latest.count : 0;
}
