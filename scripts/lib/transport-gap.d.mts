// Type declarations for the plain-ESM transport-gap module so the TypeScript
// spec (src/lib/trips/backfill-transport-gap.spec.ts) can import it under strict
// type checking. Keep in sync with transport-gap.mjs.

export interface TransportGapLeg {
  legId: string;
}

export interface TransportGapEntry {
  legId: string;
  uid: string;
  status: string;
  ridingWithUid?: string;
  seatCount?: number;
}

export const TransportationStatus: {
  Driving: string;
  DrivingWithSeats: string;
  FlyingOrOther: string;
  NeedTransportation: string;
  RidingWith: string;
};

export function computeTransportGapCountFromDocs(
  legs: TransportGapLeg[],
  entries: TransportGapEntry[],
  memberUids: string[],
): number;
