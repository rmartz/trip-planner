import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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

  await setDoc(ref, {
    ...(user.displayName !== null
      ? { displayName: user.displayName }
      : {}),
    email: user.email ?? "",
    createdAt: serverTimestamp(),
  });

  const createdSnapshot = await getDoc(ref);
  if (!createdSnapshot.exists()) {
    throw new Error(`Failed to create user profile for ${user.uid}`);
  }
  return firebaseToUserProfile(user.uid, createdSnapshot.data());
}
