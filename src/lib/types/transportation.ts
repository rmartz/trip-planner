export enum TransportationStatus {
  Driving = "driving",
  DrivingWithSeats = "driving-with-seats",
  FlyingOrOther = "flying-or-other",
  NeedTransportation = "need-transportation",
  RidingWith = "riding-with",
}

export interface TransportationEntry {
  entryId: string;
  legId: string;
  uid: string;
  status: TransportationStatus;
  routeName: string;
  seatCount?: number;
  ridingWithUid?: string;
}

export enum TransportOfferVisibility {
  InviteOnly = "invite_only",
  Public = "public",
}

export interface TransportCarOffer {
  driverName: string;
  inviteeCount?: number;
  routeName: string;
  seatCount: number;
  visibility: TransportOfferVisibility;
}

export interface TransportLegDemand {
  driving: number;
  haveOwn: number;
  needRide: number;
  noReply: number;
  skipLeg: number;
}
