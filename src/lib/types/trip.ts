export enum TripPhase {
  Coordination = "coordination",
  Planning = "planning",
  Settled = "settled",
  SettlingUp = "settling_up",
}

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
  memberUids: string[];
  gapCount?: number;
}

export interface TripMember {
  uid: string;
  tripId: string;
  role: TripRole;
  joinedAt: Date;
  memberUids: string[];
  displayName: string | undefined;
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
  name: string;
  notes?: string;
  order: number;
  memberUids: string[];
}
