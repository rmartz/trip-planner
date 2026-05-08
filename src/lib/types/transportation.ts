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
