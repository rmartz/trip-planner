import { Timestamp } from "firebase-admin/firestore";
import type { DocumentData } from "firebase/firestore";
import { TripRole } from "@/lib/types/trip";
import type { Leg, Stop, Trip, TripMember } from "@/lib/types/trip";

function toDate(value: Timestamp | null | undefined): Date {
  return value?.toDate() ?? new Date();
}

function toMemberUids(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

export function firebaseToTrip(tripId: string, data: DocumentData): Trip {
  const settledAtRaw = data["settledAt"] as Timestamp | null | undefined;
  return {
    tripId,
    name: (data["name"] as string | undefined) ?? "",
    startDate: toDate(data["startDate"] as Timestamp | null | undefined),
    endDate: toDate(data["endDate"] as Timestamp | null | undefined),
    createdAt: toDate(data["createdAt"] as Timestamp | null | undefined),
    createdBy: (data["createdBy"] as string | undefined) ?? "",
    memberUids: toMemberUids(data["memberUids"]),
    inviteToken: (data["inviteToken"] as string | undefined) ?? "",
    ...(settledAtRaw != null && { settledAt: settledAtRaw.toDate() }),
  };
}

export function tripToFirebase(trip: Omit<Trip, "tripId">): {
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
  memberUids: string[];
  inviteToken: string;
  settledAt?: Timestamp;
} {
  return {
    name: trip.name,
    startDate: Timestamp.fromDate(trip.startDate),
    endDate: Timestamp.fromDate(trip.endDate),
    createdAt: Timestamp.fromDate(trip.createdAt),
    createdBy: trip.createdBy,
    memberUids: trip.memberUids,
    inviteToken: trip.inviteToken,
    ...(trip.settledAt !== undefined && {
      settledAt: Timestamp.fromDate(trip.settledAt),
    }),
  };
}

export function firebaseToTripMember(
  uid: string,
  tripId: string,
  data: DocumentData,
): TripMember {
  return {
    uid,
    tripId,
    role: (data["role"] as TripRole | undefined) ?? TripRole.Guest,
    joinedAt: toDate(data["joinedAt"] as Timestamp | null | undefined),
    memberUids: toMemberUids(data["memberUids"]),
    displayName: undefined,
  };
}

export function tripMemberToFirebase(
  member: Omit<TripMember, "tripId" | "displayName">,
): {
  uid: string;
  role: TripRole;
  joinedAt: Timestamp;
  memberUids: string[];
} {
  return {
    uid: member.uid,
    role: member.role,
    joinedAt: Timestamp.fromDate(member.joinedAt),
    memberUids: member.memberUids,
  };
}

export function firebaseToStop(
  stopId: string,
  tripId: string,
  data: DocumentData,
): Stop {
  return {
    stopId,
    tripId,
    name: (data["name"] as string | undefined) ?? "",
    startDate: toDate(data["startDate"] as Timestamp | null | undefined),
    endDate: toDate(data["endDate"] as Timestamp | null | undefined),
    order: (data["order"] as number | undefined) ?? 0,
    memberUids: toMemberUids(data["memberUids"]),
  };
}

export function stopToFirebase(stop: Omit<Stop, "stopId" | "tripId">): {
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  order: number;
  memberUids: string[];
} {
  return {
    name: stop.name,
    startDate: Timestamp.fromDate(stop.startDate),
    endDate: Timestamp.fromDate(stop.endDate),
    order: stop.order,
    memberUids: stop.memberUids,
  };
}

export function firebaseToLeg(
  legId: string,
  tripId: string,
  data: DocumentData,
): Leg {
  return {
    legId,
    tripId,
    fromStopId: (data["fromStopId"] as string | undefined) ?? "",
    toStopId: (data["toStopId"] as string | undefined) ?? "",
    name: (data["name"] as string | undefined) ?? "",
    notes: data["notes"] as string | undefined,
    order: (data["order"] as number | undefined) ?? 0,
    memberUids: toMemberUids(data["memberUids"]),
    isActive: (data["isActive"] as boolean | undefined) ?? true,
  };
}

export function legToFirebase(leg: Omit<Leg, "legId" | "tripId">): {
  fromStopId: string;
  toStopId: string;
  name: string;
  notes?: string;
  order: number;
  memberUids: string[];
  isActive: boolean;
} {
  return {
    fromStopId: leg.fromStopId,
    toStopId: leg.toStopId,
    name: leg.name,
    ...(leg.notes !== undefined && { notes: leg.notes }),
    order: leg.order,
    memberUids: leg.memberUids,
    isActive: leg.isActive,
  };
}
