"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { getClientDatabase } from "@/lib/firebase/client";
import {
  getUnreadCountPath,
  parseUnreadCount,
} from "@/lib/firebase/schema/unread-count";

export function useUnreadCount(uid: string | undefined): number {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (uid === undefined) {
      setUnreadCount(0);
      return;
    }

    const countRef = ref(getClientDatabase(), getUnreadCountPath(uid));
    return onValue(countRef, (snapshot) => {
      setUnreadCount(parseUnreadCount(snapshot.val()));
    });
  }, [uid]);

  return unreadCount;
}
