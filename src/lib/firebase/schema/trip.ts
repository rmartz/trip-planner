import { Timestamp } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { TripRole } from "@/lib/types/trip";
import type { Trip, TripMember, Stop, Leg } from "@/lib/types/trip";

function toDate(value: Timestamp | null | undefined): Date {
  return value?.toDate() ?? new Date();
}

export function firebaseToTrip(tripId: string, data: DocumentData): Trip {
  return {
    tripId,
    name: (data["name"] as string | undefined) ?? "",
    startDate: toDate(data["startDate"] as Timestamp | null | undefined),
    endDate: toDate(data["endDate"] as Timestamp | null | undefined),
    createdAt: toDate(data["createdAt"] as Timestamp | null | undefined),
    createdBy: (data["createdBy"] as string | undefined) ?? "",
  };
}

export function tripToFirebase(trip: Omit<Trip, "tripId">): {
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  createdBy: string;
} {
  return {
    name: trip.name,
    startDate: Timestamp.fromDate(trip.startDate),
    endDate: Timestamp.fromDate(trip.endDate),
    createdAt: Timestamp.fromDate(trip.createdAt),
    createdBy: trip.createdBy,
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
  };
}

export function tripMemberToFirebase(
  member: Omit<TripMember, "uid" | "tripId">,
): {
  role: TripRole;
  joinedAt: Timestamp;
} {
  return {
    role: member.role,
    joinedAt: Timestamp.fromDate(member.joinedAt),
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
  };
}

export function stopToFirebase(stop: Omit<Stop, "stopId" | "tripId">): {
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  order: number;
} {
  return {
    name: stop.name,
    startDate: Timestamp.fromDate(stop.startDate),
    endDate: Timestamp.fromDate(stop.endDate),
    order: stop.order,
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
    order: (data["order"] as number | undefined) ?? 0,
  };
}

export function legToFirebase(leg: Omit<Leg, "legId" | "tripId">): {
  fromStopId: string;
  toStopId: string;
  order: number;
} {
  return {
    fromStopId: leg.fromStopId,
    toStopId: leg.toStopId,
    order: leg.order,
  };
}
