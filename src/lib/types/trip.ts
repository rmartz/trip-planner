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
  memberUids: string[];
}

export interface Stop {
  stopId: string;
  tripId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  order: number;
  memberUids: string[];
}

export interface Leg {
  legId: string;
  tripId: string;
  fromStopId: string;
  toStopId: string;
  order: number;
  memberUids: string[];
}
