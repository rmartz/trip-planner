export enum TimeOfDaySlot {
  Afternoon = "afternoon",
  EarlyMorning = "early-morning",
  Evening = "evening",
  LateEvening = "late-evening",
  Morning = "morning",
}

export enum TimeOfDaySlotType {
  MustOccurIn = "must-occur-in",
  PreferredIn = "preferred-in",
}

export enum TransportationMode {
  Private = "private",
  PublicTransit = "public-transit",
  Walking = "walking",
}

export interface ActivityTimeOfDaySlot {
  type: TimeOfDaySlotType;
  slots: TimeOfDaySlot[];
}

export interface ActivityGroupSize {
  min?: number;
  max?: number;
}

export interface ActivityProposalInput {
  name: string;
  description?: string;
  estimatedDurationMinutes: number;
  timeOfDaySlot?: ActivityTimeOfDaySlot;
  groupSize?: ActivityGroupSize;
  costPerPerson?: number;
  transportationRequired?: TransportationMode;
}

export interface Activity {
  activityId: string;
  stopId: string;
  tripId: string;
  name: string;
  description?: string;
  estimatedDurationMinutes: number;
  timeOfDaySlot?: ActivityTimeOfDaySlot;
  groupSize?: ActivityGroupSize;
  costPerPerson?: number;
  transportationRequired?: TransportationMode;
}
