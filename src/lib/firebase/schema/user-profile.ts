import { Timestamp } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import type { UserProfile } from "@/lib/types/user-profile";
import { toDate } from "./helpers";

export function firebaseToUserProfile(
  uid: string,
  data: DocumentData,
): UserProfile {
  return {
    uid,
    displayName: data["displayName"] as string | undefined,
    email: (data["email"] as string | undefined) ?? "",
    createdAt: toDate(data["createdAt"]),
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
