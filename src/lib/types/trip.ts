export enum TripRole {
  Guest = "guest",
  Planner = "planner",
}

export interface Trip {
  tripId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  createdBy: string;
}

export interface TripMember {
  uid: string;
  tripId: string;
  role: TripRole;
  joinedAt: Date;
}

export interface Stop {
  stopId: string;
  tripId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  order: number;
}

export interface Leg {
  legId: string;
  tripId: string;
  fromStopId: string;
  toStopId: string;
  order: number;
}
