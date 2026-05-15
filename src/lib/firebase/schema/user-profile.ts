import { Timestamp } from "firebase-admin/firestore";
import type { DocumentData } from "firebase/firestore";
import type { UserProfile } from "@/lib/types/user-profile";

export function firebaseToUserProfile(
  uid: string,
  data: DocumentData,
): UserProfile {
  const createdAt = data["createdAt"] as Timestamp | null | undefined;
  return {
    uid,
    displayName: data["displayName"] as string | undefined,
    email: (data["email"] as string | undefined) ?? "",
    createdAt: createdAt?.toDate() ?? new Date(),
  };
}

export function userProfileToFirebase(profile: Omit<UserProfile, "uid">): {
  displayName?: string;
  email: string;
  createdAt: Timestamp;
} {
  return {
    ...(profile.displayName !== undefined
      ? { displayName: profile.displayName }
      : {}),
    email: profile.email,
    createdAt: Timestamp.fromDate(profile.createdAt),
  };
}
