export interface NonAccountMember {
  nonAccountMemberId: string;
  tripId: string;
  name: string;
  proxiedBy: string;
  claimToken: string;
  claimedBy: string | undefined;
}
