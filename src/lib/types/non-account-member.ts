export interface NonAccountMember {
  nonAccountMemberId: string;
  tripId: string;
  name: string;
  proxiedBy: string;
  proxiedByName: string;
  claimToken: string;
  claimedBy: string | undefined;
}
