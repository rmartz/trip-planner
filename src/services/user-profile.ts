import {
  doc,
  getDoc,
  serverTimestamp,
  runTransaction,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { getClientFirestore } from "@/lib/firebase/client";
import { firebaseToUserProfile } from "@/lib/firebase/schema/user-profile";
import type { UserProfile } from "@/lib/types/user-profile";

export async function getOrCreateUserProfile(user: User): Promise<UserProfile> {
  const db = getClientFirestore();
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    return firebaseToUserProfile(user.uid, snapshot.data());
  }

  // Use a transaction for atomic create-if-not-exists to prevent two concurrent
  // first-sign-ins from overwriting each other's createdAt.
  await runTransaction(db, async (transaction) => {
    const txSnapshot = await transaction.get(ref);
    if (!txSnapshot.exists()) {
      transaction.set(ref, {
        ...(user.displayName !== null ? { displayName: user.displayName } : {}),
        email: user.email ?? "",
        createdAt: serverTimestamp(),
      });
    }
  });

  // Construct the profile from the known data rather than re-reading the
  // document (which may still carry an unresolved serverTimestamp() in the
  // local cache).  createdAt is a local estimate; subsequent reads will return
  // the resolved server value.
  return {
    uid: user.uid,
    displayName: user.displayName ?? undefined,
    email: user.email ?? "",
    createdAt: new Date(),
  };
}
