import type { DocumentData } from "firebase/firestore";
import type { NonAccountMember } from "@/lib/types/non-account-member";

export function firebaseToNonAccountMember(
  nonAccountMemberId: string,
  tripId: string,
  data: DocumentData,
): NonAccountMember {
  return {
    nonAccountMemberId,
    tripId,
    name: (data["name"] as string | undefined) ?? "",
    proxiedBy: (data["proxiedBy"] as string | undefined) ?? "",
    claimToken: (data["claimToken"] as string | undefined) ?? "",
    claimedBy: (data["claimedBy"] as string | undefined) ?? undefined,
  };
}

export function nonAccountMemberToFirebase(
  member: Omit<NonAccountMember, "nonAccountMemberId" | "tripId">,
): {
  name: string;
  proxiedBy: string;
  claimToken: string;
  claimedBy: string | undefined;
} {
  return {
    name: member.name,
    proxiedBy: member.proxiedBy,
    claimToken: member.claimToken,
    claimedBy: member.claimedBy,
  };
}
